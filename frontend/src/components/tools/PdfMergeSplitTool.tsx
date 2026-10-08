"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FilePlus2,
  Files,
  FileText,
  Info,
  Layers,
  RotateCcw,
  Scissors,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { formatByteSize } from "@/lib/tools/json-formatter";
import {
  createSamplePdfBytes,
  inspectPdfBytes,
  MAX_MERGE_FILES_COUNT,
  MAX_PDF_PAGE_COUNT,
  mergePdfDocuments,
  parsePageRanges,
  reorderArrayItems,
  splitPdfDocument,
  validatePdfFileMetadata,
  type PdfSplitOutputMode,
} from "@/lib/tools/pdf-merge-split";

type ActivePdfMode = "merge" | "split";

interface UploadedMergeFile {
  id: string;
  name: string;
  sizeBytes: number;
  pageCount: number;
  bytes: Uint8Array;
}

interface UploadedSplitFile {
  name: string;
  sizeBytes: number;
  pageCount: number;
  bytes: Uint8Array;
}

interface DownloadablePdfResult {
  id: string;
  fileName: string;
  pageCount: number;
  sizeBytes: number;
  rangeLabel: string;
  objectUrl: string;
}

export function PdfMergeSplitTool() {
  const baseId = useId();
  const mergeFileInputRef = useRef<HTMLInputElement | null>(null);
  const splitFileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<ActivePdfMode>("merge");

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<UploadedMergeFile[]>([]);
  const [mergedFileName, setMergedFileName] = useState("merged-document.pdf");
  const [mergeResult, setMergeResult] = useState<DownloadablePdfResult | null>(
    null
  );
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [isDraggingMerge, setIsDraggingMerge] = useState(false);

  // Split state
  const [splitFile, setSplitFile] = useState<UploadedSplitFile | null>(null);
  const [rangeInput, setRangeInput] = useState("1-2, 4");
  const [splitOutputMode, setSplitOutputMode] =
    useState<PdfSplitOutputMode>("single-combined");
  const [splitResults, setSplitResults] = useState<DownloadablePdfResult[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Keep track of created object URLs for cleanup
  const activeUrlsRef = useRef<Set<string>>(new Set());

  const registerObjectUrl = (bytes: Uint8Array): string => {
    const blob = new Blob([bytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    activeUrlsRef.current.add(url);
    return url;
  };

  const revokeUrl = (url?: string | null) => {
    if (!url) return;
    if (activeUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      activeUrlsRef.current.delete(url);
    }
  };

  const revokeSplitResults = (results: DownloadablePdfResult[]) => {
    for (const item of results) {
      revokeUrl(item.objectUrl);
    }
  };

  useEffect(() => {
    const urls = activeUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  // Live range validation in Split Mode
  const rangeValidation = useMemo(() => {
    if (!splitFile) return null;
    return parsePageRanges(rangeInput, splitFile.pageCount);
  }, [splitFile, rangeInput]);

  // ============================================================================
  // Merge Mode Handlers
  // ============================================================================
  const processIncomingMergeFiles = async (fileList: FileList | File[]) => {
    setMergeError(null);
    if (mergeResult) {
      revokeUrl(mergeResult.objectUrl);
      setMergeResult(null);
    }

    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    if (mergeFiles.length + incoming.length > MAX_MERGE_FILES_COUNT) {
      setMergeError(
        `You can queue at most ${MAX_MERGE_FILES_COUNT} PDF files for a single merge operation.`
      );
      return;
    }

    const validatedAdditions: UploadedMergeFile[] = [];

    for (const file of incoming) {
      const metaCheck = validatePdfFileMetadata({
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (!metaCheck.valid) {
        setMergeError(metaCheck.error ?? "Invalid PDF file.");
        return;
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const inspection = await inspectPdfBytes(bytes, file.name);

      if (!inspection.valid) {
        setMergeError(inspection.error ?? `Could not read "${file.name}".`);
        return;
      }

      validatedAdditions.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        sizeBytes: bytes.byteLength,
        pageCount: inspection.pageCount,
        bytes,
      });
    }

    setMergeFiles((prev) => [...prev, ...validatedAdditions]);
  };

  const handleLoadSampleMergePdfs = async () => {
    setMergeError(null);
    if (mergeResult) {
      revokeUrl(mergeResult.objectUrl);
      setMergeResult(null);
    }

    const [bytes1, bytes2, bytes3] = await Promise.all([
      createSamplePdfBytes("Cover & Executive Summary", 2),
      createSamplePdfBytes("Q3 Financial & Metrics Report", 3),
      createSamplePdfBytes("Appendix & Technical Notes", 2),
    ]);

    setMergeFiles([
      {
        id: "sample-merge-1",
        name: "01-cover-summary.pdf",
        sizeBytes: bytes1.byteLength,
        pageCount: 2,
        bytes: bytes1,
      },
      {
        id: "sample-merge-2",
        name: "02-q3-financial-report.pdf",
        sizeBytes: bytes2.byteLength,
        pageCount: 3,
        bytes: bytes2,
      },
      {
        id: "sample-merge-3",
        name: "03-technical-appendix.pdf",
        sizeBytes: bytes3.byteLength,
        pageCount: 2,
        bytes: bytes3,
      },
    ]);
  };

  const handleMoveMergeFile = (fromIdx: number, toIdx: number) => {
    if (mergeResult) {
      revokeUrl(mergeResult.objectUrl);
      setMergeResult(null);
    }
    setMergeFiles((prev) => reorderArrayItems(prev, fromIdx, toIdx));
  };

  const handleRemoveMergeFile = (id: string) => {
    if (mergeResult) {
      revokeUrl(mergeResult.objectUrl);
      setMergeResult(null);
    }
    setMergeFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleResetMerge = () => {
    if (mergeResult) {
      revokeUrl(mergeResult.objectUrl);
      setMergeResult(null);
    }
    setMergeFiles([]);
    setMergeError(null);
    setMergedFileName("merged-document.pdf");
    if (mergeFileInputRef.current) {
      mergeFileInputRef.current.value = "";
    }
  };

  const handleExecuteMerge = async () => {
    setMergeError(null);
    if (mergeResult) {
      revokeUrl(mergeResult.objectUrl);
      setMergeResult(null);
    }

    if (mergeFiles.length < 2) {
      setMergeError("Please upload at least 2 PDF files to merge.");
      return;
    }

    setIsMerging(true);
    try {
      const response = await mergePdfDocuments(
        mergeFiles.map((f) => ({ name: f.name, bytes: f.bytes }))
      );

      if (!response.valid || !response.mergedBytes) {
        setMergeError(response.error ?? "Failed to merge PDF files.");
        return;
      }

      const cleanOutputName = mergedFileName.trim().toLowerCase().endsWith(".pdf")
        ? mergedFileName.trim()
        : `${mergedFileName.trim() || "merged-document"}.pdf`;

      const objectUrl = registerObjectUrl(response.mergedBytes);
      setMergeResult({
        id: `merged-${Date.now()}`,
        fileName: cleanOutputName,
        pageCount: response.totalPages ?? 0,
        sizeBytes: response.mergedBytes.byteLength,
        rangeLabel: `Combined from ${mergeFiles.length} PDF files`,
        objectUrl,
      });
    } finally {
      setIsMerging(false);
    }
  };

  // ============================================================================
  // Split Mode Handlers
  // ============================================================================
  const processIncomingSplitFile = async (file: File) => {
    setSplitError(null);
    revokeSplitResults(splitResults);
    setSplitResults([]);

    const metaCheck = validatePdfFileMetadata({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (!metaCheck.valid) {
      setSplitError(metaCheck.error ?? "Invalid PDF file.");
      return;
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const inspection = await inspectPdfBytes(bytes, file.name);

    if (!inspection.valid) {
      setSplitError(inspection.error ?? `Could not read "${file.name}".`);
      return;
    }

    setSplitFile({
      name: file.name,
      sizeBytes: bytes.byteLength,
      pageCount: inspection.pageCount,
      bytes,
    });
    setRangeInput(
      inspection.pageCount >= 3 ? `1-2, ${inspection.pageCount}` : "1"
    );
  };

  const handleLoadSampleSplitPdf = async () => {
    setSplitError(null);
    revokeSplitResults(splitResults);
    setSplitResults([]);

    const sampleBytes = await createSamplePdfBytes(
      "Project Proposal & Architecture Handbook",
      6
    );
    setSplitFile({
      name: "project-handbook-6pages.pdf",
      sizeBytes: sampleBytes.byteLength,
      pageCount: 6,
      bytes: sampleBytes,
    });
    setRangeInput("1-2, 4, 5-6");
  };

  const handleToggleSinglePageInRange = (pageNumber: number) => {
    if (!splitFile) return;
    revokeSplitResults(splitResults);
    setSplitResults([]);

    const currentParsed = parsePageRanges(rangeInput, splitFile.pageCount);
    const activeSet = new Set<number>(
      currentParsed.valid ? currentParsed.uniqueSortedPages : []
    );

    if (activeSet.has(pageNumber)) {
      activeSet.delete(pageNumber);
    } else {
      activeSet.add(pageNumber);
    }

    const sorted = Array.from(activeSet).sort((a, b) => a - b);
    const firstPage = sorted[0];
    if (firstPage === undefined) {
      setRangeInput("");
      return;
    }

    // Condense consecutive page numbers into clean ranges (e.g., 1-3, 5)
    const condensed: string[] = [];
    let rangeStart: number = firstPage;
    let prev: number = firstPage;

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      if (current === undefined) continue;
      if (current === prev + 1) {
        prev = current;
      } else {
        condensed.push(
          rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`
        );
        rangeStart = current;
        prev = current;
      }
    }
    condensed.push(
      rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`
    );
    setRangeInput(condensed.join(", "));
  };

  const handleExecuteSplit = async () => {
    setSplitError(null);
    revokeSplitResults(splitResults);
    setSplitResults([]);

    if (!splitFile) {
      setSplitError("Please upload a PDF file first.");
      return;
    }

    setIsSplitting(true);
    try {
      const response = await splitPdfDocument(
        splitFile.bytes,
        splitFile.name,
        rangeInput,
        splitOutputMode
      );

      if (!response.valid || response.outputs.length === 0) {
        setSplitError(response.error ?? "Failed to split PDF pages.");
        return;
      }

      const downloadable: DownloadablePdfResult[] = response.outputs.map(
        (out, idx) => ({
          id: `split-${Date.now()}-${idx}`,
          fileName: out.fileName,
          pageCount: out.pageCount,
          sizeBytes: out.bytes.byteLength,
          rangeLabel: out.rangeLabel,
          objectUrl: registerObjectUrl(out.bytes),
        })
      );

      setSplitResults(downloadable);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleResetSplit = () => {
    revokeSplitResults(splitResults);
    setSplitResults([]);
    setSplitFile(null);
    setSplitError(null);
    setRangeInput("1");
    if (splitFileInputRef.current) {
      splitFileInputRef.current.value = "";
    }
  };

  const totalMergePages = mergeFiles.reduce((acc, f) => acc + f.pageCount, 0);
  const totalMergeSize = mergeFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div className="space-y-8">
      {/* Mode Switcher Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:p-5">
        <div
          role="tablist"
          aria-label="PDF Utility Mode"
          className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "merge"}
            onClick={() => setMode("merge")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm ${
              mode === "merge"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>Merge PDFs</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "split"}
            onClick={() => setMode("split")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm ${
              mode === "split"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Scissors className="h-4 w-4" aria-hidden="true" />
            <span>Split / Extract Pages</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === "merge" ? (
            <>
              <button
                type="button"
                onClick={handleLoadSampleMergePdfs}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Sparkles
                  className="h-3.5 w-3.5 text-indigo-600"
                  aria-hidden="true"
                />
                <span>Load 3 Sample PDFs</span>
              </button>
              <button
                type="button"
                onClick={handleResetMerge}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Merge</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLoadSampleSplitPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Sparkles
                  className="h-3.5 w-3.5 text-indigo-600"
                  aria-hidden="true"
                />
                <span>Load 6-Page Sample PDF</span>
              </button>
              <button
                type="button"
                onClick={handleResetSplit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Split</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MERGE MODE WORKSPACE                                                 */}
      {/* ==================================================================== */}
      {mode === "merge" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Drag & Drop Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingMerge(true);
              }}
              onDragLeave={() => setIsDraggingMerge(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingMerge(false);
                if (e.dataTransfer.files?.length) {
                  void processIncomingMergeFiles(e.dataTransfer.files);
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
                isDraggingMerge
                  ? "border-indigo-500 bg-indigo-50/70"
                  : "border-slate-300 bg-white hover:border-indigo-400"
              }`}
            >
              <input
                ref={mergeFileInputRef}
                id={`${baseId}-merge-upload`}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) {
                    void processIncomingMergeFiles(e.target.files);
                    e.target.value = "";
                  }
                }}
                className="sr-only"
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900">
                Drop PDF files here to combine, or browse from your device
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Supports up to {MAX_MERGE_FILES_COUNT} unencrypted PDFs &bull;
                Max 50 MB per file &bull; Max {MAX_PDF_PAGE_COUNT} total pages
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <label
                  htmlFor={`${baseId}-merge-upload`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700"
                >
                  <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                  <span>Select PDF Files</span>
                </label>
              </div>
            </div>

            {/* Merge Error Alert */}
            {mergeError ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-950"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold text-rose-900">PDF Merge Error</p>
                  <p className="mt-0.5 text-xs text-rose-800 sm:text-sm">
                    {mergeError}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Queued Files List with Reordering */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Files to Merge ({mergeFiles.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Use the Up and Down arrows to arrange the exact page order
                    before merging.
                  </p>
                </div>
                {mergeFiles.length > 0 ? (
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    Total: {totalMergePages} pages &bull;{" "}
                    {formatByteSize(totalMergeSize)}
                  </span>
                ) : null}
              </div>

              {mergeFiles.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No PDF files queued yet. Upload two or more PDFs above or
                  click <strong>&ldquo;Load 3 Sample PDFs&rdquo;</strong> to
                  try merging right away.
                </div>
              ) : (
                <ol className="mt-4 space-y-2.5">
                  {mergeFiles.map((file, idx) => (
                    <li
                      key={file.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <FileText
                          className="h-5 w-5 shrink-0 text-indigo-600"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file.pageCount}{" "}
                            {file.pageCount === 1 ? "page" : "pages"} &bull;{" "}
                            {formatByteSize(file.sizeBytes)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveMergeFile(idx, idx - 1)}
                          disabled={idx === 0}
                          aria-label={`Move ${file.name} up`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMergeFile(idx, idx + 1)}
                          disabled={idx === mergeFiles.length - 1}
                          aria-label={`Move ${file.name} down`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMergeFile(file.id)}
                          aria-label={`Remove ${file.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Right Merge Output Panel */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h3 className="text-base font-bold text-slate-900">
                Merge Settings &amp; Export
              </h3>
              <div className="mt-4">
                <label
                  htmlFor={`${baseId}-merged-filename`}
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Output File Name
                </label>
                <input
                  id={`${baseId}-merged-filename`}
                  type="text"
                  value={mergedFileName}
                  onChange={(e) => setMergedFileName(e.target.value)}
                  placeholder="merged-document.pdf"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={handleExecuteMerge}
                disabled={mergeFiles.length < 2 || isMerging}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Files className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isMerging
                    ? "Merging PDFs..."
                    : `Merge ${mergeFiles.length} PDFs Now`}
                </span>
              </button>

              {mergeResult ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2
                      className="h-4 w-4 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>Merged PDF Ready!</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {mergeResult.fileName}
                  </p>
                  <p className="text-xs text-slate-600">
                    {mergeResult.pageCount} pages &bull;{" "}
                    {formatByteSize(mergeResult.sizeBytes)}
                  </p>
                  <a
                    href={mergeResult.objectUrl}
                    download={mergeResult.fileName}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Download Merged PDF</span>
                  </a>
                </div>
              ) : null}
            </div>

            {/* Technical Preservation Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <strong className="font-bold">
                  Signatures, Forms &amp; Encryption Note:
                </strong>{" "}
                Password-protected (encrypted) PDFs are not supported and must
                be unlocked prior to upload. Cryptographic digital signatures,
                interactive AcroForm/XFA fields, or certain dynamic annotations
                may not be preserved when pages are recombined.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================================================================== */
        /* SPLIT / EXTRACT MODE WORKSPACE                                     */
        /* ================================================================== */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Upload Source PDF */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingSplit(true);
              }}
              onDragLeave={() => setIsDraggingSplit(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingSplit(false);
                const first = e.dataTransfer.files?.[0];
                if (first) {
                  void processIncomingSplitFile(first);
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
                isDraggingSplit
                  ? "border-indigo-500 bg-indigo-50/70"
                  : "border-slate-300 bg-white hover:border-indigo-400"
              }`}
            >
              <input
                ref={splitFileInputRef}
                id={`${baseId}-split-upload`}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const first = e.target.files?.[0];
                  if (first) {
                    void processIncomingSplitFile(first);
                    e.target.value = "";
                  }
                }}
                className="sr-only"
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Scissors className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-base font-bold text-slate-900">
                Upload a PDF to split or extract specific page ranges
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Unencrypted PDF up to 50 MB and {MAX_PDF_PAGE_COUNT} pages
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <label
                  htmlFor={`${baseId}-split-upload`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700"
                >
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                  <span>Select PDF Document</span>
                </label>
              </div>
            </div>

            {/* Split Error Alert */}
            {splitError ? (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-950"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold text-rose-900">PDF Split Error</p>
                  <p className="mt-0.5 text-xs text-rose-800 sm:text-sm">
                    {splitError}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Page Range Selector & Interactive Page Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              {!splitFile ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No PDF loaded yet. Upload a PDF document above or click{" "}
                  <strong>&ldquo;Load 6-Page Sample PDF&rdquo;</strong> to test
                  page range extraction.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <FileText
                        className="h-6 w-6 text-indigo-600"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                          {splitFile.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {splitFile.pageCount}{" "}
                          {splitFile.pageCount === 1 ? "page" : "pages"} &bull;{" "}
                          {formatByteSize(splitFile.sizeBytes)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setRangeInput(`1-${splitFile.pageCount}`)
                      }
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Select All Pages (1–{splitFile.pageCount})
                    </button>
                  </div>

                  {/* Range String Input */}
                  <div>
                    <label
                      htmlFor={`${baseId}-page-ranges`}
                      className="mb-1.5 block text-xs font-bold text-slate-700"
                    >
                      Page Numbers or Ranges (e.g., <code>1-3, 5, 7-10</code>)
                    </label>
                    <input
                      id={`${baseId}-page-ranges`}
                      type="text"
                      value={rangeInput}
                      onChange={(e) => {
                        revokeSplitResults(splitResults);
                        setSplitResults([]);
                        setRangeInput(e.target.value);
                      }}
                      placeholder="e.g., 1-3, 5"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                    />
                    {rangeValidation && !rangeValidation.valid ? (
                      <p className="mt-1.5 text-xs font-semibold text-rose-600">
                        {rangeValidation.error}
                      </p>
                    ) : rangeValidation && rangeValidation.valid ? (
                      <p className="mt-1.5 text-xs font-medium text-emerald-700">
                        Valid selection: {rangeValidation.orderedPages.length}{" "}
                        {rangeValidation.orderedPages.length === 1
                          ? "page"
                          : "pages"}{" "}
                        across {rangeValidation.segments.length}{" "}
                        {rangeValidation.segments.length === 1
                          ? "range segment"
                          : "range segments"}
                        .
                      </p>
                    ) : null}
                  </div>

                  {/* Interactive Page Pills (for up to 60 pages) */}
                  {splitFile.pageCount <= 60 ? (
                    <div>
                      <p className="mb-2 text-xs font-bold text-slate-700">
                        Quick Toggle Individual Pages:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(
                          { length: splitFile.pageCount },
                          (_, idx) => idx + 1
                        ).map((pageNum) => {
                          const isSelected =
                            rangeValidation?.valid &&
                            rangeValidation.uniqueSortedPages.includes(pageNum);
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() =>
                                handleToggleSinglePageInRange(pageNum)
                              }
                              aria-pressed={Boolean(isSelected)}
                              className={`h-8 min-w-9 rounded-lg px-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              p.{pageNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Split Output & Download Panel */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h3 className="text-base font-bold text-slate-900">
                Extraction Mode &amp; Download
              </h3>

              <fieldset className="mt-4 space-y-2.5">
                <legend className="text-xs font-bold text-slate-700">
                  How should selected ranges be exported?
                </legend>
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
                  <input
                    type="radio"
                    name={`${baseId}-split-output-mode`}
                    checked={splitOutputMode === "single-combined"}
                    onChange={() => {
                      revokeSplitResults(splitResults);
                      setSplitResults([]);
                      setSplitOutputMode("single-combined");
                    }}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-600"
                  />
                  <div>
                    <span className="block font-bold text-slate-900">
                      Single Combined PDF
                    </span>
                    <span className="text-slate-600">
                      Extracts all selected pages into one new PDF document.
                    </span>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs">
                  <input
                    type="radio"
                    name={`${baseId}-split-output-mode`}
                    checked={splitOutputMode === "separate-files"}
                    onChange={() => {
                      revokeSplitResults(splitResults);
                      setSplitResults([]);
                      setSplitOutputMode("separate-files");
                    }}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-600"
                  />
                  <div>
                    <span className="block font-bold text-slate-900">
                      Separate PDF per Range
                    </span>
                    <span className="text-slate-600">
                      Creates a separate downloadable PDF file for each
                      comma-separated range segment.
                    </span>
                  </div>
                </label>
              </fieldset>

              <button
                type="button"
                onClick={handleExecuteSplit}
                disabled={
                  !splitFile ||
                  !rangeValidation?.valid ||
                  isSplitting
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Scissors className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isSplitting ? "Extracting Pages..." : "Extract PDF Pages"}
                </span>
              </button>

              {splitResults.length > 0 ? (
                <div className="mt-5 space-y-2.5">
                  <p className="text-xs font-bold text-emerald-800">
                    Generated {splitResults.length}{" "}
                    {splitResults.length === 1 ? "PDF File" : "PDF Files"}:
                  </p>
                  {splitResults.map((res) => (
                    <div
                      key={res.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5"
                    >
                      <p className="truncate text-xs font-bold text-slate-900">
                        {res.fileName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-600">
                        {res.rangeLabel} ({res.pageCount}{" "}
                        {res.pageCount === 1 ? "page" : "pages"}) &bull;{" "}
                        {formatByteSize(res.sizeBytes)}
                      </p>
                      <a
                        href={res.objectUrl}
                        download={res.fileName}
                        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Download {res.fileName}</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Technical Preservation Disclaimer */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <strong className="font-bold">
                  Signatures, Forms &amp; Encryption Note:
                </strong>{" "}
                Password-protected (encrypted) PDFs are not supported. Digital
                signatures, interactive form fields, or document-level
                annotations may not be preserved when splitting pages into new
                files.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
