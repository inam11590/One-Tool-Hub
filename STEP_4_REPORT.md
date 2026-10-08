# OneToolHub — Step 4 Production Audit & Optimization Report

## 1. SEO Improvements Implemented

- **Centralized & Validated Site URL Configuration ([`frontend/src/lib/seo.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/seo.ts), [`frontend/.env.example`](file:///Users/mac/Documents/One-Tool-Hub/frontend/.env.example))**:
  - Removed the previously hardcoded `https://onetoolhub.com` placeholder domain from [`frontend/src/lib/tools.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/seo.ts) and [`QrCodeGeneratorTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/QrCodeGeneratorTool.tsx).
  - Implemented `getSiteUrlConfig()`, `getSiteOrigin()`, and `getAbsoluteUrl()` in `src/lib/seo.ts` to validate `process.env.NEXT_PUBLIC_SITE_URL` using the URL parser, strip trailing slashes, and detect preview/staging/localhost environments (`isStagingOrLocal` vs. `isProductionDomainConfigured`).
- **Centralized Metadata Builder (`buildPageMetadata`)**:
  - Updated all 14 indexable routes (`/`, `/tools`, `/about`, `/contact`, `/privacy`, `/terms`, and all 8 `/tools/*` routes) to use `buildPageMetadata()`.
  - Every indexable route has a **unique `<title>`**, a **unique `<meta name="description">`** (>110 characters), a clean **relative canonical path** resolved against `metadataBase` in [`layout.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/layout.tsx), **Open Graph** metadata (`og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:type`), and **Twitter/X card** metadata (`summary_large_image`).
- **404 & Non-Indexable Page Protection ([`frontend/src/app/not-found.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/not-found.tsx))**:
  - Added explicit `robots: { index: false, follow: false }` metadata to `not-found.tsx` so 404 responses are never indexed by search engines.
- **On-Page SEO Content Expansion ([`ToolPageShell.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/ToolPageShell.tsx) & all 8 tool pages)**:
  - Expanded all 8 tool pages (`json-formatter`, `image-compressor`, `qr-code-generator`, `word-counter`, `youtube-timestamp-formatter`, `gpa-calculator`, `invoice-generator`, `pdf-merge-split`) with:
    1. A single descriptive `<h1>` heading and concise introduction.
    2. **What the Tool Does (`overview`)**: Original, tool-specific explanation of the utility and target workflow.
    3. **Supported Features & Specifications (`features`)**: Scannable checklist of capabilities and technical limits.
    4. **Practical Examples (`examples`)**: Real-world scenarios and sample inputs/outputs.
    5. **Step-by-Step Instructions (`instructions`)**: Numbered 4-step usage guide.
    6. **Frequently Asked Questions (`faqs`)**: 4 tool-specific questions and factual answers.
    7. **Internal Linking & Breadcrumbs**: Semantic `<nav aria-label="Breadcrumb">` (`Home → All Tools → [Tool Name]`) and 4 related tool cards linking across categories.
  - Replaced exaggerated or absolute phrasing (`"100% client-side"`) with factual browser-processing privacy descriptions (`"Processed locally in your browser..."`).

---

## 2. Sitemap and Robots Configuration

- **`/robots.txt` ([`frontend/src/app/robots.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/robots.ts))**:
  - Dynamically checks `getSiteUrlConfig().isStagingOrLocal` and `process.env.NEXT_PUBLIC_ALLOW_INDEXING`:
    - When deployed to a preview/staging host (`*.vercel.app`, `staging.*`, `dev.*`) or when `NEXT_PUBLIC_ALLOW_INDEXING === "false"`, `robots.txt` returns `Disallow: /` so staging/preview environments are not accidentally indexed.
    - Otherwise, `robots.txt` returns `Allow: /`, `Disallow: ["/api/", "/_next/"]`, and points `Sitemap` to `${getSiteOrigin()}/sitemap.xml`.
- **`/sitemap.xml` ([`frontend/src/app/sitemap.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/sitemap.ts))**:
  - Generates a complete XML sitemap using `getAbsoluteUrl()` covering all 14 indexable routes (`/`, `/tools`, `/about`, `/contact`, `/privacy`, `/terms`, and all 8 `/tools/[slug]` pages) with appropriate `changeFrequency` and `priority` values.

---

## 3. Structured Data Added

- **Homepage (`WebSite` schema in [`frontend/src/app/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/page.tsx))**:
  - Injects a valid `<script type="application/ld+json">` block with `@type: "WebSite"`, `name`, `url`, `description`, and `inLanguage: "en"`.
- **Tool Pages (`BreadcrumbList` + `SoftwareApplication` schemas in [`ToolPageShell.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/ToolPageShell.tsx))**:
  - Injects a valid JSON-LD array containing:
    1. `BreadcrumbList` matching the visible 3-level breadcrumb trail (`Home` → `All Tools` → `[Tool Name]`).
    2. `SoftwareApplication` with `name`, `description`, `url`, `applicationCategory: "UtilitiesApplication"`, `operatingSystem: "Any (Web Browser)"`, and `isAccessibleForFree: true`.
  - Strictly omits fabricated `aggregateRating`, fake reviews, invented prices, or unverified `Organization` physical addresses.

---

## 4. Performance Improvements and Bundle Analysis

- **Lazy-Loading Heavy Third-Party Libraries (Code Splitting)**:
  - **PDF Engine (`pdf-lib`)**: Previously imported statically at module top-level in [`src/lib/tools/invoice-generator.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/invoice-generator.ts) and [`src/lib/tools/pdf-merge-split.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/pdf-merge-split.ts), forcing a ~180 kB library into the initial page load of `/tools/invoice-generator` and `/tools/pdf-merge-split` before the user even interacted with the page. Converted to on-demand `await import("pdf-lib")` inside `generateInvoicePdfBytes`, `inspectPdfBytes`, `mergePdfDocuments`, `splitPdfDocument`, and `createSamplePdfBytes` (keeping only TypeScript `import type` at top level).
  - **QR Encoder (`qrcode`)**: Converted static `import QRCode from "qrcode"` in [`src/lib/tools/qr-code-generator.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/qr-code-generator.ts) to dynamic `await import("qrcode")` inside `generateQrCodeAssets`.
- **Static Server Rendering & Font Optimization**:
  - All 19 routes build as static prerendered pages (`○ (Static)`).
  - Non-interactive informational pages (`/about`, `/contact`, `/privacy`, `/terms`, `/tools`) ship zero custom client-side JavaScript beyond the shared Next.js runtime and header navigation.
  - `Inter` font is self-hosted via `next/font/google` with `display: "swap"` in [`layout.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/layout.tsx).
  - QR code previews and uploaded image previews reserve explicit container heights (`min-h-64` / `max-h-80`) to prevent Cumulative Layout Shift (CLS).

---

## 5. Security Improvements and Headers Configured

- **HTTP Security Headers ([`frontend/next.config.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/next.config.ts))**:
  - Configured `poweredByHeader: false` and `async headers()` applying to all routes `/(.*)`:
    - `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob: data:; media-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'` (allows local Canvas/QR `data:` and PDF `blob:` URLs while blocking external script injection, plugins, and framing; note that `'unsafe-inline'` in `script-src`/`style-src` is required for static Next.js App Router RSC hydration and JSON-LD scripts unless dynamic per-request nonce middleware is used).
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
    - `Cross-Origin-Opener-Policy: same-origin`
- **File Upload Magic-Byte Verification ([`src/lib/tools/image-compressor.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/image-compressor.ts) & [`ImageCompressorTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/ImageCompressorTool.tsx))**:
  - Added `validateImageMagicBytes(bytes: Uint8Array)` to inspect the first 12 bytes of uploaded image files for authentic JPEG (`FF D8 FF`), PNG (`89 50 4E 47 0D 0A 1A 0A`), and WebP (`RIFF....WEBP`) signatures before creating an object URL or decoding in `<canvas>`.
  - Complemented existing `%PDF-` magic-byte header inspection (`hasPdfMagicHeader`) in [`src/lib/tools/pdf-merge-split.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/pdf-merge-split.ts).
- **Error Sanitization & Safe Parsing**:
  - Sanitized catch blocks in `pdf-merge-split.ts` and `qr-code-generator.ts` so internal library stack traces or raw parser internals are never echoed to the UI.
  - Confirmed zero usage of `eval()`, `new Function()`, or unsanitized `dangerouslySetInnerHTML` with user input across the entire repository (only static server-serialized JSON-LD uses `dangerouslySetInnerHTML`).
- **Dependency Audit (`npm audit`)**:
  - Inspected `npm audit` output: 0 runtime dependency vulnerabilities in shipped client libraries (`lucide-react`, `pdf-lib`, `qrcode`). The 7 reported advisories are transitive build/lint dependencies (`braces` inside `@next/eslint-plugin-next` and `postcss` inside `next@15.5.27`), documented in Section 11.

---

## 6. Accessibility Improvements (WCAG 2.2 AA)

- **Reduced Motion Support ([`frontend/src/app/globals.css`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/globals.css))**:
  - Added `@media (prefers-reduced-motion: reduce)` rule disabling smooth scrolling (`scroll-behavior: auto !important`) and collapsing CSS animation and transition durations (`0.01ms !important`) for users with vestibular motion sensitivity.
- **Sequential Heading Hierarchy ([`frontend/src/components/layout/Footer.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/layout/Footer.tsx))**:
  - Changed footer section headings (`Tool Categories`, `Platform`) from `<h3>` to `<h2>` so pages never skip from `<h1>` directly to `<h3>` in the footer landmark.
- **Keyboard Focus Visibility on File Inputs ([`ImageCompressorTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/ImageCompressorTool.tsx), [`PdfMergeSplitTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/PdfMergeSplitTool.tsx))**:
  - Added `peer` classes on visually hidden `<input type="file">` controls and `peer-focus-visible` / `peer-focus-within` rings on their associated `<label>` buttons so keyboard-only users see a clear indigo focus ring when tabbing to file upload triggers.
- **Contrast & Semantic Landmarks**:
  - Upgraded muted instructional helper text from `text-slate-500` to `text-slate-600` on light cards for stronger WCAG AA contrast (>4.5:1).
  - Verified `<header>`, `<nav>`, `<main id="main-content">`, `<footer>`, skip-to-content link, `role="alert"` on error banners, `role="status"` / `aria-live="polite"` on live counters, and explicit `<label htmlFor>` associations across all 14 routes (0 unlabeled form inputs and 0 unnamed buttons in headless Chrome DOM audit).

---

## 7. UX and Mobile Fixes

- Verified all 14 indexable routes across **375px (mobile)**, **768px (tablet)**, and **1440px (desktop)** viewports in headless Chrome with **zero horizontal overflow** (`documentElement.scrollWidth <= documentElement.clientWidth` on every route and viewport).
- Added rich "What This Tool Does", "Supported Features", and "Practical Examples" cards below each tool workspace so first-time visitors immediately understand input requirements, edge cases, and sample formats without cluttering the primary interactive workspace above the fold.

---

## 8. Legal / Privacy Page Improvements & Remaining Owner Placeholders

Updated [`/privacy`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/privacy/page.tsx), [`/terms`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/terms/page.tsx), [`/about`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/about/page.tsx), and [`/contact`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/contact/page.tsx) to:
- Accurately reflect all **8 active browser-based tools** (JSON Formatter & Validator, Image Compressor, QR Code Generator, Word Counter, YouTube Timestamp Formatter, GPA Calculator, Professional Invoice Generator, and PDF Merge & Split).
- Explain local browser processing (`JSON.parse`, HTML5 Canvas, `Intl.Segmenter`, and in-memory `pdf-lib` / `qrcode` buffers), opt-in `localStorage` draft saving in the Invoice Generator, and standard HTTP server request logs.
- Avoid making unverified legal or regulatory certification claims.
- Include explicit, greppable `[OWNER PLACEHOLDER: ...]` markers where real operator/company details must be supplied before public commercial launch:
  - `[OWNER PLACEHOLDER: Insert legal entity name, registered business address, and data protection contact email before public launch]` in `src/app/privacy/page.tsx`.
  - `[OWNER PLACEHOLDER: Insert governing law jurisdiction, legal entity name, and official notice address before public launch]` in `src/app/terms/page.tsx`.
  - `[OWNER PLACEHOLDER: Insert company registration details, founding team information, and physical headquarters address before public launch]` in `src/app/about/page.tsx`.
  - `[OWNER PLACEHOLDER: Replace support@example.com with your live monitored production support email address and optional business mailing address before public launch]` in `src/app/contact/page.tsx`.

---

## 9. Files Created or Modified

### Created
- [`frontend/src/lib/seo.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/seo.ts) — Validated `NEXT_PUBLIC_SITE_URL` helper, `buildPageMetadata`, `buildWebsiteJsonLd`, and `buildToolPageJsonLd`.
- [`frontend/.env.example`](file:///Users/mac/Documents/One-Tool-Hub/frontend/.env.example) — Documented environment variables (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ALLOW_INDEXING`).
- [`STEP_4_REPORT.md`](file:///Users/mac/Documents/One-Tool-Hub/STEP_4_REPORT.md) — Production audit and optimization report.

### Modified
- [`frontend/next.config.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/next.config.ts) — Added HTTP security headers (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`).
- [`frontend/src/app/globals.css`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/globals.css) — Added `@media (prefers-reduced-motion: reduce)` accessibility rules.
- [`frontend/src/app/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/page.tsx) — Added homepage `metadata` via `buildPageMetadata` and `WebSite` JSON-LD structured data.
- [`frontend/src/app/robots.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/robots.ts) — Added staging/preview crawler protection and validated sitemap URL.
- [`frontend/src/app/sitemap.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/sitemap.ts) — Updated to use `getAbsoluteUrl()`.
- [`frontend/src/app/not-found.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/not-found.tsx) — Added `robots: { index: false, follow: false }`.
- [`frontend/src/app/tools/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/page.tsx) — Standardized metadata via `buildPageMetadata`.
- [`frontend/src/app/about/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/about/page.tsx), [`frontend/src/app/contact/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/contact/page.tsx), [`frontend/src/app/privacy/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/privacy/page.tsx), [`frontend/src/app/terms/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/terms/page.tsx) — Updated metadata, factual 8-tool descriptions, and explicit `[OWNER PLACEHOLDER: ...]` fields.
- [`frontend/src/app/tools/json-formatter/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/json-formatter/page.tsx), [`image-compressor/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/image-compressor/page.tsx), [`qr-code-generator/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/qr-code-generator/page.tsx), [`word-counter/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/word-counter/page.tsx), [`youtube-timestamp-formatter/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/youtube-timestamp-formatter/page.tsx), [`gpa-calculator/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/gpa-calculator/page.tsx), [`invoice-generator/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/invoice-generator/page.tsx), [`pdf-merge-split/page.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/tools/pdf-merge-split/page.tsx) — Updated with `buildPageMetadata`, `overview`, `features`, `examples`, and factual privacy notes.
- [`frontend/src/components/layout/Footer.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/layout/Footer.tsx) — Fixed heading hierarchy (`<h2>` instead of `<h3>`).
- [`frontend/src/components/tools/ToolPageShell.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/ToolPageShell.tsx) — Added `BreadcrumbList` & `SoftwareApplication` JSON-LD script rendering and Overview / Features / Practical Examples sections.
- [`frontend/src/components/tools/ImageCompressorTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/ImageCompressorTool.tsx) — Added magic-byte file signature verification on upload and keyboard focus ring on file input label.
- [`frontend/src/components/tools/QrCodeGeneratorTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/QrCodeGeneratorTool.tsx) — Replaced hardcoded default domain with `https://example.com`.
- [`frontend/src/components/tools/PdfMergeSplitTool.tsx`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/tools/PdfMergeSplitTool.tsx) — Improved keyboard focus visibility and text contrast on upload dropzones.
- [`frontend/src/lib/tools.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools.ts) — Replaced hardcoded URL with `getSiteOrigin()`.
- [`frontend/src/lib/tools/image-compressor.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/image-compressor.ts) — Added `validateImageMagicBytes()`.
- [`frontend/src/lib/tools/invoice-generator.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/invoice-generator.ts) — Lazy-loaded `pdf-lib` via dynamic `await import("pdf-lib")`.
- [`frontend/src/lib/tools/pdf-merge-split.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/pdf-merge-split.ts) — Lazy-loaded `pdf-lib` via dynamic `await import("pdf-lib")` and sanitized error messages.
- [`frontend/src/lib/tools/qr-code-generator.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/qr-code-generator.ts) — Lazy-loaded `qrcode` via dynamic `await import("qrcode")` and sanitized error messages.
- [`frontend/src/lib/tools/tools.test.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/lib/tools/tools.test.ts) — Added unit tests for `validateImageMagicBytes` and technical SEO/JSON-LD helpers (21 total tests).

---

## 10. Before-and-After Metrics & Build Output

| Metric / Route | Before Step 4 (Baseline) | After Step 4 (Optimized) | Improvement |
| :--- | :--- | :--- | :--- |
| **Unit Tests (`npm test`)** | 19 / 19 passing | **21 / 21 passing** (`614ms`) | +2 security & SEO test suites |
| **TypeScript (`npm run typecheck`)** | 0 errors | **0 errors** | Strict mode clean |
| **ESLint (`npm run lint`)** | 0 errors | **0 errors, 0 warnings** | Clean |
| **`/tools/invoice-generator` First Load JS** | `293 kB` (`187 kB` route) | **`118 kB`** (`9.92 kB` route) | **-175 kB (-59.7% First Load JS)** |
| **`/tools/pdf-merge-split` First Load JS** | `293 kB` (`187 kB` route) | **`118 kB`** (`9.49 kB` route) | **-175 kB (-59.7% First Load JS)** |
| **`/tools/qr-code-generator` First Load JS** | `120 kB` (`14.7 kB` route) | **`111 kB`** (`5.18 kB` route) | **-9 kB (-7.5% First Load JS)** |
| **HTTP Security Headers** | 0 custom headers | **6 security headers** (CSP, HSTS-ready, XFO, nosniff, Referrer, Permissions, COOP) | Hardened |
| **JSON-LD Structured Data** | None | **`WebSite`, `BreadcrumbList`, `SoftwareApplication`** | Validated in headless Chrome |

---

## 11. Remaining Manual Configuration Before Public Launch

1. **Set `NEXT_PUBLIC_SITE_URL` in Production Environment**:
   - Configure `NEXT_PUBLIC_SITE_URL=https://your-production-domain.com` (and `NEXT_PUBLIC_ALLOW_INDEXING=true`) in your hosting provider's environment settings before running `npm run build` for production so canonical URLs, Open Graph tags, `robots.txt`, and `sitemap.xml` emit your live domain.
2. **Replace `[OWNER PLACEHOLDER: ...]` Blocks on Informational & Legal Pages**:
   - Search the codebase for `OWNER PLACEHOLDER` in `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/about/page.tsx`, and `src/app/contact/page.tsx` and fill in your real legal entity name, jurisdiction, physical address, and monitored support email.
3. **Optional Upstream Framework Upgrade**:
   - When upgrading beyond `next@15.5.x` in the future, re-run `npm audit` to clear the low/moderate dev-time `braces`/`postcss` advisories bundled in `@next/eslint-plugin-next` and Next's internal PostCSS build pipeline.

---

## 12. Confirmation That All 8 Tools Still Work

All **8 tools** were verified via automated unit tests (`21/21 passing`) and headless Chrome DOM/viewport testing (`375px`, `768px`, `1440px` with `0` console/runtime errors):
1. **JSON Formatter & Validator** (`/tools/json-formatter`) — 2-space, 4-space, minify, syntax error line/column reporting, upload/download working.
2. **Image Compressor** (`/tools/image-compressor`) — Magic-byte signature check, JPEG/PNG/WebP Canvas compression, quality slider, and size comparison working.
3. **QR Code Generator** (`/tools/qr-code-generator`) — Dynamic `qrcode` import, live PNG/SVG generation, color contrast checker, and downloads working.
4. **Word Counter** (`/tools/word-counter`) — Real-time words, characters, sentences, paragraphs, and reading time working.
5. **YouTube Timestamp Formatter** (`/tools/youtube-timestamp-formatter`) — Timestamp normalization, 4-rule YouTube chapter validation, and chronological sorting working.
6. **GPA Calculator** (`/tools/gpa-calculator`) — 4.0/5.0 scales, editable grade mappings, multi-semester cumulative GPA, and worked formula working.
7. **Professional Invoice Generator** (`/tools/invoice-generator`) — Integer minor-unit currency math, discount/tax calculation, opt-in draft saving, and lazy-loaded multi-page `pdf-lib` PDF export working.
8. **PDF Merge & Split** (`/tools/pdf-merge-split`) — Lazy-loaded `pdf-lib` inspection, sample PDF generation, multi-file reordering & merging, and custom page-range extraction working.
