/**
 * Types and interfaces for the OneToolHub advertising architecture.
 */

export type AdPlacementSlotId =
  | "learn_article_body"
  | "learn_sidebar"
  | "learn_article_bottom"
  | "tool_page_bottom"
  | "informational_page_bottom";

export type AdvertisingConsentStatus = "accepted" | "rejected" | "undecided";

export interface AdvertisingConsentRecord {
  status: AdvertisingConsentStatus;
  updatedAt: string;
}

export interface AdSlotConfig {
  slotId: AdPlacementSlotId;
  adUnitId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

export interface AdContextValue {
  isConfigured: boolean;
  isEnabled: boolean;
  clientId: string | null;
  consentStatus: AdvertisingConsentStatus;
  canRenderAds: boolean;
  setConsent: (status: "accepted" | "rejected") => void;
}
