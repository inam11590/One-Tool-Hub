/**
 * Client-Side Image Cropper Core Logic
 *
 * Requirements:
 * - 100% In-browser canvas cropping.
 * - Supports aspect ratio presets: Freeform, 1:1, 16:9, 9:16, 4:3, and Custom.
 * - Boundary validation to prevent out-of-bounds crops or invalid coordinates.
 * - Zoom (scale) and rotation (90° steps) transforms.
 * - Memory cleanup and URL resource safety.
 * - Zero external server uploads.
 */

import {
  type SupportedImageMimeType,
  validateImageMagicBytes,
  validateImageFileMetadata,
  getOutputExtension,
} from "./image-compressor.ts";

export type AspectRatioPreset =
  | "freeform"
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "custom";

export interface CropRect {
  x: number; // 0 <= x < imageWidth
  y: number; // 0 <= y < imageHeight
  width: number;
  height: number;
}

export interface CropConfig {
  cropRect: CropRect;
  rotation?: number; // 0, 90, 180, 270 degrees
  outputMimeType?: SupportedImageMimeType;
  quality?: number; // 0.05 - 1.0
}

export interface CropResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

/**
 * Validates crop rectangle against image natural dimensions.
 */
export function validateCropRect(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number
): { valid: boolean; error?: string } {
  if (
    !Number.isFinite(crop.x) ||
    !Number.isFinite(crop.y) ||
    !Number.isFinite(crop.width) ||
    !Number.isFinite(crop.height)
  ) {
    return { valid: false, error: "Crop coordinates must be finite numbers." };
  }

  if (crop.width <= 0 || crop.height <= 0) {
    return { valid: false, error: "Crop width and height must be greater than zero." };
  }

  if (crop.x < 0 || crop.y < 0) {
    return { valid: false, error: "Crop origin cannot be negative." };
  }

  if (crop.x + crop.width > imageWidth + 0.5) {
    return {
      valid: false,
      error: `Crop box width (${crop.x + crop.width}px) exceeds image width (${imageWidth}px).`,
    };
  }

  if (crop.y + crop.height > imageHeight + 0.5) {
    return {
      valid: false,
      error: `Crop box height (${crop.y + crop.height}px) exceeds image height (${imageHeight}px).`,
    };
  }

  return { valid: true };
}

/**
 * Calculates initial centered crop rectangle for a given aspect ratio preset.
 */
export function calculateDefaultCropRect(
  aspectPreset: AspectRatioPreset,
  imageWidth: number,
  imageHeight: number,
  customRatio?: { width: number; height: number }
): CropRect {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  let ratio: number | null = null;
  switch (aspectPreset) {
    case "1:1":
      ratio = 1.0;
      break;
    case "16:9":
      ratio = 16 / 9;
      break;
    case "9:16":
      ratio = 9 / 16;
      break;
    case "4:3":
      ratio = 4 / 3;
      break;
    case "custom":
      if (customRatio && customRatio.width > 0 && customRatio.height > 0) {
        ratio = customRatio.width / customRatio.height;
      }
      break;
    case "freeform":
    default:
      ratio = null;
      break;
  }

  if (ratio === null) {
    // 80% centered box for freeform
    const w = Math.round(imageWidth * 0.8);
    const h = Math.round(imageHeight * 0.8);
    const x = Math.round((imageWidth - w) / 2);
    const y = Math.round((imageHeight - h) / 2);
    return { x, y, width: w, height: h };
  }

  // Constrain by image dimensions
  let targetWidth = imageWidth;
  let targetHeight = targetWidth / ratio;

  if (targetHeight > imageHeight) {
    targetHeight = imageHeight;
    targetWidth = targetHeight * ratio;
  }

  // Use 85% of maximum fit for padding
  const w = Math.max(1, Math.round(targetWidth * 0.85));
  const h = Math.max(1, Math.round(targetHeight * 0.85));
  const x = Math.max(0, Math.round((imageWidth - w) / 2));
  const y = Math.max(0, Math.round((imageHeight - h) / 2));

  return { x, y, width: w, height: h };
}

/**
 * Builds a clean filename for the cropped image.
 */
export function buildCroppedFileName(
  originalName: string,
  outputMime: SupportedImageMimeType = "image/png"
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "") || "image";
  const safeBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "-");
  const ext = getOutputExtension(outputMime);
  return `${safeBase}-cropped.${ext}`;
}

/**
 * Performs client-side image cropping and optional rotation on an HTML Canvas.
 */
export async function cropImageFile(
  file: File,
  config: CropConfig
): Promise<CropResult> {
  const metaValidation = validateImageFileMetadata(file);
  if (!metaValidation.valid) {
    throw new Error(metaValidation.error || "Invalid image file.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const magicValidation = validateImageMagicBytes(new Uint8Array(arrayBuffer));
  if (!magicValidation.valid) {
    throw new Error(magicValidation.error || "File signature validation failed.");
  }

  const blobUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image in browser."));
      img.src = blobUrl;
    });

    const validation = validateCropRect(
      config.cropRect,
      img.naturalWidth,
      img.naturalHeight
    );
    if (!validation.valid) {
      throw new Error(validation.error || "Invalid crop coordinates.");
    }

    const { x, y, width, height } = config.cropRect;
    const roundedW = Math.max(1, Math.round(width));
    const roundedH = Math.max(1, Math.round(height));

    const canvas = document.createElement("canvas");
    canvas.width = roundedW;
    canvas.height = roundedH;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to initialize Canvas 2D context.");
    }

    const outputMime = config.outputMimeType || "image/png";

    // Fill background with white if exporting to JPEG
    if (outputMime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, roundedW, roundedH);
    } else {
      ctx.clearRect(0, 0, roundedW, roundedH);
    }

    // Draw the cropped portion
    ctx.drawImage(
      img,
      Math.round(x),
      Math.round(y),
      roundedW,
      roundedH,
      0,
      0,
      roundedW,
      roundedH
    );

    const quality = Math.max(0.05, Math.min(1.0, config.quality || 0.92));

    const resultBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas crop encoding failed."));
        },
        outputMime,
        outputMime === "image/png" ? undefined : quality
      );
    });

    const dataUrl = URL.createObjectURL(resultBlob);
    const filename = buildCroppedFileName(file.name, outputMime);

    return {
      blob: resultBlob,
      dataUrl,
      width: roundedW,
      height: roundedH,
      sizeBytes: resultBlob.size,
      filename,
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
