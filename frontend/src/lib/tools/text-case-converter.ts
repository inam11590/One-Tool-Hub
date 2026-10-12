/**
 * Client-Side Text Case Converter Engine
 *
 * Supported Conversions:
 * - UPPERCASE: Every letter converted to uppercase.
 * - lowercase: Every letter converted to lowercase.
 * - Title Case: AP & Chicago style capitalization rules (capitalizes major words, keeps minor prepositions/articles lowercase unless first or last).
 * - Sentence case: Capitalizes the first word of each sentence after terminators (. ! ?) and line breaks.
 * - Capitalize Each Word (Start Case): Capitalizes every single word's first letter.
 * - Toggle Case (Invert Case): Inverts character cases (uppercase -> lowercase, lowercase -> uppercase).
 * - camelCase, snake_case, kebab-case, CONSTANT_CASE: Popular programming formatting cases.
 *
 * 100% Client-Side. No external APIs.
 */

export type CaseConversionType =
  | "uppercase"
  | "lowercase"
  | "titlecase"
  | "sentencecase"
  | "capitalizeWords"
  | "togglecase"
  | "camelcase"
  | "snakecase"
  | "kebabcase"
  | "constantcase";

const TITLE_CASE_MINOR_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "on",
  "at",
  "to",
  "from",
  "by",
  "in",
  "of",
  "with",
  "as",
  "via",
]);

/**
 * Converts input text to AP/Chicago style Title Case while preserving paragraphs and punctuation.
 */
export function toTitleCase(text: string): string {
  if (!text) return "";

  // Split into lines to preserve paragraph breaks
  const lines = text.split("\n");

  const convertedLines = lines.map((line) => {
    // If the line is empty or only whitespace, preserve it
    if (!line.trim()) return line;

    // Tokenize words and non-words (spaces, punctuation)
    const tokens = line.split(/(\s+|[—–\-])/);
    const wordTokens = tokens.filter((t) => /[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/.test(t));
    const totalWords = wordTokens.length;
    let wordIdx = -1;

    return tokens
      .map((token) => {
        // If not a word token, preserve whitespace/hyphens
        if (!/[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/.test(token)) {
          return token;
        }

        wordIdx++;
        const lower = token.toLowerCase();
        const isFirst = wordIdx === 0;
        const isLast = wordIdx === totalWords - 1;

        // Minor words stay lowercase unless they are the first or last word
        if (!isFirst && !isLast && TITLE_CASE_MINOR_WORDS.has(lower)) {
          return lower;
        }

        // Capitalize first letter of the word, keep rest of word lowercase
        return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
      })
      .join("");
  });

  return convertedLines.join("\n");
}

/**
 * Converts input text to standard Sentence case.
 * Capitalizes the first character following sentence terminators (. ! ?) and newlines.
 */
export function toSentenceCase(text: string): string {
  if (!text) return "";

  // Lowercase the entire text first
  const lower = text.toLowerCase();

  // Capitalize first letter of string and any letter following (. ! ? \n) + whitespace
  return lower.replace(/(^\s*|[.!?\n]\s+)([a-zA-Z\u00C0-\u024F\u1E00-\u1EFF])/g, (match, prefix, char) => {
    return prefix + char.toUpperCase();
  });
}

/**
 * Capitalizes the first letter of each word unconditionally.
 */
export function toCapitalizeEachWord(text: string): string {
  if (!text) return "";

  return text.replace(/\b([a-zA-Z\u00C0-\u024F\u1E00-\u1EFF])/g, (match, char) => {
    return char.toUpperCase();
  });
}

/**
 * Inverts the casing of each character (a -> A, B -> b).
 */
export function toToggleCase(text: string): string {
  if (!text) return "";

  let result = "";
  for (const char of text) {
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      result += char.toLowerCase();
    } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
      result += char.toUpperCase();
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Converts text to camelCase.
 */
export function toCamelCase(text: string): string {
  if (!text) return "";

  const words = text
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  return words
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

/**
 * Converts text to snake_case.
 */
export function toSnakeCase(text: string): string {
  if (!text) return "";

  return text
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

/**
 * Converts text to kebab-case.
 */
export function toKebabCase(text: string): string {
  if (!text) return "";

  return text
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/**
 * Converts text to CONSTANT_CASE.
 */
export function toConstantCase(text: string): string {
  if (!text) return "";

  return toSnakeCase(text).toUpperCase();
}

/**
 * Master conversion dispatcher.
 */
export function convertTextCase(text: string, mode: CaseConversionType): string {
  switch (mode) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return toTitleCase(text);
    case "sentencecase":
      return toSentenceCase(text);
    case "capitalizeWords":
      return toCapitalizeEachWord(text);
    case "togglecase":
      return toToggleCase(text);
    case "camelcase":
      return toCamelCase(text);
    case "snakecase":
      return toSnakeCase(text);
    case "kebabcase":
      return toKebabCase(text);
    case "constantcase":
      return toConstantCase(text);
    default:
      return text;
  }
}

/**
 * Computes live word and character counts for text inspection.
 */
export function getTextStatistics(text: string): {
  characterCount: number;
  characterCountNoSpaces: number;
  wordCount: number;
  lineCount: number;
  paragraphCount: number;
} {
  const characterCount = text.length;
  const characterCountNoSpaces = text.replace(/\s/g, "").length;
  const lineCount = text ? text.split("\n").length : 0;
  const paragraphCount = text
    ? text
        .split(/\n\s*\n/)
        .filter((p) => p.trim().length > 0).length
    : 0;

  // Word counting with Unicode word boundary regex
  const trimmed = text.trim();
  const wordCount = trimmed
    ? trimmed.split(/\s+/).filter((w) => w.length > 0).length
    : 0;

  return {
    characterCount,
    characterCountNoSpaces,
    wordCount,
    lineCount,
    paragraphCount,
  };
}

export const SAMPLE_TEXT_CASE_CONTENT =
  "the quick brown fox jumps over the lazy dog. it was the best of times, it was the worst of times! can you believe it? one-tool-hub is fast and free.";
