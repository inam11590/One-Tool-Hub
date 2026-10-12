/**
 * Client-Side PDF Watermark Core Logic
 * 
 * Features:
 * - Adds customizable text watermarks to PDF pages using standard PDF fonts.
 * - Supports Center, Corner, and Tiled repeating grid placements.
 * - Granular control over font size, rotation angle, opacity, and text color.
 * - Supports all pages or selected custom page ranges.
 * - Zero server upload: all rendering and PDF writing occurs in client memory via pdf-lib.
 */

import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  type RGB,
  type PDFFont,
} from "pdf-lib";
import { parsePageRanges } from "./pdf-merge-split.ts";

export type WatermarkPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "tile";

export type WatermarkFontFamily =
  | "HelveticaBold"
  | "Helvetica"
  | "TimesRomanBold"
  | "CourierBold";

export interface WatermarkConfig {
  text: string;
  fontSize: number; // 12 - 120
  fontFamily: WatermarkFontFamily;
  colorHex: string; // e.g. #ef4444 or #6b7280
  opacity: number; // 0.05 - 1.0
  rotationDegrees: number; // -90 to +90
  position: WatermarkPosition;
  pageSelection: "all" | "custom";
  customPagesString?: string; // e.g. "1-3, 5"
}

/**
 * Converts a hex color string (#rrggbb or #rgb) to pdf-lib RGB values (0-1).
 */
export function hexToPdfRgb(hex: string): RGB {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return rgb(0.5, 0.5, 0.5); // fallback gray
  }
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

/**
 * Resolves standard embedded font in pdf-lib.
 */
export async function getStandardPdfFont(
  doc: PDFDocument,
  family: WatermarkFontFamily
): Promise<PDFFont> {
  switch (family) {
    case "HelveticaBold":
      return await doc.embedFont(StandardFonts.HelveticaBold);
    case "Helvetica":
      return await doc.embedFont(StandardFonts.Helvetica);
    case "TimesRomanBold":
      return await doc.embedFont(StandardFonts.TimesRomanBold);
    case "CourierBold":
      return await doc.embedFont(StandardFonts.CourierBold);
    default:
      return await doc.embedFont(StandardFonts.HelveticaBold);
  }
}

/**
 * Applies watermark text to specified pages of a PDF document.
 */
export async function applyWatermarkToPdf(
  originalBytes: Uint8Array,
  config: WatermarkConfig,
  outputFileName = "watermarked.pdf",
  onProgress?: (current: number, total: number) => void
): Promise<{ bytes: Uint8Array; fileName: string; pageCount: number; sizeBytes: number }> {
  if (!config.text.trim()) {
    throw new Error("Watermark text cannot be empty.");
  }

  const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: false });
  const font = await getStandardPdfFont(pdfDoc, config.fontFamily);
  const color = hexToPdfRgb(config.colorHex);
  const totalPages = pdfDoc.getPageCount();

  // Determine target pages
  let targetPageIndices: number[] = [];
  if (config.pageSelection === "all") {
    targetPageIndices = Array.from({ length: totalPages }, (_, i) => i);
  } else {
    const rangeRes = parsePageRanges(config.customPagesString || "", totalPages);
    if (!rangeRes.valid || rangeRes.uniqueSortedPages.length === 0) {
      throw new Error(rangeRes.error || "Invalid custom page range.");
    }
    targetPageIndices = rangeRes.uniqueSortedPages.map((p) => p - 1);
  }

  const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);
  const textHeight = font.heightAtSize(config.fontSize);

  for (let idx = 0; idx < targetPageIndices.length; idx++) {
    const pageIndex = targetPageIndices[idx];
    if (pageIndex === undefined || pageIndex < 0 || pageIndex >= totalPages) continue;

    if (onProgress) {
      onProgress(idx + 1, targetPageIndices.length);
    }

    const page = pdfDoc.getPage(pageIndex);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    if (config.position === "tile") {
      // Draw repeating grid across the page
      const stepX = Math.max(textWidth * 1.5, 180);
      const stepY = Math.max(textHeight * 3, 140);

      for (let y = 60; y < pageHeight; y += stepY) {
        for (let x = 40; x < pageWidth; x += stepX) {
          page.drawText(config.text, {
            x,
            y,
            size: config.fontSize,
            font,
            color,
            opacity: config.opacity,
            rotate: degrees(config.rotationDegrees),
          });
        }
      }
    } else {
      let x = (pageWidth - textWidth) / 2;
      let y = (pageHeight - textHeight) / 2;

      switch (config.position) {
        case "top-left":
          x = 40;
          y = pageHeight - textHeight - 40;
          break;
        case "top-right":
          x = pageWidth - textWidth - 40;
          y = pageHeight - textHeight - 40;
          break;
        case "bottom-left":
          x = 40;
          y = 40;
          break;
        case "bottom-right":
          x = pageWidth - textWidth - 40;
          y = 40;
          break;
        case "center":
        default:
          x = (pageWidth - textWidth) / 2;
          y = (pageHeight - textHeight) / 2;
          break;
      }

      page.drawText(config.text, {
        x,
        y,
        size: config.fontSize,
        font,
        color,
        opacity: config.opacity,
        rotate: degrees(config.rotationDegrees),
      });
    }
  }

  const savedBytes = await pdfDoc.save();
  const safeName = outputFileName.trim().toLowerCase().endsWith(".pdf")
    ? outputFileName.trim()
    : `${outputFileName.trim() || "watermarked-document"}.pdf`;

  return {
    bytes: savedBytes,
    fileName: safeName,
    pageCount: totalPages,
    sizeBytes: savedBytes.byteLength,
  };
}
