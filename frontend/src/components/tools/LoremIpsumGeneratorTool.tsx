'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Pilcrow,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  AlignLeft,
  FileCode,
  Layers,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import {
  generatePlaceholderText,
  type PlaceholderMode,
  type PlaceholderFlavor,
  type LoremIpsumOptions,
} from "@/lib/tools/lorem-ipsum-generator";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "lorem-ipsum-generator";
const TOOL_CATEGORY = "developer";

interface PresetConfig {
  label: string;
  mode: PlaceholderMode;
  quantity: number;
  flavor: PlaceholderFlavor;
  startWithLorem: boolean;
  asHtml: boolean;
}

const PRESETS: PresetConfig[] = [
  { label: "1 Paragraph (Teaser)", mode: "paragraphs", quantity: 1, flavor: "latin", startWithLorem: true, asHtml: false },
  { label: "3 Paragraphs (Standard)", mode: "paragraphs", quantity: 3, flavor: "latin", startWithLorem: true, asHtml: false },
  { label: "5 Paragraphs (Article)", mode: "paragraphs", quantity: 5, flavor: "latin", startWithLorem: true, asHtml: false },
  { label: "5 Sentences (Excerpt)", mode: "sentences", quantity: 5, flavor: "latin", startWithLorem: true, asHtml: false },
  { label: "30 Words (Mock Header)", mode: "words", quantity: 30, flavor: "latin", startWithLorem: true, asHtml: false },
  { label: "English UI Prototype", mode: "paragraphs", quantity: 3, flavor: "english", startWithLorem: false, asHtml: false },
];

export function LoremIpsumGeneratorTool() {
  const [mode, setMode] = useState<PlaceholderMode>("paragraphs");
  const [quantity, setQuantity] = useState<number>(3);
  const [flavor, setFlavor] = useState<PlaceholderFlavor>("latin");
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [asHtmlParagraphs, setAsHtmlParagraphs] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Maximum quantity boundary based on mode
  const maxQuantity = useMemo(() => {
    switch (mode) {
      case "words":
        return 500;
      case "sentences":
        return 50;
      case "paragraphs":
      default:
        return 20;
    }
  }, [mode]);

  // Adjust quantity if switching modes
  const handleModeChange = (newMode: PlaceholderMode) => {
    setMode(newMode);
    if (newMode === "paragraphs") {
      setQuantity(3);
    } else if (newMode === "sentences") {
      setQuantity(6);
    } else {
      setQuantity(50);
    }
  };

  const executeGeneration = useCallback(() => {
    const opts: LoremIpsumOptions = {
      mode,
      quantity,
      flavor,
      startWithLorem,
      asHtmlParagraphs: mode === "paragraphs" && asHtmlParagraphs,
    };
    const result = generatePlaceholderText(opts);
    setGeneratedText(result);
    setCopied(false);

    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "generate_lorem_ipsum",
    });
  }, [mode, quantity, flavor, startWithLorem, asHtmlParagraphs]);

  // Initial generation on mount
  useEffect(() => {
    executeGeneration();
  }, [executeGeneration]);

  // Live text statistics
  const stats = useMemo(() => {
    const clean = generatedText.trim();
    if (!clean) return { characters: 0, words: 0, paragraphs: 0 };
    const words = clean.split(/\s+/).filter(Boolean).length;
    const paragraphs = clean.split(/\n\s*\n/).filter(Boolean).length;
    return {
      characters: clean.length,
      words,
      paragraphs,
    };
  }, [generatedText]);

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_lorem_text",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!generatedText) return;
    const isHtml = asHtmlParagraphs && mode === "paragraphs";
    const filename = isHtml ? "lorem-ipsum.html" : "lorem-ipsum.txt";
    const mimeType = isHtml ? "text/html;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([generatedText], { type: mimeType });
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
      operation_type: "download_lorem_file",
    });
  };

  const applyPreset = (preset: PresetConfig) => {
    setMode(preset.mode);
    setQuantity(preset.quantity);
    setFlavor(preset.flavor);
    setStartWithLorem(preset.startWithLorem);
    setAsHtmlParagraphs(preset.asHtml);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Placeholder Generation Options
            </h2>
          </div>
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Format Mode
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(["paragraphs", "sentences", "words"] as PlaceholderMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleModeChange(m)}
                  className={`rounded-lg py-1.5 text-xs font-medium capitalize transition ${
                    mode === m
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider / Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="quantity-input" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quantity ({mode})
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {quantity}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="quantity-input"
                type="range"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700"
              />
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))}
                aria-label={`Quantity of ${mode}`}
                className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Vocabulary Flavor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vocabulary Flavor
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setFlavor("latin")}
                className={`rounded-lg py-1.5 text-xs font-medium transition ${
                  flavor === "latin"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Classic Latin
              </button>
              <button
                type="button"
                onClick={() => setFlavor("english")}
                className={`rounded-lg py-1.5 text-xs font-medium transition ${
                  flavor === "english"
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Mock English
              </button>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Output Formatting
            </label>
            <div className="flex flex-col gap-2 pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={startWithLorem && flavor === "latin"}
                  disabled={flavor !== "latin"}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                />
                Start with &ldquo;Lorem ipsum...&rdquo;
              </label>

              {mode === "paragraphs" && (
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={asHtmlParagraphs}
                    onChange={(e) => setAsHtmlParagraphs(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                  />
                  Wrap in &lt;p&gt; HTML tags
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {flavor === "latin"
              ? "Cicero-derived Latin vocabulary (de Finibus Bonorum et Malorum)."
              : "Modern UI/UX prototype sentences with clear legibility."}
          </p>
          <button
            type="button"
            onClick={executeGeneration}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Generate / Refresh
          </button>
        </div>
      </div>

      {/* Generated Output Area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pilcrow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Generated Dummy Text
            </h3>
            {asHtmlParagraphs && mode === "paragraphs" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                <FileCode className="h-3 w-3" /> HTML Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={executeGeneration}
              title="Re-roll randomized sentences"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          readOnly
          value={generatedText}
          rows={12}
          aria-label="Generated placeholder text output"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-sm leading-relaxed text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-indigo-400"
        />

        {/* Text Statistics Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <strong>{stats.paragraphs}</strong> {stats.paragraphs === 1 ? "Paragraph" : "Paragraphs"}
            </span>
            <span className="flex items-center gap-1.5">
              <AlignLeft className="h-4 w-4 text-slate-400" />
              <strong>{stats.words.toLocaleString()}</strong> Words
            </span>
            <span className="flex items-center gap-1.5">
              <Pilcrow className="h-4 w-4 text-slate-400" />
              <strong>{stats.characters.toLocaleString()}</strong> Characters
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Ready for mockups, prototypes, and typography tests</span>
          </div>
        </div>
      </div>

      {/* User Feedback Card */}
      <ToolFeedbackCard
        toolSlug={TOOL_SLUG}
        toolName="Lorem Ipsum Generator"
      />
    </div>
  );
}
