'use client';

import { useState, useId, useEffect } from "react";
import { Copy, Check, RefreshCw, KeyRound, AlertCircle, ShieldCheck } from "lucide-react";
import {
  generateSecurePassword,
  evaluatePasswordStrength,
  DEFAULT_PASSWORD_OPTIONS,
  type PasswordGeneratorOptions,
} from "@/lib/tools/password-generator";
import { trackToolEvent } from "@/lib/analytics";

const TOOL_SLUG = "password-generator";
const TOOL_CATEGORY = "developer";

export function PasswordGeneratorTool() {
  const baseId = useId();
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate initial password on client mount
  useEffect(() => {
    const res = generateSecurePassword(DEFAULT_PASSWORD_OPTIONS);
    if (res.password) {
      setPassword(res.password);
    }
    trackToolEvent("tool_open", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
    });
  }, []);

  const handleGenerate = (customOptions: PasswordGeneratorOptions = options) => {
    setErrorMessage(null);
    const res = generateSecurePassword(customOptions);
    if (res.error) {
      setErrorMessage(res.error);
      trackToolEvent("tool_process_error", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "generate_password",
        error_category: "invalid_input",
      });
      return;
    }
    setPassword(res.password);
    setCopied(false);
    trackToolEvent("tool_process_success", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "generate_password",
    });
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_password",
      });
    } catch {
      // Clipboard write failed
    }
  };

  const handleLengthChange = (length: number) => {
    const nextOptions = { ...options, length };
    setOptions(nextOptions);
    handleGenerate(nextOptions);
  };

  const handleOptionToggle = (key: keyof Omit<PasswordGeneratorOptions, "length">) => {
    const nextOptions = { ...options, [key]: !options[key] };
    setOptions(nextOptions);
    handleGenerate(nextOptions);
  };

  const handleReset = () => {
    setOptions(DEFAULT_PASSWORD_OPTIONS);
    handleGenerate(DEFAULT_PASSWORD_OPTIONS);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset_password_options",
    });
  };

  const strength = evaluatePasswordStrength(password);

  return (
    <div className="space-y-6">
      {/* Generated Password Display Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <label htmlFor={`${baseId}-password-output`} className="sr-only">
              Generated Password
            </label>
            <input
              id={`${baseId}-password-output`}
              type="text"
              readOnly
              value={password}
              placeholder="Click Generate Password below"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-base font-semibold tracking-wider text-slate-900 shadow-inner select-all focus:border-indigo-600 focus:outline-hidden sm:text-lg"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => handleGenerate()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              title="Generate a new password"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Regenerate</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!password}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Strength Meter Bar */}
        {password && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">
                Strength: <span className="text-slate-900">{strength.label}</span>
              </span>
              <span className="text-slate-500">~{strength.entropyBits} bits entropy</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-2 rounded-full transition-colors ${
                    strength.score >= level ? strength.colorClass : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">{strength.feedback}</p>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-900"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Controls & Configuration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Password Settings
        </h2>

        {/* Length Slider */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${baseId}-length-slider`}
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Password Length: <span className="text-indigo-600 font-extrabold">{options.length}</span> characters
            </label>
            <span className="text-xs text-slate-500">Range: 8 – 128</span>
          </div>
          <input
            id={`${baseId}-length-slider`}
            type="range"
            min={8}
            max={128}
            value={options.length}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
          />
        </div>

        {/* Character Checkboxes */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={() => handleOptionToggle("includeUppercase")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <div>
              <span>Uppercase Letters (A-Z)</span>
              <p className="text-slate-500 font-normal">ABCDEF...</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={() => handleOptionToggle("includeLowercase")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <div>
              <span>Lowercase Letters (a-z)</span>
              <p className="text-slate-500 font-normal">abcdef...</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={() => handleOptionToggle("includeNumbers")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <div>
              <span>Numbers (0-9)</span>
              <p className="text-slate-500 font-normal">012345...</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={() => handleOptionToggle("includeSymbols")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <div>
              <span>Symbols &amp; Punctuation</span>
              <p className="text-slate-500 font-normal">!@#$%^&amp;*()_+-=...</p>
            </div>
          </label>
        </div>

        {/* Exclusion option */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={() => handleOptionToggle("excludeAmbiguous")}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <span>Exclude ambiguous characters (I, l, 1, O, 0, o, |) for easier typing</span>
          </label>
        </div>

        {/* Action button bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
          >
            Reset to Recommended Defaults
          </button>
          <button
            type="button"
            onClick={() => handleGenerate()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            <span>Generate New Password</span>
          </button>
        </div>
      </div>

      {/* Security Privacy Assurance */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-relaxed text-emerald-950">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="font-bold">Zero-Knowledge Security Assurance:</strong> Passwords are generated exclusively on your device using the browser&apos;s cryptographic engine (<code>crypto.getRandomValues</code>). Generated passwords are never transmitted over the network, never logged, and never stored in browser memory.
        </div>
      </div>
    </div>
  );
}
