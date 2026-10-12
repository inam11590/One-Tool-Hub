'use client';

import { useState, useId, useMemo, useRef } from "react";
import {
  GitCompare,
  Copy,
  Check,
  RotateCcw,
  Upload,
  Download,
  ArrowLeftRight,
  Sliders,
  FileCode,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import {
  computeCodeDiff,
  SAMPLE_CODE_DIFF,
  type DiffViewMode,
  type DiffOptions,
  type DiffComputationResult,
} from "@/lib/tools/code-diff-checker";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "code-diff-checker";
const TOOL_CATEGORY = "developer";

export function CodeDiffCheckerTool() {
  const baseId = useId();
  const fileInputLeftRef = useRef<HTMLInputElement>(null);
  const fileInputRightRef = useRef<HTMLInputElement>(null);

  // Text Inputs
  const [originalText, setOriginalText] = useState<string>(SAMPLE_CODE_DIFF.original);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLE_CODE_DIFF.modified);

  // Configuration
  const [viewMode, setViewMode] = useState<DiffViewMode>("side-by-side");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);

  const [copiedDiff, setCopiedDiff] = useState(false);

  // Compute Diff
  const diffResult: DiffComputationResult = useMemo(() => {
    const options: DiffOptions = {
      viewMode,
      ignoreWhitespace,
      ignoreCase,
    };
    return computeCodeDiff(originalText, modifiedText, options);
  }, [originalText, modifiedText, viewMode, ignoreWhitespace, ignoreCase]);

  const handleSwapInputs = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
    trackToolEvent("tool_process_start", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "swap_inputs",
    });
  };

  const handleCopyPatch = async () => {
    await navigator.clipboard.writeText(diffResult.patchString);
    setCopiedDiff(true);
    setTimeout(() => setCopiedDiff(false), 2000);
    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_patch",
    });
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([diffResult.patchString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "changes.patch";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_patch",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "left" | "right") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === "string") {
        if (target === "left") setOriginalText(content);
        else setModifiedText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setOriginalText("");
    setModifiedText("");
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  return (
    <div className="w-full space-y-8" aria-label="Code Diff Checker Workspace">
      {/* Configuration Header Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold text-base">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            <span>Comparison Settings & Statistics</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwapInputs}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap Inputs</span>
            </button>
            <button
              type="button"
              onClick={handleCopyPatch}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedDiff ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Patch</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadPatch}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .patch</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Diff Options & Mode Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-zinc-850">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-400 mr-2 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              View:
            </span>
            <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode("side-by-side")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "side-by-side"
                    ? "bg-emerald-500 text-zinc-950 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode("unified")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === "unified"
                    ? "bg-emerald-500 text-zinc-950 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Unified
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIgnoreWhitespace((prev) => !prev)}
              className={`ml-2 px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                ignoreWhitespace
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ignore Whitespace
            </button>
            <button
              type="button"
              onClick={() => setIgnoreCase((prev) => !prev)}
              className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                ignoreCase
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ignore Case
            </button>
          </div>

          {/* Change Stats Pills */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <Plus className="w-3 h-3" />
              {diffResult.stats.addedCount} additions
            </span>
            <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              <Minus className="w-3 h-3" />
              {diffResult.stats.removedCount} deletions
            </span>
            <span className="text-zinc-500">
              {diffResult.stats.totalLines} total lines
            </span>
          </div>
        </div>
      </div>

      {/* Editor Inputs (Collapsible or Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Text Input */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${baseId}-orig`}
              className="text-sm font-semibold text-zinc-200 flex items-center gap-2"
            >
              <FileCode className="w-4 h-4 text-rose-400" />
              <span>Original Text / Code</span>
            </label>
            <div>
              <input
                ref={fileInputLeftRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "left")}
              />
              <button
                type="button"
                onClick={() => fileInputLeftRef.current?.click()}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
          <textarea
            id={`${baseId}-orig`}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original code or text here..."
            rows={8}
            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/80 resize-y"
            spellCheck="false"
          />
        </div>

        {/* Modified Text Input */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${baseId}-mod`}
              className="text-sm font-semibold text-zinc-200 flex items-center gap-2"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Modified Text / Code</span>
            </label>
            <div>
              <input
                ref={fileInputRightRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "right")}
              />
              <button
                type="button"
                onClick={() => fileInputRightRef.current?.click()}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
          <textarea
            id={`${baseId}-mod`}
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified code or text here..."
            rows={8}
            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/80 resize-y"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Visual Diff Rendering Output */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Interactive Difference Viewer</span>
        </h3>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 font-mono text-xs overflow-x-auto">
          {viewMode === "side-by-side" ? (
            /* Side-by-Side Table */
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <th className="w-12 py-2 px-2 text-right border-r border-zinc-850">#</th>
                  <th className="py-2 px-3 text-left w-1/2 border-r border-zinc-800">Original</th>
                  <th className="w-12 py-2 px-2 text-right border-r border-zinc-850">#</th>
                  <th className="py-2 px-3 text-left w-1/2">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/80">
                {diffResult.sideBySideRows.map((row, idx) => (
                  <tr key={`diff-row-${idx}`} className="hover:bg-zinc-900/30">
                    {/* Left Side */}
                    <td className="py-1 px-2 text-right text-zinc-600 select-none border-r border-zinc-850">
                      {row.left.originalLineNumber ?? ""}
                    </td>
                    <td
                      className={`py-1 px-3 whitespace-pre-wrap break-all border-r border-zinc-800 ${
                        row.left.type === "removed"
                          ? "bg-rose-500/15 text-rose-300"
                          : row.left.type === "empty"
                          ? "bg-zinc-950/40"
                          : "text-zinc-300"
                      }`}
                    >
                      {row.left.type === "removed" && (
                        <span className="text-rose-400 mr-1 select-none">-</span>
                      )}
                      {row.left.content}
                    </td>

                    {/* Right Side */}
                    <td className="py-1 px-2 text-right text-zinc-600 select-none border-r border-zinc-850">
                      {row.right.modifiedLineNumber ?? ""}
                    </td>
                    <td
                      className={`py-1 px-3 whitespace-pre-wrap break-all ${
                        row.right.type === "added"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : row.right.type === "empty"
                          ? "bg-zinc-950/40"
                          : "text-zinc-300"
                      }`}
                    >
                      {row.right.type === "added" && (
                        <span className="text-emerald-400 mr-1 select-none">+</span>
                      )}
                      {row.right.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Unified Table */
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
                  <th className="w-12 py-2 px-2 text-right border-r border-zinc-850">Orig</th>
                  <th className="w-12 py-2 px-2 text-right border-r border-zinc-800">Mod</th>
                  <th className="py-2 px-3 text-left">Code Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/80">
                {diffResult.unifiedLines.map((line, idx) => (
                  <tr
                    key={`unified-line-${idx}`}
                    className={`hover:bg-zinc-900/30 ${
                      line.type === "added"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : line.type === "removed"
                        ? "bg-rose-500/15 text-rose-300"
                        : "text-zinc-300"
                    }`}
                  >
                    <td className="py-1 px-2 text-right text-zinc-600 select-none border-r border-zinc-850">
                      {line.originalLineNumber ?? ""}
                    </td>
                    <td className="py-1 px-2 text-right text-zinc-600 select-none border-r border-zinc-800">
                      {line.modifiedLineNumber ?? ""}
                    </td>
                    <td className="py-1 px-3 whitespace-pre-wrap break-all">
                      <span className="mr-2 select-none font-bold">
                        {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                      </span>
                      {line.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Security & Local Execution Badge */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>
          <strong>Local Execution:</strong> Line comparison runs completely inside your browser memory using the Myers diff algorithm. Neither input code nor diff patches are ever transmitted across the network.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="Code Diff Checker" />
    </div>
  );
}
