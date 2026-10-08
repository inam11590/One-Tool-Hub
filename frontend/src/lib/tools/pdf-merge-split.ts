import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const MAX_PDF_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB per file
export const MAX_TOTAL_MERGE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB combined
export const MAX_MERGE_FILES_COUNT = 25;
export const MAX_PDF_PAGE_COUNT = 500;

export type PdfSplitOutputMode = "single-combined" | "separate-files";

export interface PdfFileMetadataInput {
  name: string;
  type: string;
  size: number;
}

export interface PdfInspectionResult {
  valid: boolean;
  pageCount: number;
  isEncrypted?: boolean;
  error?: string;
}

export interface PageRangeSegment {
  label: string;
  startPage: number; // 1-indexed inclusive
  endPage: number; // 1-indexed inclusive
  pageNumbers: number[]; // 1-indexed page numbers in this segment
}

export interface PageRangeParseResult {
  valid: boolean;
  segments: PageRangeSegment[];
  uniqueSortedPages: number[]; // 1-indexed
  orderedPages: number[]; // 1-indexed in user-specified order
  error?: string;
}

export interface GeneratedPdfOutput {
  fileName: string;
  pageCount: number;
  bytes: Uint8Array;
  rangeLabel: string;
}

export function validatePdfFileMetadata(
  file: PdfFileMetadataInput
): { valid: boolean; error?: string } {
  const lowerName = file.name.trim().toLowerCase();
  const isPdfMime = file.type === "application/pdf";
  const hasPdfExt = lowerName.endsWith(".pdf");

  if (!isPdfMime && !hasPdfExt) {
    return {
      valid: false,
      error: `"${file.name}" is not a PDF file. Please select a valid .pdf document.`,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: `"${file.name}" is empty (0 bytes).`,
    };
  }

  if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the 50 MB per-file limit for local browser processing.`,
    };
  }

  return { valid: true };
}

/**
 * Checks whether the byte buffer starts with the `%PDF-` magic header within the first 1024 bytes.
 */
export function hasPdfMagicHeader(bytes: Uint8Array): boolean {
  if (!bytes || bytes.byteLength < 5) {
    return false;
  }
  const searchLen = Math.min(bytes.byteLength, 1024);
  const headerSlice = bytes.subarray(0, searchLen);
  const ascii = new TextDecoder("latin1").decode(headerSlice);
  return ascii.includes("%PDF-");
}

/**
 * Inspects a PDF byte array using pdf-lib, detecting corrupted files,
 * password-protected/encrypted PDFs, and excessive page counts.
 */
export async function inspectPdfBytes(
  bytes: Uint8Array,
  fileName = "document.pdf"
): Promise<PdfInspectionResult> {
  if (!bytes || bytes.byteLength === 0) {
    return {
      valid: false,
      pageCount: 0,
      error: `"${fileName}" is empty (0 bytes).`,
    };
  }

  if (bytes.byteLength > MAX_PDF_FILE_SIZE_BYTES) {
    return {
      valid: false,
      pageCount: 0,
      error: `"${fileName}" exceeds the 50 MB file size limit.`,
    };
  }

  if (!hasPdfMagicHeader(bytes)) {
    return {
      valid: false,
      pageCount: 0,
      error: `"${fileName}" does not contain a valid PDF file header (%PDF-). The file may be corrupted or not a real PDF.`,
    };
  }

  try {
    const doc = await PDFDocument.load(bytes, {
      updateMetadata: false,
    });

    if (doc.isEncrypted) {
      return {
        valid: false,
        pageCount: 0,
        isEncrypted: true,
        error: `"${fileName}" is password-protected or encrypted. Encrypted PDFs are not supported—please remove the password before uploading.`,
      };
    }

    const pageCount = doc.getPageCount();
    if (pageCount <= 0) {
      return {
        valid: false,
        pageCount: 0,
        error: `"${fileName}" contains 0 pages.`,
      };
    }

    if (pageCount > MAX_PDF_PAGE_COUNT) {
      return {
        valid: false,
        pageCount,
        error: `"${fileName}" has ${pageCount} pages, which exceeds the ${MAX_PDF_PAGE_COUNT}-page browser memory safety limit.`,
      };
    }

    return {
      valid: true,
      pageCount,
      isEncrypted: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("encrypt") || lowerMsg.includes("password")) {
      return {
        valid: false,
        pageCount: 0,
        isEncrypted: true,
        error: `"${fileName}" is password-protected or encrypted. Encrypted PDFs are not supported—please remove the password before uploading.`,
      };
    }

    return {
      valid: false,
      pageCount: 0,
      error: `"${fileName}" could not be parsed as a valid PDF document. It may be corrupted or use an unsupported PDF structure.`,
    };
  }
}

/**
 * Reorders an array of items by moving the item at `fromIndex` to `toIndex`.
 */
export function reorderArrayItems<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const copy = [...items];
  if (
    fromIndex < 0 ||
    fromIndex >= copy.length ||
    toIndex < 0 ||
    toIndex >= copy.length ||
    fromIndex === toIndex
  ) {
    return copy;
  }
  const [moved] = copy.splice(fromIndex, 1);
  if (moved !== undefined) {
    copy.splice(toIndex, 0, moved);
  }
  return copy;
}

/**
 * Merges multiple PDF byte arrays in the exact order provided.
 */
export async function mergePdfDocuments(
  sources: readonly { name: string; bytes: Uint8Array }[]
): Promise<{
  valid: boolean;
  mergedBytes?: Uint8Array;
  totalPages?: number;
  error?: string;
}> {
  if (!sources || sources.length < 2) {
    return {
      valid: false,
      error: "Please upload at least 2 PDF files to merge.",
    };
  }

  if (sources.length > MAX_MERGE_FILES_COUNT) {
    return {
      valid: false,
      error: `You can merge up to ${MAX_MERGE_FILES_COUNT} PDF files at a time.`,
    };
  }

  let totalBytes = 0;
  for (const src of sources) {
    totalBytes += src.bytes.byteLength;
  }
  if (totalBytes > MAX_TOTAL_MERGE_SIZE_BYTES) {
    return {
      valid: false,
      error: "Total combined size of uploaded PDFs exceeds the 100 MB browser memory limit.",
    };
  }

  try {
    const mergedPdf = await PDFDocument.create();
    mergedPdf.setCreator("OneToolHub PDF Merge & Split");

    let runningPageCount = 0;

    for (const src of sources) {
      const inspection = await inspectPdfBytes(src.bytes, src.name);
      if (!inspection.valid) {
        return {
          valid: false,
          error: inspection.error,
        };
      }

      runningPageCount += inspection.pageCount;
      if (runningPageCount > MAX_PDF_PAGE_COUNT) {
        return {
          valid: false,
          error: `Combined PDF page count (${runningPageCount} pages) exceeds the ${MAX_PDF_PAGE_COUNT}-page limit.`,
        };
      }

      const donorPdf = await PDFDocument.load(src.bytes, {
        updateMetadata: false,
      });
      const copiedPages = await mergedPdf.copyPages(
        donorPdf,
        donorPdf.getPageIndices()
      );
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    const mergedBytes = await mergedPdf.save();
    return {
      valid: true,
      mergedBytes,
      totalPages: runningPageCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      error: `Failed to merge PDF files: ${message}`,
    };
  }
}

/**
 * Parses page range expressions like "1-3, 5, 7-10" against a document's total page count.
 */
export function parsePageRanges(
  rangeInput: string,
  totalPages: number
): PageRangeParseResult {
  if (!Number.isInteger(totalPages) || totalPages <= 0) {
    return {
      valid: false,
      segments: [],
      uniqueSortedPages: [],
      orderedPages: [],
      error: "Document must have at least 1 page.",
    };
  }

  const trimmed = rangeInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      segments: [],
      uniqueSortedPages: [],
      orderedPages: [],
      error:
        "Please enter at least one page number or range (for example: 1-3, 5, 7-10).",
    };
  }

  const parts = trimmed.split(",").map((part) => part.trim());
  const segments: PageRangeSegment[] = [];
  const orderedPages: number[] = [];
  const uniqueSet = new Set<number>();

  for (const part of parts) {
    if (!part) {
      return {
        valid: false,
        segments: [],
        uniqueSortedPages: [],
        orderedPages: [],
        error:
          "Invalid page range syntax: empty comma-separated segment detected.",
      };
    }

    // Single page number
    if (/^\d+$/.test(part)) {
      const pageNum = Number(part);
      if (pageNum < 1 || pageNum > totalPages) {
        return {
          valid: false,
          segments: [],
          uniqueSortedPages: [],
          orderedPages: [],
          error: `Page ${pageNum} is out of bounds. The uploaded PDF has ${totalPages} ${totalPages === 1 ? "page" : "pages"} (valid range: 1–${totalPages}).`,
        };
      }
      segments.push({
        label: `page-${pageNum}`,
        startPage: pageNum,
        endPage: pageNum,
        pageNumbers: [pageNum],
      });
      orderedPages.push(pageNum);
      uniqueSet.add(pageNum);
      continue;
    }

    // Range start-end
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (rangeMatch) {
      const startPage = Number(rangeMatch[1]);
      const endPage = Number(rangeMatch[2]);

      if (startPage < 1 || endPage < 1) {
        return {
          valid: false,
          segments: [],
          uniqueSortedPages: [],
          orderedPages: [],
          error: `Invalid range "${part}": page numbers must start at 1.`,
        };
      }

      if (startPage > endPage) {
        return {
          valid: false,
          segments: [],
          uniqueSortedPages: [],
          orderedPages: [],
          error: `Invalid range "${part}": start page (${startPage}) cannot be greater than end page (${endPage}).`,
        };
      }

      if (endPage > totalPages) {
        return {
          valid: false,
          segments: [],
          uniqueSortedPages: [],
          orderedPages: [],
          error: `Range "${part}" exceeds the document length of ${totalPages} ${totalPages === 1 ? "page" : "pages"}.`,
        };
      }

      const pageNumbers: number[] = [];
      for (let p = startPage; p <= endPage; p++) {
        pageNumbers.push(p);
        orderedPages.push(p);
        uniqueSet.add(p);
      }

      segments.push({
        label: startPage === endPage ? `page-${startPage}` : `pages-${startPage}-${endPage}`,
        startPage,
        endPage,
        pageNumbers,
      });
      continue;
    }

    return {
      valid: false,
      segments: [],
      uniqueSortedPages: [],
      orderedPages: [],
      error: `Invalid range token "${part}". Use numbers and hyphens separated by commas (e.g., 1-3, 5, 7-10).`,
    };
  }

  return {
    valid: true,
    segments,
    uniqueSortedPages: Array.from(uniqueSet).sort((a, b) => a - b),
    orderedPages,
  };
}

function sanitizeBaseFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.pdf$/i, "").trim();
  const cleaned = withoutExt.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "document";
}

/**
 * Splits or extracts pages from a PDF document into either:
 * - "single-combined": one PDF containing all specified pages/ranges in order
 * - "separate-files": one PDF file per range segment
 */
export async function splitPdfDocument(
  sourceBytes: Uint8Array,
  sourceFileName: string,
  rangeInput: string,
  outputMode: PdfSplitOutputMode = "single-combined"
): Promise<{
  valid: boolean;
  outputs: GeneratedPdfOutput[];
  error?: string;
}> {
  const inspection = await inspectPdfBytes(sourceBytes, sourceFileName);
  if (!inspection.valid) {
    return {
      valid: false,
      outputs: [],
      error: inspection.error,
    };
  }

  const parsedRanges = parsePageRanges(rangeInput, inspection.pageCount);
  if (!parsedRanges.valid) {
    return {
      valid: false,
      outputs: [],
      error: parsedRanges.error,
    };
  }

  const baseName = sanitizeBaseFileName(sourceFileName);

  try {
    const sourceDoc = await PDFDocument.load(sourceBytes, {
      updateMetadata: false,
    });

    if (outputMode === "single-combined") {
      const targetDoc = await PDFDocument.create();
      targetDoc.setCreator("OneToolHub PDF Merge & Split");

      const zeroBasedIndices = parsedRanges.orderedPages.map((p) => p - 1);
      const copiedPages = await targetDoc.copyPages(sourceDoc, zeroBasedIndices);
      for (const page of copiedPages) {
        targetDoc.addPage(page);
      }

      const outBytes = await targetDoc.save();
      return {
        valid: true,
        outputs: [
          {
            fileName: `${baseName}-extracted.pdf`,
            pageCount: copiedPages.length,
            bytes: outBytes,
            rangeLabel: rangeInput.trim(),
          },
        ],
      };
    }

    // Separate PDF file per segment
    const outputs: GeneratedPdfOutput[] = [];
    for (const segment of parsedRanges.segments) {
      const segDoc = await PDFDocument.create();
      segDoc.setCreator("OneToolHub PDF Merge & Split");

      const zeroBasedIndices = segment.pageNumbers.map((p) => p - 1);
      const copiedPages = await segDoc.copyPages(sourceDoc, zeroBasedIndices);
      for (const page of copiedPages) {
        segDoc.addPage(page);
      }

      const segBytes = await segDoc.save();
      outputs.push({
        fileName: `${baseName}-${segment.label}.pdf`,
        pageCount: copiedPages.length,
        bytes: segBytes,
        rangeLabel:
          segment.startPage === segment.endPage
            ? `Page ${segment.startPage}`
            : `Pages ${segment.startPage}–${segment.endPage}`,
      });
    }

    return {
      valid: true,
      outputs,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      outputs: [],
      error: `Failed to extract PDF pages: ${message}`,
    };
  }
}

/**
 * Generates a clean multi-page sample PDF in memory for instant browser demoing and testing.
 */
export async function createSamplePdfBytes(
  documentTitle: string,
  pageCount: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const safeCount = Math.max(1, Math.min(pageCount, 20));
  for (let i = 1; i <= safeCount; i++) {
    const page = doc.addPage([595.28, 841.89]);
    page.drawRectangle({
      x: 48,
      y: 720,
      width: 499.28,
      height: 64,
      color: rgb(0.95, 0.96, 1.0),
    });
    page.drawText(documentTitle, {
      x: 64,
      y: 754,
      size: 16,
      font: fontBold,
      color: rgb(0.22, 0.24, 0.82),
    });
    page.drawText(`Sample Document — Page ${i} of ${safeCount}`, {
      x: 64,
      y: 734,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });
    page.drawText(
      `This sample page (${i}/${safeCount}) was generated locally in your browser by OneToolHub.`,
      {
        x: 48,
        y: 680,
        size: 10.5,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.25),
      }
    );
  }

  return doc.save();
}
