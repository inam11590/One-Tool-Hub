/**
 * Cryptographically Secure Password Generator Core
 *
 * Requirements:
 * - Uses crypto.getRandomValues() for uniform cryptographically secure randomness.
 * - Modulo-bias free rejection sampling algorithm.
 * - Guaranteed representation of all selected character categories.
 * - Enforces length between 8 and 128 characters.
 * - Never saves passwords to disk, memory storage, analytics, or server.
 */

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
export const NUMBER_CHARS = "0123456789";
export const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

// Ambiguous characters commonly confused in fonts: I, l, 1, O, 0, o
export const AMBIGUOUS_CHARS = new Set(["I", "l", "1", "O", "0", "o", "|", "i"]);

export const DEFAULT_PASSWORD_OPTIONS: PasswordGeneratorOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // 0=Very Weak, 1=Weak, 2=Fair, 3=Strong, 4=Very Strong
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  colorClass: string;
  entropyBits: number;
  feedback: string;
}

/**
 * Filters out ambiguous characters from a string set if requested.
 */
function filterAmbiguous(charset: string, exclude: boolean): string {
  if (!exclude) return charset;
  return charset
    .split("")
    .filter((char) => !AMBIGUOUS_CHARS.has(char))
    .join("");
}

/**
 * Selects an unbiased random integer in [0, max - 1] using rejection sampling.
 * Rejection sampling eliminates modulo bias when 256 is not evenly divisible by max.
 */
function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;
  if (max > 256) {
    throw new Error("Max pool size exceeds 256");
  }

  const limit = 256 - (256 % max);
  const buffer = new Uint8Array(1);

  while (true) {
    crypto.getRandomValues(buffer);
    const rand = buffer[0]!;
    if (rand < limit) {
      return rand % max;
    }
  }
}

/**
 * Fisher-Yates shuffle using cryptographically secure random integers.
 */
function secureShuffle(array: string[]): string[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Generates a cryptographically secure random password.
 */
export function generateSecurePassword(
  options: Partial<PasswordGeneratorOptions> = {}
): { password: string; error?: string } {
  const length = Math.max(8, Math.min(128, options.length ?? 16));
  const includeUppercase = options.includeUppercase ?? true;
  const includeLowercase = options.includeLowercase ?? true;
  const includeNumbers = options.includeNumbers ?? true;
  const includeSymbols = options.includeSymbols ?? true;
  const excludeAmbiguous = options.excludeAmbiguous ?? false;

  const categories: string[] = [];

  if (includeUppercase) {
    const chars = filterAmbiguous(UPPERCASE_CHARS, excludeAmbiguous);
    if (chars.length > 0) categories.push(chars);
  }
  if (includeLowercase) {
    const chars = filterAmbiguous(LOWERCASE_CHARS, excludeAmbiguous);
    if (chars.length > 0) categories.push(chars);
  }
  if (includeNumbers) {
    const chars = filterAmbiguous(NUMBER_CHARS, excludeAmbiguous);
    if (chars.length > 0) categories.push(chars);
  }
  if (includeSymbols) {
    const chars = filterAmbiguous(SYMBOL_CHARS, excludeAmbiguous);
    if (chars.length > 0) categories.push(chars);
  }

  if (categories.length === 0) {
    return {
      password: "",
      error: "Select at least one character category (uppercase, lowercase, numbers, or symbols).",
    };
  }

  // Combined full pool
  const fullPool = categories.join("");
  if (fullPool.length === 0) {
    return {
      password: "",
      error: "No characters available after excluding ambiguous characters.",
    };
  }

  const passwordChars: string[] = [];

  // Guarantee at least 1 character from each enabled category
  for (const cat of categories) {
    const index = getSecureRandomInt(cat.length);
    passwordChars.push(cat[index]!);
  }

  // Fill remaining slots uniformly from the full pool
  const remainingCount = length - passwordChars.length;
  for (let i = 0; i < remainingCount; i++) {
    const index = getSecureRandomInt(fullPool.length);
    passwordChars.push(fullPool[index]!);
  }

  // Shuffle to randomize positions so guaranteed categories aren't always at the front
  const finalPassword = secureShuffle(passwordChars).join("");

  return { password: finalPassword };
}

/**
 * Evaluates password strength based on character entropy and diversity.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      score: 0,
      label: "Very Weak",
      colorClass: "bg-red-500",
      entropyBits: 0,
      feedback: "Enter or generate a password to evaluate strength.",
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) poolSize = 26;

  // Entropy = length * log2(poolSize)
  const entropyBits = Math.round(password.length * Math.log2(poolSize));

  if (password.length < 10 || entropyBits < 40) {
    return {
      score: 1,
      label: "Weak",
      colorClass: "bg-orange-500",
      entropyBits,
      feedback: "Short password. Increase length to at least 14 characters for better security.",
    };
  }

  if (password.length < 14 || entropyBits < 60) {
    return {
      score: 2,
      label: "Fair",
      colorClass: "bg-amber-500",
      entropyBits,
      feedback: "Acceptable for non-critical accounts. Add symbols or length for high-security services.",
    };
  }

  if (password.length < 20 || entropyBits < 80) {
    return {
      score: 3,
      label: "Strong",
      colorClass: "bg-emerald-500",
      entropyBits,
      feedback: "Strong password suitable for email, banking, and primary work accounts.",
    };
  }

  return {
    score: 4,
    label: "Very Strong",
    colorClass: "bg-emerald-600",
    entropyBits,
    feedback: "Exceptional cryptographic complexity. Resistant to brute-force dictionary attacks.",
  };
}
