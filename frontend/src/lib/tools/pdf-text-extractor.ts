/**
 * Client-Side PDF Text Extractor Core Logic
 * 
 * Features:
 * - Extracts selectable text from PDF documents using PDF.js.
 * - Supports extraction of all pages or selected page ranges.
 * - Preserves page boundaries and line formatting.
 * - Counts characters and words accurately.
 * - Detects scanned documents with zero text layers ("This document may require OCR").
 * - Exports formatted text as UTF-8 .txt files.
 * - 100% in-browser processing with zero server uploads.
 */

import { getPdfjsLib } from "./pdf-to-image.ts";
import {
  hasPdfMagicHeader,
  parsePageRanges,
  type PageRangeParseResult,
} from "./pdf-merge-split.ts";

export const MAX_TEXT_EXTRACT_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_TEXT_EXTRACT_PAGES = 300;

export interface PageTextResult {
  pageNumber: number;
  text: string;
  wordCount: number;
  charCount: number;
}

export interface PdfTextExtractionOutput {
  fileName: string;
  totalPages: number;
  extractedPagesCount: number;
  fullText: string;
  pages: PageTextResult[];
  totalWordCount: number;
  totalCharCount: number;
  hasSelectableText: boolean;
}

/**
 * Counts words in a string accurately, supporting Unicode words.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match whitespace-separated word tokens
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Validates candidate PDF bytes for text extraction.
 */
export function validatePdfForTextExtraction(
  bytes: Uint8Array,
  fileName: string
): { valid: boolean; error?: string } {
  if (bytes.length === 0) {
    return { valid: false, error: `"${fileName}" is empty (0 bytes).` };
  }
  if (bytes.length > MAX_TEXT_EXTRACT_FILE_SIZE) {
    return {
      valid: false,
      error: `"${fileName}" exceeds the 50 MB file size limit for in-browser text extraction.`,
    };
  }
  if (!hasPdfMagicHeader(bytes)) {
    return {
      valid: false,
      error: `"${fileName}" is missing the standard PDF header (%PDF-). Please choose a valid PDF file.`,
    };
  }
  return { valid: true };
}

/**
 * Extracts selectable text from PDF document bytes.
 */
export async function extractTextFromPdf(
  bytes: Uint8Array,
  fileName: string,
  options?: {
    pageRangeString?: string;
    onProgress?: (currentPage: number, totalPages: number) => void;
  }
): Promise<PdfTextExtractionOutput> {
  const validation = validatePdfForTextExtraction(bytes, fileName);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid PDF file.");
  }

  const pdfjs = await getPdfjsLib();
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/",
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  // Determine target pages
  let targetPages: number[] = [];
  if (options?.pageRangeString && options.pageRangeString.trim()) {
    const rangeResult: PageRangeParseResult = parsePageRanges(
      options.pageRangeString,
      totalPages
    );
    if (!rangeResult.valid || rangeResult.uniqueSortedPages.length === 0) {
      throw new Error(rangeResult.error || "Invalid page range specified.");
    }
    targetPages = rangeResult.uniqueSortedPages;
  } else {
    for (let i = 1; i <= Math.min(totalPages, MAX_TEXT_EXTRACT_PAGES); i++) {
      targetPages.push(i);
    }
  }

  const pagesOutput: PageTextResult[] = [];
  const fullTextParts: string[] = [];

  for (let idx = 0; idx < targetPages.length; idx++) {
    const pageNum = targetPages[idx];
    if (!pageNum) continue;
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Extract text items preserving vertical separation
    const lines: string[] = [];
    let currentLine = "";
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if ("str" in item) {
        const str = item.str;
        // Check transform matrix for vertical line jump
        const currentY = item.transform ? item.transform[5] : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = str;
        } else {
          currentLine += (currentLine.endsWith(" ") || str.startsWith(" ") ? "" : " ") + str;
        }
        lastY = currentY;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    const pageText = lines.join("\n").trim();
    const wordCount = countWords(pageText);
    const charCount = pageText.length;

    pagesOutput.push({
      pageNumber: pageNum,
      text: pageText,
      wordCount,
      charCount,
    });

    const header = totalPages > 1 ? `--- Page ${pageNum} of ${totalPages} ---\n` : "";
    fullTextParts.push(header + (pageText || "[No selectable text on this page]"));

    if (options?.onProgress) {
      options.onProgress(idx + 1, targetPages.length);
    }
  }

  const fullText = fullTextParts.join("\n\n");
  const totalWordCount = pagesOutput.reduce((acc, p) => acc + p.wordCount, 0);
  const totalCharCount = pagesOutput.reduce((acc, p) => acc + p.charCount, 0);
  const hasSelectableText = totalCharCount > 0;

  return {
    fileName,
    totalPages,
    extractedPagesCount: targetPages.length,
    fullText,
    pages: pagesOutput,
    totalWordCount,
    totalCharCount,
    hasSelectableText,
  };
}
