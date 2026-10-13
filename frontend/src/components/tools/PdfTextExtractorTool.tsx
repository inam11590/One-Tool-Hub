'use client';

import { useState, useId, useRef } from 'react';
import {
  Upload,
  FileText,
  Copy,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  extractTextFromPdf,
  type PdfTextExtractionOutput,
  MAX_TEXT_EXTRACT_FILE_SIZE,
} from '@/lib/tools/pdf-text-extractor';
import { trackToolEvent } from '@/lib/analytics';
import { ToolFeedbackCard } from '@/components/tools/ToolFeedbackCard';

const TOOL_SLUG = 'pdf-text-extractor';
const TOOL_CATEGORY = 'freelancer';

export function PdfTextExtractorTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [customRangeString, setCustomRangeString] = useState<string>('');

  // Processing state
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [extractedResult, setExtractedResult] = useState<PdfTextExtractionOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileChange = async (selectedFile: File) => {
    setErrorMessage(null);
    setExtractedResult(null);
    setCopied(false);

    if (selectedFile.size === 0) {
      setErrorMessage(`"${selectedFile.name}" is empty (0 bytes).`);
      return;
    }
    if (selectedFile.size > MAX_TEXT_EXTRACT_FILE_SIZE) {
      setErrorMessage(`"${selectedFile.name}" exceeds the 50 MB file size limit.`);
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Verify PDF magic bytes
      const header = String.fromCharCode(...bytes.slice(0, 5));
      if (!header.startsWith('%PDF-')) {
        setErrorMessage(`"${selectedFile.name}" is not a valid PDF document.`);
        return;
      }

      // Quick read page count with PDF.js
      const { getPdfjsLib } = await import('@/lib/tools/pdf-to-image');
      const pdfjs = await getPdfjsLib();
      const doc = await pdfjs.getDocument({ data: bytes }).promise;

      setFile(selectedFile);
      setPdfBytes(bytes);
      setTotalPages(doc.numPages);
      setCustomRangeString(`1-${Math.min(doc.numPages, 10)}`);

      trackToolEvent('tool_process_start', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: 'load_document',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isEncrypted = msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password');
      setErrorMessage(
        isEncrypted
          ? `"${selectedFile.name}" is encrypted or password-protected. Please decrypt it first.`
          : `Failed to load "${selectedFile.name}": ${msg}`
      );
      trackToolEvent('tool_process_error', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: isEncrypted ? 'encrypted_file' : 'invalid_input',
      });
    }
  };

  const handleExtract = async () => {
    if (!pdfBytes || !file) return;

    setIsExtracting(true);
    setErrorMessage(null);
    setProgress({ current: 0, total: totalPages });

    try {
      const result = await extractTextFromPdf(pdfBytes, file.name, {
        pageRangeString: pageRangeMode === 'custom' ? customRangeString : undefined,
        onProgress: (current, total) => setProgress({ current, total }),
      });

      setExtractedResult(result);
      setIsExtracting(false);

      trackToolEvent('tool_process_success', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: 'extract_text',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Extraction failed: ${msg}`);
      setIsExtracting(false);
      trackToolEvent('tool_process_error', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        error_category: 'processing_error',
      });
    }
  };

  const handleCopyText = async () => {
    if (!extractedResult) return;
    try {
      await navigator.clipboard.writeText(extractedResult.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      trackToolEvent('tool_copy', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: 'copy_text',
      });
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    if (!extractedResult || !file) return;
    const blob = new Blob([extractedResult.fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, '') + '-extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent('tool_download', {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: 'download_txt',
    });
  };

  const handleReset = () => {
    setFile(null);
    setPdfBytes(null);
    setTotalPages(0);
    setExtractedResult(null);
    setErrorMessage(null);
    setCopied(false);
    setProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    trackToolEvent('tool_reset', {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

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
            <Upload className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base sm:text-lg font-bold text-slate-900">
            Select or drag a PDF to extract text
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm">
            Extract selectable text, headings, and tables from all pages or custom ranges. 100% private in-browser parsing.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-indigo-300">
            Browse files (Max 50 MB)
          </span>
        </div>
      ) : (
        /* Document Loaded & Extraction Controls */
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
                  <span>{totalPages} {totalPages === 1 ? 'page' : 'pages'}</span>
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

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pages to Extract
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pageRangeMode"
                    checked={pageRangeMode === 'all'}
                    onChange={() => setPageRangeMode('all')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>All Pages ({totalPages})</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pageRangeMode"
                    checked={pageRangeMode === 'custom'}
                    onChange={() => setPageRangeMode('custom')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Custom Range</span>
                </label>
              </div>
            </div>

            {pageRangeMode === 'custom' && (
              <div className="space-y-1">
                <label
                  htmlFor={`${baseId}-custom-range`}
                  className="block text-xs font-bold text-slate-700"
                >
                  Page Numbers or Ranges (e.g., 1-3, 5)
                </label>
                <input
                  id={`${baseId}-custom-range`}
                  type="text"
                  value={customRangeString}
                  onChange={(e) => setCustomRangeString(e.target.value)}
                  placeholder={`1-${totalPages}`}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div>
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleExtract}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>{isExtracting ? 'Extracting Text...' : 'Extract Text Now'}</span>
            </button>
          </div>

          {/* Progress Feedback */}
          {isExtracting && progress && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-indigo-900">
                <span>Extracting page {progress.current} of {progress.total}...</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Extraction Output */}
          {extractedResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Extracted Pages</p>
                  <p className="text-base font-bold text-slate-900">{extractedResult.extractedPagesCount}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Total Words</p>
                  <p className="text-base font-bold text-slate-900">{extractedResult.totalWordCount.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Characters</p>
                  <p className="text-base font-bold text-slate-900">{extractedResult.totalCharCount.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Est. Reading Time</p>
                  <p className="text-base font-bold text-slate-900">{Math.max(1, Math.ceil(extractedResult.totalWordCount / 200))} min</p>
                </div>
              </div>

              {/* Scanned / Image-only warning */}
              {!extractedResult.hasSelectableText && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 text-xs text-amber-800">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">No selectable text was found.</strong> This document may require OCR.
                    <p className="mt-1 text-[11px] text-amber-700">
                      Scanned paper documents or image-only PDFs do not have embedded digital font layers. To extract text from scanned images, an Optical Character Recognition (OCR) engine is required.
                    </p>
                  </div>
                </div>
              )}

              {/* Text Preview and Action Buttons */}
              {extractedResult.hasSelectableText && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Extracted Text Preview
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadTxt}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    value={extractedResult.fullText}
                    rows={12}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-800 focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Feedback Card */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF Text Extractor" />
    </div>
  );
}
