'use client';

import { useState, useMemo } from "react";
import {
  FileSearch,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  ArrowLeftRight,
  Columns2,
  Rows3,
  CheckCircle2,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import {
  compareProseTexts,
  SAMPLE_TEXT_COMPARE_ORIGINAL,
  SAMPLE_TEXT_COMPARE_MODIFIED,
  MAX_TEXT_COMPARE_LENGTH,
  type TextCompareOptions,
} from "@/lib/tools/text-compare";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "text-compare";
const TOOL_CATEGORY = "student";

export function TextCompareTool() {
  const [originalText, setOriginalText] = useState<string>("");
  const [modifiedText, setModifiedText] = useState<string>("");

  const [options, setOptions] = useState<TextCompareOptions>({
    mode: "words",
    ignoreCase: false,
    ignoreWhitespace: true,
  });

  const [viewMode, setViewMode] = useState<"sideBySide" | "inline">("sideBySide");
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Compute Diff
  const diffResult = useMemo(() => {
    if (!originalText && !modifiedText) return null;
    return compareProseTexts(originalText, modifiedText, options);
  }, [originalText, modifiedText, options]);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "swap_inputs",
    });
  };

  const handleClear = () => {
    setOriginalText("");
    setModifiedText("");
    setCopiedSummary(false);
  };

  const handleLoadSample = () => {
    setOriginalText(SAMPLE_TEXT_COMPARE_ORIGINAL);
    setModifiedText(SAMPLE_TEXT_COMPARE_MODIFIED);
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "load_sample",
    });
  };

  const handleCopySummary = async () => {
    if (!diffResult) return;
    try {
      await navigator.clipboard.writeText(diffResult.summaryText);
      setCopiedSummary(true);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_comparison_summary",
      });
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      setCopiedSummary(false);
    }
  };

  const handleDownloadReport = () => {
    if (!diffResult) return;
    const blob = new Blob([diffResult.summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onetoolhub-text-comparison.txt`;
    link.click();
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_comparison_report",
    });
  };

  return (
    <div className="space-y-8">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Private Document Comparison:</strong> Your essays, drafts, and articles are compared entirely inside your browser memory. No text is ever uploaded to a server.
          </span>
        </div>
        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100"
        >
          <Sparkles className="h-3 w-3" />
          Load Sample
        </button>
      </div>

      {/* Control Bar: Mode, Options, Views */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Comparison Options Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Comparison Granularity:</span>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setOptions((prev) => ({ ...prev, mode: "words" }))}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                options.mode === "words"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Word-by-Word
            </button>
            <button
              type="button"
              onClick={() => setOptions((prev) => ({ ...prev, mode: "lines" }))}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                options.mode === "lines"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Line-by-Line
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={options.ignoreCase}
              onChange={(e) => setOptions((prev) => ({ ...prev, ignoreCase: e.target.checked }))}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span>Ignore Case</span>
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={options.ignoreWhitespace}
              onChange={(e) => setOptions((prev) => ({ ...prev, ignoreWhitespace: e.target.checked }))}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span>Ignore Extra Whitespace</span>
          </label>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("sideBySide")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "sideBySide"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode("inline")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "inline"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Rows3 className="h-3.5 w-3.5" />
              Inline
            </button>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            title="Swap Original and Modified text"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Swap
          </button>

          {(originalText || modifiedText) && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Input Editors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Original Text (Before)
            </span>
            <span className="text-xs text-slate-400">
              {originalText.length.toLocaleString()} / {MAX_TEXT_COMPARE_LENGTH.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value.slice(0, MAX_TEXT_COMPARE_LENGTH))}
            placeholder="Paste your original text, first draft, or baseline document here..."
            rows={8}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Modified Text (After)
            </span>
            <span className="text-xs text-slate-400">
              {modifiedText.length.toLocaleString()} / {MAX_TEXT_COMPARE_LENGTH.toLocaleString()} chars
            </span>
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value.slice(0, MAX_TEXT_COMPARE_LENGTH))}
            placeholder="Paste your revised text, second draft, or updated version here..."
            rows={8}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* Comparison Results Card */}
      {diffResult && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Header & Stats Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <FileSearch className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Comparison Results
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {options.mode === "words" ? "Word-level comparison" : "Line-level comparison"} with {diffResult.stats.similarityScore}% overall similarity.
                </p>
              </div>
            </div>

            {/* Change Metrics Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                +{diffResult.stats.addedCount} Words Added
              </span>
              <span className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                -{diffResult.stats.removedCount} Words Removed
              </span>
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {diffResult.stats.unchangedCount} Unchanged
              </span>

              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {copiedSummary ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copiedSummary ? "Copied" : "Copy Summary"}
              </button>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-3 w-3" />
                Report
              </button>
            </div>
          </div>

          {/* Diff Views */}
          {viewMode === "inline" ? (
            /* Inline Diff View */
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 font-serif text-base leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
              {diffResult.tokens.map((token, idx) => {
                if (token.type === "added") {
                  return (
                    <mark
                      key={idx}
                      className="rounded bg-emerald-100 px-1 py-0.5 text-emerald-950 underline decoration-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200"
                    >
                      {token.text}
                    </mark>
                  );
                }
                if (token.type === "removed") {
                  return (
                    <del
                      key={idx}
                      className="rounded bg-rose-100 px-1 py-0.5 text-rose-900 line-through decoration-rose-500 opacity-75 dark:bg-rose-950/60 dark:text-rose-200"
                    >
                      {token.text}
                    </del>
                  );
                }
                return <span key={idx}>{token.text}</span>;
              })}
            </div>
          ) : (
            /* Side-by-Side Diff View */
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 font-serif text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Original Version (Showing Removals)
                </div>
                <div>
                  {diffResult.originalTokens.map((token, idx) => {
                    if (token.type === "removed") {
                      return (
                        <del
                          key={idx}
                          className="rounded bg-rose-100 px-1 py-0.5 text-rose-900 line-through decoration-rose-500 opacity-75 dark:bg-rose-950/60 dark:text-rose-200"
                        >
                          {token.text}
                        </del>
                      );
                    }
                    return <span key={idx}>{token.text}</span>;
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 font-serif text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Modified Version (Showing Additions)
                </div>
                <div>
                  {diffResult.modifiedTokens.map((token, idx) => {
                    if (token.type === "added") {
                      return (
                        <mark
                          key={idx}
                          className="rounded bg-emerald-100 px-1 py-0.5 text-emerald-950 underline decoration-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-200"
                        >
                          {token.text}
                        </mark>
                      );
                    }
                    return <span key={idx}>{token.text}</span>;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Educational Disclaimer */}
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <strong>Note on Comparison Results:</strong> This tool highlights literal text differences between documents. It is not an automated grammar checker, stylistic evaluator, or plagiarism detection service.
            </span>
          </div>
        </div>
      )}

      {/* User Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="Text Compare & Difference Checker" />
    </div>
  );
}
