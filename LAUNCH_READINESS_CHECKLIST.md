# OneToolHub — Worldwide Launch Readiness Checklist

Use this pre-launch and post-launch operational checklist before deploying **OneToolHub** to a public production domain.

---

## 1. Environment Variables & Production Configuration

- [ ] Set `NEXT_PUBLIC_SITE_URL` to your final HTTPS production origin without a trailing slash (e.g., `https://www.onetoolhub.com`).
- [ ] Set `NEXT_PUBLIC_ALLOW_INDEXING=true` **only** on the live production environment (keep unset or `false` on preview/staging branches so search engines do not index staging URLs).
- [ ] Configure `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` if using the HTML meta tag verification method for Google Search Console.
- [ ] Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` if enabling optional, consent-gated Google Analytics 4.
- [ ] Ensure `NEXT_PUBLIC_ENABLE_ANALYTICS_IN_DEV` is unset or `false` in production.
- [ ] Configure `NEXT_PUBLIC_ERROR_MONITORING_ENABLED` and `NEXT_PUBLIC_ERROR_MONITORING_DSN` if connecting an external error monitoring endpoint.

---

## 2. Legal, Privacy & Compliance Review (Owner Action Required)

- [ ] Replace the `[OWNER PLACEHOLDER]` entries in `frontend/src/app/privacy/page.tsx` with your legal entity/operator name, privacy contact email address, and effective launch date.
- [ ] Have qualified legal counsel review `/privacy` and the cookie consent flow (`AnalyticsAndConsentManager.tsx`) for compliance with target jurisdictions (GDPR, UK GDPR, ePrivacy Directive, CCPA/CPRA, etc.).
- [ ] Verify that the consent banner appears when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured and that clicking **Reject Optional Analytics** prevents `googletagmanager.com` from loading.
- [ ] Verify that clicking **Privacy & Cookie Settings** in the footer allows users to withdraw consent and clears `_ga` cookies.

---

## 3. Technical SEO & Search Console Verification

- [ ] Run `curl -I https://www.yourdomain.com/robots.txt` and verify `Allow: /` and `Sitemap: https://www.yourdomain.com/sitemap.xml` are present.
- [ ] Open `https://www.yourdomain.com/sitemap.xml` and verify all 13 public routes use the production HTTPS origin.
- [ ] Verify domain ownership in Google Search Console (see [`SEARCH_CONSOLE_SETUP.md`](./SEARCH_CONSOLE_SETUP.md)).
- [ ] Submit `sitemap.xml` in Google Search Console and run Live URL Inspection on the homepage and tool pages.
- [ ] Confirm Open Graph and Twitter/X social card previews render properly using social card validators.

---

## 4. Functional QA Across All 8 Tools

- [ ] **JSON Formatter & Validator (`/tools/json-formatter`)**: Format 2/4 spaces, minify, validate syntax errors, copy, upload `.json`, download `.json`.
- [ ] **Image Compressor (`/tools/image-compressor`)**: Upload JPEG/PNG/WebP, verify magic-byte validation, adjust quality slider, compare file sizes, download compressed image.
- [ ] **QR Code Generator (`/tools/qr-code-generator`)**: Generate QR code for URL/Unicode text, test contrast warning, download PNG and SVG.
- [ ] **Word Counter (`/tools/word-counter`)**: Verify real-time word, character, sentence, paragraph, and reading-time metrics, copy text, download `.txt`.
- [ ] **YouTube Timestamp Formatter (`/tools/youtube-timestamp-formatter`)**: Verify `00:00` check, minimum 3 chapters, chronological auto-sort, `<10s` warning, copy/download chapters.
- [ ] **GPA Calculator (`/tools/gpa-calculator`)**: Test 4.0 and 5.0 scales, custom grade mappings, multi-semester cumulative GPA calculation.
- [ ] **Professional Invoice Generator (`/tools/invoice-generator`)**: Test line items, tax/discount math, opt-in `localStorage` draft saving, print view, and multi-page PDF download.
- [ ] **PDF Merge & Split (`/tools/pdf-merge-split`)**: Test merging multiple PDFs, reordering, splitting custom page ranges (`1-2, 4`), and downloading output PDFs.

---

## 5. Security, Accessibility & Build Gates

- [ ] Run `npm test` in `frontend/` and confirm all 25 unit test suites pass.
- [ ] Run `npm run typecheck` and `npm run lint` with zero errors.
- [ ] Run `npm run build` and confirm clean static/SSR route generation.
- [ ] Inspect HTTP response headers in production to confirm `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` are active.
- [ ] Verify keyboard navigation (`Tab`, `Shift+Tab`, `Escape`), skip-to-content link, and mobile responsiveness (`375px` width) with zero horizontal overflow.

---

## 6. Post-Launch Roadmap Items (Deferred Beyond Step 5)

- [ ] Connect `ToolFeedbackCard` (`frontend/src/lib/feedback.ts`) to a backend endpoint (`POST /api/v1/feedback` in FastAPI + PostgreSQL) when backend infrastructure is provisioned, and update the UI disclosure from local browser draft to remote submission.
- [ ] Connect `frontend/src/lib/error-monitoring.ts` to a production telemetry sink (e.g., Sentry or OpenTelemetry collector) if real-time alerting is desired.
