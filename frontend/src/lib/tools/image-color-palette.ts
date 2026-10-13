/**
 * Client-Side Image Color Palette Extractor Core Logic
 *
 * Requirements:
 * - 100% In-browser deterministic color extraction.
 * - Downsamples image to maximum 160x160 px for swift, lag-free pixel sampling (< 15ms).
 * - Ignores transparent pixels (alpha < 128).
 * - Color quantization using 5-bit color binning & Euclidean distance deduplication.
 * - Extracts dominant swatches with HEX, RGB, percentage share, and contrast indicator.
 * - Configurable palette size (4 to 12 colors).
 * - Exports palette as JSON, Plain Text, or CSS Custom Properties.
 * - Zero external server requests.
 */

import {
  type RgbColor,
  rgbToHex,
} from "./color-picker.ts";
import {
  validateImageMagicBytes,
  validateImageFileMetadata,
} from "./image-compressor.ts";

export interface ExtractedColorSwatch {
  hex: string;
  rgb: RgbColor;
  percentage: number;
  isDark: boolean;
}

export interface PaletteExtractionResult {
  colors: ExtractedColorSwatch[];
  totalSampledPixels: number;
  executionTimeMs: number;
}

/**
 * Calculates Euclidean distance between two RGB colors.
 * $d = \sqrt{(r_1 - r_2)^2 + (g_1 - g_2)^2 + (b_1 - b_2)^2}$
 */
export function calculateColorDistance(c1: RgbColor, c2: RgbColor): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Determines whether a color is perceptually dark (relative luminance < 0.5)
 * to decide whether overlay text should be white or black.
 */
export function isPerceptuallyDark(rgb: RgbColor): boolean {
  // ITU-R BT.709 relative luminance
  const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return lum < 0.5;
}

/**
 * Quantizes image pixels and extracts dominant colors deterministically.
 */
export function extractPaletteFromPixelArray(
  pixels: Uint8ClampedArray,
  paletteSize: number = 6,
  minColorDistance: number = 28
): ExtractedColorSwatch[] {
  const clampedSize = Math.max(4, Math.min(12, paletteSize));

  // Map to store frequency of 5-bit quantized colors (32x32x32 = 32768 possible bins)
  const binMap = new Map<number, { rSum: number; gSum: number; bSum: number; count: number }>();
  let validPixelCount = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]!;
    const g = pixels[i + 1]!;
    const b = pixels[i + 2]!;
    const a = pixels[i + 3]!;

    // Ignore transparent or near-transparent pixels
    if (a < 128) continue;

    validPixelCount++;

    // Quantize 8-bit to 5-bit (shift right by 3)
    const qr = r >> 3;
    const qg = g >> 3;
    const qb = b >> 3;
    const binKey = (qr << 10) | (qg << 5) | qb;

    const existing = binMap.get(binKey);
    if (existing) {
      existing.rSum += r;
      existing.gSum += g;
      existing.bSum += b;
      existing.count += 1;
    } else {
      binMap.set(binKey, { rSum: r, gSum: g, bSum: b, count: 1 });
    }
  }

  if (validPixelCount === 0 || binMap.size === 0) {
    return [];
  }

  // Sort bins by frequency descending
  const sortedBins = Array.from(binMap.values()).sort(
    (a, b) => b.count - a.count
  );

  const selectedColors: { rgb: RgbColor; count: number }[] = [];

  for (const bin of sortedBins) {
    if (selectedColors.length >= clampedSize) break;

    const avgRgb: RgbColor = {
      r: Math.round(bin.rSum / bin.count),
      g: Math.round(bin.gSum / bin.count),
      b: Math.round(bin.bSum / bin.count),
    };

    // Check distance against already selected colors
    const isDistinct = selectedColors.every(
      (c) => calculateColorDistance(avgRgb, c.rgb) >= minColorDistance
    );

    if (isDistinct || selectedColors.length === 0) {
      selectedColors.push({ rgb: avgRgb, count: bin.count });
    }
  }

  // If distinct filter was too strict and yielded fewer than requested colors, fill up
  if (selectedColors.length < clampedSize) {
    for (const bin of sortedBins) {
      if (selectedColors.length >= clampedSize) break;
      const avgRgb: RgbColor = {
        r: Math.round(bin.rSum / bin.count),
        g: Math.round(bin.gSum / bin.count),
        b: Math.round(bin.bSum / bin.count),
      };
      const alreadyPresent = selectedColors.some(
        (c) => calculateColorDistance(avgRgb, c.rgb) < 10
      );
      if (!alreadyPresent) {
        selectedColors.push({ rgb: avgRgb, count: bin.count });
      }
    }
  }

  const totalSelectedCounts = selectedColors.reduce((sum, c) => sum + c.count, 0) || 1;

  return selectedColors.map((item) => {
    const hex = rgbToHex(item.rgb);
    const percentage = Number(((item.count / totalSelectedCounts) * 100).toFixed(1));
    return {
      hex,
      rgb: item.rgb,
      percentage,
      isDark: isPerceptuallyDark(item.rgb),
    };
  });
}

/**
 * Extracts a color palette from an uploaded image file using an in-memory downsampled canvas.
 */
export async function extractColorPaletteFromFile(
  file: File,
  paletteSize: number = 6
): Promise<PaletteExtractionResult> {
  const metaValidation = validateImageFileMetadata(file);
  if (!metaValidation.valid) {
    throw new Error(metaValidation.error || "Invalid image file.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const magicValidation = validateImageMagicBytes(new Uint8Array(arrayBuffer));
  if (!magicValidation.valid) {
    throw new Error(magicValidation.error || "File signature validation failed.");
  }

  const startTime = performance.now();
  const blobUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.src = blobUrl;
    });

    // Downsample to max 160x160 for optimal performance
    const maxDimension = 160;
    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      const ratio = targetWidth / targetHeight;
      if (ratio > 1) {
        targetWidth = maxDimension;
        targetHeight = Math.max(1, Math.round(maxDimension / ratio));
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.max(1, Math.round(maxDimension * ratio));
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("Failed to create Canvas 2D context for pixel sampling.");
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    const colors = extractPaletteFromPixelArray(imageData.data, paletteSize);
    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      colors,
      totalSampledPixels: targetWidth * targetHeight,
      executionTimeMs,
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Exports extracted palette colors as a JSON string.
 */
export function exportPaletteAsJson(colors: ExtractedColorSwatch[]): string {
  const data = colors.map((c, idx) => ({
    name: `Color ${idx + 1}`,
    hex: c.hex,
    rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
    r: c.rgb.r,
    g: c.rgb.g,
    b: c.rgb.b,
    share: `${c.percentage}%`,
  }));
  return JSON.stringify({ palette: data }, null, 2);
}

/**
 * Exports extracted palette colors as plain text.
 */
export function exportPaletteAsText(colors: ExtractedColorSwatch[]): string {
  return colors
    .map(
      (c, idx) =>
        `Color ${idx + 1}: ${c.hex.toUpperCase()} | rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}) (${c.percentage}%)`
    )
    .join("\n");
}

/**
 * Exports extracted palette colors as CSS custom properties.
 */
export function exportPaletteAsCss(colors: ExtractedColorSwatch[]): string {
  const vars = colors
    .map((c, idx) => `  --color-${idx + 1}: ${c.hex}; /* rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}) */`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}
