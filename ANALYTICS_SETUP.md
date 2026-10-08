# OneToolHub — Google Analytics 4 & Privacy Consent Setup Guide

This document explains how to configure, verify, and operate the optional, consent-gated **Google Analytics 4 (GA4)** integration in **OneToolHub**.

---

## 1. Architecture Overview

OneToolHub implements a privacy-first, consent-gated GA4 integration:
- **Core utility**: `frontend/src/lib/analytics.ts`
- **Consent & script manager**: `frontend/src/components/analytics/AnalyticsAndConsentManager.tsx`
- **Persistent footer/privacy trigger**: `frontend/src/components/analytics/CookieSettingsButton.tsx`
- **Tool open tracker**: `frontend/src/components/analytics/ToolOpenTracker.tsx`

### Key Privacy & Compliance Guarantees
1. **Optional by default**: If `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset or does not match `/^G-[A-Z0-9]{6,15}$/`, no Google Analytics scripts are injected and no tracking occurs.
2. **Local development protection**: Even if a valid Measurement ID is present, analytics is disabled when `NODE_ENV !== "production"` unless `NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV=true` is explicitly set.
3. **Consent-gated script loading**: When GA4 is configured, visitors see a non-deceptive privacy consent banner (`Accept Optional Analytics` / `Reject Optional Analytics`). The `googletagmanager.com/gtag/js` script is **never loaded** before the user explicitly clicks **Accept Optional Analytics**.
4. **Consent withdrawal at any time**: Users can click **Privacy & Cookie Settings** in the footer (or on `/privacy`) at any time to change or withdraw consent. Withdrawing consent:
   - Updates `localStorage` (`onetoolhub_analytics_consent_v1`) to `"rejected"`
   - Sets `window["ga-disable-G-XXXXXXXXXX"] = true`
   - Sends `gtag("consent", "update", { analytics_storage: "denied", ... })`
   - Deletes first-party `_ga` and `_ga_*` cookies
5. **Strict payload sanitization**: Only four whitelisted metadata keys (`tool_slug`, `tool_category`, `operation_type`, `error_category`) are ever sent with tool events. User inputs, filenames, JSON content, invoice details, PDF contents, text, and QR payloads are strictly stripped and never transmitted.

---

## 2. How to Create a GA4 Property & Measurement ID

1. Sign in to [Google Analytics](https://analytics.google.com/).
2. Go to **Admin** (gear icon) &rarr; **Create** &rarr; **Property**.
3. Enter property details (e.g., `OneToolHub Production`), select your reporting time zone and currency.
4. Choose **Web** as your data stream platform and enter your production HTTPS domain (e.g., `https://www.yourdomain.com`).
5. In the **Web stream details** panel:
   - Copy the **Measurement ID** (formatted like `G-XXXXXXXXXX`).
   - Under **Enhanced measurement**, consider disabling **Page changes based on browser history events** if you want to rely exclusively on OneToolHub's deduplicated App Router `page_view` tracking (`send_page_view: false` is set in `gtag('config', ...)`).

---

## 3. Environment Configuration

Set the following variable in your production hosting provider (or in `frontend/.env.local` for local testing):

```bash
# Required to enable GA4 (must match /^G-[A-Z0-9]{6,15}$/)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Set to "true" ONLY if you want to test GA4 locally during `npm run dev`
NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV=false
```

---

## 4. Tracked Events & Parameters Reference

| Event Name | When Triggered | Whitelisted Parameters |
| :--- | :--- | :--- |
| `page_view` | On initial page load (after consent) and across Next.js App Router route changes (deduplicated per pathname; query strings and hashes stripped). | `page_path` |
| `tool_open` | When a user opens any of the 8 tool pages (fired once per page mount). | `tool_slug`, `tool_category` |
| `tool_process_success` | When a tool completes a primary action (format/minify/validate JSON, compress image, switch GPA scale/semester, generate/print invoice PDF, merge/split PDF). | `tool_slug`, `tool_category`, `operation_type` |
| `tool_process_error` | When validation or local processing fails, categorized into a generic error bucket. | `tool_slug`, `tool_category`, `operation_type`, `error_category` |
| `tool_download` | When a user downloads an output file (`.json`, compressed image, `.png`/`.svg` QR code, `.txt` word count/chapters, invoice `.pdf`, merged/split `.pdf`). | `tool_slug`, `tool_category`, `operation_type` |
| `tool_copy` | When a user copies output to the clipboard (JSON, QR input, Word Counter text, YouTube chapters). | `tool_slug`, `tool_category`, `operation_type` |
| `tool_reset` | When a user clears or resets a tool workspace. | `tool_slug`, `tool_category`, `operation_type` |

---

## 5. How to Verify Consent & Events in Browser DevTools

1. **Before Consent**:
   - Open Chrome DevTools &rarr; **Network** tab, filter by `collect` or `googletagmanager`.
   - Load `/tools/json-formatter` in a fresh Incognito window.
   - Confirm the consent banner is visible at the bottom of the viewport and **zero** requests are made to `googletagmanager.com` or `google-analytics.com`.
2. **After Clicking "Reject Optional Analytics"**:
   - Click **Reject Optional Analytics**.
   - Interact with the tool (Format, Copy, Download).
   - Confirm **zero** GA4 network requests are sent.
3. **After Clicking "Accept Optional Analytics"**:
   - Click **Privacy & Cookie Settings** in the footer, then click **Accept Optional Analytics**.
   - Confirm `googletagmanager.com/gtag/js` loads and `page_view` + tool interaction events (`tool_process_success`, `tool_copy`, `tool_download`) appear in GA4 **DebugView** or the Network tab with only whitelisted parameters.
