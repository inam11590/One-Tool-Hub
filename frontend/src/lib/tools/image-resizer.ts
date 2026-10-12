/**
 * Client-Side Image Resizer Core
 *
 * Requirements:
 * - Local browser Canvas rendering.
 * - Supports JPEG, PNG, and WebP.
 * - Aspect ratio locking & unlocking.
 * - Dimension calculation with memory constraints.
 * - Transparency preservation (PNG/WebP).
 * - Release of Object URLs.
 */

import {
  MAX_IMAGE_DIMENSION_PX,
  MAX_IMAGE_TOTAL_PIXELS,
  type SupportedImageMimeType,
} from "./image-compressor.ts";

export interface ImageResizeConfig {
  targetWidth: number;
  targetHeight: number;
  lockAspectRatio: boolean;
  outputFormat: SupportedImageMimeType;
  quality: number; // 1-100
}

export interface ImageDimensionValidation {
  valid: boolean;
  error?: string;
}

export function validateTargetDimensions(
  width: number,
  height: number
): ImageDimensionValidation {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return {
      valid: false,
      error: "Width and height must be positive numbers.",
    };
  }

  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);

  if (
    roundedWidth > MAX_IMAGE_DIMENSION_PX ||
    roundedHeight > MAX_IMAGE_DIMENSION_PX
  ) {
    return {
      valid: false,
      error: `Dimensions cannot exceed ${MAX_IMAGE_DIMENSION_PX}x${MAX_IMAGE_DIMENSION_PX} pixels.`,
    };
  }

  const totalPixels = roundedWidth * roundedHeight;
  if (totalPixels > MAX_IMAGE_TOTAL_PIXELS) {
    return {
      valid: false,
      error: `Image resolution exceeds the memory limit of ${MAX_IMAGE_TOTAL_PIXELS / 1_000_000} megapixels.`,
    };
  }

  return { valid: true };
}

/**
 * Calculates new height or width maintaining original aspect ratio.
 */
export function calculateAspectDimension(
  originalWidth: number,
  originalHeight: number,
  newWidth?: number,
  newHeight?: number
): { width: number; height: number } {
  if (originalWidth <= 0 || originalHeight <= 0) {
    return { width: 100, height: 100 };
  }

  const ratio = originalWidth / originalHeight;

  if (newWidth !== undefined && newHeight === undefined) {
    return {
      width: Math.round(newWidth),
      height: Math.max(1, Math.round(newWidth / ratio)),
    };
  }

  if (newHeight !== undefined && newWidth === undefined) {
    return {
      width: Math.max(1, Math.round(newHeight * ratio)),
      height: Math.round(newHeight),
    };
  }

  return {
    width: Math.round(newWidth ?? originalWidth),
    height: Math.round(newHeight ?? originalHeight),
  };
}

/**
 * Resizes an image file locally using an in-memory Canvas element.
 */
export async function resizeImageInBrowser(
  file: File,
  config: ImageResizeConfig
): Promise<{ blob: Blob; width: number; height: number }> {
  const dimCheck = validateTargetDimensions(
    config.targetWidth,
    config.targetHeight
  );
  if (!dimCheck.valid) {
    throw new Error(dimCheck.error);
  }

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error("Failed to decode image data in browser."));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(config.targetWidth);
    canvas.height = Math.round(config.targetHeight);

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) {
      throw new Error("Unable to create 2D canvas context for resizing.");
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // For JPEG output, draw white background first to avoid black transparency
    if (config.outputFormat === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const qualityRatio = Math.max(0.05, Math.min(1.0, config.quality / 100));

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b),
        config.outputFormat,
        config.outputFormat === "image/png" ? undefined : qualityRatio
      );
    });

    if (!blob) {
      throw new Error("Failed to export resized canvas image to blob.");
    }

    return {
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
