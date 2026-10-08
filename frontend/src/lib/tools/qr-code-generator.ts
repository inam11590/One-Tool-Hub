export const MAX_QR_INPUT_LENGTH = 2000;
export const MIN_QR_SIZE_PX = 128;
export const MAX_QR_SIZE_PX = 1024;
export const DEFAULT_QR_SIZE_PX = 320;
export const DEFAULT_QR_MARGIN = 4; // Quiet zone modules

export interface QrGenerationOptions {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
}

export interface QrValidationResult {
  valid: boolean;
  error?: string;
  contrastWarning?: string;
}

export interface QrGenerationResult {
  valid: boolean;
  pngDataUrl?: string;
  svgString?: string;
  error?: string;
  contrastWarning?: string;
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!HEX_COLOR_REGEX.test(hex)) {
    return null;
  }
  const clean = hex.slice(1);
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

function getRelativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(rgb.r);
  const G = toLinear(rgb.g);
  const B = toLinear(rgb.b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastRatio(hex1: string, hex2: string): number | null {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  if (lum1 === null || lum2 === null) return null;

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function validateQrOptions(
  options: QrGenerationOptions
): QrValidationResult {
  const trimmed = options.text.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: "Please enter a URL or text to generate a QR code.",
    };
  }

  if (options.text.length > MAX_QR_INPUT_LENGTH) {
    return {
      valid: false,
      error: `Input length (${options.text.length} characters) exceeds the maximum ${MAX_QR_INPUT_LENGTH}-character limit for reliable QR scanning.`,
    };
  }

  if (
    !Number.isFinite(options.size) ||
    options.size < MIN_QR_SIZE_PX ||
    options.size > MAX_QR_SIZE_PX
  ) {
    return {
      valid: false,
      error: `QR size must be between ${MIN_QR_SIZE_PX}px and ${MAX_QR_SIZE_PX}px.`,
    };
  }

  if (
    !HEX_COLOR_REGEX.test(options.foregroundColor) ||
    !HEX_COLOR_REGEX.test(options.backgroundColor)
  ) {
    return {
      valid: false,
      error: "Foreground and background colors must be valid 6-digit hex colors (e.g., #0F172A).",
    };
  }

  const fgLum = getRelativeLuminance(options.foregroundColor);
  const bgLum = getRelativeLuminance(options.backgroundColor);
  const ratio = getContrastRatio(
    options.foregroundColor,
    options.backgroundColor
  );

  let contrastWarning: string | undefined;
  if (ratio !== null && ratio < 3.5) {
    contrastWarning = `Low color contrast (${ratio.toFixed(1)}:1). Many smartphone cameras require higher contrast to scan reliably.`;
  } else if (fgLum !== null && bgLum !== null && fgLum > bgLum) {
    contrastWarning =
      "Inverted colors detected (light foreground on dark background). Some older QR scanners require a dark foreground on a light background.";
  }

  return {
    valid: true,
    contrastWarning,
  };
}

export async function generateQrCodeAssets(
  options: QrGenerationOptions
): Promise<QrGenerationResult> {
  const validation = validateQrOptions(options);
  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error,
    };
  }

  try {
    const qrModule = await import("qrcode");
    const QRCode = qrModule.default ?? qrModule;
    const qrParams = {
      width: options.size,
      margin: DEFAULT_QR_MARGIN,
      errorCorrectionLevel: "M" as const,
      color: {
        dark: options.foregroundColor,
        light: options.backgroundColor,
      },
    };

    const [pngDataUrl, svgString] = await Promise.all([
      QRCode.toDataURL(options.text, qrParams),
      QRCode.toString(options.text, {
        ...qrParams,
        type: "svg",
      }),
    ]);

    return {
      valid: true,
      pngDataUrl,
      svgString,
      contrastWarning: validation.contrastWarning,
    };
  } catch {
    return {
      valid: false,
      error: "Unable to generate a QR code for the provided input.",
    };
  }
}
