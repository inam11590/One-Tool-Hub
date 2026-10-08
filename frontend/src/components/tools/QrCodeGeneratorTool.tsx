"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  DEFAULT_QR_SIZE_PX,
  generateQrCodeAssets,
  MAX_QR_INPUT_LENGTH,
  MAX_QR_SIZE_PX,
  MIN_QR_SIZE_PX,
  type QrGenerationResult,
} from "@/lib/tools/qr-code-generator";
import { trackToolEvent } from "@/lib/analytics";
import { reportToolProcessingError } from "@/lib/error-monitoring";

const TOOL_SLUG = "qr-code-generator";
const TOOL_CATEGORY = "freelancer";

const DEFAULT_QR_TEXT = "https://example.com";
const DEFAULT_FG_COLOR = "#0F172A";
const DEFAULT_BG_COLOR = "#FFFFFF";

export function QrCodeGeneratorTool() {
  const [text, setText] = useState<string>(DEFAULT_QR_TEXT);
  const [size, setSize] = useState<number>(DEFAULT_QR_SIZE_PX);
  const [foregroundColor, setForegroundColor] =
    useState<string>(DEFAULT_FG_COLOR);
  const [backgroundColor, setBackgroundColor] =
    useState<string>(DEFAULT_BG_COLOR);
  const [qrResult, setQrResult] = useState<QrGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    generateQrCodeAssets({
      text,
      size,
      foregroundColor,
      backgroundColor,
    }).then((res) => {
      if (active) {
        setQrResult(res);
        if (!res.valid && res.error && text.trim().length > 0) {
          reportToolProcessingError(
            TOOL_SLUG,
            TOOL_CATEGORY,
            "generate_qr",
            res.error
          );
        }
      }
    });
    return () => {
      active = false;
    };
  }, [text, size, foregroundColor, backgroundColor]);

  const handleCopyInput = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("tool_copy", {
        tool_slug: TOOL_SLUG,
        tool_category: TOOL_CATEGORY,
        operation_type: "copy_qr_input",
      });
    } catch {
      reportToolProcessingError(
        TOOL_SLUG,
        TOOL_CATEGORY,
        "copy_qr_input",
        "clipboard failed",
        "clipboard_error"
      );
    }
  };

  const handleDownloadPng = () => {
    if (!qrResult?.valid || !qrResult.pngDataUrl) return;
    const link = document.createElement("a");
    link.href = qrResult.pngDataUrl;
    link.download = `qrcode-${size}px.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_png",
    });
  };

  const handleDownloadSvg = () => {
    if (!qrResult?.valid || !qrResult.svgString) return;
    const blob = new Blob([qrResult.svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode-${size}px.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackToolEvent("tool_download", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "download_svg",
    });
  };

  const handleReset = () => {
    setText(DEFAULT_QR_TEXT);
    setSize(DEFAULT_QR_SIZE_PX);
    setForegroundColor(DEFAULT_FG_COLOR);
    setBackgroundColor(DEFAULT_BG_COLOR);
    setCopied(false);
    trackToolEvent("tool_reset", {
      tool_slug: TOOL_SLUG,
      tool_category: TOOL_CATEGORY,
      operation_type: "reset",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Configuration Column */}
        <div className="space-y-6 lg:col-span-7">
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="qr-input-text"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Website URL or Text Content
              </label>
              <span className="text-xs text-slate-500">
                {text.length} / {MAX_QR_INPUT_LENGTH} chars
              </span>
            </div>
            <textarea
              id="qr-input-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a URL (https://...) or text to encode..."
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyInput}
                disabled={!text.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>Copied Input</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Input Text</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setText("")}
                disabled={!text}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Clear Text</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Size & Color Controls */}
          <div className="grid grid-cols-1 gap-5 border-t border-slate-200 pt-5 sm:grid-cols-3">
            {/* Size Slider */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="qr-size-range"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Size ({size} px)
                </label>
              </div>
              <input
                id="qr-size-range"
                type="range"
                min={MIN_QR_SIZE_PX}
                max={MAX_QR_SIZE_PX}
                step={32}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>{MIN_QR_SIZE_PX}px</span>
                <span>{MAX_QR_SIZE_PX}px</span>
              </div>
            </div>

            {/* Foreground Color */}
            <div>
              <label
                htmlFor="qr-fg-color"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Foreground Color
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="qr-fg-color"
                  type="color"
                  value={foregroundColor}
                  onChange={(e) =>
                    setForegroundColor(e.target.value.toUpperCase())
                  }
                  className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                />
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {foregroundColor}
                </span>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label
                htmlFor="qr-bg-color"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Background Color
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="qr-bg-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) =>
                    setBackgroundColor(e.target.value.toUpperCase())
                  }
                  className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                />
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {backgroundColor}
                </span>
              </div>
            </div>
          </div>

          {/* Validation or Contrast Feedback */}
          {qrResult && !qrResult.valid && qrResult.error ? (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <span>{qrResult.error}</span>
            </div>
          ) : null}

          {qrResult?.valid && qrResult.contrastWarning ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <span>{qrResult.contrastWarning}</span>
            </div>
          ) : null}
        </div>

        {/* Right Preview & Download Column */}
        <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:col-span-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live QR Preview (Quiet Zone Included)
            </p>
          </div>

          <div className="my-6 flex min-h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            {qrResult?.valid && qrResult.pngDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrResult.pngDataUrl}
                alt="Generated QR code"
                width={Math.min(size, 260)}
                height={Math.min(size, 260)}
                className="h-auto max-w-full rounded-lg"
              />
            ) : (
              <p className="px-4 text-center text-xs text-slate-400">
                Enter valid text or a URL on the left to generate your QR code.
              </p>
            )}
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!qrResult?.valid}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={!qrResult?.valid}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
