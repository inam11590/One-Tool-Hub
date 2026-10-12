import {
  type ErrorCategory,
  ERROR_CATEGORIES,
  trackToolEvent,
  type ValidToolSlug,
} from "./analytics.ts";
import type { ToolCategoryId } from "@/types/tools";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export type StandardErrorType =
  | "ValidationError"
  | "ProcessingError"
  | "FileError"
  | "BrowserCompatibilityError"
  | "NetworkError"
  | "UnexpectedApplicationError";

/**
 * Base Application Error class with standardized severity and safe user messaging.
 */
export abstract class BaseApplicationError extends Error {
  public abstract readonly errorType: StandardErrorType;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly safeMessage: string;
  public readonly timestamp: string;

  constructor(options: {
    message: string;
    safeMessage?: string;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
  }) {
    super(options.message);
    this.name = this.constructor.name;
    this.category = options.category ?? "processing_error";
    this.severity = options.severity ?? "error";
    this.safeMessage =
      options.safeMessage ??
      "An unexpected issue occurred while processing your request. Your local data remains safe.";
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends BaseApplicationError {
  public readonly errorType: StandardErrorType = "ValidationError";
  constructor(message = "Invalid input data provided", safeMessage?: string) {
    super({
      message,
      safeMessage: safeMessage ?? "Please verify your input parameters and try again.",
      category: "invalid_input",
      severity: "warning",
    });
  }
}

export class ProcessingError extends BaseApplicationError {
  public readonly errorType: StandardErrorType = "ProcessingError";
  constructor(message = "Failed to process data", safeMessage?: string) {
    super({
      message,
      safeMessage:
        safeMessage ?? "An error occurred during local processing. Please try again.",
      category: "processing_error",
      severity: "error",
    });
  }
}

export class FileError extends BaseApplicationError {
  public readonly errorType: StandardErrorType = "FileError";
  constructor(
    message = "File operation failed",
    category: ErrorCategory = "corrupted_file",
    safeMessage?: string
  ) {
    super({
      message,
      safeMessage:
        safeMessage ??
        "The selected file could not be processed. Please check file format and size.",
      category,
      severity: "error",
    });
  }
}

export class BrowserCompatibilityError extends BaseApplicationError {
  public readonly errorType: StandardErrorType = "BrowserCompatibilityError";
  constructor(featureName = "feature", safeMessage?: string) {
    super({
      message: `Browser does not support required API: ${featureName}`,
      safeMessage:
        safeMessage ??
        "Your browser does not support a required feature for this tool. Please update your browser.",
      category: "runtime_boundary_error",
      severity: "warning",
    });
  }
}

export class NetworkError extends BaseApplicationError {
  public readonly errorType: StandardErrorType = "NetworkError";
  constructor(message = "Network connectivity issue", safeMessage?: string) {
    super({
      message,
      safeMessage:
        safeMessage ??
        "A network connection issue was detected. Please check your internet connection.",
      category: "processing_error",
      severity: "warning",
    });
  }
}

export class UnexpectedApplicationError extends BaseApplicationError {
  public readonly errorType: StandardErrorType = "UnexpectedApplicationError";
  constructor(message = "Unexpected application failure", safeMessage?: string) {
    super({
      message,
      safeMessage:
        safeMessage ??
        "An unexpected error occurred. Your local data has not been transmitted anywhere.",
      category: "runtime_boundary_error",
      severity: "critical",
    });
  }
}

export interface SanitizedErrorReport {
  timestamp: string;
  errorCategory: ErrorCategory;
  errorType?: StandardErrorType;
  severity?: ErrorSeverity;
  toolSlug?: ValidToolSlug;
  operationType?: string;
  boundaryName?: string;
  durationMsBucket?: "<100ms" | "100-500ms" | "500ms-2s" | ">2s";
}

export interface ErrorMonitoringConfig {
  enabled: boolean;
  dsn: string | null;
}

/**
 * Reads whether optional external error monitoring is configured via environment variables.
 * Monitoring is strictly disabled by default unless NEXT_PUBLIC_ERROR_MONITORING_ENABLED="true".
 */
export function getErrorMonitoringConfig(options?: {
  enabledEnv?: string;
  dsnEnv?: string;
}): ErrorMonitoringConfig {
  const rawEnabled =
    options?.enabledEnv ?? process.env.NEXT_PUBLIC_ERROR_MONITORING_ENABLED;
  const rawDsn =
    options?.dsnEnv ?? process.env.NEXT_PUBLIC_ERROR_MONITORING_DSN;

  const dsn = rawDsn?.trim() ? rawDsn.trim() : null;
  const enabled = rawEnabled === "true" && dsn !== null;

  return {
    enabled,
    dsn: enabled ? dsn : null,
  };
}

/**
 * Classifies an unknown error into a safe, generic ErrorCategory without leaking
 * raw user input, filenames, or internal stack traces.
 */
export function classifyErrorCategory(
  errorOrMessage: unknown,
  fallback: ErrorCategory = "processing_error"
): ErrorCategory {
  if (errorOrMessage instanceof BaseApplicationError) {
    return errorOrMessage.category;
  }

  if (
    typeof errorOrMessage === "string" &&
    (ERROR_CATEGORIES as readonly string[]).includes(errorOrMessage)
  ) {
    return errorOrMessage as ErrorCategory;
  }

  const rawText =
    errorOrMessage instanceof Error
      ? errorOrMessage.message
      : typeof errorOrMessage === "string"
        ? errorOrMessage
        : "";
  const lower = rawText.toLowerCase();

  if (lower.includes("range") || lower.includes("out of bounds")) {
    return "range_error";
  }
  if (
    lower.includes("exceeds") ||
    lower.includes("limit") ||
    lower.includes("too large") ||
    lower.includes("megapixel")
  ) {
    return "file_too_large";
  }
  if (lower.includes("encrypt") || lower.includes("password")) {
    return "encrypted_file";
  }
  if (
    lower.includes("unsupported") ||
    lower.includes("signature does not match") ||
    lower.includes("not a pdf")
  ) {
    return "unsupported_format";
  }
  if (lower.includes("corrupt") || lower.includes("header (%pdf-)")) {
    return "corrupted_file";
  }
  if (lower.includes("syntax") || lower.includes("json")) {
    return "syntax_error";
  }
  if (lower.includes("clipboard")) {
    return "clipboard_error";
  }
  if (
    lower.includes("empty") ||
    lower.includes("invalid") ||
    lower.includes("required")
  ) {
    return "invalid_input";
  }

  return fallback;
}

/**
 * Returns a user-friendly, safe error message for unexpected runtime boundary errors
 * without exposing stack traces or sensitive input data.
 */
export function getFriendlyBoundaryErrorMessage(
  category: ErrorCategory = "runtime_boundary_error"
): string {
  switch (category) {
    case "file_too_large":
      return "The selected file or input exceeds the browser memory safety limit. Please try a smaller file.";
    case "unsupported_format":
      return "The selected file format is not supported by this tool.";
    case "encrypted_file":
      return "Password-protected or encrypted files cannot be processed locally. Please unlock the file first.";
    case "corrupted_file":
      return "The file appears to be damaged or unreadable.";
    default:
      return "An unexpected error occurred while rendering this view. Your local data has not been transmitted anywhere. You can reset the view or return to the homepage.";
  }
}

/**
 * Converts a duration in milliseconds into an aggregated privacy-safe bucket.
 */
export function bucketDuration(durationMs: number): "<100ms" | "100-500ms" | "500ms-2s" | ">2s" {
  if (durationMs < 100) return "<100ms";
  if (durationMs <= 500) return "100-500ms";
  if (durationMs <= 2000) return "500ms-2s";
  return ">2s";
}

/**
 * Records a generic, privacy-safe tool processing error.
 * Forwards to GA4 (if consented) and to optional error monitoring (if configured).
 * Never logs or transmits user inputs, filenames, or stack traces.
 */
export function reportToolProcessingError(
  toolSlugOrParams:
    | ValidToolSlug
    | {
        toolSlug: ValidToolSlug;
        toolCategory: ToolCategoryId;
        errorCategory: ErrorCategory;
        operationType?: string;
        durationMs?: number;
      },
  toolCategory?: ToolCategoryId,
  operationType?: string,
  errorOrMessage?: unknown,
  explicitCategory?: ErrorCategory
): SanitizedErrorReport {
  if (typeof toolSlugOrParams === "object" && toolSlugOrParams !== null) {
    const report: SanitizedErrorReport = {
      timestamp: new Date().toISOString(),
      errorCategory: toolSlugOrParams.errorCategory,
      toolSlug: toolSlugOrParams.toolSlug,
      operationType: toolSlugOrParams.operationType,
      durationMsBucket:
        toolSlugOrParams.durationMs !== undefined
          ? bucketDuration(toolSlugOrParams.durationMs)
          : undefined,
    };

    trackToolEvent("tool_process_error", {
      tool_slug: toolSlugOrParams.toolSlug,
      tool_category: toolSlugOrParams.toolCategory,
      operation_type: toolSlugOrParams.operationType,
      error_category: toolSlugOrParams.errorCategory,
    });

    return report;
  }

  const resolvedCategory =
    explicitCategory ?? classifyErrorCategory(errorOrMessage, "processing_error");
  const resolvedToolCategory = toolCategory ?? "developer";

  const report: SanitizedErrorReport = {
    timestamp: new Date().toISOString(),
    errorCategory: resolvedCategory,
    toolSlug: toolSlugOrParams,
    operationType,
  };

  trackToolEvent("tool_process_error", {
    tool_slug: toolSlugOrParams,
    tool_category: resolvedToolCategory,
    operation_type: operationType,
    error_category: resolvedCategory,
  });

  return report;
}

/**
 * Records a sanitized React Error Boundary event without logging sensitive payloads or stack traces.
 */
export function reportBoundaryError(
  boundaryName: "app-error-boundary" | "global-error-boundary",
  error?: unknown
): SanitizedErrorReport {
  const category = classifyErrorCategory(error, "runtime_boundary_error");
  return {
    timestamp: new Date().toISOString(),
    errorCategory: category,
    boundaryName,
  };
}
