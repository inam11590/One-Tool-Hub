# OneToolHub — Google Search Console Setup & Indexing Guide

This guide explains how to verify ownership of **OneToolHub** (`https://one-tool-hub-sooty.vercel.app`) in **Google Search Console**, confirm canonical URLs, and submit your `sitemap.xml`.

---

## 1. Production URL & Environment Configuration

- **Live Production URL**: `https://one-tool-hub-sooty.vercel.app`
- **Sitemap URL**: `https://one-tool-hub-sooty.vercel.app/sitemap.xml`
- **Robots File**: `https://one-tool-hub-sooty.vercel.app/robots.txt`

In your **Vercel Project Dashboard → Settings → Environment Variables** (Production environment):

```bash
# 1. Canonical production HTTPS origin (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://one-tool-hub-sooty.vercel.app

# 2. HTML meta verification token from Google Search Console (URL Prefix method)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_token_here
```

> **Note on Automatic Fallback & Preview Protection (`frontend/src/lib/seo.ts` & `frontend/next.config.ts`)**:
> - On **Vercel Production** (`VERCEL_ENV=production`), `getSiteUrlConfig()` automatically resolves `https://one-tool-hub-sooty.vercel.app` (via `NEXT_PUBLIC_SITE_URL` or `VERCEL_PROJECT_PRODUCTION_URL`), emits `Allow: /` in `/robots.txt`, and outputs all **14 indexable public URLs** in `/sitemap.xml`.
> - On **Vercel Preview Deployments** (`VERCEL_ENV=preview`, such as branch or commit URLs like `https://one-tool-*.vercel.app`), OneToolHub automatically blocks search engine indexing via three layers:
>   1. `/robots.txt` outputs `User-Agent: *` and `Disallow: /` (with no sitemap link).
>   2. Every page's `<meta name="robots">` is forced to `noindex, nofollow`.
>   3. Every HTTP response includes `X-Robots-Tag: noindex, nofollow`.

---

## 2. Ownership Verification in Google Search Console

Because `https://one-tool-hub-sooty.vercel.app` is hosted on a `.vercel.app` subdomain (or if you later attach a custom domain), choose the matching property type in [Google Search Console](https://search.google.com/search-console):

### Option A: URL-Prefix Property (Recommended for `https://one-tool-hub-sooty.vercel.app`)
1. Open [Google Search Console](https://search.google.com/search-console) and click **Add property**.
2. Under **URL prefix**, enter:
   ```text
   https://one-tool-hub-sooty.vercel.app
   ```
3. Click **Continue** and expand the **HTML tag** verification method:
   ```html
   <meta name="google-site-verification" content="abcDEF123_-exampleTokenValue" />
   ```
4. Copy **only the `content` token string** (`abcDEF123_-exampleTokenValue`).
5. In **Vercel Dashboard → Project Settings → Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value**: `abcDEF123_-exampleTokenValue`
   - **Environment**: Production
6. Trigger a production deployment so `frontend/src/app/layout.tsx` renders `<meta name="google-site-verification" content="..." />` in the `<head>`.
7. Return to Google Search Console and click **Verify**.

### Option B: Domain Property (If You Attach a Custom Domain Later)
1. In Google Search Console, click **Add property** and choose **Domain** (e.g., `onetoolhub.com`).
2. Copy the DNS `TXT` record provided by Google (`google-site-verification=...`).
3. Add the `TXT` record in your domain registrar or DNS provider.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your custom HTTPS domain and redeploy.
5. Click **Verify** in Google Search Console.

---

## 3. Submitting `sitemap.xml`

1. After ownership verification succeeds in Google Search Console, select your property (`https://one-tool-hub-sooty.vercel.app`).
2. In the left navigation menu, click **Sitemaps**.
3. Under **Add a new sitemap**, enter:
   ```text
   sitemap.xml
   ```
4. Click **Submit**.
5. Confirm that Search Console reports status **Success** and discovers all **14 indexable URLs**:
   - `/` (Homepage)
   - `/tools` (All Tools Directory)
   - `/about`
   - `/contact`
   - `/privacy`
   - `/terms`
   - `/tools/youtube-timestamp-formatter`
   - `/tools/json-formatter`
   - `/tools/image-compressor`
   - `/tools/qr-code-generator`
   - `/tools/word-counter`
   - `/tools/gpa-calculator`
   - `/tools/invoice-generator`
   - `/tools/pdf-merge-split`

---

## 4. URL Inspection & Rich Result Checks

1. Use the **URL Inspection** bar at the top of Google Search Console to inspect:
   - `https://one-tool-hub-sooty.vercel.app/`
   - `https://one-tool-hub-sooty.vercel.app/tools/json-formatter`
   - `https://one-tool-hub-sooty.vercel.app/tools/image-compressor`
   - `https://one-tool-hub-sooty.vercel.app/tools/qr-code-generator`
   - `https://one-tool-hub-sooty.vercel.app/tools/word-counter`
   - `https://one-tool-hub-sooty.vercel.app/tools/youtube-timestamp-formatter`
   - `https://one-tool-hub-sooty.vercel.app/tools/gpa-calculator`
   - `https://one-tool-hub-sooty.vercel.app/tools/invoice-generator`
   - `https://one-tool-hub-sooty.vercel.app/tools/pdf-merge-split`
2. Click **Test Live URL** and **Request Indexing** once verified.
