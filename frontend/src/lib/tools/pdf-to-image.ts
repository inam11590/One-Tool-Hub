/**
 * Client-Side PDF to JPG / PNG Converter Core Logic
 * 
 * Features:
 * - PDF.js client-side rendering with local worker (/pdf.worker.min.mjs).
 * - Multi-page rendering to canvas with customizable scale (1x, 1.5x, 2x).
 * - Format selection: JPEG (with quality control) or PNG.
 * - Single image download & ZIP bundling using JSZip.
 * - Zero server upload or remote data transmission.
 */

import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  MAX_PDF_FILE_SIZE_BYTES,
  hasPdfMagicHeader,
  parsePageRanges,
  type PageRangeParseResult,
} from "./pdf-merge-split.ts";

export type ImageOutputFormat = "image/jpeg" | "image/png";

export type PdfJsDocument = PDFDocumentProxy;

export interface PdfToImageConfig {
  scale: number; // 1, 1.5, 2
  format: ImageOutputFormat;
  quality: number; // 0.6 - 1.0 (for JPEG)
  selectedPages: number[]; // 1-indexed page numbers
}

export interface RenderedPageImage {
  pageNumber: number;
  fileName: string;
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface PdfDocumentInfo {
  valid: boolean;
  pageCount: number;
  fileName: string;
  fileSizeBytes: number;
  error?: string;
}

/**
 * Dynamically loads pdfjs-dist on client and configures local worker.
 */
export async function getPdfjsLib() {
  if (typeof window === "undefined") {
    throw new Error("PDF rendering is only supported in browser environments.");
  }
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjs;
}

/**
 * Validates PDF metadata and magic header.
 */
export function validatePdfForConversion(
  file: { name: string; size: number; type?: string },
  bytes?: Uint8Array
): { valid: boolean; error?: string } {
  const lowerName = file.name.trim().toLowerCase();
  if (!lowerName.endsWith(".pdf") && file.type !== "application/pdf") {
    return {
      valid: false,
      error: `"${file.name}" is not a valid PDF file. Please select a .pdf file.`,
    };
  }
  if (file.size <= 0) {
    return { valid: false, error: `"${file.name}" is empty (0 bytes).` };
  }
  if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the 50 MB limit for browser-based processing.`,
    };
  }
  if (bytes && !hasPdfMagicHeader(bytes)) {
    return {
      valid: false,
      error: `"${file.name}" is missing a valid PDF header (%PDF-). File may be corrupted.`,
    };
  }
  return { valid: true };
}

/**
 * Loads a PDF document via PDF.js and returns page count.
 */
export async function loadPdfDocument(bytes: Uint8Array): Promise<PdfJsDocument> {
  const pdfjs = await getPdfjsLib();
  const loadingTask = pdfjs.getDocument({
    data: bytes,
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/",
    cMapPacked: true,
  });
  return (await loadingTask.promise) as unknown as PdfJsDocument;
}

/**
 * Renders a single PDF page to an offscreen HTML5 canvas and converts to Blob.
 */
export async function renderPageToImageBlob(
  pdfDoc: PdfJsDocument,
  pageNumber: number,
  scale = 1.5,
  format: ImageOutputFormat = "image/jpeg",
  quality = 0.9
): Promise<{ blob: Blob; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext("2d", { alpha: format === "image/png" });
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas rendering context.");
  }

  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  await page.render(renderContext).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to encode page ${pageNumber} to ${format}.`));
          return;
        }
        resolve({
          blob,
          width: canvas.width,
          height: canvas.height,
        });
      },
      format,
      format === "image/jpeg" ? quality : undefined
    );
  });
}

/**
 * Converts selected pages of a PDF to images sequentially.
 */
export async function convertPdfPagesToImages(
  pdfDoc: PdfJsDocument,
  baseFileName: string,
  config: PdfToImageConfig,
  onProgress?: (completed: number, total: number, currentPage: number) => void
): Promise<RenderedPageImage[]> {
  const cleanBaseName = baseFileName.replace(/\.pdf$/i, "");
  const ext = config.format === "image/jpeg" ? "jpg" : "png";
  const results: RenderedPageImage[] = [];
  const total = config.selectedPages.length;

  for (let i = 0; i < total; i++) {
    const pageNum = config.selectedPages[i];
    if (pageNum === undefined) continue;
    if (onProgress) {
      onProgress(i, total, pageNum);
    }

    const { blob, width, height } = await renderPageToImageBlob(
      pdfDoc,
      pageNum,
      config.scale,
      config.format,
      config.quality
    );

    const paddedNum = String(pageNum).padStart(3, "0");
    const fileName = `${cleanBaseName}-page-${paddedNum}.${ext}`;
    const objectUrl = URL.createObjectURL(blob);

    results.push({
      pageNumber: pageNum,
      fileName,
      blob,
      objectUrl,
      width,
      height,
      sizeBytes: blob.size,
    });
  }

  if (onProgress) {
    onProgress(total, total, config.selectedPages[total - 1] || total);
  }

  return results;
}

/**
 * Bundles multiple rendered image blobs into a ZIP archive using JSZip.
 */
export async function createImagesZip(
  images: RenderedPageImage[],
  zipFileName = "pdf-pages.zip"
): Promise<{ blob: Blob; fileName: string }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const img of images) {
    zip.file(img.fileName, img.blob);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { blob, fileName: zipFileName };
}

export { parsePageRanges, type PageRangeParseResult };
