/**
 * Client-Side Code & Text Diff Comparison Engine
 * 
 * Features:
 * - Line-by-line comparison using Myers diff algorithm via 'diff' package.
 * - Side-by-side split view and unified single-column view.
 * - Options to ignore trailing whitespace, leading whitespace, or match case-insensitively.
 * - Unified diff patch (.patch / .txt) format export.
 * - Change statistics calculation: additions (+), deletions (-), and total modified lines.
 * - File loading (UTF-8 text, code files) and swap inputs.
 * - 100% in-browser comparison. Zero server upload.
 */

import { diffLines, createTwoFilesPatch, type Change } from "diff";

export type DiffViewMode = "side-by-side" | "unified";

export interface DiffOptions {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  viewMode: DiffViewMode;
}

export interface DiffLineItem {
  type: "added" | "removed" | "unchanged" | "empty";
  originalLineNumber?: number;
  modifiedLineNumber?: number;
  content: string;
}

export interface SideBySideRow {
  left: DiffLineItem;
  right: DiffLineItem;
}

export interface DiffStatistics {
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
  totalLines: number;
}

export interface DiffComputationResult {
  stats: DiffStatistics;
  unifiedLines: DiffLineItem[];
  sideBySideRows: SideBySideRow[];
  patchString: string;
}

export const MAX_DIFF_INPUT_LENGTH = 200_000; // 200 KB per text input limit

/**
 * Normalizes input text according to diff options.
 */
function prepareTextForComparison(
  text: string,
  options: Pick<DiffOptions, "ignoreWhitespace" | "ignoreCase">
): string {
  let result = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (options.ignoreWhitespace) {
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }
  if (options.ignoreCase) {
    result = result.toLowerCase();
  }
  return result;
}

/**
 * Computes side-by-side and unified diffs between original and modified strings.
 */
export function computeCodeDiff(
  originalText: string,
  modifiedText: string,
  options: DiffOptions,
  fileNames: { original?: string; modified?: string } = {}
): DiffComputationResult {
  const normOriginal = originalText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const normModified = modifiedText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const origForDiff = prepareTextForComparison(originalText, options);
  const modForDiff = prepareTextForComparison(modifiedText, options);

  const changes: Change[] = diffLines(origForDiff, modForDiff, {
    ignoreWhitespace: options.ignoreWhitespace,
  });

  const unifiedLines: DiffLineItem[] = [];
  const sideBySideRows: SideBySideRow[] = [];

  let origLineNum = 1;
  let modLineNum = 1;
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  // We iterate through raw lines of original and modified to display true original text
  const rawOrigLines = normOriginal.split("\n");
  const rawModLines = normModified.split("\n");
  let rawOrigIdx = 0;
  let rawModIdx = 0;

  for (const part of changes) {
    const partLines = part.value.endsWith("\n")
      ? part.value.slice(0, -1).split("\n")
      : part.value.split("\n");

    const lineCount = partLines.length;

    if (part.added) {
      addedCount += lineCount;
      for (let i = 0; i < lineCount; i++) {
        const lineContent = rawModLines[rawModIdx] ?? partLines[i] ?? "";
        rawModIdx++;

        const item: DiffLineItem = {
          type: "added",
          modifiedLineNumber: modLineNum++,
          content: lineContent,
        };
        unifiedLines.push(item);
      }
    } else if (part.removed) {
      removedCount += lineCount;
      for (let i = 0; i < lineCount; i++) {
        const lineContent = rawOrigLines[rawOrigIdx] ?? partLines[i] ?? "";
        rawOrigIdx++;

        const item: DiffLineItem = {
          type: "removed",
          originalLineNumber: origLineNum++,
          content: lineContent,
        };
        unifiedLines.push(item);
      }
    } else {
      unchangedCount += lineCount;
      for (let i = 0; i < lineCount; i++) {
        const lineContent = rawOrigLines[rawOrigIdx] ?? rawModLines[rawModIdx] ?? partLines[i] ?? "";
        rawOrigIdx++;
        rawModIdx++;

        const item: DiffLineItem = {
          type: "unchanged",
          originalLineNumber: origLineNum++,
          modifiedLineNumber: modLineNum++,
          content: lineContent,
        };
        unifiedLines.push(item);
      }
    }
  }

  // Construct paired side-by-side rows from unified lines
  let uIdx = 0;
  while (uIdx < unifiedLines.length) {
    const cur = unifiedLines[uIdx]!;

    if (cur.type === "unchanged") {
      sideBySideRows.push({
        left: cur,
        right: cur,
      });
      uIdx++;
    } else if (cur.type === "removed") {
      // Gather contiguous removals
      const removals: DiffLineItem[] = [];
      while (uIdx < unifiedLines.length && unifiedLines[uIdx]!.type === "removed") {
        removals.push(unifiedLines[uIdx]!);
        uIdx++;
      }
      // Gather subsequent contiguous additions (representing modifications)
      const additions: DiffLineItem[] = [];
      while (uIdx < unifiedLines.length && unifiedLines[uIdx]!.type === "added") {
        additions.push(unifiedLines[uIdx]!);
        uIdx++;
      }

      const maxLen = Math.max(removals.length, additions.length);
      for (let r = 0; r < maxLen; r++) {
        const leftItem: DiffLineItem = removals[r] ?? {
          type: "empty",
          content: "",
        };
        const rightItem: DiffLineItem = additions[r] ?? {
          type: "empty",
          content: "",
        };
        sideBySideRows.push({
          left: leftItem,
          right: rightItem,
        });
      }
    } else if (cur.type === "added") {
      sideBySideRows.push({
        left: { type: "empty", content: "" },
        right: cur,
      });
      uIdx++;
    }
  }

  const patchString = createTwoFilesPatch(
    fileNames.original || "original.txt",
    fileNames.modified || "modified.txt",
    normOriginal,
    normModified,
    "Original",
    "Modified"
  );

  return {
    stats: {
      addedCount,
      removedCount,
      unchangedCount,
      totalLines: addedCount + removedCount + unchangedCount,
    },
    unifiedLines,
    sideBySideRows,
    patchString,
  };
}

export const SAMPLE_CODE_DIFF = {
  original: `function calculateTotal(items, discountRate) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    subtotal += items[i].price;
  }

  // Old flat tax calculation
  const tax = subtotal * 0.05;
  return subtotal + tax - discountRate;
}`,
  modified: `function calculateTotal(items, discountRate = 0) {
  // Use modern reduce with initial value guard
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);

  // Dynamic regional tax and percentage discount
  const discount = subtotal * (discountRate / 100);
  const tax = (subtotal - discount) * 0.0825;
  return Number((subtotal - discount + tax).toFixed(2));
}`,
};
