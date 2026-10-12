'use client';

import { useState, useId, useEffect, useRef } from "react";
import {
  Upload,
  Stamp,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import {
  applyWatermarkToPdf,
  type WatermarkConfig,
  type WatermarkPosition,
  type WatermarkFontFamily,
} from "@/lib/tools/pdf-watermark";
import { validatePdfForConversion } from "@/lib/tools/pdf-to-image";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "pdf-watermark";
const TOOL_CATEGORY = "freelancer";

const PRESET_TEXTS = ["CONFIDENTIAL", "DRAFT", "SAMPLE", "DO NOT COPY", "INTERNAL USE ONLY"];

const COLOR_PRESETS = [
  { label: "Red", hex: "#ef4444" },
  { label: "Gray", hex: "#6b7280" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Amber", hex: "#f59e0b" },
  { label: "Green", hex: "#10b981" },
  { label: "Black", hex: "#18181b" },
];

export function PdfWatermarkTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>("watermarked-document.pdf");

  // Watermark configuration
  const [text, setText] = useState<string>("CONFIDENTIAL");
  const [fontFamily, setFontFamily] = useState<WatermarkFontFamily>("HelveticaBold");
  const [fontSize, setFontSize] = useState<number>(48);
  const [colorHex, setColorHex] = useState<string>("#ef4444");
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotationDegrees, setRotationDegrees] = useState<number>(-45);
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [pageSelection, setPageSelection] = useState<"all" | "custom">("all");
  const [customPagesString, setCustomPagesString] = useState<string>("");

  // Process & download state
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [watermarkedPdf, setWatermarkedPdf] = useState<{
    bytes: Uint8Array;
    fileName: string;
    pageCount: number;
    sizeBytes: number;
    downloadUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cleanup download URL on unmount
  useEffect(() => {
    return () => {
      if (watermarkedPdf?.downloadUrl) {
        URL.revokeObjectURL(watermarkedPdf.downloadUrl);
      }
    };
  }, [watermarkedPdf]);

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMessage(null);
    setWatermarkedPdf(null);
    const check = validatePdfForConversion(selectedFile);
    if (!check.valid) {
      setErrorMessage(check.error || "Invalid PDF file.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "invalid_input",
      });
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const headerCheck = validatePdfForConversion(selectedFile, bytes);
      if (!headerCheck.valid) {
        setErrorMessage(headerCheck.error || "Corrupted PDF header.");
        return;
      }

      // Quick read via pdf-lib to get page count
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: false });
      const pagesCount = doc.getPageCount();

      setFile(selectedFile);
      setPdfBytes(bytes);
      setTotalPages(pagesCount);
      setOutputFileName(
        selectedFile.name.replace(/\.pdf$/i, "") + "-watermarked.pdf"
      );
      setCustomPagesString(`1-${pagesCount}`);

      trackToolEvent("tool_process_start", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "load_document",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load PDF.";
      setErrorMessage(
        msg.includes("password")
          ? "This PDF is password-protected or encrypted. Please remove password encryption before watermarking."
          : `Failed to load document: ${msg}`
      );
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "encrypted_file",
      });
    }
  };

  const handleApplyWatermark = async () => {
    if (!pdfBytes) {
      setErrorMessage("Please select a PDF document.");
      return;
    }
    if (!text.trim()) {
      setErrorMessage("Please enter watermark text.");
      return;
    }

    setErrorMessage(null);
    setIsApplying(true);
    setProgressPercent(10);

    const config: WatermarkConfig = {
      text: text.trim(),
      fontSize,
      fontFamily,
      colorHex,
      opacity,
      rotationDegrees,
      position,
      pageSelection,
      customPagesString: customPagesString.trim(),
    };

    try {
      const result = await applyWatermarkToPdf(
        pdfBytes,
        config,
        outputFileName.trim() || "watermarked.pdf",
        (current, total) => {
          setProgressPercent(Math.round((current / total) * 100));
        }
      );

      const blob = new Blob([result.bytes as unknown as BlobPart], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setWatermarkedPdf({
        ...result,
        downloadUrl,
      });
      setIsApplying(false);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "apply_watermark",
      });
    } catch (err) {
      setIsApplying(false);
      setErrorMessage(err instanceof Error ? err.message : "Failed to apply watermark.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "processing_error",
      });
    }
  };

  const handleReset = () => {
    if (watermarkedPdf?.downloadUrl) URL.revokeObjectURL(watermarkedPdf.downloadUrl);
    setFile(null);
    setPdfBytes(null);
    setTotalPages(0);
    setWatermarkedPdf(null);
    setErrorMessage(null);
    setProgressPercent(0);
    if (fileInputRef.current) fileInputRef.current.value = "";

    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  return (
    <div className="w-full space-y-8" aria-label="PDF Watermark Tool Workspace">
      {/* Upload Dropzone */}
      {!file && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFileSelected(dropped);
          }}
          className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/80 rounded-2xl p-8 sm:p-12 text-center bg-zinc-900/40 hover:bg-zinc-900/70 transition-all duration-200 cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            id={`${baseId}-file-input`}
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFileSelected(selected);
            }}
          />
          <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:scale-105 transition-all mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Select or drop a PDF to add text watermarks
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">
            Stamp contracts, drafts, or invoices with custom opacity, rotation, and tiled patterns.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400 text-xs">
            <span>Supports .pdf up to 50 MB • 100% Client-Side</span>
          </div>
        </div>
      )}

      {/* Active Workspace */}
      {file && (
        <div className="space-y-6">
          {/* Document Header Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Stamp className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-100 truncate">{file.name}</h3>
                <p className="text-xs text-zinc-400">
                  {totalPages} {totalPages === 1 ? "page" : "pages"} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Choose Another PDF
            </button>
          </div>

          {/* Watermark Configuration Form */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-2 text-zinc-200 font-medium border-b border-zinc-800 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Watermark Text & Style Settings</span>
            </div>

            {/* Text Input & Quick Preset Chips */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Watermark Text
              </label>
              <input
                type="text"
                value={text}
                maxLength={100}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL or DRAFT"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-500">Presets:</span>
                {PRESET_TEXTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setText(preset)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography, Color, Opacity, Rotation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Font
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as WatermarkFontFamily)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="HelveticaBold">Helvetica Bold</option>
                  <option value="Helvetica">Helvetica Regular</option>
                  <option value="TimesRomanBold">Times Bold</option>
                  <option value="CourierBold">Courier Bold</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Font Size
                  </label>
                  <span className="text-xs text-zinc-400 font-mono">{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="96"
                  step="4"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Opacity
                  </label>
                  <span className="text-xs text-zinc-400 font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Rotation Angle
                  </label>
                  <span className="text-xs text-zinc-400 font-mono">{rotationDegrees}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="15"
                  value={rotationDegrees}
                  onChange={(e) => setRotationDegrees(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Color Palette & Position Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Color Presets */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Text Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {COLOR_PRESETS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setColorHex(col.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        colorHex === col.hex
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-750 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark Position */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Placement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "center", label: "Center" },
                    { id: "tile", label: "Tile (Grid)" },
                    { id: "top-left", label: "Top-Left" },
                    { id: "top-right", label: "Top-Right" },
                    { id: "bottom-left", label: "Bottom-Left" },
                    { id: "bottom-right", label: "Bottom-Right" },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id as WatermarkPosition)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-xl border transition-all ${
                        position === pos.id
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                          : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/60">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Pages to Watermark
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSelection("all")}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all ${
                      pageSelection === "all"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750"
                    }`}
                  >
                    All Pages ({totalPages})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSelection("custom")}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all ${
                      pageSelection === "custom"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750"
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
              </div>

              {pageSelection === "custom" && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Page Numbers or Ranges
                  </label>
                  <input
                    type="text"
                    value={customPagesString}
                    onChange={(e) => setCustomPagesString(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Output File Name
                </label>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  placeholder="watermarked.pdf"
                  className="w-full max-w-xs bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyWatermark}
                disabled={isApplying || !text.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Applying Watermark ({progressPercent}%)...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-4 h-4" />
                    <span>Apply Watermark to PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Download Output Card */}
          {watermarkedPdf && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">{watermarkedPdf.fileName}</h4>
                  <p className="text-xs text-emerald-300/80">
                    {watermarkedPdf.pageCount} {watermarkedPdf.pageCount === 1 ? "page" : "pages"} •{" "}
                    {(watermarkedPdf.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <a
                href={watermarkedPdf.downloadUrl}
                download={watermarkedPdf.fileName}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Watermarked PDF</span>
              </a>
            </div>
          )}

          {/* Legal / Security Advisory Card */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>Security Disclaimer:</strong> Text watermarks serve as a visible deterrence and provenance indicator. They do not constitute cryptographic digital rights management (DRM) or access restrictions.
            </p>
          </div>
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
          <strong>Local Execution:</strong> Watermarking vectors are embedded directly using pdf-lib in your web browser. No document files or watermark texts are transmitted across the internet.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF Watermark Tool" />
    </div>
  );
}
