'use client';

import { useState, useId, useEffect, useRef } from "react";
import {
  Upload,
  FileImage,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Archive,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import {
  validatePdfForConversion,
  loadPdfDocument,
  convertPdfPagesToImages,
  createImagesZip,
  type ImageOutputFormat,
  type RenderedPageImage,
  type PdfJsDocument,
} from "@/lib/tools/pdf-to-image";
import { renderPageThumbnail } from "@/lib/tools/pdf-organizer";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "pdf-to-image";
const TOOL_CATEGORY = "freelancer";

interface PagePreviewItem {
  pageNumber: number;
  thumbnailUrl: string;
}

export function PdfToImageTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PdfJsDocument | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagePreviews, setPagePreviews] = useState<PagePreviewItem[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);

  // Conversion settings
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [format, setFormat] = useState<ImageOutputFormat>("image/jpeg");
  const [scale, setScale] = useState<number>(1.5);
  const [quality, setQuality] = useState<number>(0.9);

  // Process & output state
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [convertedImages, setConvertedImages] = useState<RenderedPageImage[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cleanup object URLs on unmount or reset
  useEffect(() => {
    return () => {
      convertedImages.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    };
  }, [convertedImages]);

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMessage(null);
    setConvertedImages([]);
    const validation = validatePdfForConversion(selectedFile);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid PDF file.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "invalid_input",
      });
      return;
    }

    setIsLoadingDoc(true);
    setProgressText("Reading PDF file into browser memory...");
    setProgressPercent(15);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const headerCheck = validatePdfForConversion(selectedFile, bytes);
      if (!headerCheck.valid) {
        setErrorMessage(headerCheck.error || "Invalid PDF header.");
        setIsLoadingDoc(false);
        return;
      }

      setProgressText("Loading document structure...");
      setProgressPercent(40);
      const loadedDoc = await loadPdfDocument(bytes);
      const numPages = loadedDoc.numPages;

      setFile(selectedFile);
      setPdfDoc(loadedDoc);
      setTotalPages(numPages);

      // Select all pages by default
      const allNums = Array.from({ length: numPages }, (_, i) => i + 1);
      setSelectedPages(allNums);

      // Generate visual page previews
      setProgressText("Generating page thumbnails...");
      const previews: PagePreviewItem[] = [];
      const previewLimit = Math.min(numPages, 30); // thumbnail limit for performance

      for (let i = 1; i <= previewLimit; i++) {
        const thumbUrl = await renderPageThumbnail(loadedDoc, i, 140);
        previews.push({ pageNumber: i, thumbnailUrl: thumbUrl });
        setProgressPercent(40 + Math.round((i / previewLimit) * 50));
      }

      setPagePreviews(previews);
      setProgressPercent(100);
      setIsLoadingDoc(false);

      trackToolEvent("tool_process_start", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "load_pdf",
      });
    } catch (err) {
      setIsLoadingDoc(false);
      const msg = err instanceof Error ? err.message : "Failed to load PDF document.";
      setErrorMessage(
        msg.includes("password")
          ? "This PDF is password-protected or encrypted. Please remove password protection before converting."
          : `Failed to load PDF: ${msg}`
      );
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "encrypted_file",
      });
    }
  };

  const handleTogglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    if (totalPages > 0) {
      setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
    }
  };

  const handleDeselectAll = () => {
    setSelectedPages([]);
  };

  const handleConvert = async () => {
    if (!pdfDoc || selectedPages.length === 0) {
      setErrorMessage("Please select at least one page to convert.");
      return;
    }

    setErrorMessage(null);
    setIsConverting(true);
    setProgressPercent(0);

    try {
      const results = await convertPdfPagesToImages(
        pdfDoc,
        file?.name || "document.pdf",
        {
          scale,
          format,
          quality,
          selectedPages,
        },
        (completed, total, pageNum) => {
          const percent = Math.round((completed / total) * 100);
          setProgressPercent(percent);
          setProgressText(`Converting page ${pageNum} (${completed} of ${total})...`);
        }
      );

      setConvertedImages(results);
      setIsConverting(false);

      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "convert_pages",
      });
    } catch (err) {
      setIsConverting(false);
      setErrorMessage(err instanceof Error ? err.message : "Conversion failed.");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: "processing_error",
      });
    }
  };

  const handleDownloadZip = async () => {
    if (convertedImages.length === 0) return;
    setIsZipping(true);
    try {
      const zipName = `${(file?.name || "document").replace(/\.pdf$/i, "")}-images.zip`;
      const { blob } = await createImagesZip(convertedImages, zipName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      trackToolEvent("tool_download", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "download_zip",
      });
    } catch {
      setErrorMessage("Failed to create ZIP package.");
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    convertedImages.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    setFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setPagePreviews([]);
    setSelectedPages([]);
    setConvertedImages([]);
    setErrorMessage(null);
    setProgressPercent(0);
    setProgressText("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  return (
    <div className="w-full space-y-8" aria-label="PDF to Image Converter Workspace">
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
            Select or drop a PDF document here
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">
            Extract PDF pages into sharp JPG or PNG images with custom resolution. Zero server uploads.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400 text-xs">
            <span>Supports .pdf up to 50 MB</span>
          </div>
        </div>
      )}

      {/* Loading Document Indicator */}
      {isLoadingDoc && (
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

      {/* Active Document Workspace */}
      {file && !isLoadingDoc && (
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <FileImage className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-100 truncate">{file.name}</h3>
                <p className="text-xs text-zinc-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {totalPages} {totalPages === 1 ? "page" : "pages"}
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700/80 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Choose Another PDF
            </button>
          </div>

          {/* Conversion Settings Controls */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
            <div className="flex items-center gap-2 text-zinc-200 font-medium border-b border-zinc-800 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Conversion Settings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Image Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat("image/jpeg")}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all ${
                      format === "image/jpeg"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    JPG (Smaller)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("image/png")}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border transition-all ${
                      format === "image/png"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                </div>
              </div>

              {/* Resolution / Scale */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Resolution Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "1x (72 DPI)", val: 1 },
                    { label: "1.5x (108 DPI)", val: 1.5 },
                    { label: "2x (144 DPI)", val: 2 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setScale(item.val)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all ${
                        scale === item.val
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                          : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality (JPG only) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Quality
                  </label>
                  <span className="text-xs text-zinc-400">
                    {format === "image/jpeg" ? `${Math.round(quality * 100)}%` : "Max (Lossless)"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  disabled={format === "image/png"}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* Page Selection Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-300">
                  Selected Pages: <strong className="text-emerald-400">{selectedPages.length}</strong> of {totalPages}
                </span>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-zinc-400 hover:underline"
                >
                  Clear Selection
                </button>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting || selectedPages.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <FileImage className="w-4 h-4" />
                    <span>Convert {selectedPages.length} {selectedPages.length === 1 ? "Page" : "Pages"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Page Previews Grid */}
          {pagePreviews.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <span>Page Selection Grid</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {pagePreviews.map((p) => {
                  const isChecked = selectedPages.includes(p.pageNumber);
                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => handleTogglePage(p.pageNumber)}
                      className={`relative p-2 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500"
                          : "bg-zinc-900 border-zinc-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="aspect-[3/4] bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center mb-1.5 border border-zinc-800">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={`Page ${p.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-zinc-600">Page {p.pageNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-medium text-zinc-300">Page {p.pageNumber}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                            isChecked ? "bg-emerald-500 text-zinc-950" : "border border-zinc-700"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Conversion Progress Bar */}
          {isConverting && (
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-400 font-medium">{progressText}</span>
                <span className="text-zinc-400 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Converted Output Images Gallery */}
          {convertedImages.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-zinc-100">
                    Converted {convertedImages.length} {convertedImages.length === 1 ? "Image" : "Images"}
                  </h3>
                </div>

                {convertedImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-zinc-700 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{isZipping ? "Creating ZIP..." : "Download All as ZIP"}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {convertedImages.map((img) => (
                  <div
                    key={img.pageNumber}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-850">
                      <img
                        src={img.objectUrl}
                        alt={`Page ${img.pageNumber} converted`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-200 truncate">{img.fileName}</span>
                        <span className="text-zinc-500 font-mono">
                          {(img.sizeBytes / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Resolution: {img.width} × {img.height} px
                      </p>
                    </div>
                    <a
                      href={img.objectUrl}
                      download={img.fileName}
                      className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {format === "image/jpeg" ? "JPG" : "PNG"}</span>
                    </a>
                  </div>
                ))}
              </div>
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
          <strong>Local Execution:</strong> Rendering runs via client-side WebAssembly / Canvas. Document contents are never uploaded to any remote server.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF to JPG / PNG Converter" />
    </div>
  );
}
