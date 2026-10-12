/**
 * Client-Side Text Compare & Prose Difference Checker
 *
 * Dedicated to prose documents, essays, articles, and general written text.
 * Focuses on word-level and sentence-level changes rather than source-code diffing.
 *
 * 100% In-Browser Execution. Zero server transfer.
 */

import { diffWords, diffLines, type Change } from "diff";

export interface TextCompareOptions {
  mode: "words" | "lines";
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

export interface DiffWordToken {
  type: "added" | "removed" | "unchanged";
  text: string;
}

export interface TextCompareStats {
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
  originalWordCount: number;
  modifiedWordCount: number;
  similarityScore: number; // 0 - 100%
}

export interface TextCompareResult {
  tokens: DiffWordToken[];
  originalTokens: DiffWordToken[];
  modifiedTokens: DiffWordToken[];
  stats: TextCompareStats;
  summaryText: string;
}

export const MAX_TEXT_COMPARE_LENGTH = 150_000; // 150 KB text safety cap

function normalizeText(text: string, options: TextCompareOptions): string {
  let normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (options.ignoreWhitespace) {
    // Collapse multiple spaces/tabs into a single space while keeping single newlines
    normalized = normalized
      .split("\n")
      .map((line) => line.trim().replace(/[ \t]+/g, " "))
      .join("\n");
  }

  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
}

/**
 * Computes word-level or line-level differences between two prose texts.
 */
export function compareProseTexts(
  originalText: string,
  modifiedText: string,
  options: TextCompareOptions = { mode: "words", ignoreCase: false, ignoreWhitespace: false }
): TextCompareResult {
  const normOriginal = normalizeText(originalText, options);
  const normModified = normalizeText(modifiedText, options);

  const changes: Change[] =
    options.mode === "lines"
      ? diffLines(normOriginal, normModified)
      : diffWords(normOriginal, normModified);

  const tokens: DiffWordToken[] = [];
  const originalTokens: DiffWordToken[] = [];
  const modifiedTokens: DiffWordToken[] = [];

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  for (const change of changes) {
    if (change.added) {
      tokens.push({ type: "added", text: change.value });
      modifiedTokens.push({ type: "added", text: change.value });
      addedCount += countWords(change.value);
    } else if (change.removed) {
      tokens.push({ type: "removed", text: change.value });
      originalTokens.push({ type: "removed", text: change.value });
      removedCount += countWords(change.value);
    } else {
      tokens.push({ type: "unchanged", text: change.value });
      originalTokens.push({ type: "unchanged", text: change.value });
      modifiedTokens.push({ type: "unchanged", text: change.value });
      unchangedCount += countWords(change.value);
    }
  }

  const originalWordCount = countWords(originalText);
  const modifiedWordCount = countWords(modifiedText);

  // Compute similarity score percentage
  const totalDifferenceTokens = addedCount + removedCount;
  const totalTokens = totalDifferenceTokens + unchangedCount;
  const similarityScore =
    totalTokens > 0
      ? Math.max(0, Math.min(100, Math.round((unchangedCount / totalTokens) * 100)))
      : 100;

  const summaryText = buildComparisonSummary({
    addedCount,
    removedCount,
    unchangedCount,
    originalWordCount,
    modifiedWordCount,
    similarityScore,
  });

  return {
    tokens,
    originalTokens,
    modifiedTokens,
    stats: {
      addedCount,
      removedCount,
      unchangedCount,
      originalWordCount,
      modifiedWordCount,
      similarityScore,
    },
    summaryText,
  };
}

function countWords(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function buildComparisonSummary(stats: TextCompareStats): string {
  return [
    "=== OneToolHub Text Comparison Summary ===",
    `Original Document: ${stats.originalWordCount.toLocaleString()} words`,
    `Modified Document: ${stats.modifiedWordCount.toLocaleString()} words`,
    "------------------------------------------",
    `Words Added:       +${stats.addedCount.toLocaleString()}`,
    `Words Removed:     -${stats.removedCount.toLocaleString()}`,
    `Words Unchanged:    ${stats.unchangedCount.toLocaleString()}`,
    `Similarity Score:   ${stats.similarityScore}% match`,
    "------------------------------------------",
    "Note: This tool highlights textual modifications. It does not evaluate grammar, originality, or plagiarism.",
  ].join("\n");
}

export const SAMPLE_TEXT_COMPARE_ORIGINAL = `In the first semester of university, students often face challenges in balancing coursework, extracurricular activities, and personal life. Time management techniques like the Pomodoro method and weekly planner schedules can significantly improve academic performance and reduce exam anxiety.`;

export const SAMPLE_TEXT_COMPARE_MODIFIED = `During their first semester at college, students frequently encounter obstacles when balancing rigorous coursework, campus leadership roles, and personal well-being. Proven time management strategies—such as the Pomodoro technique and structured weekly schedules—dramatically improve overall grades while minimizing deadline stress.`;
