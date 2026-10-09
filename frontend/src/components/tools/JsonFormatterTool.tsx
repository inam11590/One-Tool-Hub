"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  formatByteSize,
  getUtf8ByteSize,
  MAX_JSON_SIZE_BYTES,
  SAMPLE_JSON_DOCUMENT,
  validateAndFormatJson,
  type JsonErrorDetails,
} from "@/lib/tools/json-formatter";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "json-formatter";
const TOOL_CATEGORY = "developer";

export function JsonFormatterTool() {
  const [input, setInput] = useState<string>(SAMPLE_JSON_DOCUMENT);
  const [output, setOutput] = useState<string>(SAMPLE_JSON_DOCUMENT);
  const [indent, setIndent] = useState<2 | 4>(2);
  const [error, setError] = useState<JsonErrorDetails | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    "Valid JSON loaded. Ready to format, validate, or minify."
  );
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const inputBytes = getUtf8ByteSize(input);
  const outputBytes = getUtf8ByteSize(output);

  const handleProcess = (targetIndent: 2 | 4 | 0, sourceText = input) => {
    const operationType =
      targetIndent === 0 ? "minify" : `format_${targetIndent}`;
    const result = validateAndFormatJson(sourceText, targetIndent);
    if (!result.valid) {
      const errMsg = result.error?.message ?? "Invalid JSON syntax.";
      setError(result.error ?? { message: errMsg });
      setStatusMessage(null);
      reportToolProcessingError(TOOL_SLUG, TOOL_CATEGORY, operationType, errMsg);
      return;
    }

    setError(null);
    setOutput(result.output ?? "");
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: operationType,
    });
    if (targetIndent === 0) {
      setStatusMessage("JSON validated and minified successfully.");
    } else {
      setIndent(targetIndent);
      setStatusMessage(
        `JSON validated and formatted with ${targetIndent}-space indentation.`
      );
    }
  };

  const handleValidateOnly = () => {
    const result = validateAndFormatJson(input, indent);
    if (!result.valid) {
      const errMsg = result.error?.message ?? "Invalid JSON syntax.";
      setError(result.error ?? { message: errMsg });
      setStatusMessage(null);
      reportToolProcessingError(TOOL_SLUG, TOOL_CATEGORY, "validate", errMsg);
      return;
    }
    setError(null);
    setStatusMessage("Valid JSON syntax confirmed.");
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "validate",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".json") &&
      file.type !== "application/json" &&
      file.type !== "text/plain"
    ) {
      setError({
        message: "Please select a valid .json file.",
      });
      setStatusMessage(null);
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "upload_json",
        "unsupported format",
        "unsupported_format"
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_JSON_SIZE_BYTES) {
      setError({
        message: `Uploaded file (${formatByteSize(
          file.size
        )}) exceeds the 2 MB browser limit.`,
      });
      setStatusMessage(null);
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "upload_json",
        "file exceeds limit",
        "file_too_large"
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === "string" ? reader.result : "";
      setInput(content);
      const res = validateAndFormatJson(content, indent);
      if (res.valid) {
        setError(null);
        setOutput(res.output ?? "");
        setStatusMessage(`Loaded and formatted "${file.name}".`);
        trackToolEvent("tool_process_success", {
          tool_slug: TOOL_SLUG,
          tool_category: TOOL_CATEGORY,
          operation_type: "upload_json",
        });
      } else {
        setOutput("");
        const errMsg = res.error?.message ?? "Invalid JSON in uploaded file.";
        setError(res.error ?? { message: errMsg });
        setStatusMessage(null);
        reportToolProcessingError(
          TOOL_SLUG,
          TOOL_CATEGORY,
          "upload_json",
          errMsg,
          "syntax_error"
        );
      }
    };
    reader.onerror = () => {
      setError({ message: "Failed to read the selected file." });
      setStatusMessage(null);
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "upload_json",
        "file read error",
        "processing_error"
      );
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleCopyOutput = async () => {
    const textToCopy = output || input;
    if (!textToCopy.trim()) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_json",
      });
    } catch {
      setError({ message: "Unable to copy to clipboard in this browser." });
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "copy_json",
        "clipboard write failed",
        "clipboard_error"
      );
    }
  };

  const handleDownload = () => {
    const content = output || input;
    if (!content.trim()) return;
    const blob = new Blob([content], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_json",
    });
  };

  const handleClear = () => {
    if (
      input.trim().length > 0 &&
      input !== SAMPLE_JSON_DOCUMENT &&
      typeof window !== "undefined" &&
      !window.confirm("Clear all JSON editor content? Any unsaved edits will be lost.")
    ) {
      return;
    }
    setInput("");
    setOutput("");
    setError(null);
    setStatusMessage(null);
    setCopied(false);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "clear",
    });
  };

  const handleLoadSample = () => {
    if (
      input.trim().length > 0 &&
      input !== SAMPLE_JSON_DOCUMENT &&
      typeof window !== "undefined" &&
      !window.confirm("Replace current editor content with sample JSON?")
    ) {
      return;
    }
    setInput(SAMPLE_JSON_DOCUMENT);
    setOutput(SAMPLE_JSON_DOCUMENT);
    setError(null);
    setStatusMessage("Sample JSON loaded.");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleProcess(2)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              indent === 2 && !error
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Format (2 Spaces)</span>
          </button>

          <button
            type="button"
            onClick={() => handleProcess(4)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              indent === 4 && !error
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Format (4 Spaces)</span>
          </button>

          <button
            type="button"
            onClick={() => handleProcess(0)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Minify</span>
          </button>

          <button
            type="button"
            onClick={handleValidateOnly}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>Validate Only</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="sr-only"
            id="json-file-upload"
          />
          <label
            htmlFor="json-file-upload"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload .json</span>
          </label>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sample</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Validation Status / Error Banner */}
      {error ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold">Invalid JSON Syntax</p>
            <p className="mt-1 font-mono text-xs sm:text-sm">{error.message}</p>
            {error.line ? (
              <p className="mt-1 text-xs font-semibold text-red-700">
                Detected near Line {error.line}
                {error.column ? `, Column ${error.column}` : ""}
              </p>
            ) : null}
          </div>
        </div>
      ) : statusMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs font-medium text-emerald-900 sm:text-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>{statusMessage}</span>
          </div>
          <span className="font-mono text-xs text-emerald-800">
            Input: {formatByteSize(inputBytes)} &bull; Output:{" "}
            {formatByteSize(outputBytes)}
          </span>
        </div>
      ) : null}

      {/* Dual Editor Panes */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Raw Input */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="json-input-editor"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Input JSON
            </label>
            <span className="font-mono text-xs text-slate-500">
              Size: {formatByteSize(inputBytes)}
            </span>
          </div>
          <textarea
            id="json-input-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste or type JSON here (e.g. {"name": "OneToolHub"})...'
            rows={16}
            spellCheck={false}
            className="w-full flex-1 rounded-xl border border-slate-300 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600 sm:text-sm"
          />
        </div>

        {/* Formatted Output */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="json-output-editor"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Formatted / Minified Output
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">
                Size: {formatByteSize(outputBytes)}
              </span>
              <button
                type="button"
                onClick={handleCopyOutput}
                disabled={!output.trim()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {copied ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
          <textarea
            id="json-output-editor"
            value={output}
            readOnly
            placeholder="Formatted or minified JSON output will appear here..."
            rows={16}
            spellCheck={false}
            className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 shadow-2xs focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
