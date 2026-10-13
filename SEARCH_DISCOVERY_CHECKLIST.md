# OneToolHub — Search Engine Discovery & Indexing Manual Checklist

## 1. Executive Summary & Verification Context
Search engine discoverability depends on strict technical correctness: crawlable navigation, responsive rendering, valid XML sitemaps, unblocked `robots.txt` directives, reciprocal international hreflang tags, and rich structured data schemas.

This checklist provides step-by-step manual procedures for search marketing and engineering leads to verify, submit, and inspect OneToolHub across **Google Search Console** and **Bing Webmaster Tools**.

---

## 2. Technical Infrastructure Verification Matrix

| Discovery Component | Production URL / Location | Specification / Value | Status |
| :--- | :--- | :--- | :--- |
| **Robots Directives** | `https://one-tool-hub-sooty.vercel.app/robots.txt` | `User-agent: *`, `Allow: /`, `Disallow: /growth` | **VERIFIED** |
| **Sitemap Endpoint** | `https://one-tool-hub-sooty.vercel.app/sitemap.xml` | 58 verified canonical production URLs | **VERIFIED** |
| **GSC Verification** | `<meta name="google-site-verification" ... />` | Token embedded in root HTML header | **VERIFIED** |
| **Canonical Tags** | `<link rel="canonical" ... />` | 100% self-referencing absolute canonicals | **VERIFIED** |
| **Hreflang Tags** | `<link rel="alternate" hreflang="..." />` | Symmetric `en`, `ur`, `x-default` tags | **VERIFIED** |
| **Structured Data** | `<script type="application/ld+json">` | `WebSite`, `BreadcrumbList`, `SoftwareApplication`, `Article`, `FAQPage` | **VERIFIED** |
| **Internal Broken Links**| Site-wide crawl | 0 broken internal links (404 errors) | **VERIFIED** |
| **HTTP Status Codes** | Core production routes | All return HTTP/2 200 OK | **VERIFIED** |

---

## 3. Google Search Console (GSC) Manual Action Guide

### Step 1: Property Verification
1. Open [Google Search Console](https://search.google.com/search-console).
2. Select Property: `https://one-tool-hub-sooty.vercel.app`.
3. Confirm ownership status: **Verified via HTML Meta Tag**.

### Step 2: Sitemap Submission
1. In the left navigation menu, click **Sitemaps**.
2. Under "Add a new sitemap", enter: `sitemap.xml`.
3. Click **Submit**.
4. Confirm message: *Sitemap submitted successfully*.
5. Monitor "Status": Should change from *Processing* to *Success* with 58 discovered pages.

### Step 3: Priority URL Inspection & Live Test
Run the URL Inspection tool for high-intent representative routes:
1. **Root English**: `https://one-tool-hub-sooty.vercel.app/`
2. **Tool Route (Developer)**: `https://one-tool-hub-sooty.vercel.app/tools/json-formatter`
3. **Tool Route (PDF)**: `https://one-tool-hub-sooty.vercel.app/tools/image-compressor`
4. **Learning Guide**: `https://one-tool-hub-sooty.vercel.app/learn/how-to-format-and-validate-json`
5. **Urdu Root**: `https://one-tool-hub-sooty.vercel.app/ur`
6. **Urdu Tool**: `https://one-tool-hub-sooty.vercel.app/ur/tools/gpa-calculator`

**What to verify during Live Test**:
- Page fetch: *Successful (HTTP 200)*.
- Mobile usability: *Page is usable on mobile*.
- Declared canonical matches inspected URL.
- User-declared hreflang tags detected by Googlebot.

---

## 4. Bing Webmaster Tools Manual Action Guide

### Step 1: Property Import or Verification
1. Log into [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Option A: Click **Import from Google Search Console** (fastest, preserves verification).
3. Option B: Add site URL `https://one-tool-hub-sooty.vercel.app` and verify via HTML Meta tag.

### Step 2: Submit Sitemap
1. Navigate to **Sitemaps** in the left sidebar.
2. Click **Submit Sitemap**.
3. Input: `https://one-tool-hub-sooty.vercel.app/sitemap.xml`.
4. Click **Submit**.

### Step 3: URL Inspection & SEO Diagnostic Audit
1. Run Bing's **URL Inspection Tool** on `/tools/code-diff-checker`.
2. Run Bing's built-in **SEO Reports** tool to verify:
   - Zero missing alt tags.
   - Clean title tag lengths (< 65 characters).
   - Zero duplicate title warnings.

---

## 5. Ongoing Monitoring & Remediation Schedule

| Interval | Inspection Task | Expected Signal | Remediation If Failed |
| :--- | :--- | :--- | :--- |
| **Day 3** | Check GSC "Sitemaps" status | Status = "Success", Discovered URLs = 58 | Inspect server logs for sitemap XML parsing errors |
| **Day 7** | Check GSC "Page indexing" | Initial pages moving to "Indexed" | Check for accidental `noindex` or staging headers |
| **Day 14** | Audit "Hreflang" in GSC | Zero "No return tag" errors | Verify reciprocal URL matching in `frontend/src/lib/seo.ts` |
| **Day 21** | Review initial Search Queries | First organic impressions logged | Check query intent against `KEYWORD_CONTENT_MAP.md` |
| **Day 30** | Run First Monthly CSV Export | Export GSC Queries & Pages CSV | Upload to `/growth` dashboard for in-browser analysis |

---

## 6. Zero-Automation Disclaimer
In strict accordance with search engine terms of service, OneToolHub does not execute automated ping scripts, scraping crawlers, or third-party automated submission bots. All search console actions must follow the manual protocols defined above.
