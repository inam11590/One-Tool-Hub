"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  Image as ImageIcon,
  RefreshCw,
  RotateCcw,
  Upload,
  Check,
} from "lucide-react";
import {
  type SupportedImageMimeType,
  formatFileBytes,
  calculateSizeReduction,
} from "@/lib/tools/image-compressor";
import {
  convertImageFormat,
  type ImageConvertResult,
} from "@/lib/tools/image-format-converter";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "image-format-converter";
const TOOL_CATEGORY = "freelancer" as const;

export function ImageFormatConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [targetFormat, setTargetFormat] = useState<SupportedImageMimeType>("image/webp");
  const [quality, setQuality] = useState<number>(90); // 1 - 100
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageConvertResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlsRef = useRef<{ original?: string; result?: string }>({});

  const cleanupUrls = () => {
    if (urlsRef.current.original) {
      URL.revokeObjectURL(urlsRef.current.original);
      urlsRef.current.original = undefined;
    }
    if (urlsRef.current.result) {
      URL.revokeObjectURL(urlsRef.current.result);
      urlsRef.current.result = undefined;
    }
  };

  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    cleanupUrls();
    setResult(null);
    setError(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    urlsRef.current.original = objectUrl;

    const img = new Image();
    img.onload = () => {
      setFile(selectedFile);
      setOriginalPreviewUrl(objectUrl);
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      setError("Failed to decode image file. Please upload a valid JPEG, PNG, or WebP image.");
      URL.revokeObjectURL(objectUrl);
      urlsRef.current.original = undefined;
    };
    img.src = objectUrl;
  };

  const executeConversion = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (urlsRef.current.result) {
        URL.revokeObjectURL(urlsRef.current.result);
        urlsRef.current.result = undefined;
      }

      const conversionResult = await convertImageFormat(file, {
        targetMimeType: targetFormat,
        quality: quality / 100,
        backgroundColor: backgroundColor,
      });

      urlsRef.current.result = conversionResult.dataUrl;
      setResult(conversionResult);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "convert_format",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to convert image.";
      setError(message);
      reportToolProcessingError({
        toolSlug: TOOL_SLUG,
        toolCategory: TOOL_CATEGORY,
        errorCategory: "processing_error",
        operationType: "convert_format",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    cleanupUrls();
    setFile(null);
    setOriginalPreviewUrl(null);
    setOriginalDimensions(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download",
    });
  };

  const sizeComparison =
    file && result
      ? calculateSizeReduction(file.size, result.outputSize)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Upload Box */}
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
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Choose an image or drag and drop here
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, and WebP (up to 25 MB). 100% private in-browser conversion.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Workspace */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileBytes(file.size)} •{" "}
                    {originalDimensions
                      ? `${originalDimensions.width} × ${originalDimensions.height} px`
                      : "Analyzing..."}
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

            {/* Target Settings */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white">
                  Target Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) =>
                    setTargetFormat(e.target.value as SupportedImageMimeType)
                  }
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="image/webp">WebP (Modern, high compression)</option>
                  <option value="image/jpeg">JPG / JPEG (Universal compatibility)</option>
                  <option value="image/png">PNG (Lossless, supports transparency)</option>
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {targetFormat === "image/webp" && "Best for websites and modern apps."}
                  {targetFormat === "image/jpeg" &&
                    "Best for photographs. Note: Transparency will be flattened."}
                  {targetFormat === "image/png" &&
                    "Best for screenshots, graphics, and logos requiring transparency."}
                </p>
              </div>

              {targetFormat !== "image/png" ? (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">
                      Quality: {quality}%
                    </label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {quality >= 90 ? "Maximum" : quality >= 75 ? "High" : "Standard"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="mt-3 w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Smallest File (10%)</span>
                    <span>Best Quality (100%)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center rounded-xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                  PNG is a lossless format and does not use lossy quality compression sliders.
                </div>
              )}

              {targetFormat === "image/jpeg" && (
                <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                        Flatten Transparency Background Color
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        JPG does not support transparent alpha channels. Choose a background color to fill transparent regions.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5 dark:border-slate-700"
                      />
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {backgroundColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={executeConversion}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                {isProcessing ? "Converting..." : "Convert Format"}
              </button>
            </div>
          </div>

          {/* Results Comparison Section */}
          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4 dark:border-emerald-900/40">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">Conversion Complete</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Download {result.filename}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Original Size</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {formatFileBytes(file.size)}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Converted Size</p>
                  <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatFileBytes(result.outputSize)}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Change</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {sizeComparison?.summaryLabel}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dimensions</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {result.width} × {result.height} px
                  </p>
                </div>
              </div>

              {/* Previews side by side */}
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Original Image
                  </p>
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-700 dark:bg-slate-800">
                    {originalPreviewUrl && (
                      <img
                        src={originalPreviewUrl}
                        alt="Original Upload"
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Converted Preview ({result.outputMimeType.replace("image/", "").toUpperCase()})
                  </p>
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-700 dark:bg-slate-800">
                    <img
                      src={result.dataUrl}
                      alt="Converted Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
