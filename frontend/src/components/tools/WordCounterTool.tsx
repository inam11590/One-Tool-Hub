"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  Info,
  RotateCcw,
} from "lucide-react";
import { analyzeTextMetrics } from "@/lib/tools/word-counter";

const SAMPLE_TEXT = `OneToolHub provides fast, browser-based utilities for students, freelancers, creators, and software developers.

Paste or type your essay, article, video script, or documentation here to see real-time word, character, sentence, and paragraph counts.`;

export function WordCounterTool() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => analyzeTextMetrics(text), [text]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadTxt = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText("");
    setCopied(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
      {/* Live Metric Cards */}
      <div
        aria-live="polite"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-500">Words</p>
          <p
            data-testid="metric-words"
            className="mt-1 text-2xl font-extrabold text-indigo-600"
          >
            {metrics.words.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-500">Characters</p>
          <p
            data-testid="metric-chars-with-spaces"
            className="mt-1 text-2xl font-extrabold text-slate-900"
          >
            {metrics.charactersWithSpaces.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-500">
            Chars (No Spaces)
          </p>
          <p
            data-testid="metric-chars-no-spaces"
            className="mt-1 text-2xl font-extrabold text-slate-900"
          >
            {metrics.charactersWithoutSpaces.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-500">Sentences</p>
          <p
            data-testid="metric-sentences"
            className="mt-1 text-2xl font-extrabold text-slate-900"
          >
            {metrics.sentences.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-500">Paragraphs</p>
          <p
            data-testid="metric-paragraphs"
            className="mt-1 text-2xl font-extrabold text-slate-900"
          >
            {metrics.paragraphs.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold text-slate-500">Reading Time</p>
          <p
            data-testid="metric-reading-time"
            className="mt-1 text-xl font-extrabold text-slate-900"
          >
            {metrics.readingTimeLabel}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <label
          htmlFor="word-counter-textarea"
          className="text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          Text Input Editor
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            disabled={!text}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download .txt</span>
          </button>

          <button
            type="button"
            onClick={() => setText(SAMPLE_TEXT)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sample</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear Text</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        id="word-counter-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here to count words, characters, sentences, and paragraphs in real time..."
        rows={14}
        className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50/40 p-4 text-sm leading-relaxed text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600 sm:text-base"
      />

      {/* International Language & Estimation Disclosure */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
          aria-hidden="true"
        />
        <span>
          <strong>Language &amp; Estimation Note:</strong> Word and sentence
          counts use your browser&apos;s Unicode segmentation capabilities (
          <code>Intl.Segmenter</code> where supported) with a Unicode boundary
          fallback. Because scripts without spaces (such as Japanese, Chinese,
          or Thai) and complex abbreviations segment differently across engines,
          word, sentence, and reading-time figures (~200 words/minute) should be
          treated as helpful estimates.
        </span>
      </div>
    </div>
  );
}
