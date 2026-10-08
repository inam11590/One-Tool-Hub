"use client";

import { triggerOpenConsentPreferences } from "@/components/analytics/AnalyticsAndConsentManager";

interface CookieSettingsButtonProps {
  className?: string;
  label?: string;
}

export function CookieSettingsButton({
  className = "text-xs font-medium text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  label = "Privacy & Cookie Settings",
}: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={() => triggerOpenConsentPreferences()}
      className={className}
    >
      {label}
    </button>
  );
}
