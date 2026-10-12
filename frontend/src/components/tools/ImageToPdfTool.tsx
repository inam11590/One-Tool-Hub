'use client';

import { useState, useId, useEffect, useRef } from "react";
import {
  Upload,
  Images,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Sliders,
  Plus,
} from "lucide-react";
import {
  validateImageForPdf,
  inspectImageDimensions,
  generatePdfFromImages,
  type ImageToPdfItem,
  type PdfPageSize,
  type PdfOrientation,
  type PdfMarginOption,
  type ImageLayoutMode,
} from "@/lib/tools/image-to-pdf";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "image-to-pdf";
const TOOL_CATEGORY = "student";

export function ImageToPdfTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Images list state
  const [items, setItems] = useState<ImageToPdfItem[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);

  // Configuration state
  const [pageSize, setPageSize] = useState<PdfPageSize>("a4");
  const [orientation, setOrientation] = useState<PdfOrientation>("portrait");
  const [margin, setMargin] = useState<PdfMarginOption>("small");
  const [layoutMode, setLayoutMode] = useState<ImageLayoutMode>("fit");
  const [outputFileName, setOutputFileName] = useState<string>("converted-document.pdf");

  // Execution & output state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedPdf, setGeneratedPdf] = useState<{
    bytes: Uint8Array;
    fileName: string;
    pageCount: number;
    sizeBytes: number;
    downloadUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.objectUrl));
      if (generatedPdf?.downloadUrl) {
        URL.revokeObjectURL(generatedPdf.downloadUrl);
      }
    };
  }, [items, generatedPdf]);

  const handleFilesAdded = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setIsProcessingUpload(true);
    const newItems: ImageToPdfItem[] = [];

    for (const f of filesArray) {
      const check = validateImageForPdf(f);
      if (!check.valid) {
        setErrorMessage(check.error || `Skipped invalid file "${f.name}".`);
        continue;
      }

      try {
        const buffer = await f.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const objectUrl = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: f.type }));
        const dims = await inspectImageDimensions(bytes, f.type);

        newItems.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          size: f.size,
          type: f.type,
          bytes,
          objectUrl,
          width: dims.width,
          height: dims.height,
        });
      } catch (err) {
        setErrorMessage(`Could not read "${f.name}": ${err instanceof Error ? err.message : "Error"}`);
      }
    }

    setItems((prev) => [...prev, newItems].flat());
    setIsProcessingUpload(false);

    trackToolEvent("tool_process_start", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "add_images",
    });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      if (!temp || !copy[index]) return prev;
      copy[index - 1] = copy[index]!;
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      if (!temp || !copy[index]) return prev;
      copy[index + 1] = copy[index]!;
      copy[index] = temp;
      return copy;
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    if (generatedPdf?.downloadUrl) URL.revokeObjectURL(generatedPdf.downloadUrl);
    setItems([]);
    setGeneratedPdf(null);
    setErrorMessage(null);
    setProgressPercent(0);
    if (fileInputRef.current) fileInputRef.current.value = "";

    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  const handleGeneratePdf = async () => {
    if (items.length === 0) {
      setErrorMessage("Please add at least one image.");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setProgressPercent(10);

    try {
      const result = await generatePdfFromImages(
        items,
        {
          pageSize,
          orientation,
          margin,
          layoutMode,
          outputFileName: outputFileName.trim() || "converted-images.pdf",
        },
        (completed, total) => {
          setProgressPercent(Math.round((completed / total) * 100));
        }
      );

      const blob = new Blob([result.bytes as unknown as BlobPart], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setGeneratedPdf({
        ...result,
        downloadUrl,
      });
      setIsGenerating(false);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "generate_pdf",
      });
    } catch (err) {
      setIsGenerating(false);
      setErrorMessage(err instanceof Error ? err.message : "Failed to create PDF.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "processing_error",
      });
    }
  };

  return (
    <div className="w-full space-y-8" aria-label="Image to PDF Converter Workspace">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/80 rounded-2xl p-6 sm:p-10 text-center bg-zinc-900/40 hover:bg-zinc-900/70 transition-all duration-200 cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          id={`${baseId}-file-input`}
          onChange={(e) => {
            if (e.target.files) handleFilesAdded(e.target.files);
          }}
        />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:scale-105 transition-all mb-3">
          <Upload className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">
          {items.length === 0 ? "Select or drop JPG, PNG, or WebP images" : "Add more images to your document"}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto mb-3">
          Combine homework pages, invoices, scans, or photo series into a single clean PDF file.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400 text-xs">
          <span>Multi-file upload supported • Up to 30 MB per image</span>
        </div>
      </div>

      {isProcessingUpload && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 text-sm">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Processing added images...</span>
        </div>
      )}

      {/* Image List & Page Settings Workspace */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-200">
              <Images className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>{items.length}</strong> {items.length === 1 ? "Image" : "Images"} Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Configuration Settings Panel */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-2 text-zinc-200 font-medium border-b border-zinc-800 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>PDF Page & Layout Options</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PdfPageSize)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="letter">US Letter</option>
                  <option value="fit-to-image">Fit to Image</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Orientation
                </label>
                <select
                  value={orientation}
                  disabled={pageSize === "fit-to-image"}
                  onChange={(e) => setOrientation(e.target.value as PdfOrientation)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-40"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              {/* Margins */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Page Margins
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as PdfMarginOption)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="none">None (0 mm)</option>
                  <option value="small">Small (7 mm)</option>
                  <option value="medium">Medium (13 mm)</option>
                  <option value="large">Large (19 mm)</option>
                </select>
              </div>

              {/* Layout Mode */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Image Fit
                </label>
                <select
                  value={layoutMode}
                  onChange={(e) => setLayoutMode(e.target.value as ImageLayoutMode)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="fit">Fit (Keep Proportions)</option>
                  <option value="fill">Fill (Expand to Margin)</option>
                </select>
              </div>
            </div>

            {/* Output File Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Output File Name
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="my-document.pdf"
                className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
              />
            </div>

            {/* Generate Action Button */}
            <div className="pt-4 border-t border-zinc-800/60 flex justify-end">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={isGenerating || items.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Creating PDF ({progressPercent}%)...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate PDF ({items.length} {items.length === 1 ? "page" : "pages"})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reorderable Image Cards */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-300">
              Page Order (drag or use arrows to rearrange)
            </h4>
            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center font-mono text-xs font-semibold text-emerald-400 shrink-0">
                      #{index + 1}
                    </span>
                    <div className="w-12 h-12 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                      <img
                        src={item.objectUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400">
                        {item.width} × {item.height} px • {(item.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 transition-colors"
                      aria-label="Move image up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 transition-colors"
                      aria-label="Move image down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors ml-2"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated PDF Download Card */}
          {generatedPdf && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">{generatedPdf.fileName}</h4>
                  <p className="text-xs text-emerald-300/80">
                    {generatedPdf.pageCount} {generatedPdf.pageCount === 1 ? "page" : "pages"} •{" "}
                    {(generatedPdf.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <a
                href={generatedPdf.downloadUrl}
                download={generatedPdf.fileName}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Generated PDF</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>
          <strong>Local Execution:</strong> Images are embedded directly into PDF vectors inside your browser via pdf-lib. No images are sent to any remote server.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="JPG / PNG to PDF Converter" />
    </div>
  );
}
