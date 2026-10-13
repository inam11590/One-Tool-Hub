/**
 * Client-Side PDF Page Rotator Core Logic
 * 
 * Features:
 * - Rotate individual pages, selected page ranges, or all pages.
 * - Supports 90° clockwise (+90°), 90° counter-clockwise (-90°), and 180° inversion.
 * - Preserves all document annotations, form fields, and content streams.
 * - Generates clean downloadable PDF using pdf-lib.
 * - 100% in-browser processing with zero server uploads.
 */

import { PDFDocument, degrees } from "pdf-lib";
import { hasPdfMagicHeader } from "./pdf-merge-split.ts";

export const MAX_PDF_ROTATE_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export interface PageRotationState {
  pageNumber: number; // 1-indexed
  originalRotation: number; // 0, 90, 180, 270
  rotationDelta: number; // -90, 0, 90, 180, etc.
  finalRotation: number; // 0, 90, 180, 270
}

export interface PdfRotatorDocumentInfo {
  valid: boolean;
  pageCount: number;
  fileName: string;
  fileSizeBytes: number;
  pages: PageRotationState[];
  error?: string;
}

/**
 * Normalizes an angle into [0, 90, 180, 270].
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Inspects PDF document and initializes page rotation states.
 */
export async function inspectPdfForRotation(
  bytes: Uint8Array,
  fileName: string
): Promise<PdfRotatorDocumentInfo> {
  if (bytes.length === 0) {
    return {
      valid: false,
      pageCount: 0,
      fileName,
      fileSizeBytes: 0,
      pages: [],
      error: `"${fileName}" is empty (0 bytes).`,
    };
  }
  if (bytes.length > MAX_PDF_ROTATE_FILE_SIZE) {
    return {
      valid: false,
      pageCount: 0,
      fileName,
      fileSizeBytes: bytes.length,
      pages: [],
      error: `"${fileName}" exceeds the 50 MB file size limit.`,
    };
  }
  if (!hasPdfMagicHeader(bytes)) {
    return {
      valid: false,
      pageCount: 0,
      fileName,
      fileSizeBytes: bytes.length,
      pages: [],
      error: `"${fileName}" is missing standard PDF header (%PDF-).`,
    };
  }

  try {
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: false });
    const pageCount = pdfDoc.getPageCount();
    const pages: PageRotationState[] = [];

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const origRot = normalizeAngle(page.getRotation().angle);
      pages.push({
        pageNumber: i + 1,
        originalRotation: origRot,
        rotationDelta: 0,
        finalRotation: origRot,
      });
    }

    return {
      valid: true,
      pageCount,
      fileName,
      fileSizeBytes: bytes.length,
      pages,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isEncrypted = msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password");
    return {
      valid: false,
      pageCount: 0,
      fileName,
      fileSizeBytes: bytes.length,
      pages: [],
      error: isEncrypted
        ? `"${fileName}" is password-protected or encrypted. Please decrypt it first.`
        : `Could not parse "${fileName}": ${msg}`,
    };
  }
}

/**
 * Applies a rotation delta to specified pages (or all pages).
 */
export function applyRotationDelta(
  currentPages: PageRotationState[],
  delta: 90 | -90 | 180,
  targetPageNumbers?: number[]
): PageRotationState[] {
  const targetSet = targetPageNumbers ? new Set(targetPageNumbers) : null;

  return currentPages.map((p) => {
    if (targetSet && !targetSet.has(p.pageNumber)) {
      return p;
    }
    const newDelta = normalizeAngle(p.rotationDelta + delta);
    const newFinal = normalizeAngle(p.originalRotation + newDelta);
    return {
      ...p,
      rotationDelta: newDelta,
      finalRotation: newFinal,
    };
  });
}

/**
 * Resets all rotation deltas to 0.
 */
export function resetRotations(pages: PageRotationState[]): PageRotationState[] {
  return pages.map((p) => ({
    ...p,
    rotationDelta: 0,
    finalRotation: p.originalRotation,
  }));
}

/**
 * Exports the rotated PDF document.
 */
export async function exportRotatedPdf(
  originalBytes: Uint8Array,
  pages: PageRotationState[],
  outputFileName = "rotated.pdf",
  onProgress?: (step: number, total: number) => void
): Promise<{ bytes: Uint8Array; fileName: string; sizeBytes: number }> {
  if (onProgress) onProgress(1, 3);
  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: false });
  const totalPages = pdfDoc.getPageCount();

  if (onProgress) onProgress(2, 3);
  for (const pageState of pages) {
    const pageIndex = pageState.pageNumber - 1;
    if (pageIndex >= 0 && pageIndex < totalPages) {
      const page = pdfDoc.getPage(pageIndex);
      page.setRotation(degrees(pageState.finalRotation));
    }
  }

  if (onProgress) onProgress(3, 3);
  const savedBytes = await pdfDoc.save();

  const safeName = outputFileName.trim().toLowerCase().endsWith(".pdf")
    ? outputFileName.trim()
    : `${outputFileName.trim() || "rotated-document"}.pdf`;

  return {
    bytes: savedBytes,
    fileName: safeName,
    sizeBytes: savedBytes.byteLength,
  };
}
