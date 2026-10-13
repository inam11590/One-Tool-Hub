"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Crop as CropIcon,
  Download,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Check,
} from "lucide-react";
import {
  type SupportedImageMimeType,
  formatFileBytes,
} from "@/lib/tools/image-compressor";
import {
  type AspectRatioPreset,
  type CropRect,
  type CropResult,
  calculateDefaultCropRect,
  cropImageFile,
} from "@/lib/tools/image-cropper";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "image-cropper";
const TOOL_CATEGORY = "youtube" as const;

export function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [aspectPreset, setAspectPreset] = useState<AspectRatioPreset>("freeform");

  const [cropRect, setCropRect] = useState<CropRect>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  const [rotation, setRotation] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<SupportedImageMimeType>("image/png");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CropResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlsRef = useRef<{ original?: string; cropped?: string }>({});

  const cleanupUrls = () => {
    if (urlsRef.current.original) {
      URL.revokeObjectURL(urlsRef.current.original);
      urlsRef.current.original = undefined;
    }
    if (urlsRef.current.cropped) {
      URL.revokeObjectURL(urlsRef.current.cropped);
      urlsRef.current.cropped = undefined;
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
    setRotation(0);

    const objectUrl = URL.createObjectURL(selectedFile);
    urlsRef.current.original = objectUrl;

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setFile(selectedFile);
      setPreviewUrl(objectUrl);
      setNaturalDimensions({ width: w, height: h });
      const initialCrop = calculateDefaultCropRect("freeform", w, h);
      setCropRect(initialCrop);
    };
    img.onerror = () => {
      setError("Failed to decode image. Please upload a valid JPEG, PNG, or WebP image.");
      URL.revokeObjectURL(objectUrl);
      urlsRef.current.original = undefined;
    };
    img.src = objectUrl;
  };

  const handlePresetChange = (preset: AspectRatioPreset) => {
    setAspectPreset(preset);
    if (!naturalDimensions) return;
    const newCrop = calculateDefaultCropRect(
      preset,
      naturalDimensions.width,
      naturalDimensions.height
    );
    setCropRect(newCrop);
  };

  const handleExecuteCrop = async () => {
    if (!file || !naturalDimensions) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (urlsRef.current.cropped) {
        URL.revokeObjectURL(urlsRef.current.cropped);
        urlsRef.current.cropped = undefined;
      }

      const cropRes = await cropImageFile(file, {
        cropRect,
        rotation,
        outputMimeType: outputFormat,
      });

      urlsRef.current.cropped = cropRes.dataUrl;
      setResult(cropRes);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "crop_image",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to crop image.";
      setError(msg);
      reportToolProcessingError({
        toolSlug: TOOL_SLUG,
        toolCategory: TOOL_CATEGORY,
        errorCategory: "processing_error",
        operationType: "crop_image",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    cleanupUrls();
    setFile(null);
    setPreviewUrl(null);
    setNaturalDimensions(null);
    setResult(null);
    setError(null);
    setAspectPreset("freeform");
    setRotation(0);
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
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Choose an image to crop or drag & drop
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, and WebP. 100% private in-browser canvas cropping.
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
                    {naturalDimensions
                      ? `${naturalDimensions.width} × ${naturalDimensions.height} px`
                      : "Loading..."}{" "}
                    • {formatFileBytes(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New Image
              </button>
            </div>

            {/* Aspect Presets */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Aspect Ratio Presets
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      { id: "freeform", label: "Freeform" },
                      { id: "1:1", label: "1:1 (Square / Instagram)" },
                      { id: "16:9", label: "16:9 (Landscape / YouTube)" },
                      { id: "9:16", label: "9:16 (Stories / TikTok)" },
                      { id: "4:3", label: "4:3 (Standard Photo)" },
                      { id: "custom", label: "Custom Ratio" },
                    ] as const
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetChange(preset.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        aspectPreset === preset.id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions Editor */}
              {naturalDimensions && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">
                      Crop Width (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max={naturalDimensions.width}
                      value={cropRect.width}
                      onChange={(e) => {
                        const val = Math.max(10, Math.min(naturalDimensions.width, Number(e.target.value)));
                        setCropRect((prev) => ({
                          ...prev,
                          width: val,
                          x: Math.min(prev.x, naturalDimensions.width - val),
                        }));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">
                      Crop Height (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max={naturalDimensions.height}
                      value={cropRect.height}
                      onChange={(e) => {
                        const val = Math.max(10, Math.min(naturalDimensions.height, Number(e.target.value)));
                        setCropRect((prev) => ({
                          ...prev,
                          height: val,
                          y: Math.min(prev.y, naturalDimensions.height - val),
                        }));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">
                      Offset X (px)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={naturalDimensions.width - cropRect.width}
                      value={cropRect.x}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(naturalDimensions.width - cropRect.width, Number(e.target.value)));
                        setCropRect((prev) => ({ ...prev, x: val }));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400">
                      Offset Y (px)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={naturalDimensions.height - cropRect.height}
                      value={cropRect.y}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(naturalDimensions.height - cropRect.height, Number(e.target.value)));
                        setCropRect((prev) => ({ ...prev, y: val }));
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Format selection */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Output Format:
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) =>
                      setOutputFormat(e.target.value as SupportedImageMimeType)
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="image/png">PNG (Lossless, Transparency)</option>
                    <option value="image/jpeg">JPG / JPEG (Compact)</option>
                    <option value="image/webp">WebP (Optimized)</option>
                  </select>
                </div>

                <button
                  onClick={handleExecuteCrop}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CropIcon className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                  {isProcessing ? "Cropping..." : "Apply Crop"}
                </button>
              </div>
            </div>

            {/* Visual Crop Box Simulation Container */}
            {previewUrl && naturalDimensions && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interactive Crop Overlay ({cropRect.width} × {cropRect.height} px selected)
                </p>
                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-900 p-2">
                  <img
                    src={previewUrl}
                    alt="Crop Canvas"
                    className="max-h-full max-w-full object-contain opacity-70"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div
                      className="border-2 border-emerald-400 bg-emerald-400/20 shadow-lg"
                      style={{
                        width: `${Math.min(90, Math.max(20, (cropRect.width / naturalDimensions.width) * 80))}%`,
                        height: `${Math.min(90, Math.max(20, (cropRect.height / naturalDimensions.height) * 80))}%`,
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
                          {cropRect.width} × {cropRect.height} px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cropped Output Result */}
          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4 dark:border-emerald-900/40">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">Image Cropped Successfully</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Download {result.filename}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="rounded-md bg-white px-2.5 py-1 shadow-sm dark:bg-slate-800">
                  Dimensions: <strong>{result.width} × {result.height} px</strong>
                </span>
                <span className="rounded-md bg-white px-2.5 py-1 shadow-sm dark:bg-slate-800">
                  File Size: <strong>{formatFileBytes(result.sizeBytes)}</strong>
                </span>
                <span className="rounded-md bg-white px-2.5 py-1 shadow-sm dark:bg-slate-800">
                  Format: <strong>{outputFormat.replace("image/", "").toUpperCase()}</strong>
                </span>
              </div>

              <div className="mt-4 flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800">
                <img
                  src={result.dataUrl}
                  alt="Cropped Preview"
                  className="max-h-96 object-contain"
                />
              </div>
            </div>
          )}
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
