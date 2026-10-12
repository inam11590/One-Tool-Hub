'use client';

import { useState, useMemo } from "react";
import {
  Eraser,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  Sliders,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  cleanText,
  DEFAULT_CLEANER_OPTIONS,
  SAMPLE_MESSY_TEXT,
  type TextCleanerOptions,
} from "@/lib/tools/text-cleaner";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "text-cleaner";
const TOOL_CATEGORY = "freelancer";

export function TextCleanerTool() {
  const [inputText, setInputText] = useState<string>("");
  const [options, setOptions] = useState<TextCleanerOptions>(DEFAULT_CLEANER_OPTIONS);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute cleaned text
  const result = useMemo(() => {
    return cleanText(inputText, options);
  }, [inputText, options]);

  const handleCopy = async () => {
    if (!result.cleanedText) return;
    try {
      await navigator.clipboard.writeText(result.cleanedText);
      setCopied(true);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_cleaned_text",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!result.cleanedText) return;
    const blob = new Blob([result.cleanedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onetoolhub-cleaned-text.txt`;
    link.click();
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_cleaned_text",
    });
  };

  const handleClear = () => {
    setInputText("");
    setCopied(false);
  };

  const handleResetOptions = () => {
    setOptions(DEFAULT_CLEANER_OPTIONS);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_MESSY_TEXT);
    setOptions(DEFAULT_CLEANER_OPTIONS);
  };

  const toggleOption = (key: keyof TextCleanerOptions) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      trackToolEvent("tool_process_success", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "toggle_cleaner_option",
      });
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side Text Sanitization:</strong> Your data is cleaned locally in your browser tab. No pasted documents or client emails are sent across the network.
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

      {/* Cleaning Configuration Options Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cleaning Rules & Formatting Options
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetOptions}
            className="text-xs font-medium text-slate-500 underline hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.removeExtraSpaces}
              onChange={() => toggleOption("removeExtraSpaces")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Remove Extra Spaces</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Replaces 2+ consecutive spaces with a single space.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.trimLines}
              onChange={() => toggleOption("trimLines")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Trim Line Boundaries</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Strips leading and trailing spaces from every line.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.reduceBlankLines}
              onChange={() => toggleOption("reduceBlankLines")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Reduce Multiple Blank Lines</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Collapses multiple empty lines down to a single blank line.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.removeEmptyLines}
              onChange={() => toggleOption("removeEmptyLines")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Remove All Empty Lines</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Completely deletes all blank lines from the text.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.removeDuplicateLines}
              onChange={() => toggleOption("removeDuplicateLines")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Remove Duplicate Lines</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Deduplicates identical lines across the document.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.caseInsensitiveDuplicates}
              onChange={() => toggleOption("caseInsensitiveDuplicates")}
              disabled={!options.removeDuplicateLines}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Case-Insensitive Duplicates</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Treats &quot;Item&quot; and &quot;item&quot; as duplicate lines.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.convertTabsToSpaces}
              onChange={() => toggleOption("convertTabsToSpaces")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Convert Tabs to Spaces</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Replaces tab characters with 4 spaces.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.stripHtmlTags}
              onChange={() => toggleOption("stripHtmlTags")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Strip HTML Tags</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Removes tags like &lt;p&gt;, &lt;br&gt;, and &lt;span&gt; from copy-pastes.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
            <input
              type="checkbox"
              checked={options.normalizeLineEndings}
              onChange={() => toggleOption("normalizeLineEndings")}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">Normalize Line Endings</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">Converts Windows CRLF and Mac CR to standard Unix LF.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Input and Cleaned Output Editors */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Original Text Input */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Original Text
              </h2>
            </div>
            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste messy text with extra spaces, duplicate lines, or formatting artifacts here..."
            rows={12}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900"
          />

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            <span>
              <strong>{result.stats.originalCharacters.toLocaleString()}</strong> Characters
            </span>
            <span>
              <strong>{result.stats.originalLines.toLocaleString()}</strong> Lines
            </span>
          </div>
        </div>

        {/* Cleaned Text Output */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eraser className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Cleaned Output
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result.cleanedText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!result.cleanedText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-3.5 w-3.5" />
                .txt
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={result.cleanedText}
            placeholder="Cleaned and formatted text will appear here automatically..."
            rows={12}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:placeholder-slate-500"
          />

          {/* Cleaned Reduction Metrics */}
          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                <strong>{result.stats.cleanedCharacters.toLocaleString()}</strong> Characters
              </span>
              <span>
                <strong>{result.stats.cleanedLines.toLocaleString()}</strong> Lines
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -{result.stats.charactersRemoved.toLocaleString()} chars removed
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                -{result.stats.linesRemoved.toLocaleString()} lines removed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="Text Cleaner & Formatter" />
    </div>
  );
}
