/**
 * Advertising and Google AdSense utility functions for OneToolHub.
 *
 * Implements strict format validation, environment feature gating, consent checks,
 * and safeguards preventing accidental script loading, layout shifts, or policy violations.
 */

import type {
  AdPlacementSlotId,
  AdvertisingConsentRecord,
  AdvertisingConsentStatus,
} from "@/types/ads";

export const ADSENSE_CLIENT_ID_REGEX = /^ca-pub-\d{10,16}$/;
export const ADSENSE_PUB_ID_REGEX = /^pub-\d{10,16}$/;

export const ADVERTISING_CONSENT_STORAGE_KEY = "onetoolhub_ad_consent_v1";
export const ADVERTISING_CONSENT_EVENT_NAME = "onetoolhub:ad-consent-change";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Validates whether a candidate string is a well-formed Google AdSense Client ID (ca-pub-XXXXXXXXXXXXXXXX).
 */
export function isValidAdSenseClientId(
  value?: string | null
): value is string {
  if (!value || typeof value !== "string") {
    return false;
  }
  return ADSENSE_CLIENT_ID_REGEX.test(value.trim());
}

/**
 * Validates whether a candidate string is a well-formed Google AdSense Publisher ID (pub-XXXXXXXXXXXXXXXX).
 */
export function isValidAdSensePublisherId(
  value?: string | null
): value is string {
  if (!value || typeof value !== "string") {
    return false;
  }
  return ADSENSE_PUB_ID_REGEX.test(value.trim());
}

/**
 * Extracts the raw publisher ID ('pub-XXXXXXXXXXXXXXXX') from an AdSense client ID ('ca-pub-XXXXXXXXXXXXXXXX').
 * Returns null if the client ID is malformed.
 */
export function extractPublisherId(clientId?: string | null): string | null {
  if (!isValidAdSenseClientId(clientId)) {
    return null;
  }
  return clientId.trim().replace(/^ca-/, "");
}

export const DEFAULT_ADSENSE_CLIENT_ID = "ca-pub-7928844199781621";

/**
 * Reads and validates the configured NEXT_PUBLIC_ADSENSE_CLIENT_ID environment variable
 * (falling back to the project's production AdSense Client ID ca-pub-7928844199781621).
 * Returns null if unset, empty, or malformed.
 * NEVER returns a placeholder or dummy ID.
 */
export function getConfiguredAdSenseClientId(
  envValue: string | undefined = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ??
    DEFAULT_ADSENSE_CLIENT_ID
): string | null {
  const trimmed = envValue?.trim();
  if (!trimmed || !isValidAdSenseClientId(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Checks whether the advertising feature flag is explicitly enabled in the environment.
 * Defaults to false for security, development safety, and policy compliance.
 */
export function isAdsFeatureEnabled(
  envValue: string | undefined = process.env.NEXT_PUBLIC_ENABLE_ADS
): boolean {
  return envValue?.trim().toLowerCase() === "true";
}

/**
 * Determines whether Google AdSense is fully configured and active in the runtime environment.
 * Requires BOTH a valid client ID and the explicit feature flag.
 */
export function isAdsEnvironmentActive(options?: {
  clientId?: string | null;
  featureEnabled?: boolean;
}): boolean {
  const clientId =
    options?.clientId !== undefined
      ? options.clientId
      : getConfiguredAdSenseClientId();
  const featureEnabled =
    options?.featureEnabled !== undefined
      ? options.featureEnabled
      : isAdsFeatureEnabled();

  return Boolean(clientId && isValidAdSenseClientId(clientId) && featureEnabled);
}

/**
 * Reads the stored advertising consent status from localStorage safely.
 */
export function getStoredAdvertisingConsent(): AdvertisingConsentStatus {
  if (typeof window === "undefined") {
    return "undecided";
  }
  try {
    const raw = window.localStorage.getItem(ADVERTISING_CONSENT_STORAGE_KEY);
    if (!raw) {
      return "undecided";
    }
    const parsed = JSON.parse(raw) as Partial<AdvertisingConsentRecord>;
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
 * Persists the user's advertising consent choice to localStorage and notifies listeners.
 */
export function setStoredAdvertisingConsent(
  status: "accepted" | "rejected"
): AdvertisingConsentRecord {
  const record: AdvertisingConsentRecord = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        ADVERTISING_CONSENT_STORAGE_KEY,
        JSON.stringify(record)
      );
    } catch {
      // Ignore storage quota errors
    }

    // Update Google Consent Mode v2 if window.gtag is available
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: status === "accepted" ? "granted" : "denied",
        ad_user_data: status === "accepted" ? "granted" : "denied",
        ad_personalization: status === "accepted" ? "granted" : "denied",
      });
    }

    window.dispatchEvent(
      new CustomEvent<AdvertisingConsentRecord>(
        ADVERTISING_CONSENT_EVENT_NAME,
        {
          detail: record,
        }
      )
    );
  }

  return record;
}

/**
 * Determines whether ads can be actively rendered in the browser.
 * Requires environment configuration AND user consent.
 */
export function canRenderAds(options?: {
  clientId?: string | null;
  featureEnabled?: boolean;
  consentStatus?: AdvertisingConsentStatus;
}): boolean {
  const isEnvActive = isAdsEnvironmentActive({
    clientId: options?.clientId,
    featureEnabled: options?.featureEnabled,
  });

  if (!isEnvActive) {
    return false;
  }

  const consent =
    options?.consentStatus !== undefined
      ? options.consentStatus
      : getStoredAdvertisingConsent();

  return consent === "accepted";
}

/**
 * List of permitted, policy-compliant ad placement slot identifiers.
 */
export const ALLOWED_AD_SLOTS: readonly AdPlacementSlotId[] = [
  "learn_article_body",
  "learn_sidebar",
  "learn_article_bottom",
  "tool_page_bottom",
  "informational_page_bottom",
] as const;

/**
 * Validates whether a placement slot identifier is recognized and policy-compliant.
 */
export function isAllowedAdSlot(slotId: string): slotId is AdPlacementSlotId {
  return (ALLOWED_AD_SLOTS as readonly string[]).includes(slotId);
}

/**
 * Generates the standard, authorized ads.txt record line for Google AdSense.
 * Format: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 * Returns null if publisher ID is missing or invalid.
 */
export function buildAdsTxtRecord(publisherId?: string | null): string | null {
  if (!publisherId) {
    return null;
  }

  // Normalize: if passed ca-pub-..., extract pub-...
  const normalizedPubId = publisherId.startsWith("ca-pub-")
    ? extractPublisherId(publisherId)
    : publisherId;

  if (!isValidAdSensePublisherId(normalizedPubId)) {
    return null;
  }

  return `google.com, ${normalizedPubId}, DIRECT, f08c47fec0942fa0`;
}
