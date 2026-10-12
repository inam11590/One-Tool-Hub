/**
 * Client-Side RFC 9562 / RFC 4122 UUID Generator & Validator
 * 
 * Features:
 * - Deterministic, cryptographically secure UUID v4 generation using Web Crypto:
 *   window.crypto.randomUUID() or crypto.getRandomValues() with strict bit-masking:
 *   version 4 (0100 in bits 48-51) and variant 1 (10xx in bits 64-65).
 * - Bulk generation with custom quantity (1 to 1,000) and delimiter formatting (newline, comma, JSON array).
 * - Format controls: Hyphenated (standard), No Hyphens (compact 32-hex), Uppercase vs. Lowercase, Braced {UUID}.
 * - Comprehensive UUID Validator: parses any candidate string and detects UUID version (v1, v2, v3, v4, v5, nil).
 * - 100% in-browser generation. Identifiers are never sent to external servers or logged.
 */

export interface UuidFormatOptions {
  uppercase: boolean;
  hyphens: boolean;
  braces: boolean;
}

export interface UuidValidationDetails {
  valid: boolean;
  input: string;
  normalized?: string;
  version?: number | "nil" | "unknown";
  variant?: "RFC 4122 / RFC 9562" | "NCS backward-compatible" | "Microsoft GUID" | "Future / Reserved" | "unknown";
  error?: string;
}

export const MAX_BULK_UUID_COUNT = 1000;

// Standard 8-4-4-4-12 UUID v4 regex
export const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const GENERAL_UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/**
 * Generates a single RFC 9562 compliant UUID v4 string.
 * Uses crypto.randomUUID() where supported, with Web Crypto getRandomValues fallback.
 */
export function generateSingleUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version to 4 (0100) -> bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    // Set variant to 10xx (RFC 4122) -> bytes[8] = (bytes[8] & 0x3f) | 0x80
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  throw new Error("Secure random number generator (Web Crypto) is unavailable in this environment.");
}

/**
 * Applies presentation formatting (casing, hyphens, braces) to a standard UUID string.
 */
export function formatUuid(uuid: string, options: UuidFormatOptions): string {
  let clean = uuid.trim().toLowerCase();
  if (!options.hyphens) {
    clean = clean.replace(/-/g, "");
  }
  if (options.uppercase) {
    clean = clean.toUpperCase();
  }
  if (options.braces) {
    clean = `{${clean}}`;
  }
  return clean;
}

/**
 * Generates multiple UUID v4 strings with presentation options.
 */
export function generateBulkUuids(
  count: number,
  options: UuidFormatOptions = { uppercase: false, hyphens: true, braces: false }
): string[] {
  const safeCount = Math.max(1, Math.min(MAX_BULK_UUID_COUNT, Math.floor(count)));
  const results: string[] = [];

  for (let i = 0; i < safeCount; i++) {
    const raw = generateSingleUuidV4();
    results.push(formatUuid(raw, options));
  }

  return results;
}

/**
 * Validates a candidate UUID string and extracts version & RFC variant details.
 */
export function validateUuidString(input: string): UuidValidationDetails {
  if (!input || typeof input !== "string") {
    return { valid: false, input: "", error: "Please enter a UUID string to validate." };
  }

  // Strip optional braces, whitespace, and urn:uuid: prefix
  let clean = input.trim().replace(/^\{/, "").replace(/\}$/, "").replace(/^urn:uuid:/i, "");

  // If provided as 32 hex chars without hyphens, insert standard hyphens
  if (/^[0-9a-fA-F]{32}$/.test(clean)) {
    clean = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
  }

  const normalized = clean.toLowerCase();

  if (normalized === NIL_UUID) {
    return {
      valid: true,
      input,
      normalized,
      version: "nil",
      variant: "RFC 4122 / RFC 9562",
    };
  }

  if (!GENERAL_UUID_REGEX.test(normalized)) {
    return {
      valid: false,
      input,
      error: "String does not match standard 36-character hexadecimal UUID format (8-4-4-4-12).",
    };
  }

  // Extract version nibble (char at index 14)
  const versionChar = normalized.charAt(14);
  const versionNum = parseInt(versionChar, 16);

  // Extract variant nibble (char at index 19)
  const variantChar = normalized.charAt(19);
  const variantNibble = parseInt(variantChar, 16);

  let variant: UuidValidationDetails["variant"] = "unknown";
  if ((variantNibble & 0x8) === 0x0) {
    variant = "NCS backward-compatible";
  } else if ((variantNibble & 0xc) === 0x8) {
    variant = "RFC 4122 / RFC 9562";
  } else if ((variantNibble & 0xe) === 0xc) {
    variant = "Microsoft GUID";
  } else {
    variant = "Future / Reserved";
  }

  return {
    valid: true,
    input,
    normalized,
    version: versionNum >= 1 && versionNum <= 8 ? versionNum : "unknown",
    variant,
  };
}
