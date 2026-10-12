'use client';

import { useState, useId, useMemo } from "react";
import {
  Fingerprint,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck,
  Hash,
} from "lucide-react";
import {
  generateBulkUuids,
  validateUuidString,
  type UuidFormatOptions,
  type UuidValidationDetails,
  MAX_BULK_UUID_COUNT,
} from "@/lib/tools/uuid-generator";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "uuid-generator";
const TOOL_CATEGORY = "developer";

export function UuidGeneratorTool() {
  const baseId = useId();

  // Generator State
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [generatedList, setGeneratedList] = useState<string[]>(() =>
    generateBulkUuids(5, { uppercase: false, hyphens: true, braces: false })
  );

  // Validator State
  const [candidateInput, setCandidateInput] = useState<string>(
    "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  );
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Validation Result
  const validationResult: UuidValidationDetails = useMemo(() => {
    return validateUuidString(candidateInput);
  }, [candidateInput]);

  const handleGenerate = () => {
    const opts: UuidFormatOptions = { uppercase, hyphens, braces };
    const list = generateBulkUuids(quantity, opts);
    setGeneratedList(list);
    trackToolEvent("tool_process_start", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "generate_bulk_uuid",
    });
  };

  const handleCopySingle = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_single_uuid",
    });
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(generatedList.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_all_uuids",
    });
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generatedList.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${generatedList.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_uuid_txt",
    });
  };

  const handleReset = () => {
    setQuantity(5);
    setUppercase(false);
    setHyphens(true);
    setBraces(false);
    const list = generateBulkUuids(5, { uppercase: false, hyphens: true, braces: false });
    setGeneratedList(list);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  return (
    <div className="w-full space-y-8" aria-label="UUID Generator & Validator Workspace">
      {/* Generator Configuration Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold text-base">
            <Fingerprint className="w-5 h-5 text-emerald-400" />
            <span>Generate Cryptographic UUID v4 Identifiers</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={generatedList.length === 0}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied All</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              disabled={generatedList.length === 0}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Options Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 border-t border-zinc-850">
          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-zinc-500" />
              Quantity (1 - {MAX_BULK_UUID_COUNT}):
            </label>
            <input
              type="number"
              min="1"
              max={MAX_BULK_UUID_COUNT}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(MAX_BULK_UUID_COUNT, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-sm focus:outline-hidden focus:border-emerald-500/80"
            />
          </div>

          {/* Uppercase Toggle */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setUppercase((prev) => !prev)}
              className={`w-full py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                uppercase
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Uppercase (A-F)
            </button>
          </div>

          {/* Hyphens Toggle */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setHyphens((prev) => !prev)}
              className={`w-full py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                hyphens
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Standard Hyphens (-)
            </button>
          </div>

          {/* Braces Toggle */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setBraces((prev) => !prev)}
              className={`w-full py-2 px-3 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                braces
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Curly Braces &#123; &#125;
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Regenerate UUIDs</span>
          </button>
        </div>

        {/* Generated UUIDs Display List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Generated Output ({generatedList.length} items):</span>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2 rounded-xl bg-zinc-950 p-3 border border-zinc-800 font-mono text-xs">
            {generatedList.map((uuid, idx) => (
              <div
                key={`uuid-${idx}`}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 text-[11px] select-none w-6">{idx + 1}.</span>
                  <span className="text-emerald-300 font-medium select-all break-all">{uuid}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySingle(uuid, idx)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-2"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UUID Validator & Inspector */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>UUID Format Validator & Version Detector</span>
        </div>

        <div className="space-y-2">
          <label htmlFor={`${baseId}-candidate`} className="text-xs font-medium text-zinc-400">
            Enter UUID or GUID to Validate:
          </label>
          <input
            type="text"
            id={`${baseId}-candidate`}
            value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
            placeholder="e.g. f47ac10b-58cc-4372-a567-0e02b2c3d479 or {f47ac10b-...}"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-sm focus:outline-hidden focus:border-emerald-500/80"
            spellCheck="false"
          />
        </div>

        {/* Validation Result Box */}
        {candidateInput.trim() && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 font-mono ${
              validationResult.valid
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {validationResult.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valid UUID String</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Invalid UUID Format</span>
                </>
              )}
            </div>

            {validationResult.valid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans text-xs">
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-500">Detected Version:</span>{" "}
                  <strong className="text-zinc-200 font-mono">
                    {validationResult.version === "nil"
                      ? "Nil UUID (all zeros)"
                      : `Version ${validationResult.version} (${
                          validationResult.version === 4
                            ? "Random / Pseudo-Random"
                            : validationResult.version === 1
                            ? "Date-Time & MAC"
                            : validationResult.version === 5
                            ? "SHA-1 Name-based"
                            : "Standard"
                        })`}
                  </strong>
                </div>
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-500">RFC Variant:</span>{" "}
                  <strong className="text-zinc-200 font-mono">{validationResult.variant}</strong>
                </div>
              </div>
            ) : (
              <p className="text-rose-400">{validationResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>
          <strong>Local Execution:</strong> UUID generation uses native `crypto.randomUUID()` with Web Crypto entropy. Identifiers are never logged or transmitted over the network.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="UUID Generator & Validator" />
    </div>
  );
}
