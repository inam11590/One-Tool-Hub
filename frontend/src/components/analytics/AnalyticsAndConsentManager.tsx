"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import {
  ANALYTICS_CONSENT_EVENT_NAME,
  type AnalyticsConsentStatus,
  getConfiguredGaMeasurementId,
  getStoredAnalyticsConsent,
  isAnalyticsEnvironmentEnabled,
  setStoredAnalyticsConsent,
  trackPageView,
} from "@/lib/analytics";
import {
  setStoredAdvertisingConsent,
  isAdsEnvironmentActive,
} from "@/lib/ads";

export const OPEN_CONSENT_MODAL_EVENT = "onetoolhub:open-consent-preferences";

export function triggerOpenConsentPreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_CONSENT_MODAL_EVENT));
  }
}

export function AnalyticsAndConsentManager() {
  const pathname = usePathname();
  const measurementId = getConfiguredGaMeasurementId();
  const analyticsConfiguredAndAllowed = isAnalyticsEnvironmentEnabled({
    measurementId,
  });
  const adsConfiguredAndAllowed = isAdsEnvironmentActive();

  const [mounted, setMounted] = useState(false);
  const [consentStatus, setConsentStatus] =
    useState<AnalyticsConsentStatus>("undecided");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [gtagReady, setGtagReady] = useState(false);

  useEffect(() => {
    const initialConsent = getStoredAnalyticsConsent();
    setConsentStatus(initialConsent);
    setMounted(true);

    const handleConsentChange = () => {
      setConsentStatus(getStoredAnalyticsConsent());
    };

    const handleOpenPreferences = () => {
      setIsPreferencesOpen(true);
    };

    window.addEventListener(ANALYTICS_CONSENT_EVENT_NAME, handleConsentChange);
    window.addEventListener(OPEN_CONSENT_MODAL_EVENT, handleOpenPreferences);

    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_EVENT_NAME,
        handleConsentChange
      );
      window.removeEventListener(
        OPEN_CONSENT_MODAL_EVENT,
        handleOpenPreferences
      );
    };
  }, []);

  // Track App Router pageviews without duplicates once GA is ready and consent is accepted
  useEffect(() => {
    if (
      !mounted ||
      !analyticsConfiguredAndAllowed ||
      consentStatus !== "accepted" ||
      !gtagReady ||
      !pathname
    ) {
      return;
    }

    trackPageView(pathname, {
      measurementId,
      consentStatus,
    });
  }, [
    mounted,
    analyticsConfiguredAndAllowed,
    consentStatus,
    gtagReady,
    pathname,
    measurementId,
  ]);

  const handleAccept = () => {
    setStoredAnalyticsConsent("accepted");
    setStoredAdvertisingConsent("accepted");
    setConsentStatus("accepted");
    setIsPreferencesOpen(false);
  };

  const handleReject = () => {
    setStoredAnalyticsConsent("rejected");
    setStoredAdvertisingConsent("rejected");
    setConsentStatus("rejected");
    setGtagReady(false);
    setIsPreferencesOpen(false);
  };

  if (!mounted) {
    return null;
  }

  const shouldLoadGaScripts =
    analyticsConfiguredAndAllowed &&
    Boolean(measurementId) &&
    consentStatus === "accepted";

  const showBanner =
    ((analyticsConfiguredAndAllowed || adsConfiguredAndAllowed) &&
      consentStatus === "undecided") ||
    isPreferencesOpen;

  return (
    <>
      {/* Load Google Analytics 4 ONLY when properly configured AND explicit consent is granted */}
      {shouldLoadGaScripts && measurementId ? (
        <>
          <Script
            id="onetoolhub-ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
            strategy="afterInteractive"
            onLoad={() => {
              if (typeof window !== "undefined") {
                window.dataLayer = window.dataLayer || [];
                function gtag(...args: unknown[]) {
                  window.dataLayer?.push(args);
                }
                window.gtag = window.gtag || gtag;
                window[`ga-disable-${measurementId}`] = false;

                // Google Consent Mode v2 default + update
                window.gtag("consent", "default", {
                  analytics_storage: "granted",
                  ad_storage: "denied",
                  ad_user_data: "denied",
                  ad_personalization: "denied",
                });
                window.gtag("js", new Date());
                // Disable automatic page_view on config so App Router navigation handler controls pageviews without duplicates
                window.gtag("config", measurementId, {
                  send_page_view: false,
                  anonymize_ip: true,
                });
                setGtagReady(true);
              }
            }}
          />
        </>
      ) : null}

      {showBanner ? (
        <aside
          data-testid="consent-preferences-banner"
          aria-label="Privacy and analytics preferences"
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 print:hidden"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl ring-1 ring-slate-900/5 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2 md:max-w-2xl">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>Privacy &amp; Cookie Preferences</span>
                  </div>
                  {isPreferencesOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsPreferencesOpen(false)}
                      aria-label="Close privacy preferences"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:hidden"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <h2 className="text-base font-bold text-slate-900">
                  Optional Usage Analytics &amp; Advertising
                </h2>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                  All 8 tools on OneToolHub process your files and text locally
                  in your browser. With your permission, we use optional Google
                  Analytics 4 cookies to measure aggregate pageviews and
                  anonymous tool actions, and may display optional Google
                  AdSense advertising. We never transmit your uploaded files,
                  JSON, text, QR links, grades, or invoice details to analytics
                  or advertising networks.{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-indigo-600 underline hover:text-indigo-700"
                  >
                    Read our Privacy Policy
                  </Link>
                  .
                </p>

                {!analyticsConfiguredAndAllowed && !adsConfiguredAndAllowed ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                    <strong>Current Status:</strong> Analytics and advertising
                    are not active in this environment (no production IDs
                    configured). Your preference below is saved locally in your
                    browser:{" "}
                    <span className="font-semibold text-slate-900">
                      {consentStatus === "accepted"
                        ? "Accepted"
                        : consentStatus === "rejected"
                          ? "Rejected"
                          : "Not set (Tracking disabled)"}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="text-xs text-slate-600">
                    Current preference:{" "}
                    <strong className="font-semibold text-slate-900">
                      {consentStatus === "accepted"
                        ? "Optional Analytics & Ads Accepted"
                        : consentStatus === "rejected"
                          ? "Optional Analytics & Ads Rejected"
                          : "Awaiting Your Choice (Tracking Not Loaded)"}
                    </strong>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row md:shrink-0">
                <button
                  type="button"
                  onClick={handleReject}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
                >
                  Reject Optional Analytics &amp; Ads
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
                >
                  <SlidersHorizontal
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  <span>Accept Optional Analytics &amp; Ads</span>
                </button>
                {isPreferencesOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsPreferencesOpen(false)}
                    aria-label="Close privacy preferences"
                    className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:inline-flex"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
