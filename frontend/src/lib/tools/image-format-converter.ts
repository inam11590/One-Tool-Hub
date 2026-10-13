/**
 * Client-Side Image Format Converter Core Logic
 *
 * Requirements:
 * - 100% In-browser conversion across JPEG, PNG, and WebP using HTML5 Canvas.
 * - Aspect ratio preservation with zero automatic upscaling.
 * - Handles transparency loss when converting transparent PNG/WebP to JPEG
 *   by drawing a user-configurable background color (default #ffffff).
 * - Quality adjustment for lossy formats (JPEG, WebP).
 * - Reuses magic byte validation and size limit safeguards from image-compressor.ts.
 * - Safe memory management and URL resource cleanup.
 * - Zero external server uploads.
 */

import {
  type SupportedImageMimeType,
  validateImageMagicBytes,
  validateImageFileMetadata,
  validateImageDimensions,
  getOutputExtension,
} from "./image-compressor.ts";

export interface ImageConvertOptions {
  targetMimeType: SupportedImageMimeType;
  quality: number; // 0.01 - 1.0 (for JPEG & WebP)
  backgroundColor?: string; // Hex color for transparent-to-JPEG conversion, e.g. "#ffffff"
}

export interface ImageConvertResult {
  blob: Blob;
  dataUrl: string;
  outputSize: number;
  outputMimeType: SupportedImageMimeType;
  width: number;
  height: number;
  filename: string;
  transparencyFlattened: boolean;
}

/**
 * Builds a clean, safe filename for the converted image.
 */
export function buildConvertedFileName(
  originalName: string,
  targetMime: SupportedImageMimeType
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "") || "image";
  const safeBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "-");
  const ext = getOutputExtension(targetMime);
  return `${safeBase}-converted.${ext}`;
}

/**
 * Validates whether an image format conversion can proceed safely.
 */
export function validateConversionRequest(
  file: { name: string; type: string; size: number },
  targetMime: string
): { valid: boolean; error?: string } {
  const metaValidation = validateImageFileMetadata(file);
  if (!metaValidation.valid) {
    return metaValidation;
  }

  if (
    targetMime !== "image/jpeg" &&
    targetMime !== "image/png" &&
    targetMime !== "image/webp"
  ) {
    return {
      valid: false,
      error: `Unsupported target format: ${targetMime}. Supported formats are JPEG, PNG, and WebP.`,
    };
  }

  return { valid: true };
}

/**
 * Converts an image file to the target format in the browser using HTML5 Canvas.
 */
export async function convertImageFormat(
  file: File,
  options: ImageConvertOptions
): Promise<ImageConvertResult> {
  const validation = validateConversionRequest(file, options.targetMimeType);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid conversion request.");
  }

  // Magic bytes inspection
  const arrayBuffer = await file.arrayBuffer();
  const magicValidation = validateImageMagicBytes(new Uint8Array(arrayBuffer));
  if (!magicValidation.valid) {
    throw new Error(magicValidation.error || "File signature validation failed.");
  }

  // Load image element safely
  const blobUrl = URL.createObjectURL(file);
  const img = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode image in browser."));
      img.src = blobUrl;
    });

    const dimValidation = validateImageDimensions(img.naturalWidth, img.naturalHeight);
    if (!dimValidation.valid) {
      throw new Error(dimValidation.error || "Image dimensions exceed safety limits.");
    }

    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Unable to initialize 2D Canvas context for image processing.");
    }

    let transparencyFlattened = false;

    // When converting to JPEG (which lacks alpha channel), fill background
    if (options.targetMimeType === "image/jpeg") {
      ctx.fillStyle = options.backgroundColor || "#ffffff";
      ctx.fillRect(0, 0, width, height);
      transparencyFlattened = true;
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Clamp quality between 0.05 and 1.0
    const clampedQuality = Math.max(0.05, Math.min(1.0, options.quality || 0.85));

    const resultBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob encoding failed."));
          }
        },
        options.targetMimeType,
        options.targetMimeType === "image/png" ? undefined : clampedQuality
      );
    });

    const dataUrl = URL.createObjectURL(resultBlob);
    const filename = buildConvertedFileName(file.name, options.targetMimeType);

    return {
      blob: resultBlob,
      dataUrl,
      outputSize: resultBlob.size,
      outputMimeType: options.targetMimeType,
      width,
      height,
      filename,
      transparencyFlattened,
    };
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
