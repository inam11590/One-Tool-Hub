"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileCode,
  RotateCcw,
  Upload,
} from "lucide-react";
import { formatFileBytes } from "@/lib/tools/image-compressor";
import {
  convertImageFileToBase64,
  type ImageBase64Result,
} from "@/lib/tools/image-to-base64";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "image-to-base64";
const TOOL_CATEGORY = "developer" as const;

export function ImageToBase64Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageBase64Result | null>(null);

  const [activeTab, setActiveTab] = useState<"dataUrl" | "rawBase64">("dataUrl");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    try {
      const base64Res = await convertImageFileToBase64(selectedFile);
      setResult(base64Res);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "convert_base64",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to convert image to Base64.";
      setError(msg);
      reportToolProcessingError({
        toolSlug: TOOL_SLUG,
        toolCategory: TOOL_CATEGORY,
        errorCategory: "processing_error",
        operationType: "convert_base64",
      });
    }
  };

  const handleCopy = (type: "dataUrl" | "rawBase64") => {
    if (!result) return;
    const textToCopy = type === "dataUrl" ? result.dataUrl : result.rawBase64;
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);

    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy",
    });
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const content = activeTab === "dataUrl" ? result.dataUrl : result.rawBase64;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename.replace(/\.[^/.]+$/, "")}-${activeTab === "dataUrl" ? "data-url" : "base64"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download",
    });
  };

  const handleReset = () => {
    setFile(null);
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
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Choose an image to convert to Base64
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, and WebP (up to 15 MB). Zero external uploads.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileBytes(file.size)} • {file.type || "Image"}
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

            {/* Metrics Grid */}
            {result && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Original Size</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {formatFileBytes(result.originalSizeBytes)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Base64 Size</p>
                  <p className="mt-1 font-semibold text-amber-600 dark:text-amber-400">
                    {formatFileBytes(result.base64Length)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Encoding Overhead</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    +{result.overheadPercentage}% (+{formatFileBytes(result.overheadBytes)})
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dimensions</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {result.width} × {result.height} px
                  </p>
                </div>
              </div>
            )}

            {/* Overhead Explanation Alert */}
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
              <strong>Why is Base64 larger?</strong> Base64 encodes binary data into 64 printable ASCII characters, turning every 3 binary bytes into 4 text characters. This causes an expected <strong>~33% file size increase</strong>. Base64 is ideal for inlining small icons or emails, but raw binary files are recommended for large assets.
            </div>

            {/* Output View Tabs & Actions */}
            {result && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("dataUrl")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === "dataUrl"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      Complete Data URL (HTML/CSS)
                    </button>
                    <button
                      onClick={() => setActiveTab("rawBase64")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === "rawBase64"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      Raw Base64 String
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(activeTab)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      {copiedType === activeTab ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Save as .txt
                    </button>
                  </div>
                </div>

                {/* Text Output Box */}
                <div className="relative">
                  <textarea
                    readOnly
                    rows={8}
                    value={activeTab === "dataUrl" ? result.dataUrl : result.rawBase64}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>
                      {activeTab === "dataUrl"
                        ? "Format: data:[mime];base64,[data]"
                        : "Format: Pure Base64 payload"}
                    </span>
                    <span>Length: {result.base64Length.toLocaleString()} characters</span>
                  </div>
                </div>

                {/* Thumbnail Preview */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Rendered Data URL Verification
                  </p>
                  <div className="flex max-h-48 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                    <img
                      src={result.dataUrl}
                      alt="Data URL preview"
                      className="max-h-40 object-contain"
                    />
                  </div>
                </div>
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
