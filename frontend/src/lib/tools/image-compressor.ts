export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageMimeType =
  (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export const MAX_IMAGE_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_IMAGE_DIMENSION_PX = 8192; // Max 8192x8192 px
export const MAX_IMAGE_TOTAL_PIXELS = 40_000_000; // 40 MP memory cap

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function isSupportedImageMimeType(
  mimeType: string
): mimeType is SupportedImageMimeType {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateImageFileMetadata(file: {
  name: string;
  type: string;
  size: number;
}): ImageValidationResult {
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: "The selected file is empty. Please choose a valid JPEG, PNG, or WebP image.",
    };
  }

  if (!isSupportedImageMimeType(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || "unknown"}). Please upload a JPEG, PNG, or WebP image.`,
    };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatFileBytes(file.size)}) exceeds the 25 MB limit for safe browser processing.`,
    };
  }

  return { valid: true };
}

export function validateImageDimensions(
  width: number,
  height: number
): ImageValidationResult {
  if (width <= 0 || height <= 0) {
    return {
      valid: false,
      error: "Invalid image dimensions.",
    };
  }

  if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
    return {
      valid: false,
      error: `Image dimensions (${width}×${height} px) exceed the maximum supported ${MAX_IMAGE_DIMENSION_PX}×${MAX_IMAGE_DIMENSION_PX} px limit.`,
    };
  }

  if (width * height > MAX_IMAGE_TOTAL_PIXELS) {
    return {
      valid: false,
      error: `Image resolution (${((width * height) / 1_000_000).toFixed(1)} MP) exceeds the 40 MP browser memory safeguard.`,
    };
  }

  return { valid: true };
}

export function calculateSizeReduction(
  originalBytes: number,
  outputBytes: number
): {
  diffBytes: number;
  percentageChange: number;
  isSmaller: boolean;
  summaryLabel: string;
} {
  if (originalBytes <= 0) {
    return {
      diffBytes: 0,
      percentageChange: 0,
      isSmaller: false,
      summaryLabel: "0%",
    };
  }

  const diffBytes = originalBytes - outputBytes;
  const rawPct = (diffBytes / originalBytes) * 100;
  const percentageChange = Number(rawPct.toFixed(1));

  if (diffBytes > 0) {
    return {
      diffBytes,
      percentageChange,
      isSmaller: true,
      summaryLabel: `-${percentageChange.toFixed(1)}% smaller`,
    };
  }

  if (diffBytes < 0) {
    const increasePct = Math.abs(percentageChange).toFixed(1);
    return {
      diffBytes,
      percentageChange,
      isSmaller: false,
      summaryLabel: `+${increasePct}% larger`,
    };
  }

  return {
    diffBytes: 0,
    percentageChange: 0,
    isSmaller: false,
    summaryLabel: "0% (same size)",
  };
}

export function formatFileBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getOutputExtension(mimeType: SupportedImageMimeType): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

export function buildCompressedFileName(
  originalName: string,
  outputMime: SupportedImageMimeType
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "") || "image";
  const safeBase = baseName.replace(/[^a-zA-Z0-9_-]/g, "-");
  const ext = getOutputExtension(outputMime);
  return `${safeBase}-compressed.${ext}`;
}
