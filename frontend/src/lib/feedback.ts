import { VALID_TOOL_SLUGS, type ValidToolSlug } from "./analytics.ts";

export const FEEDBACK_STORAGE_KEY = "onetoolhub_tool_feedback_drafts_v1";
export const MAX_FEEDBACK_SUGGESTION_LENGTH = 500;
export const MAX_STORED_FEEDBACK_ITEMS = 25;
export const FEEDBACK_COOLDOWN_MS = 15_000; // 15 seconds per tool spam prevention

export type FeedbackHelpfulVote = "yes" | "no";

/**
 * Typed Feedback API Contract reserved for future backend integration (e.g., FastAPI POST /api/v1/feedback).
 * Explicitly excludes any uploaded files, tool inputs, or personally identifiable information.
 */
export interface ToolFeedbackSubmissionPayload {
  id: string;
  toolSlug: ValidToolSlug;
  helpful: FeedbackHelpfulVote;
  suggestion: string;
  createdAt: string;
  storageMode: "local-browser-draft";
}

export interface ToolFeedbackValidationInput {
  toolSlug: string;
  helpful: string;
  suggestion?: string;
  honeypot?: string;
  lastSubmittedAtMs?: number | null;
  nowMs?: number;
}

export interface ToolFeedbackValidationResult {
  valid: boolean;
  sanitized?: {
    toolSlug: ValidToolSlug;
    helpful: FeedbackHelpfulVote;
    suggestion: string;
  };
  error?: string;
}

/**
 * Strips non-printable control characters (except standard newlines/tabs) and trims text safely.
 */
export function sanitizeFeedbackText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

/**
 * Validates user feedback input, enforcing tool slug validity, yes/no vote,
 * 500-character suggestion limit, honeypot spam check, and rate-limit cooldown.
 */
export function validateToolFeedback(
  input: ToolFeedbackValidationInput
): ToolFeedbackValidationResult {
  // 1. Honeypot spam protection
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return {
      valid: false,
      error: "Automated submission rejected.",
    };
  }

  // 2. Validate tool slug
  const slug = typeof input.toolSlug === "string" ? input.toolSlug.trim() : "";
  if (!(VALID_TOOL_SLUGS as readonly string[]).includes(slug)) {
    return {
      valid: false,
      error: "Invalid tool identifier.",
    };
  }

  // 3. Validate Yes/No vote
  if (input.helpful !== "yes" && input.helpful !== "no") {
    return {
      valid: false,
      error: "Please select Yes or No to indicate whether this tool was helpful.",
    };
  }

  // 4. Rate-limit cooldown check
  const now = input.nowMs ?? Date.now();
  if (
    typeof input.lastSubmittedAtMs === "number" &&
    now - input.lastSubmittedAtMs < FEEDBACK_COOLDOWN_MS
  ) {
    const remainingSec = Math.ceil(
      (FEEDBACK_COOLDOWN_MS - (now - input.lastSubmittedAtMs)) / 1000
    );
    return {
      valid: false,
      error: `Please wait ${remainingSec} seconds before saving another feedback entry for this tool.`,
    };
  }

  // 5. Sanitize and check suggestion length
  const sanitizedSuggestion = sanitizeFeedbackText(input.suggestion ?? "");
  if (sanitizedSuggestion.length > MAX_FEEDBACK_SUGGESTION_LENGTH) {
    return {
      valid: false,
      error: `Suggestion must be ${MAX_FEEDBACK_SUGGESTION_LENGTH} characters or fewer (currently ${sanitizedSuggestion.length} characters).`,
    };
  }

  return {
    valid: true,
    sanitized: {
      toolSlug: slug as ValidToolSlug,
      helpful: input.helpful,
      suggestion: sanitizedSuggestion,
    },
  };
}

/**
 * Reads locally saved feedback drafts from browser localStorage.
 */
export function getStoredFeedbackDrafts(): ToolFeedbackSubmissionPayload[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.slice(0, MAX_STORED_FEEDBACK_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Saves a validated feedback entry as a local browser draft in localStorage.
 * Does NOT claim that the feedback was sent to a remote backend server.
 */
export function saveFeedbackDraftLocally(
  validated: NonNullable<ToolFeedbackValidationResult["sanitized"]>
): ToolFeedbackSubmissionPayload {
  const entry: ToolFeedbackSubmissionPayload = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    toolSlug: validated.toolSlug,
    helpful: validated.helpful,
    suggestion: validated.suggestion,
    createdAt: new Date().toISOString(),
    storageMode: "local-browser-draft",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getStoredFeedbackDrafts();
      const updated = [entry, ...existing].slice(0, MAX_STORED_FEEDBACK_ITEMS);
      window.localStorage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore localStorage quota errors
    }
  }

  return entry;
}

/**
 * Clears locally stored feedback drafts for a specific tool or all tools.
 */
export function clearStoredFeedbackDrafts(toolSlug?: ValidToolSlug): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!toolSlug) {
      window.localStorage.removeItem(FEEDBACK_STORAGE_KEY);
      return;
    }
    const remaining = getStoredFeedbackDrafts().filter(
      (item) => item.toolSlug !== toolSlug
    );
    if (remaining.length === 0) {
      window.localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify(remaining)
      );
    }
  } catch {
    // Ignore storage errors
  }
}
