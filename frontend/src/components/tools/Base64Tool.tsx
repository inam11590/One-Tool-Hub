'use client';

import { useState, useId, useEffect } from "react";
import {
  Copy,
  Check,
  ArrowRightLeft,
  RotateCcw,
  Download,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import {
  encodeUtf8ToBase64,
  decodeBase64ToUtf8,
  type Base64ProcessResult,
} from "@/lib/tools/base64";
import { trackToolEvent } from "@/lib/analytics";

const TOOL_SLUG = "base64-encoder-decoder";
const TOOL_CATEGORY = "developer";

export function Base64Tool() {
  const baseId = useId();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackToolEvent("tool_open", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  }, []);

  const handleProcess = (text: string, currentMode: "encode" | "decode") => {
    setInputText(text);
    setError(null);

    if (!text.trim()) {
      setOutputText("");
      return;
    }

    const result: Base64ProcessResult =
      currentMode === "encode"
        ? encodeUtf8ToBase64(text)
        : decodeBase64ToUtf8(text);

    if (!result.success) {
      setError(result.error ?? "Failed to process input.");
      setOutputText("");
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: `${currentMode}_base64`,
        error_category: "invalid_input",
      });
      return;
    }

    setOutputText(result.output);
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: `${currentMode}_base64`,
    });
  };

  const handleModeChange = (newMode: "encode" | "decode") => {
    setMode(newMode);
    handleProcess(inputText, newMode);
  };

  const handleSwap = () => {
    if (!outputText && !inputText) return;
    const nextInput = outputText;
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    handleProcess(nextInput, nextMode);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: `copy_${mode}_output`,
      });
    } catch {
      // Clipboard write failed
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    const filename = mode === "encode" ? "encoded-base64.txt" : "decoded-text.txt";
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: `download_${mode}_output`,
    });
  };

  const handleReset = () => {
    if (
      inputText.trim() &&
      typeof window !== "undefined" &&
      !window.confirm("Clear all input and output fields?")
    ) {
      return;
    }
    setInputText("");
    setOutputText("");
    setError(null);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset_base64",
    });
  };

  const handleLoadSample = () => {
    if (
      inputText.trim() &&
      typeof window !== "undefined" &&
      !window.confirm("Replace current input with sample text?")
    ) {
      return;
    }
    const sample =
      mode === "encode"
        ? 'Hello, World! 🚀 Enjoy browser-based UTF-8 Base64 encoding.'
        : "SGVsbG8sIFdvcmxkISDwn5qAIEVuam95IGJyb3dzZXItYmFzZWQgVVRGLTggQmFzZTY0IGVuY29kaW5nLg==";
    handleProcess(sample, mode);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector & Quick Actions Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleModeChange("encode")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              mode === "encode"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Encode Text → Base64
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("decode")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              mode === "decode"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Decode Base64 → Text
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!outputText}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            title="Swap input and output text"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Swap</span>
          </button>
          <button
            type="button"
            onClick={handleLoadSample}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Load Sample
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Panels (Input and Output) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${baseId}-input`}
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              {mode === "encode" ? "Input Plain Text (UTF-8)" : "Input Base64 String"}
            </label>
            <span className="text-xs text-slate-500">{inputText.length} characters</span>
          </div>
          <textarea
            id={`${baseId}-input`}
            rows={12}
            value={inputText}
            onChange={(e) => handleProcess(e.target.value, mode)}
            placeholder={
              mode === "encode"
                ? "Type or paste text to encode into Base64 (Unicode & emojis supported)..."
                : "Paste Base64 encoded string to decode into UTF-8 text..."
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${baseId}-output`}
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              {mode === "encode" ? "Encoded Base64 Output" : "Decoded Text Output"}
            </label>
            <span className="text-xs text-slate-500">{outputText.length} characters</span>
          </div>
          <textarea
            id={`${baseId}-output`}
            rows={12}
            readOnly
            value={outputText}
            placeholder="Processed output will appear here automatically..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-900 select-all focus:border-indigo-600 focus:outline-hidden"
          />

          {/* Output Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Output</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputText}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-900"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Security notice regarding encoding vs encryption */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <span>
          <strong>Important Security Note:</strong> Base64 is an <em>encoding format</em> designed to transmit binary data over text-only protocols (e.g., MIME, JSON, data URIs). It is <strong>not encryption</strong> and offers zero confidentiality. Never use Base64 to conceal passwords, API keys, or sensitive customer records.
        </span>
      </div>
    </div>
  );
}
