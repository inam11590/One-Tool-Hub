'use client';

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  RotateCcw,
  AlertCircle,
  Lock,
  Unlock,
  ImageIcon,
  Scaling,
  Info,
} from "lucide-react";
import {
  resizeImageInBrowser,
  calculateAspectDimension,
  validateTargetDimensions,
  type ImageResizeConfig,
} from "@/lib/tools/image-resizer";
import {
  validateImageFileMetadata,
  validateImageMagicBytes,
  formatFileBytes,
  type SupportedImageMimeType,
} from "@/lib/tools/image-compressor";
import { trackToolEvent } from "@/lib/analytics";

const TOOL_SLUG = "image-resizer";
const TOOL_CATEGORY = "youtube";

interface LoadedImageMeta {
  file: File;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
}

interface ResizedResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

export function ImageResizerTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadedImage, setLoadedImage] = useState<LoadedImageMeta | null>(null);
  const [widthInput, setWidthInput] = useState<number>(1280);
  const [heightInput, setHeightInput] = useState<number>(720);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<SupportedImageMimeType>("image/webp");
  const [quality, setQuality] = useState<number>(90);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resizedResult, setResizedResult] = useState<ResizedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Track tool mount
  useEffect(() => {
    trackToolEvent("tool_open", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (loadedImage?.originalUrl) URL.revokeObjectURL(loadedImage.originalUrl);
      if (resizedResult?.url) URL.revokeObjectURL(resizedResult.url);
    };
  }, [loadedImage, resizedResult]);

  const handleSelectFile = async (file?: File) => {
    if (!file) return;
    setErrorMessage(null);

    const metaCheck = validateImageFileMetadata(file);
    if (!metaCheck.valid) {
      setErrorMessage(metaCheck.error ?? "Invalid image file.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "upload_image",
        error_category: "invalid_input",
      });
      return;
    }

    try {
      const headerBuffer = await file.slice(0, 16).arrayBuffer();
      const magicCheck = validateImageMagicBytes(new Uint8Array(headerBuffer));
      if (!magicCheck.valid) {
        setErrorMessage(magicCheck.error ?? "Invalid image header signature.");
        return;
      }

      // Cleanup prior URLs
      if (loadedImage?.originalUrl) URL.revokeObjectURL(loadedImage.originalUrl);
      if (resizedResult?.url) URL.revokeObjectURL(resizedResult.url);

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Unable to decode image dimensions."));
        img.src = objectUrl;
      });

      setLoadedImage({
        file,
        originalWidth: img.width,
        originalHeight: img.height,
        originalUrl: objectUrl,
      });

      // Default target dimensions to original dimensions
      setWidthInput(img.width);
      setHeightInput(img.height);
      setResizedResult(null);

      // Auto-set output format matching original if possible
      if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp") {
        setOutputFormat(file.type as SupportedImageMimeType);
      }
    } catch {
      setErrorMessage("Could not inspect the selected image file.");
    }
  };

  const handleWidthChange = (val: number) => {
    setWidthInput(val);
    if (lockAspect && loadedImage) {
      const calc = calculateAspectDimension(
        loadedImage.originalWidth,
        loadedImage.originalHeight,
        val,
        undefined
      );
      setHeightInput(calc.height);
    }
  };

  const handleHeightChange = (val: number) => {
    setHeightInput(val);
    if (lockAspect && loadedImage) {
      const calc = calculateAspectDimension(
        loadedImage.originalWidth,
        loadedImage.originalHeight,
        undefined,
        val
      );
      setWidthInput(calc.width);
    }
  };

  const handleExecuteResize = async () => {
    if (!loadedImage) return;
    setErrorMessage(null);

    const dimCheck = validateTargetDimensions(widthInput, heightInput);
    if (!dimCheck.valid) {
      setErrorMessage(dimCheck.error || "Invalid target dimensions.");
      return;
    }

    setIsProcessing(true);
    try {
      const config: ImageResizeConfig = {
        targetWidth: widthInput,
        targetHeight: heightInput,
        lockAspectRatio: lockAspect,
        outputFormat,
        quality,
      };

      const out = await resizeImageInBrowser(loadedImage.file, config);
      if (resizedResult?.url) URL.revokeObjectURL(resizedResult.url);

      const newUrl = URL.createObjectURL(out.blob);
      setResizedResult({
        blob: out.blob,
        url: newUrl,
        width: out.width,
        height: out.height,
      });

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: `resize_${outputFormat.replace("image/", "")}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resize image.";
      setErrorMessage(msg);
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "resize_image",
        error_category: "processing_error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resizedResult || !loadedImage) return;
    const ext = outputFormat === "image/png" ? "png" : outputFormat === "image/jpeg" ? "jpg" : "webp";
    const nameWithoutExt = loadedImage.file.name.replace(/\.[^/.]+$/, "");
    const filename = `${nameWithoutExt}-${resizedResult.width}x${resizedResult.height}.${ext}`;

    const a = document.createElement("a");
    a.href = resizedResult.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_resized_image",
    });
  };

  const handleReset = () => {
    if (
      loadedImage &&
      typeof window !== "undefined" &&
      !window.confirm("Clear the currently loaded image and reset dimensions?")
    ) {
      return;
    }
    if (loadedImage?.originalUrl) URL.revokeObjectURL(loadedImage.originalUrl);
    if (resizedResult?.url) URL.revokeObjectURL(resizedResult.url);
    setLoadedImage(null);
    setResizedResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset_image_resizer",
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!loadedImage ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            void handleSelectFile(file);
          }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/60"
              : "border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-bold text-slate-900">
            Drag &amp; drop an image to resize, or browse files
          </h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Supports JPEG, PNG, and WebP up to 25 MB (processed privately in your browser).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void handleSelectFile(e.target.files?.[0])}
            className="peer sr-only"
            id="image-resizer-file-input"
          />
          <label
            htmlFor="image-resizer-file-input"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            <span>Select Image File</span>
          </label>
        </div>
      ) : (
        /* Image Loaded Workspace */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Controls Column */}
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Resize Dimensions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Original: {loadedImage.originalWidth} &times; {loadedImage.originalHeight} px (
                    {formatFileBytes(loadedImage.file.size)})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Width & Height Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8192}
                    value={widthInput}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8192}
                    value={heightInput}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Lock Aspect Ratio Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                    lockAspect
                      ? "border-indigo-200 bg-indigo-50/70 text-indigo-900"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {lockAspect ? (
                    <>
                      <Lock className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                      <span>Aspect Ratio Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                      <span>Aspect Ratio Unlocked (Free Distortion)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preset Dimension Quick-Chips */}
              <div>
                <span className="text-xs font-semibold text-slate-600">Common Presets:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { label: "1920×1080 (Full HD)", w: 1920, h: 1080 },
                    { label: "1280×720 (YouTube)", w: 1280, h: 720 },
                    { label: "1080×1080 (Square)", w: 1080, h: 1080 },
                    { label: "800×600 (Web)", w: 800, h: 600 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setWidthInput(preset.w);
                        setHeightInput(preset.h);
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format & Quality */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as SupportedImageMimeType)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                  >
                    <option value="image/webp">WebP (Modern, Smallest)</option>
                    <option value="image/jpeg">JPEG (Photographic)</option>
                    <option value="image/png">PNG (Preserves Transparency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Quality ({outputFormat === "image/png" ? "Fixed PNG" : `${quality}%`})
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    disabled={outputFormat === "image/png"}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="mt-3.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Execute Resize Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleExecuteResize()}
                  disabled={isProcessing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Scaling className="h-4 w-4" aria-hidden="true" />
                  <span>{isProcessing ? "Resizing Image..." : "Apply Resize"}</span>
                </button>
              </div>
            </div>

            {/* Right Preview Column */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Preview &amp; Output
              </h2>

              <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizedResult ? resizedResult.url : loadedImage.originalUrl}
                  alt={resizedResult ? "Resized Image Preview" : "Original Image Preview"}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {resizedResult ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span>Ready for Download</span>
                    <span>
                      {resizedResult.width} &times; {resizedResult.height} px (
                      {formatFileBytes(resizedResult.blob.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Download Resized Image</span>
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-500">
                  Click &quot;Apply Resize&quot; to generate your resized image and enable download.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-900"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Educational Notice on Upscaling */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span>
          <strong>Resolution Tip:</strong> Scaling down reduces file size and sharpens web presentation. Upscaling an image beyond its native resolution interpolates pixels and will not generate real original detail.
        </span>
      </div>
    </div>
  );
}
