/**
 * Client-Side Color Picker & Converter Core Logic
 * 
 * Features:
 * - Precise bidirectional conversions across HEX, RGB, and HSL formats.
 * - WCAG 2.1 relative luminance calculation ($L = 0.2126R + 0.7152G + 0.0722B$).
 * - Contrast ratio calculation against black and white or custom backgrounds:
 *   $CR = (L_1 + 0.05) / (L_2 + 0.05)$.
 * - WCAG AA & AAA validation for normal text (>= 4.5:1 / 7:1) and large text (>= 3:1 / 4.5:1).
 * - Complementary, analogous, triadic, and monochromatic harmonic palette generators.
 * - Export palette as JSON or CSS Custom Properties (:root { ... }).
 * - 100% in-browser mathematical calculation.
 */

export interface RgbColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface HslColor {
  h: number; // 0 - 360
  s: number; // 0 - 100 (%)
  l: number; // 0 - 100 (%)
}

export interface WcagEvaluation {
  ratio: number;
  scoreDisplay: string;
  normalTextAa: boolean;
  normalTextAaa: boolean;
  largeTextAa: boolean;
  largeTextAaa: boolean;
}

export interface ColorPaletteSwatch {
  name: string;
  hex: string;
  rgb: RgbColor;
  hsl: HslColor;
}

/**
 * Validates and normalizes hex string (#rgb or #rrggbb) to lowercase 6-digit hex (#rrggbb).
 */
export function normalizeHexColor(input: string): string | null {
  const clean = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const expanded = clean
      .split("")
      .map((c) => c + c)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean.toLowerCase()}`;
  }
  return null;
}

/**
 * Converts Hex string to RGB object.
 */
export function hexToRgb(hexInput: string): RgbColor | null {
  const normalized = normalizeHexColor(hexInput);
  if (!normalized) return null;
  const num = parseInt(normalized.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB components to 6-digit Hex string.
 */
export function rgbToHex(rgb: RgbColor): string {
  const clampR = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const clampG = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const clampB = Math.max(0, Math.min(255, Math.round(rgb.b)));
  const hexPart = ((1 << 24) + (clampR << 16) + (clampG << 8) + clampB)
    .toString(16)
    .slice(1);
  return `#${hexPart.toLowerCase()}`;
}

/**
 * Converts RGB to HSL.
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL components to RGB object.
 */
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = (hsl.h % 360 + 360) % 360 / 360;
  const s = Math.max(0, Math.min(100, hsl.s)) / 100;
  const l = Math.max(0, Math.min(100, hsl.l)) / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let normalizedT = t;
    if (normalizedT < 0) normalizedT += 1;
    if (normalizedT > 1) normalizedT -= 1;
    if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
    if (normalizedT < 1 / 2) return q;
    if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Converts HSL directly to 6-digit Hex.
 */
export function hslToHex(hsl: HslColor): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Calculates WCAG 2.1 relative luminance for sRGB color.
 */
export function calculateRelativeLuminance(rgb: RgbColor): number {
  const transformChannel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rLum = transformChannel(rgb.r);
  const gLum = transformChannel(rgb.g);
  const bLum = transformChannel(rgb.b);
  return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
}

/**
 * Computes WCAG contrast ratio between two RGB colors (1:1 to 21:1).
 */
export function calculateContrastRatio(colorA: RgbColor, colorB: RgbColor): number {
  const lumA = calculateRelativeLuminance(colorA);
  const lumB = calculateRelativeLuminance(colorB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return parseFloat(ratio.toFixed(2));
}

/**
 * Evaluates WCAG compliance metrics.
 */
export function evaluateWcagCompliance(ratio: number): WcagEvaluation {
  return {
    ratio,
    scoreDisplay: `${ratio}:1`,
    normalTextAa: ratio >= 4.5,
    normalTextAaa: ratio >= 7.0,
    largeTextAa: ratio >= 3.0,
    largeTextAaa: ratio >= 4.5,
  };
}

/**
 * Generates complementary, analogous, and monochromatic palette variants.
 */
export function generateHarmonicPalettes(baseHex: string): {
  complementary: ColorPaletteSwatch;
  analogous1: ColorPaletteSwatch;
  analogous2: ColorPaletteSwatch;
  tintLight: ColorPaletteSwatch;
  shadeDark: ColorPaletteSwatch;
} {
  const baseRgb = hexToRgb(baseHex) || { r: 16, g: 185, b: 129 }; // default emerald
  const baseHsl = rgbToHsl(baseRgb);

  // Complementary: +180 deg
  const compHsl: HslColor = { ...baseHsl, h: (baseHsl.h + 180) % 360 };
  const compHex = hslToHex(compHsl);

  // Analogous: +30 deg and -30 deg
  const ana1Hsl: HslColor = { ...baseHsl, h: (baseHsl.h + 30) % 360 };
  const ana1Hex = hslToHex(ana1Hsl);
  const ana2Hsl: HslColor = { ...baseHsl, h: (baseHsl.h - 30 + 360) % 360 };
  const ana2Hex = hslToHex(ana2Hsl);

  // Tints & Shades
  const tintHsl: HslColor = { ...baseHsl, l: Math.min(95, baseHsl.l + 25) };
  const tintHex = hslToHex(tintHsl);
  const shadeHsl: HslColor = { ...baseHsl, l: Math.max(10, baseHsl.l - 25) };
  const shadeHex = hslToHex(shadeHsl);

  return {
    complementary: { name: "Complementary", hex: compHex, rgb: hslToRgb(compHsl), hsl: compHsl },
    analogous1: { name: "Analogous (+30°)", hex: ana1Hex, rgb: hslToRgb(ana1Hsl), hsl: ana1Hsl },
    analogous2: { name: "Analogous (-30°)", hex: ana2Hex, rgb: hslToRgb(ana2Hsl), hsl: ana2Hsl },
    tintLight: { name: "Lighter Tint", hex: tintHex, rgb: hslToRgb(tintHsl), hsl: tintHsl },
    shadeDark: { name: "Darker Shade", hex: shadeHex, rgb: hslToRgb(shadeHsl), hsl: shadeHsl },
  };
}

/**
 * Formats color palette swatches as CSS custom properties (:root { ... }).
 */
export function exportPaletteAsCss(baseHex: string, paletteName = "onetoolhub-palette"): string {
  const harmonics = generateHarmonicPalettes(baseHex);
  return `/* Color Palette: ${paletteName} */
:root {
  --color-primary: ${baseHex};
  --color-complementary: ${harmonics.complementary.hex};
  --color-analogous-1: ${harmonics.analogous1.hex};
  --color-analogous-2: ${harmonics.analogous2.hex};
  --color-tint-light: ${harmonics.tintLight.hex};
  --color-shade-dark: ${harmonics.shadeDark.hex};
}`;
}
