"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Palette,
  RotateCcw,
} from "lucide-react";
import {
  type PaletteExtractionResult,
  extractColorPaletteFromFile,
  exportPaletteAsJson,
  exportPaletteAsText,
  exportPaletteAsCss,
} from "@/lib/tools/image-color-palette";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "image-color-palette";
const TOOL_CATEGORY = "freelancer" as const;

export function ImageColorPaletteTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [paletteSize, setPaletteSize] = useState<number>(6);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaletteExtractionResult | null>(null);

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const cleanupUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupUrl();
    };
  }, []);

  const processFile = async (selectedFile: File, size: number) => {
    cleanupUrl();
    setError(null);
    setResult(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    previewUrlRef.current = objectUrl;
    setFile(selectedFile);
    setPreviewUrl(objectUrl);

    try {
      const palette = await extractColorPaletteFromFile(selectedFile, size);
      setResult(palette);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "extract_palette",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to extract palette from image.";
      setError(msg);
      reportToolProcessingError({
        toolSlug: TOOL_SLUG,
        toolCategory: TOOL_CATEGORY,
        errorCategory: "processing_error",
        operationType: "extract_palette",
      });
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    processFile(selectedFile, paletteSize);
  };

  const handlePaletteSizeChange = (newSize: number) => {
    setPaletteSize(newSize);
    if (file) {
      processFile(file, newSize);
    }
  };

  const handleCopySingle = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);

    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_color",
    });
  };

  const handleCopyAll = () => {
    if (!result) return;
    const hexList = result.colors.map((c) => c.hex).join(", ");
    navigator.clipboard.writeText(hexList);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);

    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_all_colors",
    });
  };

  const handleDownload = (format: "json" | "txt" | "css") => {
    if (!result) return;
    let content = "";
    let mime = "text/plain";
    let ext = "txt";

    if (format === "json") {
      content = exportPaletteAsJson(result.colors);
      mime = "application/json";
      ext = "json";
    } else if (format === "css") {
      content = exportPaletteAsCss(result.colors);
      mime = "text/css";
      ext = "css";
    } else {
      content = exportPaletteAsText(result.colors);
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `color-palette.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_palette",
    });
  };

  const handleReset = () => {
    cleanupUrl();
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFileSelect(dropped);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFileSelect(selected);
            }}
          />
          <div className="mb-3 rounded-full bg-emerald-100 p-4 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Palette className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Upload an image to extract its color palette
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, and WebP. Instant deterministic pixel quantization.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {result ? `${result.totalSampledPixels.toLocaleString()} pixels analyzed in ${result.executionTimeMs}ms` : "Analyzing..."}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Change Image
              </button>
            </div>

            {/* Palette Size Selector */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Palette Swatches:
                </label>
                <div className="flex gap-1.5">
                  {[4, 6, 8, 10, 12].map((size) => (
                    <button
                      key={size}
                      onClick={() => handlePaletteSizeChange(size)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        paletteSize === size
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {allCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        All Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy All HEX
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload("json")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleDownload("css")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    CSS
                  </button>
                </div>
              )}
            </div>

            {/* Extracted Swatches Bar */}
            {result && result.colors.length > 0 && (
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Continuous Palette Strip
                  </p>
                  <div className="flex h-16 w-full overflow-hidden rounded-xl shadow-inner">
                    {result.colors.map((c) => (
                      <div
                        key={c.hex}
                        className="group relative flex-1 cursor-pointer transition hover:opacity-90"
                        style={{ backgroundColor: c.hex }}
                        onClick={() => handleCopySingle(c.hex)}
                        title={`Click to copy ${c.hex.toUpperCase()}`}
                      >
                        <span
                          className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 transition group-hover:opacity-100 ${
                            c.isDark ? "text-white" : "text-black"
                          }`}
                        >
                          {c.hex.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swatch Cards Grid */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Individual Dominant Colors (Click code to copy)
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                    {result.colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div
                          className="flex h-20 items-center justify-center p-2 text-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          {copiedHex === c.hex && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.isDark ? "bg-white text-black" : "bg-black text-white"
                              }`}
                            >
                              Copied!
                            </span>
                          )}
                        </div>
                        <div className="p-3 text-center">
                          <button
                            onClick={() => handleCopySingle(c.hex)}
                            className="font-mono text-xs font-bold text-slate-900 transition hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                          >
                            {c.hex.toUpperCase()}
                          </button>
                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                            rgb({c.rgb.r}, {c.rgb.g}, {c.rgb.b})
                          </p>
                          <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {c.percentage}% share
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reference Image Thumbnail */}
                {previewUrl && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sampled Source Image
                    </p>
                    <div className="flex max-h-56 items-center justify-center overflow-hidden rounded-lg bg-white p-2 dark:bg-slate-800">
                      <img
                        src={previewUrl}
                        alt="Color reference"
                        className="max-h-48 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
