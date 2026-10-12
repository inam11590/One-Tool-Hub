'use client';

import { useState, useId, useEffect, useMemo } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Calculator,
} from "lucide-react";
import {
  calculatePercentage,
  type PercentageCalcMode,
} from "@/lib/tools/percentage-calculator";
import { trackToolEvent } from "@/lib/analytics";

const TOOL_SLUG = "percentage-calculator";
const TOOL_CATEGORY = "student";

interface ModeConfig {
  id: PercentageCalcMode;
  title: string;
  labelX: string;
  labelY: string;
  defaultX: string;
  defaultY: string;
}

const MODES: readonly ModeConfig[] = [
  {
    id: "what-is-x-percent-of-y",
    title: "What is X% of Y?",
    labelX: "Percentage (X%)",
    labelY: "Total Value (Y)",
    defaultX: "15",
    defaultY: "250",
  },
  {
    id: "x-is-what-percent-of-y",
    title: "X is what % of Y?",
    labelX: "Part Value (X)",
    labelY: "Total Value (Y)",
    defaultX: "45",
    defaultY: "180",
  },
  {
    id: "percentage-change",
    title: "% Increase / Decrease (from X to Y)",
    labelX: "Initial Value (X)",
    labelY: "Final Value (Y)",
    defaultX: "80",
    defaultY: "100",
  },
  {
    id: "add-x-percent-to-y",
    title: "Add X% to Y (Markup / Tax)",
    labelX: "Percentage to Add (X%)",
    labelY: "Base Value (Y)",
    defaultX: "10",
    defaultY: "150",
  },
  {
    id: "subtract-x-percent-from-y",
    title: "Subtract X% from Y (Discount)",
    labelX: "Discount Percentage (X%)",
    labelY: "Original Price (Y)",
    defaultX: "20",
    defaultY: "80",
  },
] as const;

export function PercentageCalculatorTool() {
  const baseId = useId();
  const [activeMode, setActiveMode] =
    useState<PercentageCalcMode>("what-is-x-percent-of-y");
  const [valXStr, setValXStr] = useState("15");
  const [valYStr, setValYStr] = useState("250");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackToolEvent("tool_open", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  }, []);

  const currentModeConfig = useMemo(
    () => MODES.find((m) => m.id === activeMode) ?? MODES[0]!,
    [activeMode]
  );

  const numX = parseFloat(valXStr);
  const numY = parseFloat(valYStr);

  const result = useMemo(() => {
    if (!valXStr.trim() || !valYStr.trim()) {
      return null;
    }
    return calculatePercentage({
      mode: activeMode,
      valX: numX,
      valY: numY,
    });
  }, [activeMode, numX, numY, valXStr, valYStr]);

  const handleModeSelect = (mode: PercentageCalcMode) => {
    setActiveMode(mode);
    const cfg = MODES.find((m) => m.id === mode);
    if (cfg) {
      setValXStr(cfg.defaultX);
      setValYStr(cfg.defaultY);
    }
  };

  const handleCopy = async () => {
    if (!result?.valid) return;
    try {
      await navigator.clipboard.writeText(result.formattedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_percentage_result",
      });
    } catch {
      // Ignore clipboard error
    }
  };

  const handleReset = () => {
    if (
      (valXStr.trim() || valYStr.trim()) &&
      typeof window !== "undefined" &&
      !window.confirm("Reset calculator inputs?")
    ) {
      return;
    }
    setValXStr("");
    setValYStr("");
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset_percentage_calc",
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs sm:p-4">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Calculation Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeSelect(m.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activeMode === m.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs & Instant Calculation Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Input Form */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              {currentModeConfig.title}
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor={`${baseId}-val-x`}
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                {currentModeConfig.labelX}
              </label>
              <input
                id={`${baseId}-val-x`}
                type="number"
                step="any"
                value={valXStr}
                onChange={(e) => setValXStr(e.target.value)}
                placeholder="Enter number..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base font-semibold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor={`${baseId}-val-y`}
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                {currentModeConfig.labelY}
              </label>
              <input
                id={`${baseId}-val-y`}
                type="number"
                step="any"
                value={valYStr}
                onChange={(e) => setValYStr(e.target.value)}
                placeholder="Enter number..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base font-semibold text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-6 sm:p-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Calculated Result
            </span>

            {result?.valid ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
                  <span className="text-xs font-semibold text-indigo-700">Answer</span>
                  <div className="mt-1 text-3xl font-extrabold text-indigo-950 sm:text-4xl">
                    {result.formattedResult}
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-700">
                    {result.explanation}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  <span className="font-bold text-slate-600">Mathematical Formula:</span>
                  <p className="mt-1 font-mono text-slate-800">{result.formula}</p>
                </div>
              </div>
            ) : result?.error ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{result.error}</span>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <Calculator className="h-10 w-10 text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-xs">
                  Enter values in both fields to calculate results instantly.
                </p>
              </div>
            )}
          </div>

          {result?.valid && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                    <span>Copied Result!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copy Result</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
