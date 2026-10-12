'use client';

import { useState, useId, useEffect, useRef } from "react";
import {
  Upload,
  Layers,
  Download,
  RotateCcw,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Undo2,
  Info,
} from "lucide-react";
import {
  initializeOrganizerPages,
  reorderPages,
  rotatePage,
  rotateAllPages,
  deletePage,
  exportOrganizedPdf,
  type OrganizerPageItem,
} from "@/lib/tools/pdf-organizer";
import { validatePdfForConversion } from "@/lib/tools/pdf-to-image";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "pdf-organizer";
const TOOL_CATEGORY = "freelancer";

export function PdfOrganizerTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<OrganizerPageItem[]>([]);
  const [initialPages, setInitialPages] = useState<OrganizerPageItem[]>([]);
  const [history, setHistory] = useState<OrganizerPageItem[][]>([]);
  const [outputFileName, setOutputFileName] = useState<string>("organized-document.pdf");

  // Loading & export state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedPdf, setExportedPdf] = useState<{
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
      if (exportedPdf?.downloadUrl) {
        URL.revokeObjectURL(exportedPdf.downloadUrl);
      }
    };
  }, [exportedPdf]);

  const pushHistory = (newPages: OrganizerPageItem[]) => {
    setHistory((prev) => [...prev.slice(-15), pages]); // keep last 15 actions
    setPages(newPages);
  };

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMessage(null);
    setExportedPdf(null);
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

    setIsLoading(true);
    setProgressText("Reading document...");
    setProgressPercent(20);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const headerCheck = validatePdfForConversion(selectedFile, bytes);
      if (!headerCheck.valid) {
        setErrorMessage(headerCheck.error || "Corrupted PDF header.");
        setIsLoading(false);
        return;
      }

      setProgressText("Generating visual thumbnails for organizer...");
      const { pages: initialList } = await initializeOrganizerPages(
        bytes,
        (loaded, total) => {
          setProgressPercent(20 + Math.round((loaded / total) * 75));
          setProgressText(`Rendering page thumbnail ${loaded} of ${total}...`);
        }
      );

      setFile(selectedFile);
      setPdfBytes(bytes);
      setPages(initialList);
      setInitialPages(initialList);
      setHistory([]);
      setOutputFileName(
        selectedFile.name.replace(/\.pdf$/i, "") + "-organized.pdf"
      );
      setIsLoading(false);
      setProgressPercent(100);

      trackToolEvent("tool_process_start", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "load_document",
      });
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Failed to load PDF.";
      setErrorMessage(
        msg.includes("password")
          ? "This PDF is password-protected or encrypted. Please decrypt before organizing."
          : `Failed to load document: ${msg}`
      );
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "encrypted_file",
      });
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    const updated = reorderPages(pages, fromIndex, toIndex);
    pushHistory(updated);
  };

  const handleRotate = (index: number, delta: number) => {
    const updated = rotatePage(pages, index, delta);
    pushHistory(updated);
  };

  const handleRotateAll = (delta: number) => {
    const updated = rotateAllPages(pages, delta);
    pushHistory(updated);
  };

  const handleDelete = (index: number) => {
    const result = deletePage(pages, index);
    if (!result.deleted) {
      setErrorMessage(result.error || "Cannot delete page.");
      return;
    }
    pushHistory(result.pages);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    if (previous) {
      setPages(previous);
    }
  };

  const handleResetToOriginal = () => {
    if (initialPages.length === 0) return;
    pushHistory(initialPages);
  };

  const handleClearWorkspace = () => {
    if (exportedPdf?.downloadUrl) URL.revokeObjectURL(exportedPdf.downloadUrl);
    setFile(null);
    setPdfBytes(null);
    setPages([]);
    setInitialPages([]);
    setHistory([]);
    setExportedPdf(null);
    setErrorMessage(null);
    setProgressPercent(0);
    if (fileInputRef.current) fileInputRef.current.value = "";

    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  const handleExport = async () => {
    if (!pdfBytes || pages.length === 0) {
      setErrorMessage("Please ensure at least one page is present.");
      return;
    }

    setErrorMessage(null);
    setIsExporting(true);

    try {
      const result = await exportOrganizedPdf(
        pdfBytes,
        pages,
        outputFileName.trim() || "organized.pdf"
      );

      const blob = new Blob([result.bytes as unknown as BlobPart], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setExportedPdf({
        ...result,
        downloadUrl,
      });
      setIsExporting(false);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "export_pdf",
      });
    } catch (err) {
      setIsExporting(false);
      setErrorMessage(err instanceof Error ? err.message : "Export failed.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "processing_error",
      });
    }
  };

  return (
    <div className="w-full space-y-8" aria-label="PDF Organizer Workspace">
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
            Select or drop a PDF to organize pages
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">
            Reorder pages, rotate sideways scans, remove unwanted sheets, and export a clean document.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400 text-xs">
            <span>Supports multi-page .pdf up to 50 MB</span>
          </div>
        </div>
      )}

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-emerald-400 font-medium">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>{progressText}</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden max-w-md mx-auto">
            <div
              className="bg-emerald-500 h-2 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Active Organizer Workspace */}
      {file && !isLoading && (
        <div className="space-y-6">
          {/* Top Document Header & Global Actions Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-100 truncate">{file.name}</h3>
                <p className="text-xs text-zinc-400">
                  {pages.length} {pages.length === 1 ? "page" : "pages"} active •{" "}
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Quick Global Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleRotateAll(90)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Rotate all pages 90 degrees clockwise"
              >
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                Rotate All
              </button>

              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length === 0}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1.5"
                title="Undo last action"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>

              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset to original order and rotation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Order
              </button>

              <button
                type="button"
                onClick={handleClearWorkspace}
                className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
              >
                Choose Another File
              </button>
            </div>
          </div>

          {/* Interactive Page Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>Use arrow buttons below each card to reorder pages.</span>
              <span>Total Pages: <strong>{pages.length}</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 space-y-3 flex flex-col justify-between transition-all"
                >
                  {/* Page Preview Thumbnail */}
                  <div className="relative aspect-[3/4] bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-850">
                    {page.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={page.thumbnailUrl}
                        alt={`Page ${index + 1}`}
                        style={{
                          transform: `rotate(${page.rotationDegrees}deg)`,
                          transition: "transform 0.2s ease",
                        }}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-zinc-600">Page {page.displayNumber}</span>
                    )}

                    {/* Page Number Badges */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 text-[11px] font-mono font-semibold text-emerald-400">
                      Page {index + 1}
                    </div>

                    {page.rotationDegrees !== 0 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-sm text-[10px] text-zinc-400 font-mono">
                        {page.rotationDegrees}°
                      </div>
                    )}
                  </div>

                  {/* Reorder and Rotation Action Toolbar */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, index - 1)}
                        className="py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                        aria-label={`Move page ${index + 1} left`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Left</span>
                      </button>
                      <button
                        type="button"
                        disabled={index === pages.length - 1}
                        onClick={() => handleMove(index, index + 1)}
                        className="py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                        aria-label={`Move page ${index + 1} right`}
                      >
                        <span>Right</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => handleRotate(index, -90)}
                        className="p-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center transition-colors"
                        title="Rotate -90° counterclockwise"
                        aria-label={`Rotate page ${index + 1} counterclockwise`}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotate(index, 90)}
                        className="p-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center transition-colors"
                        title="Rotate +90° clockwise"
                        aria-label={`Rotate page ${index + 1} clockwise`}
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={pages.length <= 1}
                        onClick={() => handleDelete(index)}
                        className="p-1 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
                        title="Delete this page"
                        aria-label={`Delete page ${index + 1}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Settings Panel */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-sm">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Output File Name
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="organized.pdf"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
              />
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || pages.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Exporting PDF...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Export Organized PDF ({pages.length} Pages)</span>
                </>
              )}
            </button>
          </div>

          {/* Download Output Banner */}
          {exportedPdf && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-zinc-100">{exportedPdf.fileName}</h4>
                  <p className="text-xs text-emerald-300/80">
                    {exportedPdf.pageCount} {exportedPdf.pageCount === 1 ? "page" : "pages"} •{" "}
                    {(exportedPdf.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <a
                href={exportedPdf.downloadUrl}
                download={exportedPdf.fileName}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Organized PDF</span>
              </a>
            </div>
          )}

          {/* Limitation Warning Note */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Document Integrity Note:</strong> Modifying page sequences strips document-level digital signatures and may flatten interactive form fields. Your original source file remains untouched on your disk.
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
          <strong>Local Execution:</strong> Page organization, rotation, and re-encoding happen 100% in your browser memory via pdf-lib. Documents are never uploaded to any server.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF Page Organizer" />
    </div>
  );
}
