"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import Script from "next/script";
import type { AdContextValue, AdvertisingConsentStatus } from "@/types/ads";
import {
  ADVERTISING_CONSENT_EVENT_NAME,
  getConfiguredAdSenseClientId,
  getStoredAdvertisingConsent,
  isAdsEnvironmentActive,
  setStoredAdvertisingConsent,
  isValidAdSenseClientId,
} from "@/lib/ads";

const AdContext = createContext<AdContextValue>({
  isConfigured: false,
  isEnabled: false,
  clientId: null,
  consentStatus: "undecided",
  canRenderAds: false,
  setConsent: () => {},
});

export function useAds(): AdContextValue {
  return useContext(AdContext);
}

interface AdProviderProps {
  children: React.ReactNode;
}

/**
 * Manages Google AdSense lifecycle, consent propagation, and safe script injection.
 * Strict guarantees:
 * 1. Ads are strictly DISABLED by default.
 * 2. Script is never injected without both explicit environment enablement AND user consent.
 * 3. Never transmits tool inputs or personal document data.
 */
export function AdProvider({ children }: AdProviderProps) {
  const clientId = getConfiguredAdSenseClientId();
  const isConfigured = isValidAdSenseClientId(clientId);
  const isEnabled = isAdsEnvironmentActive({ clientId });

  const [mounted, setMounted] = useState(false);
  const [consentStatus, setConsentStatus] =
    useState<AdvertisingConsentStatus>("undecided");

  useEffect(() => {
    setConsentStatus(getStoredAdvertisingConsent());
    setMounted(true);

    const handleConsentChange = () => {
      setConsentStatus(getStoredAdvertisingConsent());
    };

    window.addEventListener(
      ADVERTISING_CONSENT_EVENT_NAME,
      handleConsentChange
    );
    return () => {
      window.removeEventListener(
        ADVERTISING_CONSENT_EVENT_NAME,
        handleConsentChange
      );
    };
  }, []);

  const handleSetConsent = useCallback(
    (status: "accepted" | "rejected") => {
      setStoredAdvertisingConsent(status);
      setConsentStatus(status);
    },
    []
  );

  const canRender = useMemo(() => {
    if (!mounted || !isEnabled || !isConfigured || !clientId) {
      return false;
    }
    return consentStatus === "accepted";
  }, [mounted, isEnabled, isConfigured, clientId, consentStatus]);

  const contextValue: AdContextValue = useMemo(
    () => ({
      isConfigured,
      isEnabled,
      clientId,
      consentStatus,
      canRenderAds: canRender,
      setConsent: handleSetConsent,
    }),
    [isConfigured, isEnabled, clientId, consentStatus, canRender, handleSetConsent]
  );

  return (
    <AdContext.Provider value={contextValue}>
      {children}

      {/* Inject Google AdSense script ONLY when fully configured, enabled, and consented */}
      {canRender && clientId ? (
        <Script
          id="onetoolhub-adsense-script"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
            clientId
          )}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
          onError={(e) => {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Failed to load Google AdSense script:", e);
            }
          }}
        />
      ) : null}
    </AdContext.Provider>
  );
}
