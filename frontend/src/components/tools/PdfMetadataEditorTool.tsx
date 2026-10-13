'use client';

import { useState, useId, useEffect, useRef } from 'react';
import {
  Tags,
  Download,
  RotateCcw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
} from 'lucide-react';
import {
  readPdfMetadata,
  updatePdfMetadata,
  type PdfMetadataFields,
  getEmptyMetadata,
  MAX_METADATA_FILE_SIZE,
} from '@/lib/tools/pdf-metadata-editor';
import { trackToolEvent } from '@/lib/analytics';
import { ToolFeedbackCard } from '@/components/tools/ToolFeedbackCard';

const TOOL_SLUG = 'pdf-metadata-editor';
const TOOL_CATEGORY = 'freelancer';

export function PdfMetadataEditorTool() {
  const baseId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [metadata, setMetadata] = useState<PdfMetadataFields>(getEmptyMetadata());
  const [originalMetadata, setOriginalMetadata] = useState<PdfMetadataFields>(getEmptyMetadata());

  // Processing & export state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [exportedPdf, setExportedPdf] = useState<{
    bytes: Uint8Array;
    fileName: string;
    sizeBytes: number;
    downloadUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (exportedPdf?.downloadUrl) {
        URL.revokeObjectURL(exportedPdf.downloadUrl);
      }
    };
  }, [exportedPdf]);

  const handleFileChange = async (selectedFile: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setExportedPdf(null);

    if (selectedFile.size === 0) {
      setErrorMessage(`"${selectedFile.name}" is empty (0 bytes).`);
      return;
    }
    if (selectedFile.size > MAX_METADATA_FILE_SIZE) {
      setErrorMessage(`"${selectedFile.name}" exceeds the 50 MB limit.`);
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const inspection = await readPdfMetadata(bytes, selectedFile.name);
      if (!inspection.valid) {
        setErrorMessage(inspection.error || 'Failed to read PDF metadata.');
        return;
      }

      setFile(selectedFile);
      setPdfBytes(bytes);
      setPageCount(inspection.pageCount);
      setMetadata(inspection.metadata);
      setOriginalMetadata(inspection.metadata);

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

  const handleFieldChange = (field: keyof PdfMetadataFields, value: string) => {
    setExportedPdf(null);
    setSuccessMessage(null);
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearAll = () => {
    setExportedPdf(null);
    setSuccessMessage(null);
    setMetadata((prev) => ({
      ...prev,
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
    }));
  };

  const handleResetToOriginal = () => {
    setExportedPdf(null);
    setSuccessMessage(null);
    setMetadata(originalMetadata);
  };

  const handleSave = async () => {
    if (!pdfBytes || !file) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const outName = file.name.replace(/\.pdf$/i, '') + '-updated-metadata.pdf';
      const output = await updatePdfMetadata(pdfBytes, metadata, outName);
      const blob = new Blob([output.bytes as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      setExportedPdf({
        bytes: output.bytes,
        fileName: output.fileName,
        sizeBytes: output.sizeBytes,
        downloadUrl,
      });

      setSuccessMessage('Metadata successfully updated and saved!');
      setIsSaving(false);

      trackToolEvent('tool_process_success', {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: 'update_metadata',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to update metadata: ${msg}`);
      setIsSaving(false);
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
    setPageCount(0);
    setMetadata(getEmptyMetadata());
    setOriginalMetadata(getEmptyMetadata());
    setExportedPdf(null);
    setErrorMessage(null);
    setSuccessMessage(null);
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
            <Tags className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-base sm:text-lg font-bold text-slate-900">
            Select or drag a PDF to inspect and edit metadata
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm">
            View and update document Title, Author, Subject, Keywords, Creator, and Producer info. 100% private in-browser editing.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-indigo-300">
            Browse files (Max 50 MB)
          </span>
        </div>
      ) : (
        /* Metadata Editor Form */
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
                  <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-2xs"
                title="Wipe all editable metadata fields"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Fields</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span>Choose different file</span>
              </button>
            </div>
          </div>

          {/* Privacy Disclaimer Banner */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3 text-xs text-amber-900">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Privacy Notice &amp; Scope Limitation:</strong> This tool edits the standard PDF Document Information Dictionary. It does not perform forensic sanitization of embedded attachments, annotations, or low-level unreferenced streams. Do not rely on this utility as a complete forensic anonymizer.
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${baseId}-title`} className="block text-xs font-bold text-slate-700 mb-1">
                Document Title
              </label>
              <input
                id={`${baseId}-title`}
                type="text"
                value={metadata.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g., Annual Financial Report 2026"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor={`${baseId}-author`} className="block text-xs font-bold text-slate-700 mb-1">
                Author / Organization
              </label>
              <input
                id={`${baseId}-author`}
                type="text"
                value={metadata.author}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                placeholder="e.g., Jane Doe or Acme Corp"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor={`${baseId}-subject`} className="block text-xs font-bold text-slate-700 mb-1">
                Subject / Description
              </label>
              <input
                id={`${baseId}-subject`}
                type="text"
                value={metadata.subject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                placeholder="e.g., Q3 Operations Overview"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor={`${baseId}-keywords`} className="block text-xs font-bold text-slate-700 mb-1">
                Keywords (Comma-separated)
              </label>
              <input
                id={`${baseId}-keywords`}
                type="text"
                value={metadata.keywords}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="e.g., finance, report, 2026, quarterly"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor={`${baseId}-creator`} className="block text-xs font-bold text-slate-700 mb-1">
                Creator Application
              </label>
              <input
                id={`${baseId}-creator`}
                type="text"
                value={metadata.creator}
                onChange={(e) => handleFieldChange('creator', e.target.value)}
                placeholder="e.g., Microsoft Word, Google Docs"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor={`${baseId}-producer`} className="block text-xs font-bold text-slate-700 mb-1">
                PDF Producer / Engine
              </label>
              <input
                id={`${baseId}-producer`}
                type="text"
                value={metadata.producer}
                onChange={(e) => handleFieldChange('producer', e.target.value)}
                placeholder="e.g., pdf-lib, Adobe PDF Library"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Read-Only Date Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
            <div>
              <span className="font-semibold text-slate-500">Creation Date: </span>
              <span className="text-slate-700 font-mono">
                {metadata.creationDate || 'Not specified in document'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Last Modified Date: </span>
              <span className="text-slate-700 font-mono">
                {metadata.modificationDate || 'Will be updated upon saving'}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-colors"
              >
                <Tags className="h-4 w-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save & Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToOriginal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <span>Reset Changes</span>
              </button>
            </div>

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

          {/* Success Message */}
          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

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
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="PDF Metadata Viewer & Editor" />
    </div>
  );
}
