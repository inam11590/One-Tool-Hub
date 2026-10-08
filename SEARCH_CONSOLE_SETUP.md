# OneToolHub — Google Search Console Setup & Indexing Guide

This guide explains how to verify ownership of **OneToolHub** in **Google Search Console**, enable production indexing safely, and submit your dynamic `sitemap.xml`.

---

## 1. Prerequisites Before Verification

By design, OneToolHub prevents accidental indexing of localhost, preview, or staging deployments. Before submitting your site to Google Search Console, ensure your production environment variables are configured:

```bash
# 1. Your canonical production HTTPS origin (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com

# 2. Explicitly allow search engine indexing on the live production deployment
NEXT_PUBLIC_ALLOW_INDEXING=true

# 3. Optional HTML meta verification token from Google Search Console
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_token_here
```

When both `NEXT_PUBLIC_SITE_URL` (a non-localhost HTTPS URL) and `NEXT_PUBLIC_ALLOW_INDEXING=true` are set:
- Every indexable page emits `<meta name="robots" content="index, follow" />` and an accurate `<link rel="canonical" ... />`.
- `/robots.txt` allows crawling (`Allow: /`) and advertises `Sitemap: https://www.yourdomain.com/sitemap.xml`.
- `/sitemap.xml` lists all 13 indexable public routes (Homepage, `/tools`, `/categories`, `/about`, `/privacy`, and all 8 tool routes).

---

## 2. Ownership Verification Methods

You can verify ownership in [Google Search Console](https://search.google.com/search-console) using either of the two standard methods below:

### Method A: DNS TXT Record (Recommended for Domain Properties)
1. In Google Search Console, click **Add property** and choose **Domain** (e.g., `yourdomain.com`).
2. Copy the TXT record provided by Google (`google-site-verification=...`).
3. Add the TXT record in your DNS provider (Cloudflare, Route 53, Namecheap, etc.).
4. Click **Verify** in Google Search Console.

### Method B: HTML Meta Tag (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)
1. In Google Search Console, click **Add property** and choose **URL prefix** (e.g., `https://www.yourdomain.com`).
2. Select the **HTML tag** verification method:
   ```html
   <meta name="google-site-verification" content="abcDEF123_-exampleTokenValue" />
   ```
3. Copy **only the `content` value** (`abcDEF123_-exampleTokenValue`).
4. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abcDEF123_-exampleTokenValue` in your production environment variables and redeploy.
5. `frontend/src/app/layout.tsx` (via `getGoogleSiteVerificationToken()` in `frontend/src/lib/seo.ts`) will automatically render `<meta name="google-site-verification" content="..." />` in the document `<head>`.
6. Click **Verify** in Google Search Console.

---

## 3. Submitting `sitemap.xml`

1. Once your property is verified in Google Search Console, open the left sidebar and click **Sitemaps**.
2. Under **Add a new sitemap**, enter:
   ```text
   sitemap.xml
   ```
   (or `https://www.yourdomain.com/sitemap.xml`).
3. Click **Submit**.
4. Confirm that Search Console reports status **Success** and discovers all 13 indexable URLs.

---

## 4. Inspecting Canonical URLs & Structured Data

1. Use the **URL Inspection** bar at the top of Google Search Console to inspect:
   - `https://www.yourdomain.com/`
   - `https://www.yourdomain.com/tools/json-formatter`
   - `https://www.yourdomain.com/tools/invoice-generator`
   - `https://www.yourdomain.com/tools/pdf-merge-split`
2. Click **Test Live URL** to confirm:
   - **Page availability**: Page can be indexed (`index, follow`).
   - **Canonical URL**: User-declared canonical matches the inspected route.
   - **Enhancements / Rich Results**: Valid `WebSite`, `BreadcrumbList`, and `SoftwareApplication` JSON-LD schemas are detected without errors or fabricated ratings.
