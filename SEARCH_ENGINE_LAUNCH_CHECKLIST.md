# SEARCH ENGINE LAUNCH & SITEMAP CHECKLIST — ONETOOLHUB (STEP 18)

**Effective Date**: October 13, 2026  
**Document Owner**: Senior Release Manager & International Technical SEO Lead  
**Scope**: Manual submission and crawl verification for Google Search Console & Bing Webmaster Tools  

---

## 1. Multi-Regional Sitemap Specification

- **Sitemap Location**: `https://one-tool-hub-sooty.vercel.app/sitemap.xml`
- **Total Published URLs**: **58 URLs**
  - **7 English Static Pages**: `/`, `/tools`, `/learn`, `/about`, `/contact`, `/privacy`, `/terms`
  - **24 English Core Tools**: `/tools/[slug]`
  - **24 English Learning Center Guides**: `/learn/[slug]`
  - **3 Verified Urdu Pilot Hubs**: `/ur`, `/ur/tools`, `/ur/learn`
- **Robots.txt Location**: `https://one-tool-hub-sooty.vercel.app/robots.txt`
  - Explicitly references the sitemap URL.
  - Correctly disallows private reporting routes (`/growth`, `/api/`).

---

## 2. Manual Search Console Submission Protocol

*Important: In accordance with critical release guidelines, sitemaps and URLs must never be submitted automatically via external scripts. Perform these steps manually in the respective webmaster consoles upon release.*

### Step 1: Google Search Console (GSC) Verification
1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Select the property: `https://one-tool-hub-sooty.vercel.app`.
3. Navigate to **Indexing > Sitemaps**.
4. In "Add a new sitemap", enter: `sitemap.xml` and click **Submit**.
5. Verify status returns **Success** with 58 discovered URLs.
6. Check **Enhancements > Hreflang** (or International Targeting report) to confirm zero alternate tag mismatch errors.

### Step 2: Bing Webmaster Tools Verification
1. Log in to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Select property `https://one-tool-hub-sooty.vercel.app`.
3. Navigate to **Sitemaps** > **Submit Sitemap**.
4. Enter: `https://one-tool-hub-sooty.vercel.app/sitemap.xml` and submit.
5. Verify status reads **Processing** / **Success**.

---

## 3. Post-Launch Crawl Monitoring Protocol

Within 7–14 days following sitemap submission:
- **Coverage / Page Indexing Report**: Monitor valid indexed pages; confirm 0 "Duplicate without user-selected canonical" errors.
- **Hreflang Monitoring**: Ensure Googlebot recognizes reciprocal alternates between `/tools` and `/ur/tools`.
- **Search Queries (Performance)**: Review impressions and clicks for Urdu queries (e.g. `امیج کمپریسر`, `پی ڈی ایف کنورٹر`).
