'use client';

import { useState, useId, useMemo } from "react";
import {
  Regex as RegexIcon,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Code,
  BookOpen,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  testRegularExpression,
  buildFlagsString,
  detectPotentialCatastrophicBacktracking,
  REGEX_LIBRARY_PRESETS,
  type RegexFlagsConfig,
  type RegexValidationResult,
  type RegexSamplePattern,
} from "@/lib/tools/regex-tester";
import { trackToolEvent } from "@/lib/analytics";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

const TOOL_SLUG = "regex-tester";
const TOOL_CATEGORY = "developer";

export function RegexTesterTool() {
  const baseId = useId();

  // Pattern and Text Inputs
  const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [testText, setTestText] = useState<string>(
    "Contact our engineering team at dev-support@onetoolhub.com or admin@company.org for assistance."
  );

  // Flags Configuration
  const [flags, setFlags] = useState<RegexFlagsConfig>({
    global: true,
    ignoreCase: true,
    multiline: false,
    dotAll: false,
    unicode: false,
  });

  const [copiedPattern, setCopiedPattern] = useState(false);
  const [copiedMatches, setCopiedMatches] = useState(false);

  // Real-time Regex Execution with Performance Safety
  const result: RegexValidationResult = useMemo(() => {
    return testRegularExpression(pattern, testText, flags);
  }, [pattern, testText, flags]);

  const flagsString = useMemo(() => buildFlagsString(flags), [flags]);

  const backtrackWarning = useMemo(() => {
    return detectPotentialCatastrophicBacktracking(pattern);
  }, [pattern]);

  const toggleFlag = (key: keyof RegexFlagsConfig) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyPattern = async () => {
    const fullLiteral = `/${pattern}/${flagsString}`;
    await navigator.clipboard.writeText(fullLiteral);
    setCopiedPattern(true);
    setTimeout(() => setCopiedPattern(false), 2000);
    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_pattern",
    });
  };

  const handleCopyMatches = async () => {
    if (result.matches.length === 0) return;
    const textMatches = result.matches.map((m) => m.fullMatch).join("\n");
    await navigator.clipboard.writeText(textMatches);
    setCopiedMatches(true);
    setTimeout(() => setCopiedMatches(false), 2000);
    trackToolEvent("tool_copy", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "copy_matches",
    });
  };

  const handleApplyPreset = (preset: RegexSamplePattern) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.sampleText);
    trackToolEvent("tool_process_start", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "apply_preset",
    });
  };

  const handleReset = () => {
    setPattern("");
    setTestText("");
    setFlags({
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
    });
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  };

  // Render Highlighted Match Overlay
  const highlightedOverlay = useMemo(() => {
    if (!result.valid || result.matches.length === 0 || !pattern || !testText) {
      return null;
    }

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    // Sort matches by start position ascending
    const sorted = [...result.matches].sort((a, b) => a.start - b.start);

    for (let i = 0; i < sorted.length; i++) {
      const m = sorted[i]!;
      if (m.start < lastIdx) continue; // Skip overlaps safely

      // Text before match
      if (m.start > lastIdx) {
        elements.push(
          <span key={`text-${lastIdx}`}>{testText.slice(lastIdx, m.start)}</span>
        );
      }

      // Matched segment
      elements.push(
        <mark
          key={`match-${i}-${m.start}`}
          className="bg-emerald-500/30 text-emerald-200 border-b-2 border-emerald-400 font-medium rounded-xs px-0.5"
          title={`Match #${i + 1}: index ${m.start}–${m.end}`}
        >
          {testText.slice(m.start, m.end)}
        </mark>
      );

      lastIdx = m.end;
    }

    // Trailing text
    if (lastIdx < testText.length) {
      elements.push(
        <span key={`text-tail`}>{testText.slice(lastIdx)}</span>
      );
    }

    return elements;
  }, [result, pattern, testText]);

  return (
    <div className="w-full space-y-8" aria-label="Regex Tester Workspace">
      {/* Pattern Input & Flag Selector Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold text-base">
            <RegexIcon className="w-5 h-5 text-emerald-400" />
            <span>Regular Expression Pattern</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPattern}
              disabled={!pattern}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              {copiedPattern ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Regex</span>
                </>
              )}
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

        {/* Pattern Input Row */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 focus-within:border-emerald-500/80 rounded-xl px-4 py-2 font-mono text-sm">
          <span className="text-zinc-500 select-none text-base">/</span>
          <input
            type="text"
            id={`${baseId}-pattern`}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. [a-z0-9_-]+@[a-z0-9.-]+\.[a-z]{2,}"
            className="flex-1 bg-transparent text-emerald-300 placeholder-zinc-600 focus:outline-hidden"
            autoComplete="off"
            spellCheck="false"
          />
          <span className="text-zinc-500 select-none text-base">/</span>
          <span className="text-emerald-400 font-semibold select-none">{flagsString}</span>
        </div>

        {/* Flags Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-850">
          <span className="text-xs font-medium text-zinc-400 mr-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            Flags:
          </span>
          {[
            { key: "global", label: "g (Global)", desc: "Find all matches rather than stopping after first" },
            { key: "ignoreCase", label: "i (Ignore Case)", desc: "Case-insensitive matching" },
            { key: "multiline", label: "m (Multiline)", desc: "^ and $ match line starts and ends" },
            { key: "dotAll", label: "s (DotAll)", desc: "Dot (.) matches newline characters" },
            { key: "unicode", label: "u (Unicode)", desc: "Treat pattern as full Unicode code points" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleFlag(item.key as keyof RegexFlagsConfig)}
              title={item.desc}
              className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                flags[item.key as keyof RegexFlagsConfig]
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-800/80 border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Syntax Error / Warning Alerts */}
        {!result.valid && result.error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="font-semibold">RegExp Syntax Error:</strong> {result.error}
            </div>
          </div>
        )}

        {backtrackWarning.suspicious && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="font-semibold">Potential ReDoS Warning:</strong> {backtrackWarning.warning}
            </div>
          </div>
        )}
      </div>

      {/* Test String & Highlight Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Test String */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${baseId}-test-text`}
              className="text-sm font-semibold text-zinc-200 flex items-center gap-2"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Test String</span>
            </label>
            <span className="text-xs text-zinc-500">
              {testText.length.toLocaleString()} characters
            </span>
          </div>

          <textarea
            id={`${baseId}-test-text`}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Paste or type test string to match against..."
            rows={10}
            className="w-full flex-1 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500/80 resize-y"
            spellCheck="false"
          />
        </div>

        {/* Highlighted Match Overlay Preview */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Interactive Match Highlight</span>
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400 font-mono font-medium">
                {result.totalMatches} {result.totalMatches === 1 ? "match" : "matches"}
              </span>
              <span className="text-zinc-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.executionTimeMs} ms
              </span>
            </div>
          </div>

          <div
            className="w-full flex-1 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-300 overflow-y-auto max-h-[250px] whitespace-pre-wrap break-words leading-relaxed"
            aria-live="polite"
          >
            {highlightedOverlay || (
              <span className="text-zinc-600 italic">No matches found in test string.</span>
            )}
          </div>
        </div>
      </div>

      {/* Match Results Table & Capture Groups */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Match Details & Capture Groups</span>
          </h3>

          {result.matches.length > 0 && (
            <button
              type="button"
              onClick={handleCopyMatches}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedMatches ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Matches</span>
                </>
              )}
            </button>
          )}
        </div>

        {result.matches.length === 0 ? (
          <p className="text-zinc-500 text-xs italic py-4">
            Enter a valid pattern and test string to view match positions and capture groups.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-950/60">
                  <th className="py-2.5 px-3 font-semibold">#</th>
                  <th className="py-2.5 px-3 font-semibold">Match Text</th>
                  <th className="py-2.5 px-3 font-semibold">Range (Indices)</th>
                  <th className="py-2.5 px-3 font-semibold">Length</th>
                  <th className="py-2.5 px-3 font-semibold">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {result.matches.slice(0, 50).map((m) => (
                  <tr key={`match-row-${m.index}`} className="hover:bg-zinc-850/40">
                    <td className="py-2 px-3 text-zinc-500">{m.index + 1}</td>
                    <td className="py-2 px-3 text-emerald-300 font-semibold max-w-[200px] truncate">
                      {m.fullMatch}
                    </td>
                    <td className="py-2 px-3 text-zinc-400">
                      [{m.start}, {m.end}]
                    </td>
                    <td className="py-2 px-3 text-zinc-400">{m.fullMatch.length} chars</td>
                    <td className="py-2 px-3 text-zinc-300">
                      {m.groups.length === 0 ? (
                        <span className="text-zinc-600">—</span>
                      ) : (
                        <div className="space-y-1">
                          {m.groups.map((grp) => (
                            <div key={`grp-${grp.index}`} className="inline-block mr-2 text-[11px]">
                              <span className="text-zinc-500">
                                {grp.name ? `${grp.name}:` : `$${grp.index}:`}
                              </span>{" "}
                              <span className="text-emerald-400 bg-zinc-950 px-1 py-0.5 rounded-sm">
                                {grp.value || '""'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.matches.length > 50 && (
              <p className="text-xs text-zinc-500 italic mt-2">
                Showing first 50 of {result.totalMatches} matches for performance.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preset Library Quick Picks */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Common Regex Presets & Templates</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REGEX_LIBRARY_PRESETS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleApplyPreset(item)}
              className="p-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-850/80 border border-zinc-800 text-left transition-all group cursor-pointer space-y-1.5"
            >
              <div className="font-semibold text-xs text-zinc-200 group-hover:text-emerald-400">
                {item.name}
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-1">{item.description}</p>
              <div className="font-mono text-[10px] text-emerald-400/80 truncate">
                /{item.pattern}/
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Security & Local Execution Badge */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span>
          <strong>Local Execution:</strong> Pattern evaluation runs strictly in your browser using ECMAScript RegExp. Your test data and expressions are never uploaded to any server.
        </span>
      </div>

      {/* Feedback Widget */}
      <ToolFeedbackCard toolSlug={TOOL_SLUG} toolName="Regex Tester & Debugger" />
    </div>
  );
}
