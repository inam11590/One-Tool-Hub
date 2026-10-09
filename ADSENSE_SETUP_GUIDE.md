# Google AdSense Setup & Activation Guide — OneToolHub

**Project**: OneToolHub  
**Target Domain**: `https://one-tool-hub-sooty.vercel.app` (or custom domain)  
**Version**: Next.js 15 App Router

---

## Overview

OneToolHub includes a modular, privacy-first, and policy-compliant advertising architecture. By default, **all advertising scripts and placements are disabled**.

This guide outlines the exact end-to-end procedure for:
1. Submitting your Google AdSense application.
2. Verifying site ownership.
3. Enabling Google's certified Consent Management Platform (CMP) for European traffic.
4. Configuring production environment variables.
5. Testing live ad units safely without risking invalid traffic penalties.

---

## Step 1: Submitting Your Application

1. Go to [https://adsense.google.com/start/](https://adsense.google.com/start/) and sign in with your Google account.
2. Enter your site URL:
   - If using your Vercel subdomain: `https://one-tool-hub-sooty.vercel.app`
   - If using a custom apex domain: `https://yourdomain.com`
3. Select your country/territory for payment and tax reporting.
4. Review and accept the AdSense Terms and Conditions, then click **Start using AdSense**.

---

## Step 2: Site Ownership Verification

Google AdSense offers three methods to verify site ownership:

### Option A: AdSense Code Snippet (Recommended)
1. In the AdSense dashboard, copy the provided `<script>` snippet containing your assigned `ca-pub-XXXXXXXXXXXXXXXX` client ID.
2. Copy *only* the `ca-pub-XXXXXXXXXXXXXXXX` string.
3. In your Vercel project settings, set:
   ```env
   NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"
   NEXT_PUBLIC_ENABLE_ADS="true"
   ```
4. Once deployed, OneToolHub's [`AdProvider`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/ads/AdProvider.tsx) will load the official script tag:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
5. Click **Verify** in the AdSense dashboard.

### Option B: ads.txt Verification
1. With `NEXT_PUBLIC_ADSENSE_CLIENT_ID` set, verify that `https://one-tool-hub-sooty.vercel.app/ads.txt` is serving:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
2. AdSense will detect this file and confirm ownership.

---

## Step 3: Configure Privacy & Messaging for EEA / UK Traffic

Google's EU User Consent Policy requires an IAB Europe TCF v2.2 certified CMP to serve personalized or non-personalized ads to visitors in the European Economic Area (EEA), United Kingdom, and Switzerland.

### How to Enable Google's Free Built-in CMP:
1. In your Google AdSense dashboard, click **Privacy & messaging** in the left menu.
2. Click **GDPR** &rarr; **Create message**.
3. Under **Select your sites**, choose your domain and click **Add domain**.
4. In the **Privacy Policy URL** field, enter:
   ```text
   https://one-tool-hub-sooty.vercel.app/privacy
   ```
5. Choose your default language (English).
6. Under **User choices**, select **Do not consent** and **Manage options** so visitors have full choice.
7. Click **Publish**.

*Note: Google will now automatically serve its certified consent dialog to visitors arriving from European IP addresses before serving ad creatives, ensuring 100% policy compliance.*

---

## Step 4: Ad Placement Options

OneToolHub supports both Google Auto Ads and Curated Manual Ad Units.

### Option A: Auto Ads (Simplest)
1. In AdSense, navigate to **Ads** &rarr; **By site**.
2. Click the edit icon next to your domain.
3. Toggle **Auto ads** to **ON**.
4. Set the **Ad load** slider to moderate (preventing ad clutter on tool pages).
5. Under **Excluded areas**, consider excluding the interactive tool workspace area (`#main-content section[aria-label$="Workspace"]`).

### Option B: Curated Manual Ad Units (Recommended for Superior UX)
If you prefer precise layout control, use OneToolHub's pre-wired ad slots:
1. In AdSense, go to **Ads** &rarr; **By ad unit** &rarr; click **Display ads**.
2. Create responsive ad units for:
   - `learn_article_body` (Responsive horizontal banner)
   - `learn_sidebar` (Responsive rectangle unit)
   - `learn_article_bottom` (Responsive horizontal banner)
   - `tool_page_bottom` (Responsive horizontal unit)
3. Copy the numeric `data-ad-slot` ID for each unit.
4. Pass the unit ID to the corresponding `<AdSlot slotId="..." adUnitId="1234567890" />` component.

---

## Step 5: Safe Testing Guidelines (Preventing Invalid Traffic Bans)

Google strictly monitors ad impressions and clicks. Violating click policies can lead to immediate account suspension or termination.

> [!CAUTION]
> **NEVER click your own live advertisements.**
> Clicking your own ads, even once "just to test if it works", is flagged as invalid traffic by Google's anti-fraud algorithms.

### How to Test Safely:
1. **Local Development Test Mode**:
   When running in development (`NODE_ENV !== "production"`), [`AdSlot`](file:///Users/mac/Documents/One-Tool-Hub/frontend/src/components/ads/AdSlot.tsx) automatically adds `data-ad-test="on"`.
2. **Google Publisher Toolbar / Ad Inspector**:
   Use Chrome DevTools with Google's official Ad Inspector to inspect ad tags and test filled vs. unfilled ad requests without registering commercial impressions.
3. **Check Browser Console**:
   Open browser developer tools and verify that:
   - `adsbygoogle.js` loads with HTTP 200.
   - `window.adsbygoogle.push({})` executes without throwing errors.
   - No layout shift or visual overflow occurs.

---

## Troubleshooting Common AdSense Issues

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| **"Site cannot be reached"** | DNS or staging URL blocking crawler | Ensure Vercel production deployment has HTTPS active and robots.txt allows `Mediapartners-Google`. |
| **"Low value content"** | Pages lack sufficient unique text | Ensure review is conducted after Learning Center tutorials (`/learn`) are deployed and indexed. |
| **Ads appear as blank spaces** | AdSense account still under review, or ad unit has no advertiser bids | Normal during initial 48-72 hour ramp-up period. New accounts take time to achieve 100% fill rates. |
| **"Earnings at risk: ads.txt"** | `ads.txt` not found or unverified | Check `https://yourdomain.com/ads.txt`. Ensure `pub-XXXXXXXXXXXXXXXX` matches your account exactly. |
