import type { ToolCategoryId } from "@/types/tools";

export const ANALYTICS_CONSENT_STORAGE_KEY =
  "onetoolhub_analytics_consent_v1";
export const ANALYTICS_CONSENT_EVENT_NAME =
  "onetoolhub:analytics-consent-change";

export type AnalyticsConsentStatus = "accepted" | "rejected" | "undecided";

export interface AnalyticsConsentRecord {
  status: AnalyticsConsentStatus;
  updatedAt: string;
}

export const VALID_TOOL_SLUGS = [
  "json-formatter",
  "image-compressor",
  "qr-code-generator",
  "word-counter",
  "youtube-timestamp-formatter",
  "gpa-calculator",
  "invoice-generator",
  "pdf-merge-split",
] as const;

export type ValidToolSlug = (typeof VALID_TOOL_SLUGS)[number];

export const VALID_TOOL_CATEGORIES: readonly ToolCategoryId[] = [
  "student",
  "freelancer",
  "youtube",
  "developer",
] as const;

export const ANALYTICS_EVENT_NAMES = [
  "tool_open",
  "tool_process_start",
  "tool_process_success",
  "tool_process_error",
  "tool_download",
  "tool_copy",
  "tool_reset",
  "tool_search",
  "favorite_add",
  "favorite_remove",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const ERROR_CATEGORIES = [
  "invalid_input",
  "file_too_large",
  "unsupported_format",
  "syntax_error",
  "encrypted_file",
  "corrupted_file",
  "range_error",
  "processing_error",
  "clipboard_error",
  "runtime_boundary_error",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export interface RawToolAnalyticsParams {
  tool_slug: string;
  tool_category: ToolCategoryId;
  operation_type?: string;
  error_category?: ErrorCategory;
  [key: string]: unknown;
}

export interface SafeToolAnalyticsParams {
  tool_slug: ValidToolSlug;
  tool_category: ToolCategoryId;
  operation_type?: string;
  error_category?: ErrorCategory;
}

const GA_MEASUREMENT_ID_REGEX = /^G-[A-Z0-9]{6,15}$/;
const SAFE_TOKEN_REGEX = /^[a-z0-9_-]{1,40}$/;

const ALLOWED_PARAM_KEYS = new Set([
  "tool_slug",
  "tool_category",
  "operation_type",
  "error_category",
]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/**
 * Validates whether a candidate string is a well-formed Google Analytics 4 Measurement ID (G-XXXXXXXXXX).
 */
export function isValidGaMeasurementId(value?: string | null): value is string {
  if (!value || typeof value !== "string") {
    return false;
  }
  return GA_MEASUREMENT_ID_REGEX.test(value.trim());
}

const DEFAULT_GA_MEASUREMENT_ID = "G-Y6CKKYZDWM";

/**
 * Reads and validates the configured NEXT_PUBLIC_GA_MEASUREMENT_ID environment variable
 * (falling back to the project's production GA4 Measurement ID G-Y6CKKYZDWM).
 * Returns null if explicitly empty or malformed.
 */
export function getConfiguredGaMeasurementId(
  envValue: string | undefined = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
    DEFAULT_GA_MEASUREMENT_ID
): string | null {
  const trimmed = envValue?.trim();
  if (!trimmed || !isValidGaMeasurementId(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Determines whether analytics is allowed to run in the current runtime environment.
 * Avoids tracking in local development or test environments unless NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV="true".
 */
export function isAnalyticsEnvironmentEnabled(options?: {
  measurementId?: string | null;
  nodeEnv?: string;
  enableInDev?: string;
}): boolean {
  const measurementId =
    options?.measurementId !== undefined
      ? options.measurementId
      : getConfiguredGaMeasurementId();

  if (!isValidGaMeasurementId(measurementId)) {
    return false;
  }

  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  const enableInDev =
    options?.enableInDev ?? process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV;

  if (nodeEnv === "production") {
    return true;
  }

  return enableInDev === "true";
}

/**
 * Reads the stored user consent status from localStorage safely.
 */
export function getStoredAnalyticsConsent(): AnalyticsConsentStatus {
  if (typeof window === "undefined") {
    return "undecided";
  }
  try {
    const raw = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (!raw) {
      return "undecided";
    }
    const parsed = JSON.parse(raw) as Partial<AnalyticsConsentRecord>;
    if (
      parsed.status === "accepted" ||
      parsed.status === "rejected" ||
      parsed.status === "undecided"
    ) {
      return parsed.status;
    }
    return "undecided";
  } catch {
    return "undecided";
  }
}

/**
 * Removes Google Analytics cookies (_ga, _ga_*) when consent is rejected or withdrawn.
 */
export function clearGoogleAnalyticsCookies(): void {
  if (typeof document === "undefined") {
    return;
  }
  try {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const rawName = (eqPos > -1 ? cookie.slice(0, eqPos) : cookie).trim();
      if (rawName === "_ga" || rawName.startsWith("_ga_") || rawName === "_gid") {
        document.cookie = `${rawName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      }
    }
  } catch {
    // Ignore cookie clearing errors in restricted environments
  }
}

/**
 * Persists the user's analytics consent choice and updates Google Consent Mode / ga-disable flags.
 */
export function setStoredAnalyticsConsent(
  status: "accepted" | "rejected"
): AnalyticsConsentRecord {
  const record: AnalyticsConsentRecord = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        ANALYTICS_CONSENT_STORAGE_KEY,
        JSON.stringify(record)
      );
    } catch {
      // Ignore storage quota errors
    }

    const measurementId = getConfiguredGaMeasurementId();
    if (measurementId) {
      window[`ga-disable-${measurementId}`] = status !== "accepted";
    }

    if (status === "rejected") {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
      clearGoogleAnalyticsCookies();
    } else if (status === "accepted" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }

    window.dispatchEvent(
      new CustomEvent<AnalyticsConsentRecord>(ANALYTICS_CONSENT_EVENT_NAME, {
        detail: record,
      })
    );
  }

  return record;
}

/**
 * Checks whether analytics can actively send events right now (valid config + environment enabled + user consented).
 */
export function canSendAnalyticsEvents(options?: {
  measurementId?: string | null;
  nodeEnv?: string;
  enableInDev?: string;
  consentStatus?: AnalyticsConsentStatus;
}): boolean {
  if (!isAnalyticsEnvironmentEnabled(options)) {
    return false;
  }
  const consent = options?.consentStatus ?? getStoredAnalyticsConsent();
  return consent === "accepted";
}

/**
 * Validates and sanitizes tool analytics parameters.
 * Strictly strips any unrecognized or sensitive fields (e.g., filenames, JSON, text, URLs, invoice data).
 */
export function sanitizeToolAnalyticsParams(
  raw: RawToolAnalyticsParams
): SafeToolAnalyticsParams | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const slug =
    typeof raw.tool_slug === "string" ? raw.tool_slug.trim() : "";
  if (!(VALID_TOOL_SLUGS as readonly string[]).includes(slug)) {
    return null;
  }

  const category =
    typeof raw.tool_category === "string" ? raw.tool_category.trim() : "";
  if (!(VALID_TOOL_CATEGORIES as readonly string[]).includes(category)) {
    return null;
  }

  const safe: SafeToolAnalyticsParams = {
    tool_slug: slug as ValidToolSlug,
    tool_category: category as ToolCategoryId,
  };

  if (
    typeof raw.operation_type === "string" &&
    SAFE_TOKEN_REGEX.test(raw.operation_type.trim())
  ) {
    safe.operation_type = raw.operation_type.trim();
  }

  if (
    typeof raw.error_category === "string" &&
    (ERROR_CATEGORIES as readonly string[]).includes(raw.error_category.trim())
  ) {
    safe.error_category = raw.error_category.trim() as ErrorCategory;
  }

  // Ensure only whitelisted keys exist on the returned object
  for (const key of Object.keys(safe)) {
    if (!ALLOWED_PARAM_KEYS.has(key)) {
      delete (safe as unknown as Record<string, unknown>)[key];
    }
  }

  return safe;
}

export function isValidAnalyticsEventName(
  eventName: string
): eventName is AnalyticsEventName {
  return (ANALYTICS_EVENT_NAMES as readonly string[]).includes(eventName);
}

// Deduplication state
const recentEventTimestamps = new Map<string, number>();
let lastTrackedPagePath: string | null = null;

/**
 * Resets internal deduplication state (used in automated unit tests).
 */
export function resetAnalyticsDedupeState(): void {
  recentEventTimestamps.clear();
  lastTrackedPagePath = null;
}

/**
 * Tracks a pageview across Next.js App Router navigation without duplicate pageview events.
 * Strips query parameters or hashes that could contain user data.
 */
export function trackPageView(
  pathname: string,
  options?: {
    measurementId?: string | null;
    nodeEnv?: string;
    enableInDev?: string;
    consentStatus?: AnalyticsConsentStatus;
    gtagFn?: (...args: unknown[]) => void;
  }
): boolean {
  if (!canSendAnalyticsEvents(options)) {
    return false;
  }

  const cleanPath = (pathname || "/").split("?")[0]?.split("#")[0]?.trim() || "/";
  if (!cleanPath.startsWith("/")) {
    return false;
  }

  if (lastTrackedPagePath === cleanPath) {
    return false;
  }

  const gtagFn =
    options?.gtagFn ??
    (typeof window !== "undefined" ? window.gtag : undefined);

  if (typeof gtagFn !== "function") {
    return false;
  }

  lastTrackedPagePath = cleanPath;
  gtagFn("event", "page_view", {
    page_path: cleanPath,
  });
  return true;
}

/**
 * Tracks an anonymous tool interaction event with strict parameter sanitization and deduplication.
 */
export function trackToolEvent(
  eventName: AnalyticsEventName,
  params: RawToolAnalyticsParams,
  options?: {
    measurementId?: string | null;
    nodeEnv?: string;
    enableInDev?: string;
    consentStatus?: AnalyticsConsentStatus;
    dedupeWindowMs?: number;
    nowMs?: number;
    gtagFn?: (...args: unknown[]) => void;
  }
): { sent: boolean; payload?: SafeToolAnalyticsParams; reason?: string } {
  if (!isValidAnalyticsEventName(eventName)) {
    return { sent: false, reason: "invalid_event_name" };
  }

  const safePayload = sanitizeToolAnalyticsParams(params);
  if (!safePayload) {
    return { sent: false, reason: "invalid_params" };
  }

  if (!canSendAnalyticsEvents(options)) {
    return { sent: false, reason: "analytics_disabled_or_unconsented" };
  }

  const dedupeWindowMs = options?.dedupeWindowMs ?? 500;
  const now = options?.nowMs ?? Date.now();
  const dedupeKey = `${eventName}:${safePayload.tool_slug}:${safePayload.operation_type ?? ""}:${safePayload.error_category ?? ""}`;
  const previousTimestamp = recentEventTimestamps.get(dedupeKey);

  if (
    previousTimestamp !== undefined &&
    now - previousTimestamp < dedupeWindowMs
  ) {
    return { sent: false, reason: "duplicate_suppressed" };
  }

  const gtagFn =
    options?.gtagFn ??
    (typeof window !== "undefined" ? window.gtag : undefined);

  if (typeof gtagFn !== "function") {
    return { sent: false, reason: "gtag_unavailable" };
  }

  recentEventTimestamps.set(dedupeKey, now);
  gtagFn("event", eventName, safePayload);

  return { sent: true, payload: safePayload };
}
