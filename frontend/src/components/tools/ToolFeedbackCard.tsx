"use client";

import { useEffect, useId, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  MessageSquarePlus,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import type { ValidToolSlug } from "@/lib/analytics";
import {
  clearStoredFeedbackDrafts,
  type FeedbackHelpfulVote,
  getStoredFeedbackDrafts,
  MAX_FEEDBACK_SUGGESTION_LENGTH,
  saveFeedbackDraftLocally,
  type ToolFeedbackSubmissionPayload,
  validateToolFeedback,
} from "@/lib/feedback";

interface ToolFeedbackCardProps {
  toolSlug: ValidToolSlug;
  toolName: string;
}

export function ToolFeedbackCard({
  toolSlug,
  toolName,
}: ToolFeedbackCardProps) {
  const formId = useId();
  const [helpful, setHelpful] = useState<FeedbackHelpfulVote | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [lastSubmittedAtMs, setLastSubmittedAtMs] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [savedEntry, setSavedEntry] =
    useState<ToolFeedbackSubmissionPayload | null>(null);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    const drafts = getStoredFeedbackDrafts().filter(
      (d) => d.toolSlug === toolSlug
    );
    setExistingCount(drafts.length);
  }, [toolSlug]);

  const handleSelectVote = (vote: FeedbackHelpfulVote) => {
    setHelpful(vote);
    setError(null);
    setSavedEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateToolFeedback({
      toolSlug,
      helpful: helpful ?? "",
      suggestion,
      honeypot,
      lastSubmittedAtMs,
    });

    if (!validation.valid || !validation.sanitized) {
      setError(validation.error ?? "Please check your feedback input.");
      return;
    }

    const entry = saveFeedbackDraftLocally(validation.sanitized);
    setSavedEntry(entry);
    setLastSubmittedAtMs(Date.now());
    setSuggestion("");
    setExistingCount((prev) => prev + 1);
  };

  const handleClearLocalFeedback = () => {
    clearStoredFeedbackDrafts(toolSlug);
    setSavedEntry(null);
    setHelpful(null);
    setSuggestion("");
    setError(null);
    setExistingCount(0);
  };

  return (
    <section
      data-testid="tool-feedback-card"
      aria-labelledby={`${formId}-heading`}
      className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-2xs sm:p-6 print:hidden"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span>Tool Feedback</span>
          </div>
          <h2
            id={`${formId}-heading`}
            className="mt-1 text-lg font-bold text-slate-900"
          >
            Was this tool helpful?
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
            Rate the <strong>{toolName}</strong> or leave an optional feature
            suggestion. Feedback is saved locally in your browser (
            <code>localStorage</code>) and no file or input data is collected.
          </p>
        </div>

        {/* Yes / No Vote Buttons */}
        <div
          role="group"
          aria-label={`Was the ${toolName} helpful?`}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => handleSelectVote("yes")}
            aria-pressed={helpful === "yes"}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm ${
              helpful === "yes"
                ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            <span>Yes</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectVote("no")}
            aria-pressed={helpful === "no"}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm ${
              helpful === "no"
                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            }`}
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            <span>No</span>
          </button>
        </div>
      </div>

      {/* Expandable Optional Suggestion Form */}
      {helpful !== null && !savedEntry ? (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-slate-200 pt-4">
          {/* Hidden Honeypot Field for Spam Prevention */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor={`${formId}-website-hp`}>
              Leave this field blank
            </label>
            <input
              id={`${formId}-website-hp`}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor={`${formId}-suggestion`}
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Optional Suggestion or Improvement Idea
              </label>
              <span className="text-xs text-slate-600">
                {suggestion.length} / {MAX_FEEDBACK_SUGGESTION_LENGTH} chars
              </span>
            </div>
            <textarea
              id={`${formId}-suggestion`}
              rows={3}
              maxLength={MAX_FEEDBACK_SUGGESTION_LENGTH}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Tell us what worked well or what feature would make this tool more useful (please do not paste sensitive data)..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900 sm:text-sm"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="flex items-start gap-2 text-xs text-slate-600">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                aria-hidden="true"
              />
              <span>
                <strong>Local Draft Storage Notice:</strong> OneToolHub currently
                runs without a backend database. Saving feedback stores a local
                draft in your browser&apos;s <code>localStorage</code> and does
                not transmit it to a remote server yet.
              </span>
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setHelpful(null);
                  setSuggestion("");
                  setError(null);
                }}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save Feedback Draft
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {/* Honest Submission Confirmation */}
      {savedEntry ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs leading-relaxed text-emerald-950 sm:text-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-bold text-emerald-950">
                  Feedback saved locally in your browser (Vote:{" "}
                  {savedEntry.helpful === "yes" ? "Yes" : "No"}).
                </p>
                <p className="mt-1 text-xs text-emerald-900">
                  Because OneToolHub currently operates as a client-side static
                  platform without a live backend server, this feedback entry is
                  saved as a local draft on your device and has{" "}
                  <strong>not</strong> been sent to the website operator yet.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearLocalFeedback}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear Local Drafts ({existingCount})</span>
            </button>
          </div>
        </div>
      ) : existingCount > 0 && helpful === null ? (
        <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-3 text-xs text-slate-600">
          <span>
            You have {existingCount} local feedback{" "}
            {existingCount === 1 ? "draft" : "drafts"} saved in this browser for{" "}
            {toolName}.
          </span>
          <button
            type="button"
            onClick={handleClearLocalFeedback}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 underline hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear Local Drafts</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
