'use client';

import { useState, useMemo } from "react";
import {
  Palette,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  CheckCircle2,
  FileCode,
  Download,
  Sparkles,
} from "lucide-react";
import {
  normalizeHexColor,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToHex,
  calculateContrastRatio,
  evaluateWcagCompliance,
  generateHarmonicPalettes,
  exportPaletteAsCss,
  type RgbColor,
  type HslColor,
} from "@/lib/tools/color-picker";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "color-picker";
const TOOL_CATEGORY = "developer";

const DEFAULT_HEX = "#10b981"; // Emerald

export function ColorPickerTool() {
  // Core Color State in Hex

  // Core Color State in Hex
  const [hexInput, setHexInput] = useState<string>(DEFAULT_HEX);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Derive RGB and HSL
  const currentRgb: RgbColor = useMemo(() => {
    return hexToRgb(hexInput) || { r: 16, g: 185, b: 129 };
  }, [hexInput]);

  const currentHsl: HslColor = useMemo(() => {
    return rgbToHsl(currentRgb);
  }, [currentRgb]);

  const normalizedHex = useMemo(() => {
    return normalizeHexColor(hexInput) || DEFAULT_HEX;
  }, [hexInput]);

  // Contrast evaluations
  const contrastAgainstWhite = useMemo(() => {
    const ratio = calculateContrastRatio(currentRgb, { r: 255, g: 255, b: 255 });
    return evaluateWcagCompliance(ratio);
  }, [currentRgb]);

  const contrastAgainstBlack = useMemo(() => {
    const ratio = calculateContrastRatio(currentRgb, { r: 0, g: 0, b: 0 });
    return evaluateWcagCompliance(ratio);
  }, [currentRgb]);

  // Harmonic Palettes
  const harmonicSwatches = useMemo(() => {
    return generateHarmonicPalettes(normalizedHex);
  }, [normalizedHex]);

  // Channel update handlers
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
  };

  const handleRgbChannelChange = (channel: keyof RgbColor, value: number) => {
    const updated: RgbColor = {
      ...currentRgb,
      [channel]: Math.max(0, Math.min(255, isNaN(value) ? 0 : value)),
    };
    setHexInput(rgbToHex(updated));
  };

  const handleHslChannelChange = (channel: keyof HslColor, value: number) => {
    const maxVal = channel === "h" ? 360 : 100;
    const updated: HslColor = {
      ...currentHsl,
      [channel]: Math.max(0, Math.min(maxVal, isNaN(value) ? 0 : value)),
    };
    setHexInput(hslToHex(updated));
  };

  const handleCopyText = async (text: string, formatName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: `copy_${formatName}`,
    });
  };

  const handleDownloadPaletteCss = () => {
    const cssText = exportPaletteAsCss(normalizedHex);
    const blob = new Blob([cssText], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_palette_css",
    });
  };

  const handleDownloadPaletteJson = () => {
    const payload = {
      primary: { hex: normalizedHex, rgb: currentRgb, hsl: currentHsl },
      harmonics: harmonicSwatches,
    };
    const jsonText = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_palette_json",
    });
  };

  const handleReset = () => {
    setHexInput(DEFAULT_HEX);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  const rgbString = `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`;
  const hslString = `hsl(${currentHsl.h}, ${currentHsl.s}%, ${currentHsl.l}%)`;

  return (
    <div className="w-full space-y-8" aria-label="Color Picker Workspace">
      {/* Visual Preview Hero Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold text-base">
            <Palette className="w-5 h-5 text-emerald-400" />
            <span>Interactive Color Inspector</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPaletteCss}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export CSS</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPaletteJson}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Color Display Canvas & Native Picker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Main Visual Swatch */}
          <div
            className="w-full h-36 rounded-2xl shadow-inner border border-white/10 flex items-end p-4 transition-colors relative overflow-hidden"
            style={{ backgroundColor: normalizedHex }}
          >
            <input
              type="color"
              value={normalizedHex}
              onChange={(e) => setHexInput(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="Click to open system color picker"
            />
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-mono text-xs flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: normalizedHex }} />
              <span>Click swatch to pick</span>
            </div>
          </div>

          {/* Quick Copy Value Fields */}
          <div className="md:col-span-2 space-y-3 font-mono">
            {/* HEX */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 text-xs px-2 select-none uppercase font-sans font-semibold">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                className="flex-1 bg-transparent text-zinc-200 text-sm focus:outline-hidden"
                placeholder="#10b981"
              />
              <button
                type="button"
                onClick={() => handleCopyText(normalizedHex, "hex")}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedFormat === "hex" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            {/* RGB */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 text-xs px-2 select-none uppercase font-sans font-semibold">RGB</span>
              <span className="flex-1 text-zinc-200 text-sm">{rgbString}</span>
              <button
                type="button"
                onClick={() => handleCopyText(rgbString, "rgb")}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedFormat === "rgb" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            {/* HSL */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 text-xs px-2 select-none uppercase font-sans font-semibold">HSL</span>
              <span className="flex-1 text-zinc-200 text-sm">{hslString}</span>
              <button
                type="button"
                onClick={() => handleCopyText(hslString, "hsl")}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedFormat === "hsl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Sliders (RGB & HSL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RGB Sliders */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>RGB Color Sliders</span>
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {/* Red */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Red (R)</span>
                <span>{currentRgb.r}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.r}
                onChange={(e) => handleRgbChannelChange("r", parseInt(e.target.value))}
                className="w-full accent-rose-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
            {/* Green */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Green (G)</span>
                <span>{currentRgb.g}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.g}
                onChange={(e) => handleRgbChannelChange("g", parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
            {/* Blue */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Blue (B)</span>
                <span>{currentRgb.b}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.b}
                onChange={(e) => handleRgbChannelChange("b", parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* HSL Sliders */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>HSL Color Sliders</span>
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {/* Hue */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Hue (H)</span>
                <span>{currentHsl.h}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={currentHsl.h}
                onChange={(e) => handleHslChannelChange("h", parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Saturation (S)</span>
                <span>{currentHsl.s}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentHsl.s}
                onChange={(e) => handleHslChannelChange("s", parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
            {/* Lightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Lightness (L)</span>
                <span>{currentHsl.l}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentHsl.l}
                onChange={(e) => handleHslChannelChange("l", parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* WCAG Contrast Ratio Checker */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>WCAG 2.1 Contrast Ratio Compliance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contrast on White */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Against Pure White (#FFF)</span>
              <span className="font-mono text-sm font-bold text-zinc-100">{contrastAgainstWhite.scoreDisplay}</span>
            </div>
            <div
              className="p-3 rounded-lg text-center font-semibold text-sm border"
              style={{ backgroundColor: "#ffffff", color: normalizedHex }}
            >
              Sample Preview Text
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-zinc-900">
                <span className="text-zinc-400">Normal AA (&ge;4.5):</span>
                <span className={contrastAgainstWhite.normalTextAa ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {contrastAgainstWhite.normalTextAa ? "PASS" : "FAIL"}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-zinc-900">
                <span className="text-zinc-400">Normal AAA (&ge;7):</span>
                <span className={contrastAgainstWhite.normalTextAaa ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {contrastAgainstWhite.normalTextAaa ? "PASS" : "FAIL"}
                </span>
              </div>
            </div>
          </div>

          {/* Contrast on Black */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Against Pure Black (#000)</span>
              <span className="font-mono text-sm font-bold text-zinc-100">{contrastAgainstBlack.scoreDisplay}</span>
            </div>
            <div
              className="p-3 rounded-lg text-center font-semibold text-sm border border-zinc-800"
              style={{ backgroundColor: "#000000", color: normalizedHex }}
            >
              Sample Preview Text
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-zinc-900">
                <span className="text-zinc-400">Normal AA (&ge;4.5):</span>
                <span className={contrastAgainstBlack.normalTextAa ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {contrastAgainstBlack.normalTextAa ? "PASS" : "FAIL"}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-zinc-900">
                <span className="text-zinc-400">Normal AAA (&ge;7):</span>
                <span className={contrastAgainstBlack.normalTextAaa ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {contrastAgainstBlack.normalTextAaa ? "PASS" : "FAIL"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harmonic Palettes Preview */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Harmonic Color Palette Swatches</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.values(harmonicSwatches).map((swatch) => (
            <button
              key={swatch.name}
              type="button"
              onClick={() => setHexInput(swatch.hex)}
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-left hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
            >
              <div
                className="w-full h-14 rounded-lg border border-white/10 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: swatch.hex }}
              />
              <div className="text-xs font-semibold text-zinc-200 truncate">{swatch.name}</div>
              <div className="text-[11px] font-mono text-zinc-400">{swatch.hex}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>
          <strong>Local Execution:</strong> Color mathematics, conversions, and contrast evaluations execute 100% inside your browser. No color codes are transmitted to any server.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="Color Picker & Converter" />
    </div>
  );
}
