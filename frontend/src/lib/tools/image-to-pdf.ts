/**
 * Client-Side JPG / PNG to PDF Converter Core Logic
 * 
 * Features:
 * - Converts multiple images (JPEG, PNG, WebP) into a structured PDF document.
 * - Supports A4, US Letter, and Fit-to-Image page sizing.
 * - Supports Portrait and Landscape orientations.
 * - Configurable margins (None, Small, Medium, Large) and Fit/Fill aspect modes.
 * - Preserves image aspect ratios and transparency where appropriate.
 * - 100% in-browser generation using pdf-lib. Zero server upload.
 */

import { PDFDocument } from "pdf-lib";

export type PdfPageSize = "a4" | "letter" | "fit-to-image";
export type PdfOrientation = "portrait" | "landscape";
export type PdfMarginOption = "none" | "small" | "medium" | "large";
export type ImageLayoutMode = "fit" | "fill";

export interface ImageToPdfItem {
  id: string;
  name: string;
  size: number;
  type: string;
  bytes: Uint8Array;
  objectUrl: string;
  width: number;
  height: number;
}

export interface ImageToPdfConfig {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMarginOption;
  layoutMode: ImageLayoutMode;
  outputFileName: string;
}

export const PAGE_SIZE_POINTS: Record<"a4" | "letter", { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

export const MARGIN_POINTS: Record<PdfMarginOption, number> = {
  none: 0,
  small: 20,
  medium: 36,
  large: 54,
};

/**
 * Validates uploaded image file metadata.
 */
export function validateImageForPdf(file: { name: string; size: number; type?: string }): {
  valid: boolean;
  error?: string;
} {
  const lowerName = file.name.trim().toLowerCase();
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const hasExt = validExtensions.some((ext) => lowerName.endsWith(ext));
  const validMimes = ["image/jpeg", "image/png", "image/webp"];
  const hasMime = file.type ? validMimes.includes(file.type.toLowerCase()) : false;

  if (!hasExt && !hasMime) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported image file. Please upload JPG, PNG, or WebP.`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: `"${file.name}" is empty (0 bytes).` };
  }

  // 30 MB per image limit
  if (file.size > 30 * 1024 * 1024) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the 30 MB image size limit.`,
    };
  }

  return { valid: true };
}

/**
 * Inspects image byte array in browser to determine width and height.
 */
export async function inspectImageDimensions(
  bytes: Uint8Array,
  mimeType: string
): Promise<{ width: number; height: number }> {
  if (typeof window === "undefined") {
    return { width: 800, height: 600 };
  }

  const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load and inspect image dimensions."));
    };
    img.src = objectUrl;
  });
}

/**
 * Converts WebP bytes to PNG bytes via browser Canvas so pdf-lib can embed it.
 */
export async function convertWebpToPngBytes(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof window === "undefined") return bytes;

  const blob = new Blob([bytes as unknown as BlobPart], { type: "image/webp" });
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to obtain 2D canvas context."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) {
          reject(new Error("Failed to convert WebP to PNG blob."));
          return;
        }
        const buffer = await pngBlob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load WebP image for conversion."));
    };
    img.src = objectUrl;
  });
}

/**
 * Generates a multi-page PDF document from an array of images.
 */
export async function generatePdfFromImages(
  items: ImageToPdfItem[],
  config: ImageToPdfConfig,
  onProgress?: (completed: number, total: number) => void
): Promise<{ bytes: Uint8Array; fileName: string; pageCount: number; sizeBytes: number }> {
  if (items.length === 0) {
    throw new Error("Please add at least one image to create a PDF.");
  }

  const pdfDoc = await PDFDocument.create();
  const marginPt = MARGIN_POINTS[config.margin];
  const total = items.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i, total);
    }
    const item = items[i];
    if (!item) continue;

    // Determine embed format (JPEG, PNG, or convert WebP to PNG)
    let embeddedImage;
    const isPng = item.type.includes("png") || item.name.toLowerCase().endsWith(".png");
    const isWebp = item.type.includes("webp") || item.name.toLowerCase().endsWith(".webp");

    if (isWebp) {
      const pngBytes = await convertWebpToPngBytes(item.bytes);
      embeddedImage = await pdfDoc.embedPng(pngBytes);
    } else if (isPng) {
      embeddedImage = await pdfDoc.embedPng(item.bytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(item.bytes);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    // Calculate Page Dimensions in PDF points
    let pageWidth: number;
    let pageHeight: number;

    if (config.pageSize === "fit-to-image") {
      pageWidth = imgWidth + marginPt * 2;
      pageHeight = imgHeight + marginPt * 2;
    } else {
      const baseSize = PAGE_SIZE_POINTS[config.pageSize];
      if (config.orientation === "landscape") {
        pageWidth = Math.max(baseSize.width, baseSize.height);
        pageHeight = Math.min(baseSize.width, baseSize.height);
      } else {
        pageWidth = Math.min(baseSize.width, baseSize.height);
        pageHeight = Math.max(baseSize.width, baseSize.height);
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Available drawing area after margins
    const printableWidth = Math.max(10, pageWidth - marginPt * 2);
    const printableHeight = Math.max(10, pageHeight - marginPt * 2);

    let drawWidth: number;
    let drawHeight: number;

    if (config.layoutMode === "fit") {
      const scaleX = printableWidth / imgWidth;
      const scaleY = printableHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);
      drawWidth = imgWidth * scale;
      drawHeight = imgHeight * scale;
    } else {
      // fill: cover full printable area
      drawWidth = printableWidth;
      drawHeight = printableHeight;
    }

    // Center image on the page
    const drawX = marginPt + (printableWidth - drawWidth) / 2;
    const drawY = marginPt + (printableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });
  }

  if (onProgress) {
    onProgress(total, total);
  }

  const pdfBytes = await pdfDoc.save();
  const safeName = config.outputFileName.trim().toLowerCase().endsWith(".pdf")
    ? config.outputFileName.trim()
    : `${config.outputFileName.trim() || "converted-images"}.pdf`;

  return {
    bytes: pdfBytes,
    fileName: safeName,
    pageCount: total,
    sizeBytes: pdfBytes.byteLength,
  };
}
