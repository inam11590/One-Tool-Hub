# Google AdSense Authorized Digital Sellers (ads.txt) Setup Guide

**Project**: OneToolHub  
**Live Production URL**: `https://one-tool-hub-sooty.vercel.app/ads.txt`  
**Standard**: IAB Tech Lab Authorized Digital Sellers (ads.txt v1.1)

---

## What is ads.txt and Why is it Required?

`ads.txt` (Authorized Digital Sellers) is an IAB Tech Lab initiative designed to prevent domain spoofing and illegitimate ad arbitrage. Major ad networks, programmatic exchanges, and demand-side platforms (DSPs) require a published `ads.txt` file at the root of a domain before serving high-value ad inventory.

Without a verified `ads.txt` record, Google AdSense will display an account alert:  
> *"Earnings at risk — You need to fix some ads.txt file issues to avoid severe impact to your revenue."*

---

## OneToolHub Implementation Architecture

In OneToolHub, `/ads.txt` is dynamically served by a Next.js App Router handler at:
[`frontend/src/app/ads.txt/route.ts`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/app/ads.txt/route.ts)

### Strict Compliance Guarantees:
1. **No Fake or Placeholder Publisher IDs**:
   When no `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set in production, the endpoint returns an **HTTP 404** status with a descriptive plain-text notice. This prevents ad crawlers from indexing placeholder numbers (e.g. `pub-0000000000000000`) as valid seller records, protecting your domain's ad safety score.
2. **Instant Zero-Downtime Activation**:
   As soon as you add your real AdSense Client ID (`ca-pub-XXXXXXXXXXXXXXXX`) to your Vercel project environment variables, `/ads.txt` immediately begins serving the official, valid seller record without requiring a code commit or file replacement.
3. **Public Accessibility & Performance**:
   The route is served at the canonical root URL (`/ads.txt`), includes `Content-Type: text/plain; charset=utf-8`, and provides HTTP caching headers (`Cache-Control: public, max-age=3600, stale-while-revalidate=86400`).

---

## The Authorized Seller Record Format

The standard Google AdSense record line consists of 4 comma-separated fields:

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Where:
- **`google.com`**: The canonical domain name of the advertising system.
- **`pub-XXXXXXXXXXXXXXXX`**: Your unique 16-digit AdSense Publisher ID (derived by stripping the `ca-` prefix from your client ID `ca-pub-XXXXXXXXXXXXXXXX`).
- **`DIRECT`**: Declares that you (the site owner) directly control the account and ad inventory.
- **`f08c47fec0942fa0`**: Google's fixed certification authority ID from the Trustworthy Accountability Group (TAG).

---

## Step-by-Step Activation Instructions for the Site Owner

### Step 1: Obtain Your Real Publisher ID from Google AdSense
1. Log in to your approved Google AdSense account at [https://adsense.google.com/](https://adsense.google.com/).
2. In the left navigation menu, click **Sites**.
3. Locate your domain in the sites list and click on it.
4. AdSense will present the authorized seller line:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
5. Copy your 16-digit publisher ID (`pub-XXXXXXXXXXXXXXXX`) or full client ID (`ca-pub-XXXXXXXXXXXXXXXX`).

---

### Step 2: Configure Environment Variable in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) &rarr; select **`One-Tool-Hub`**.
2. Click **Settings** &rarr; **Environment Variables**.
3. Add the following environment variable:
   - **Key**: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
   - **Value**: `ca-pub-XXXXXXXXXXXXXXXX` (insert your actual AdSense client ID)
   - **Environment**: Check **Production**, **Preview**, and **Development**.
4. Click **Save**.
5. Trigger a redeployment of your latest commit in Vercel, or push an update so the new environment variable is loaded.

---

### Step 3: Verify the Live File
1. Open your browser and navigate to:
   ```text
   https://one-tool-hub-sooty.vercel.app/ads.txt
   ```
2. Confirm that the page loads an HTTP 200 response with your exact publisher record:
   ```text
   # OneToolHub Authorized Digital Sellers (ads.txt)
   # Domain: onetoolhub-sooty.vercel.app
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
3. Ensure there are no typos, extra spaces, or HTML tags.

---

### Step 4: Confirm Verification in AdSense
1. Return to the **Sites** tab in your Google AdSense dashboard.
2. Click **Check for updates** next to your domain.
3. Google's crawler typically detects and validates the file within **24 to 48 hours**. Once verified, the site status will change to **Authorized** and the warning banner will clear.

---

## Alternative: Static File in `frontend/public/`

If you prefer to serve `ads.txt` as a completely static asset rather than using Next.js route handling:
1. Create a file at `frontend/public/ads.txt`.
2. Paste your authorized seller line into `frontend/public/ads.txt`:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
3. Commit and push the file to GitHub `main`.
4. Next.js will automatically serve `public/ads.txt` at `https://one-tool-hub-sooty.vercel.app/ads.txt`, overriding the dynamic route handler.
