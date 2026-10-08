"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  Image as ImageIcon,
  Info,
  RotateCcw,
  Upload,
} from "lucide-react";
import {
  buildCompressedFileName,
  calculateSizeReduction,
  formatFileBytes,
  type SupportedImageMimeType,
  validateImageDimensions,
  validateImageFileMetadata,
  validateImageMagicBytes,
} from "@/lib/tools/image-compressor";

interface ProcessedImageState {
  originalFile: File;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  outputUrl: string;
  outputBytes: number;
  outputMime: SupportedImageMimeType;
}

export function ImageCompressorTool() {
  const [imageState, setImageState] = useState<ProcessedImageState | null>(
    null
  );
  const [outputMime, setOutputMime] =
    useState<SupportedImageMimeType>("image/webp");
  const [quality, setQuality] = useState<number>(80);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlsRef = useRef<{ originalUrl?: string; outputUrl?: string }>({});

  const revokeUrls = () => {
    if (urlsRef.current.originalUrl) {
      URL.revokeObjectURL(urlsRef.current.originalUrl);
    }
    if (urlsRef.current.outputUrl) {
      URL.revokeObjectURL(urlsRef.current.outputUrl);
    }
    urlsRef.current = {};
  };

  useEffect(() => {
    return () => {
      revokeUrls();
    };
  }, []);

  const compressInBrowser = async (
    file: File,
    targetMime: SupportedImageMimeType,
    targetQualityPct: number,
    existingOriginalUrl?: string
  ) => {
    setIsProcessing(true);
    setError(null);

    const originalUrl = existingOriginalUrl ?? URL.createObjectURL(file);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = () =>
          reject(new Error("Could not decode the selected image file."));
        el.src = originalUrl;
      });

      const dimCheck = validateImageDimensions(
        img.naturalWidth,
        img.naturalHeight
      );
      if (!dimCheck.valid) {
        if (!existingOriginalUrl) {
          URL.revokeObjectURL(originalUrl);
        }
        setError(dimCheck.error ?? "Image dimensions exceed safety limits.");
        setIsProcessing(false);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        if (!existingOriginalUrl) {
          URL.revokeObjectURL(originalUrl);
        }
        setError("Canvas 2D context is not available in this browser.");
        setIsProcessing(false);
        return;
      }

      // Fill white background when converting transparent PNG/WebP to JPEG
      if (targetMime === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const normalizedQuality =
        targetMime === "image/png"
          ? undefined
          : Math.min(1, Math.max(0.1, targetQualityPct / 100));

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), targetMime, normalizedQuality)
      );

      // Release canvas memory immediately
      canvas.width = 0;
      canvas.height = 0;

      if (!blob) {
        if (!existingOriginalUrl) {
          URL.revokeObjectURL(originalUrl);
        }
        setError("Browser failed to encode the output image.");
        setIsProcessing(false);
        return;
      }

      if (urlsRef.current.outputUrl) {
        URL.revokeObjectURL(urlsRef.current.outputUrl);
      }
      if (
        !existingOriginalUrl &&
        urlsRef.current.originalUrl &&
        urlsRef.current.originalUrl !== originalUrl
      ) {
        URL.revokeObjectURL(urlsRef.current.originalUrl);
      }

      const outputUrl = URL.createObjectURL(blob);
      urlsRef.current = { originalUrl, outputUrl };

      setImageState({
        originalFile: file,
        originalUrl,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
        outputUrl,
        outputBytes: blob.size,
        outputMime: targetMime,
      });
    } catch (err) {
      if (!existingOriginalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process the selected image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFile = async (file: File | undefined) => {
    if (!file) return;
    const check = validateImageFileMetadata(file);
    if (!check.valid) {
      setError(check.error ?? "Invalid image file.");
      return;
    }

    try {
      const headerBuffer = await file.slice(0, 16).arrayBuffer();
      const magicCheck = validateImageMagicBytes(new Uint8Array(headerBuffer));
      if (!magicCheck.valid) {
        setError(magicCheck.error ?? "Invalid image file signature.");
        return;
      }
    } catch {
      setError("Could not read the selected image file.");
      return;
    }

    revokeUrls();
    setImageState(null);
    void compressInBrowser(file, outputMime, quality);
  };

  const handleFormatChange = (nextMime: SupportedImageMimeType) => {
    setOutputMime(nextMime);
    if (imageState) {
      void compressInBrowser(
        imageState.originalFile,
        nextMime,
        quality,
        imageState.originalUrl
      );
    }
  };

  const handleQualityChange = (nextQuality: number) => {
    setQuality(nextQuality);
    if (imageState && outputMime !== "image/png") {
      void compressInBrowser(
        imageState.originalFile,
        outputMime,
        nextQuality,
        imageState.originalUrl
      );
    }
  };

  const handleReset = () => {
    revokeUrls();
    setImageState(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const reduction = imageState
    ? calculateSizeReduction(
        imageState.originalFile.size,
        imageState.outputBytes
      )
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
      {/* Controls Bar */}
      <div className="grid grid-cols-1 gap-4 border-b border-slate-200 pb-5 md:grid-cols-12 md:items-end">
        {/* Output Format Selector */}
        <div className="md:col-span-5">
          <label
            htmlFor="output-format-select"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Output Format
          </label>
          <select
            id="output-format-select"
            value={outputMime}
            onChange={(e) =>
              handleFormatChange(e.target.value as SupportedImageMimeType)
            }
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
          >
            <option value="image/webp">WebP (Recommended for Web)</option>
            <option value="image/jpeg">JPEG (Lossy Photographic)</option>
            <option value="image/png">PNG (Canvas Re-encoded)</option>
          </select>
        </div>

        {/* Quality Slider */}
        <div className="md:col-span-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="quality-range"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Quality ({outputMime === "image/png" ? "N/A for PNG" : `${quality}%`})
            </label>
            <span className="text-xs text-slate-500">
              {outputMime === "image/png"
                ? "Fixed PNG encoding"
                : quality >= 80
                ? "High visual quality"
                : quality >= 50
                ? "Balanced size"
                : "Maximum reduction"}
            </span>
          </div>
          <input
            id="quality-range"
            type="range"
            min={10}
            max={100}
            step={5}
            disabled={outputMime === "image/png"}
            value={quality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Reset Button */}
        <div className="flex md:col-span-2 md:justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!imageState && !error}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:w-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* PNG & Compression Transparency Note */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-950">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
          aria-hidden="true"
        />
        <span>
          <strong>Compression Note:</strong> Browser Canvas encoding works best
          when exporting to <strong>WebP</strong> or <strong>JPEG</strong>. PNG
          output does not use a lossy quality slider and may not significantly
          reduce file size—converting a JPEG or already-optimized image to PNG
          can produce a larger file.
        </span>
      </div>

      {/* Error Message */}
      {error ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Drag and Drop / File Picker Zone */}
      {!imageState ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            handleSelectFile(droppedFile);
          }}
          className={`mt-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors sm:p-14 ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/60"
              : "border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-bold text-slate-900">
            Drag &amp; drop an image here, or choose a file
          </h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Supports JPEG, PNG, and WebP up to 25 MB (processed locally in your
            browser).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void handleSelectFile(e.target.files?.[0])}
            className="peer sr-only"
            id="image-compressor-file-input"
          />
          <label
            htmlFor="image-compressor-file-input"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600 sm:text-sm"
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            <span>Select Image File</span>
          </label>
        </div>
      ) : (
        /* Preview & Results Comparison */
        <div className="mt-6 space-y-6">
          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Original Size</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">
                {formatFileBytes(imageState.originalFile.size)}
              </p>
              <p className="text-xs text-slate-500">
                {imageState.originalWidth} &times; {imageState.originalHeight} px
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Processed Size
              </p>
              <p className="mt-1 text-lg font-extrabold text-indigo-600">
                {isProcessing
                  ? "Processing..."
                  : formatFileBytes(imageState.outputBytes)}
              </p>
              <p className="text-xs text-slate-500">
                Format: {imageState.outputMime.replace("image/", "").toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Size Change</p>
              <p
                className={`mt-1 text-lg font-extrabold ${
                  reduction?.isSmaller ? "text-emerald-600" : "text-amber-700"
                }`}
              >
                {reduction?.summaryLabel}
              </p>
              <p className="text-xs text-slate-500">
                {reduction && reduction.diffBytes >= 0
                  ? `Saved ${formatFileBytes(reduction.diffBytes)}`
                  : reduction
                  ? `Increased by ${formatFileBytes(
                      Math.abs(reduction.diffBytes)
                    )}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-col justify-center sm:items-end">
              <a
                href={imageState.outputUrl}
                download={buildCompressedFileName(
                  imageState.originalFile.name,
                  imageState.outputMime
                )}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto sm:text-sm"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Image</span>
              </a>
            </div>
          </div>

          {/* Side-by-side Image Previews */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Original Preview ({imageState.originalFile.name})</span>
                <span>{formatFileBytes(imageState.originalFile.size)}</span>
              </div>
              <div className="flex max-h-80 items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageState.originalUrl}
                  alt="Original uploaded preview"
                  className="max-h-72 w-auto object-contain"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>
                  Compressed Preview (
                  {imageState.outputMime.replace("image/", "").toUpperCase()})
                </span>
                <span>{formatFileBytes(imageState.outputBytes)}</span>
              </div>
              <div className="flex max-h-80 items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageState.outputUrl}
                  alt="Compressed output preview"
                  className="max-h-72 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
