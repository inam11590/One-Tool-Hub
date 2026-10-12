'use client';

import { useState, useMemo } from "react";
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";
import {
  convertTextCase,
  getTextStatistics,
  SAMPLE_TEXT_CASE_CONTENT,
  type CaseConversionType,
} from "@/lib/tools/text-case-converter";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "text-case-converter";
const TOOL_CATEGORY = "student";

const CASE_BUTTONS: { type: CaseConversionType; label: string; sample: string; description: string }[] = [
  { type: "uppercase", label: "UPPERCASE", sample: "HELLO WORLD", description: "All letters converted to capital characters." },
  { type: "lowercase", label: "lowercase", sample: "hello world", description: "All letters converted to lowercase characters." },
  { type: "titlecase", label: "Title Case", sample: "The Old Man and the Sea", description: "AP/Chicago style: major words capitalized, minor articles/prepositions lowercase." },
  { type: "sentencecase", label: "Sentence case", sample: "The quick brown fox. It jumps.", description: "First letter of each sentence capitalized after periods, questions, or exclamations." },
  { type: "capitalizeWords", label: "Capitalize Each Word", sample: "Hello World Every Word", description: "First letter of every word capitalized unconditionally." },
  { type: "togglecase", label: "tOGGLE cASE", sample: "hELLO wORLD", description: "Inverts character casing throughout the document." },
  { type: "camelcase", label: "camelCase", sample: "helloWorldExample", description: "Words joined together with initial word lowercase." },
  { type: "kebabcase", label: "kebab-case", sample: "hello-world-example", description: "Words separated by hyphens in lowercase." },
  { type: "snakecase", label: "snake_case", sample: "hello_world_example", description: "Words separated by underscores in lowercase." },
  { type: "constantcase", label: "CONSTANT_CASE", sample: "HELLO_WORLD_EXAMPLE", description: "Words separated by underscores in uppercase." },
];

export function TextCaseConverterTool() {
  const [inputText, setInputText] = useState<string>("");
  const [activeCase, setActiveCase] = useState<CaseConversionType>("titlecase");
  const [copied, setCopied] = useState<boolean>(false);

  // Derive transformed text
  const convertedText = useMemo(() => {
    return convertTextCase(inputText, activeCase);
  }, [inputText, activeCase]);

  // Derive statistics
  const stats = useMemo(() => {
    return getTextStatistics(inputText);
  }, [inputText]);

  const handleCopy = async () => {
    if (!convertedText) return;
    try {
      await navigator.clipboard.writeText(convertedText);
      setCopied(true);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_converted_text",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!convertedText) return;
    const blob = new Blob([convertedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onetoolhub-${activeCase}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_text_file",
    });
  };

  const handleClear = () => {
    setInputText("");
    setCopied(false);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT_CASE_CONTENT);
    setActiveCase("titlecase");
  };

  const handleSelectCase = (caseType: CaseConversionType) => {
    setActiveCase(caseType);
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "apply_case_conversion",
    });
  };

  return (
    <div className="space-y-8">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Private & Local:</strong> Your text is processed entirely inside your browser. No paragraphs or documents are uploaded to any server.
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

      {/* Case Options Selection Bar */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Select Target Text Case:
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {CASE_BUTTONS.map((btn) => {
            const isSelected = activeCase === btn.type;
            return (
              <button
                key={btn.type}
                type="button"
                onClick={() => handleSelectCase(btn.type)}
                className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                <span className="text-xs font-semibold">{btn.label}</span>
                <span className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {btn.sample}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input and Output Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Box */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
            placeholder="Type or paste your text here (essays, articles, titles, codes)..."
            rows={12}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900"
          />

          {/* Real-time Statistics Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            <span>
              <strong>{stats.characterCount.toLocaleString()}</strong> Characters
            </span>
            <span>
              <strong>{stats.characterCountNoSpaces.toLocaleString()}</strong> No Spaces
            </span>
            <span>
              <strong>{stats.wordCount.toLocaleString()}</strong> Words
            </span>
            <span>
              <strong>{stats.lineCount.toLocaleString()}</strong> Lines
            </span>
          </div>
        </div>

        {/* Output Box */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Converted Output
              </h2>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {CASE_BUTTONS.find((b) => b.type === activeCase)?.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!convertedText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!convertedText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-3.5 w-3.5" />
                .txt
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={convertedText}
            placeholder="Converted text will display here automatically..."
            rows={12}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:placeholder-slate-500"
          />

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            <span>
              {CASE_BUTTONS.find((b) => b.type === activeCase)?.description}
            </span>
          </div>
        </div>
      </div>

      {/* User Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="Text Case Converter" />
    </div>
  );
}
