'use client';

import { useState, useId, useEffect, useRef } from 'react';
import {
  RotateCw,
  RotateCcw,
  Download,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  inspectPdfForRotation,
  applyRotationDelta,
  resetRotations,
  exportRotatedPdf,
  type PageRotationState,
  MAX_PDF_ROTATE_FILE_SIZE,
} from '@/lib/tools/pdf-page-rotator';
import { trackToolEvent } from '@/lib/analytics';
import { ToolFeedbackCard } from '@/components/tools/ToolFeedbackCard';

const TOOL_SLUG = 'pdf-page-rotator';
const TOOL_CATEGORY = 'freelancer';

export function PdfPageRotatorTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageRotationState[]>([]);
  const [selectedPageNumbers, setSelectedPageNumbers] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState<'all' | 'selected'>('all');

  // Processing & download state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedPdf, setExportedPdf] = useState<{
    bytes: Uint8Array;
    fileName: string;
    sizeBytes: number;
    downloadUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (exportedPdf?.downloadUrl) {
        URL.revokeObjectURL(exportedPdf.downloadUrl);
      }
    };
  }, [exportedPdf]);

  const handleFileChange = async (selectedFile: File) => {
    setErrorMessage(null);
    setExportedPdf(null);

    if (selectedFile.size === 0) {
      setErrorMessage(`"${selectedFile.name}" is empty (0 bytes).`);
      return;
    }
    if (selectedFile.size > MAX_PDF_ROTATE_FILE_SIZE) {
      setErrorMessage(`"${selectedFile.name}" exceeds the 50 MB limit.`);
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const inspection = await inspectPdfForRotation(bytes, selectedFile.name);
      if (!inspection.valid) {
        setErrorMessage(inspection.error || 'Failed to inspect PDF.');
        return;
      }

      setFile(selectedFile);
      setPdfBytes(bytes);
      setPages(inspection.pages);
      setSelectedPageNumbers([]);
      setSelectionMode('all');

      trackToolEvent('tool_process_start', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: 'load_document',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to open PDF: ${msg}`);
      trackToolEvent('tool_process_error', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: 'invalid_input',
      });
    }
  };

  const handleRotateDelta = (delta: 90 | -90 | 180) => {
    setExportedPdf(null);
    const targetPages = selectionMode === 'selected' && selectedPageNumbers.length > 0
      ? selectedPageNumbers
      : undefined;

    setPages((prev) => applyRotationDelta(prev, delta, targetPages));
  };

  const handleResetRotations = () => {
    setExportedPdf(null);
    setPages((prev) => resetRotations(prev));
  };

  const handleTogglePageSelection = (pageNum: number) => {
    setSelectedPageNumbers((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleExport = async () => {
    if (!pdfBytes || !file) return;

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const outName = file.name.replace(/\.pdf$/i, '') + '-rotated.pdf';
      const output = await exportRotatedPdf(pdfBytes, pages, outName);
      const blob = new Blob([output.bytes as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      setExportedPdf({
        bytes: output.bytes,
        fileName: output.fileName,
        sizeBytes: output.sizeBytes,
        downloadUrl,
      });

      setIsExporting(false);

      trackToolEvent('tool_process_success', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: 'rotate_pages',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to export rotated PDF: ${msg}`);
      setIsExporting(false);
      trackToolEvent('tool_process_error', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: 'processing_error',
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfBytes(null);
    setPages([]);
    setSelectedPageNumbers([]);
    setExportedPdf(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    trackToolEvent('tool_reset', {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  const totalRotatedCount = pages.filter((p) => p.rotationDelta !== 0).length;

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) handleFileChange(droppedFile);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-8 sm:p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/20 cursor-pointer transition-all shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) handleFileChange(selected);
            }}
            className="hidden"
            id={`${baseId}-file-input`}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
            <RotateCw className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base sm:text-lg font-bold text-slate-900">
            Select or drag a PDF to rotate pages
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm">
            Rotate upside-down pages 90° clockwise, 90° counter-clockwise, or 180°. Permanent vector rotation with zero quality loss.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-indigo-300">
            Browse files (Max 50 MB)
          </span>
        </div>
      ) : (
        /* Document Loaded & Rotation Studio */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <FileText className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>&bull;</span>
                  <span>{pages.length} {pages.length === 1 ? 'page' : 'pages'}</span>
                  {totalRotatedCount > 0 && (
                    <>
                      <span>&bull;</span>
                      <span className="font-semibold text-indigo-600">{totalRotatedCount} rotated</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs self-start sm:self-center"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Choose different file</span>
            </button>
          </div>

          {/* Quick Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Apply to:</span>
              <div className="flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectionMode('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectionMode === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Pages ({pages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('selected')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectionMode === 'selected'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Selected ({selectedPageNumbers.length})
                </button>
              </div>
            </div>

            {/* Rotation Actions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleRotateDelta(90)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs"
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw className="h-3.5 w-3.5 text-indigo-600" />
                <span>+90° Clockwise</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotateDelta(-90)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs"
                title="Rotate 90 degrees counter-clockwise"
              >
                <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />
                <span>-90° Counter-CW</span>
              </button>
              <button
                type="button"
                onClick={() => handleRotateDelta(180)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 shadow-2xs"
                title="Rotate 180 degrees"
              >
                <span>180° Flip</span>
              </button>
              {totalRotatedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetRotations}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-2xs"
                >
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* Page Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Document Pages ({pages.length})
              </h3>
              {selectionMode === 'selected' && (
                <span className="text-xs text-slate-500">
                  Click pages to select/unselect for rotation
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
              {pages.map((p) => {
                const isSelected = selectedPageNumbers.includes(p.pageNumber);
                const hasDelta = p.rotationDelta !== 0;

                return (
                  <div
                    key={p.pageNumber}
                    onClick={() => {
                      if (selectionMode === 'selected') {
                        handleTogglePageSelection(p.pageNumber);
                      }
                    }}
                    className={`relative flex flex-col items-center justify-between rounded-xl border p-3 transition-all ${
                      selectionMode === 'selected' ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : hasDelta
                        ? 'border-indigo-300 bg-indigo-50/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Page {p.pageNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {p.finalRotation}°
                      </span>
                    </div>

                    {/* Visual rotation indicator */}
                    <div className="my-3 flex h-16 w-12 items-center justify-center rounded-sm border-2 border-slate-300 bg-slate-50 shadow-2xs transition-transform duration-200"
                      style={{ transform: `rotate(${p.finalRotation}deg)` }}
                    >
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    </div>

                    {/* Single page action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPages((prev) => applyRotationDelta(prev, 90, [p.pageNumber]));
                      }}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                      title={`Rotate page ${p.pageNumber} 90°`}
                    >
                      <RotateCw className="h-3 w-3" />
                      <span>+90°</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              <span>{isExporting ? 'Applying Rotations...' : 'Save & Download Rotated PDF'}</span>
            </button>

            {exportedPdf && (
              <a
                href={exportedPdf.downloadUrl}
                download={exportedPdf.fileName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download {exportedPdf.fileName}</span>
              </a>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* User Feedback Card */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF Page Rotator" />
    </div>
  );
}
