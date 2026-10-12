/**
 * Client-Side Safe Regular Expression Engine & Debugger
 * 
 * Features:
 * - Real-time pattern validation using JavaScript RegExp syntax.
 * - Supports standard ECMAScript flags: g (global), i (ignore case), m (multiline), s (dotAll), u (unicode), d (hasIndices).
 * - Match positions (start index, end index) and capture groups (indexed & named).
 * - Safe match enumeration with zero-length progression guards to prevent infinite loops.
 * - Iteration / match-count caps to protect the browser UI from excessive DOM load.
 * - 100% in-browser processing. Zero data sent to servers.
 */

export interface RegexFlagsConfig {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
}

export interface RegexCaptureGroup {
  index: number;
  name?: string;
  value: string;
}

export interface RegexMatchItem {
  index: number;
  start: number;
  end: number;
  fullMatch: string;
  groups: RegexCaptureGroup[];
}

export interface RegexValidationResult {
  valid: boolean;
  pattern: string;
  flags: string;
  error?: string;
  matches: RegexMatchItem[];
  totalMatches: number;
  truncated: boolean;
  executionTimeMs: number;
}

export const MAX_REGEX_MATCHES = 2000;
export const MAX_TEST_TEXT_LENGTH = 100_000; // 100 KB text safeguard
export const MAX_REGEX_PATTERN_LENGTH = 1000;

/**
 * Builds standard flags string from flags configuration object.
 */
export function buildFlagsString(flags: RegexFlagsConfig): string {
  let res = "";
  if (flags.global) res += "g";
  if (flags.ignoreCase) res += "i";
  if (flags.multiline) res += "m";
  if (flags.dotAll) res += "s";
  if (flags.unicode) res += "u";
  return res;
}

/**
 * Checks for obvious ReDoS patterns with nested quantifiers (e.g., (a+)+ or (x*)*).
 */
export function detectPotentialCatastrophicBacktracking(pattern: string): {
  suspicious: boolean;
  warning?: string;
} {
  // Common nested quantifier patterns that trigger catastrophic polynomial or exponential backtracking
  const nestedQuantifierRegex = /(\([^\)]*[\+\*]\)[^\)]*[\+\*])|([\+\*]\?*[\+\*])/;
  if (nestedQuantifierRegex.test(pattern)) {
    return {
      suspicious: true,
      warning:
        "Pattern contains nested quantifiers (e.g. (a+)+), which may cause catastrophic backtracking on non-matching text.",
    };
  }
  return { suspicious: false };
}

/**
 * Executes regular expression safely against test text with loop guards.
 */
export function testRegularExpression(
  pattern: string,
  testText: string,
  flags: RegexFlagsConfig | string
): RegexValidationResult {
  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
  const flagsStr = typeof flags === "string" ? flags : buildFlagsString(flags);

  if (pattern.length > MAX_REGEX_PATTERN_LENGTH) {
    return {
      valid: false,
      pattern,
      flags: flagsStr,
      error: `Pattern exceeds maximum allowed length of ${MAX_REGEX_PATTERN_LENGTH} characters.`,
      matches: [],
      totalMatches: 0,
      truncated: false,
      executionTimeMs: 0,
    };
  }

  if (testText.length > MAX_TEST_TEXT_LENGTH) {
    return {
      valid: false,
      pattern,
      flags: flagsStr,
      error: `Test text exceeds maximum allowed size of ${MAX_TEST_TEXT_LENGTH.toLocaleString()} characters.`,
      matches: [],
      totalMatches: 0,
      truncated: false,
      executionTimeMs: 0,
    };
  }

  if (!pattern) {
    return {
      valid: true,
      pattern: "",
      flags: flagsStr,
      matches: [],
      totalMatches: 0,
      truncated: false,
      executionTimeMs: 0,
    };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flagsStr);
  } catch (err) {
    return {
      valid: false,
      pattern,
      flags: flagsStr,
      error: err instanceof Error ? err.message : "Invalid regular expression syntax.",
      matches: [],
      totalMatches: 0,
      truncated: false,
      executionTimeMs: 0,
    };
  }

  const matches: RegexMatchItem[] = [];
  let totalMatches = 0;
  let truncated = false;

  try {
    if (!flagsStr.includes("g")) {
      // Non-global: single match execution
      const execResult = regex.exec(testText);
      if (execResult && execResult.index !== undefined) {
        const fullMatch = execResult[0];
        const groups: RegexCaptureGroup[] = [];

        // Numbered capture groups
        for (let g = 1; g < execResult.length; g++) {
          groups.push({
            index: g,
            value: execResult[g] ?? "",
          });
        }

        // Named capture groups
        if (execResult.groups) {
          for (const [name, val] of Object.entries(execResult.groups)) {
            // Find existing group by value or supplement
            const existing = groups.find((grp) => grp.value === val && !grp.name);
            if (existing) {
              existing.name = name;
            } else {
              groups.push({
                index: groups.length + 1,
                name,
                value: val ?? "",
              });
            }
          }
        }

        matches.push({
          index: 0,
          start: execResult.index,
          end: execResult.index + fullMatch.length,
          fullMatch,
          groups,
        });
        totalMatches = 1;
      }
    } else {
      // Global: loop with zero-length progression safeguard
      let execResult: RegExpExecArray | null;
      let iterations = 0;
      const maxIterations = 50_000;

      while ((execResult = regex.exec(testText)) !== null) {
        iterations++;
        if (iterations > maxIterations) {
          truncated = true;
          break;
        }

        const fullMatch = execResult[0];
        const matchIndex = execResult.index;

        if (totalMatches < MAX_REGEX_MATCHES) {
          const groups: RegexCaptureGroup[] = [];

          for (let g = 1; g < execResult.length; g++) {
            groups.push({
              index: g,
              value: execResult[g] ?? "",
            });
          }

          if (execResult.groups) {
            for (const [name, val] of Object.entries(execResult.groups)) {
              const existing = groups.find((grp) => grp.value === val && !grp.name);
              if (existing) {
                existing.name = name;
              } else {
                groups.push({
                  index: groups.length + 1,
                  name,
                  value: val ?? "",
                });
              }
            }
          }

          matches.push({
            index: totalMatches,
            start: matchIndex,
            end: matchIndex + fullMatch.length,
            fullMatch,
            groups,
          });
        } else {
          truncated = true;
        }

        totalMatches++;

        // CRITICAL: Avoid infinite loops on zero-length matches (e.g. ^ or \b or empty string)
        if (fullMatch.length === 0) {
          regex.lastIndex++;
          if (regex.lastIndex > testText.length) {
            break;
          }
        }
      }
    }
  } catch (execErr) {
    return {
      valid: false,
      pattern,
      flags: flagsStr,
      error: execErr instanceof Error ? execErr.message : "Regex execution encountered an error.",
      matches: [],
      totalMatches: 0,
      truncated: false,
      executionTimeMs: 0,
    };
  }

  const endTime = typeof performance !== "undefined" ? performance.now() : Date.now();

  return {
    valid: true,
    pattern,
    flags: flagsStr,
    matches,
    totalMatches,
    truncated,
    executionTimeMs: Math.max(0, parseFloat((endTime - startTime).toFixed(2))),
  };
}

export interface RegexSamplePattern {
  name: string;
  pattern: string;
  flags: RegexFlagsConfig;
  sampleText: string;
  description: string;
}

export const REGEX_LIBRARY_PRESETS: readonly RegexSamplePattern[] = [
  {
    name: "Email Address",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: { global: true, ignoreCase: true, multiline: false, dotAll: false, unicode: false },
    sampleText: "Contact support@example.com or admin.team@company.org for assistance.",
    description: "Standard RFC 5322 compatible email address pattern.",
  },
  {
    name: "URL / Web Link",
    pattern: "https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!$&'()*+,;=.]+",
    flags: { global: true, ignoreCase: true, multiline: false, dotAll: false, unicode: false },
    sampleText: "Visit https://one-tool-hub-sooty.vercel.app or http://localhost:3000/docs for setup.",
    description: "Matches HTTP and HTTPS URLs with paths, queries, and fragments.",
  },
  {
    name: "Named Capture Groups (Dates)",
    pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})",
    flags: { global: true, ignoreCase: false, multiline: true, dotAll: false, unicode: false },
    sampleText: "Project started on 2026-01-15 and milestone launched on 2026-10-12.",
    description: "Demonstrates named capture groups (?<name>...) for ISO dates.",
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: { global: true, ignoreCase: false, multiline: false, dotAll: false, unicode: false },
    sampleText: "Configured server host at 192.168.1.1 and gateway at 10.0.0.254.",
    description: "Strict IPv4 address validation ensuring octets stay within 0-255.",
  },
  {
    name: "Hex Color Code",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: { global: true, ignoreCase: true, multiline: false, dotAll: false, unicode: false },
    sampleText: "Selected accent color #10b981 and background fill #fff for contrast.",
    description: "Matches 3-digit (#fff) and 6-digit (#10b981) hexadecimal web colors.",
  },
] as const;
