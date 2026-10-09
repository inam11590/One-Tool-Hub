"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  analyzeAndFormatYouTubeTimestamps,
  SAMPLE_YOUTUBE_TIMESTAMPS,
} from "@/lib/tools/youtube-timestamp-formatter";
import { trackToolEvent } from "@/lib/analytics";

const TOOL_SLUG = "youtube-timestamp-formatter";
const TOOL_CATEGORY = "youtube";

export function YouTubeTimestampTool() {
  const [input, setInput] = useState<string>(SAMPLE_YOUTUBE_TIMESTAMPS);
  const [sortChronologically, setSortChronologically] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(
    () =>
      analyzeAndFormatYouTubeTimestamps(input, {
        sortChronologically,
      }),
    [input, sortChronologically]
  );

  const handleCopy = async () => {
    if (!analysis.formattedOutput) return;
    try {
      await navigator.clipboard.writeText(analysis.formattedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_chapters",
      });
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownload = () => {
    if (!analysis.formattedOutput) return;
    const blob = new Blob([analysis.formattedOutput], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "youtube-chapters.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_chapters_txt",
    });
  };

  const handleLoadSample = () => {
    if (
      input.trim() &&
      input !== SAMPLE_YOUTUBE_TIMESTAMPS &&
      typeof window !== "undefined" &&
      !window.confirm("Replace current timestamps with sample chapters?")
    ) {
      return;
    }
    setInput(SAMPLE_YOUTUBE_TIMESTAMPS);
  };

  const handleReset = () => {
    if (
      input.trim() &&
      typeof window !== "undefined" &&
      !window.confirm("Clear all chapters? This action cannot be undone.")
    ) {
      return;
    }
    setInput("");
    setSortChronologically(false);
    setCopied(false);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
      {/* Checklist Bar for YouTube Requirements */}
      <div className="grid grid-cols-1 gap-3 border-b border-slate-200 pb-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold ${
            analysis.startsAtZero
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              : "border-amber-200 bg-amber-50/70 text-amber-900"
          }`}
        >
          {analysis.startsAtZero ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          )}
          <span>Starts at 00:00</span>
        </div>

        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold ${
            analysis.hasMinimumThreeChapters
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              : "border-amber-200 bg-amber-50/70 text-amber-900"
          }`}
        >
          {analysis.hasMinimumThreeChapters ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          )}
          <span>
            At least 3 chapters ({analysis.normalizedChapters.length})
          </span>
        </div>

        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold ${
            analysis.isChronological
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              : "border-amber-200 bg-amber-50/70 text-amber-900"
          }`}
        >
          {analysis.isChronological ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          )}
          <span>Ascending chronological order</span>
        </div>

        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold ${
            analysis.allChaptersAtLeastTenSeconds
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
              : "border-amber-200 bg-amber-50/70 text-amber-900"
          }`}
        >
          {analysis.allChaptersAtLeastTenSeconds ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
          )}
          <span>Chapters &ge; 10 seconds</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSortChronologically((prev) => !prev)}
            aria-pressed={sortChronologically}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              sortChronologically
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {sortChronologically
                ? "Auto-Sorting Chronologically: ON"
                : "Auto-Sort Chronologically"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span>Load Sample</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!analysis.formattedOutput}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check
                  className="h-3.5 w-3.5 text-emerald-600"
                  aria-hidden="true"
                />
                <span>Copied Chapters</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy All Chapters</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!analysis.formattedOutput}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Warnings / Errors */}
      {analysis.malformedLines.length > 0 ||
      analysis.duplicateTimestamps.length > 0 ||
      analysis.outOfOrderLines.length > 0 ||
      analysis.shortChapters.length > 0 ? (
        <div
          role="alert"
          className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 sm:text-sm"
        >
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle
              className="h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <span>Timestamp Validation Issues Detected</span>
          </div>

          {analysis.malformedLines.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {analysis.malformedLines.map((item) => (
                <li key={item.lineNumber}>
                  <strong>Line {item.lineNumber}:</strong> {item.reason} (
                  <code className="rounded bg-amber-100 px-1 py-0.5">
                    {item.rawLine}
                  </code>
                  )
                </li>
              ))}
            </ul>
          ) : null}

          {analysis.duplicateTimestamps.length > 0 ? (
            <p>
              <strong>Duplicate timestamps:</strong>{" "}
              {analysis.duplicateTimestamps.join(", ")}. Each chapter must have
              a unique timestamp.
            </p>
          ) : null}

          {analysis.outOfOrderLines.length > 0 ? (
            <p>
              <strong>Out of chronological order:</strong>{" "}
              {analysis.outOfOrderLines
                .map(
                  (o) =>
                    `Line ${o.lineNumber} (${o.timestamp} appears after ${o.previousTimestamp})`
                )
                .join("; ")}
              . Enable &ldquo;Auto-Sort Chronologically&rdquo; or reorder your
              lines.
            </p>
          ) : null}

          {analysis.shortChapters.length > 0 ? (
            <p>
              <strong>Chapters shorter than 10 seconds:</strong>{" "}
              {analysis.shortChapters
                .map(
                  (s) =>
                    `"${s.chapterTitle}" at ${s.timestamp} (${s.durationSeconds}s)`
                )
                .join(", ")}
              . YouTube requires each chapter to be at least 10 seconds long.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Dual Editor Panes */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label
            htmlFor="youtube-raw-input"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Paste Raw Timestamp Lines
          </label>
          <textarea
            id="youtube-raw-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`0:00 Intro\n1:25 Setup\n04:10 Deep Dive`}
            rows={14}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600 sm:text-sm"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Supports <code>MM:SS Title</code>, <code>HH:MM:SS - Title</code>, or{" "}
            <code>Title - MM:SS</code>.
          </p>
        </div>

        <div>
          <label
            htmlFor="youtube-formatted-output"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Clean YouTube-Ready Chapter List
          </label>
          <textarea
            id="youtube-formatted-output"
            value={analysis.formattedOutput}
            readOnly
            placeholder="Formatted YouTube chapters will appear here..."
            rows={14}
            className="w-full rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 shadow-2xs focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:text-sm"
          />
        </div>
      </div>

      {/* Important YouTube Disclaimer */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
          aria-hidden="true"
        />
        <span>
          <strong>YouTube Chapter Requirements &amp; Disclaimer:</strong> To
          qualify for video chapters on YouTube, your description list must
          start with <code>00:00</code>, include at least 3 timestamps listed in
          ascending chronological order, and maintain a minimum length of 10
          seconds per chapter. Please note that valid formatting does not
          guarantee YouTube will display chapters, as channel eligibility,
          active copyright or community strikes, or YouTube&apos;s own automated
          player settings also control chapter rendering.
        </span>
      </div>
    </div>
  );
}
