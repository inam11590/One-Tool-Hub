/**
 * Base64 Encoder & Decoder Core Utility
 *
 * Requirements:
 * - Robust UTF-8 and Unicode character support (emojis, accents, CJK characters).
 * - Safe standard browser APIs via TextEncoder and TextDecoder.
 * - Validation for malformed Base64 strings.
 * - Enforces safe input size caps (5 MB text limit).
 * - Never executes decoded HTML/JS payloads.
 */

export const MAX_BASE64_TEXT_LENGTH = 5 * 1024 * 1024; // 5 MB text string limit

export interface Base64ProcessResult {
  success: boolean;
  output: string;
  error?: string;
  byteSize?: number;
}

/**
 * Converts a UTF-8 string to a Base64 encoded string safely handling Unicode.
 */
export function encodeUtf8ToBase64(text: string): Base64ProcessResult {
  if (!text) {
    return { success: true, output: "", byteSize: 0 };
  }

  if (text.length > MAX_BASE64_TEXT_LENGTH) {
    return {
      success: false,
      output: "",
      error: "Input text exceeds the 5 MB maximum size limit.",
    };
  }

  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    const base64 = btoa(binary);
    return {
      success: true,
      output: base64,
      byteSize: bytes.byteLength,
    };
  } catch (err) {
    return {
      success: false,
      output: "",
      error: err instanceof Error ? err.message : "Failed to encode text to Base64.",
    };
  }
}

/**
 * Converts a Base64 encoded string to a UTF-8 text string safely handling Unicode.
 */
export function decodeBase64ToUtf8(base64: string): Base64ProcessResult {
  const cleaned = base64.trim().replace(/\s+/g, "");
  if (!cleaned) {
    return { success: true, output: "", byteSize: 0 };
  }

  if (cleaned.length > MAX_BASE64_TEXT_LENGTH) {
    return {
      success: false,
      output: "",
      error: "Base64 input exceeds the 5 MB maximum size limit.",
    };
  }

  // Regex check for standard base64 characters (+, /, =, a-z, A-Z, 0-9)
  if (!/^[A-Za-z0-9+/=]+$/.test(cleaned) || cleaned.length % 4 !== 0) {
    return {
      success: false,
      output: "",
      error: "Invalid Base64 input: String contains illegal characters or has invalid padding.",
    };
  }

  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const text = decoder.decode(bytes);
    return {
      success: true,
      output: text,
      byteSize: bytes.byteLength,
    };
  } catch {
    return {
      success: false,
      output: "",
      error: "Malformed Base64 payload: Unable to decode byte sequence into valid UTF-8 text.",
    };
  }
}
