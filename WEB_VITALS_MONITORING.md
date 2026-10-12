# REAL USER WEB VITALS MONITORING — ONETOOLHUB (STEP 16)

**Audit Date**: October 12, 2026  
**Author**: Principal Web Performance Architect  
**Production Site**: https://one-tool-hub-sooty.vercel.app  
**Telemetry Target**: Anonymous RUM (Real User Metrics) via Google Analytics 4  

---

## 1. Web Vitals Architecture & Core Philosophy

Web performance measurement at OneToolHub is separated into two distinct categories:
1. **Laboratory Measurements (Synthetic)**: Captured during local builds, Lighthouse audits, and staging tests under controlled network conditions.
2. **Real User Monitoring (RUM)**: Collected from actual users across diverse geographic locations, network speeds (3G/4G/5G/Fiber), and mobile hardware.

---

## 2. Core Metrics & Rating Thresholds

OneToolHub monitors the three official Core Web Vitals plus supplementary diagnostics defined by the Google Web Vitals initiative:

| Metric Name | Full Descriptor | Target Threshold ("Good") | "Needs Improvement" | "Poor" | Impact Area |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **LCP** | Largest Contentful Paint | $\le 2.5\text{ s}$ | $2.5\text{ s} - 4.0\text{ s}$ | $> 4.0\text{ s}$ | Visual loading speed |
| **INP** | Interaction to Next Paint | $\le 200\text{ ms}$ | $200\text{ ms} - 500\text{ ms}$ | $> 500\text{ ms}$ | UI interactivity & responsiveness |
| **CLS** | Cumulative Layout Shift | $\le 0.1$ | $0.1 - 0.25$ | $> 0.25$ | Visual stability & layout jumps |
| **FCP** | First Contentful Paint | $\le 1.8\text{ s}$ | $1.8\text{ s} - 3.0\text{ s}$ | $> 3.0\text{ s}$ | Initial response perceived speed |
| **TTFB** | Time to First Byte | $\le 800\text{ ms}$ | $800\text{ ms} - 1.8\text{ s}$ | $> 1.8\text{ s}$ | Vercel Edge CDN latency |

---

## 3. Privacy-Conscious RUM Implementation

Implemented via `frontend/src/lib/web-vitals.ts`:
- **Consent Gating**: Metrics are only dispatched if `isAnalyticsConsentGiven() === true`. Users who decline or have not answered the consent banner emit zero telemetry.
- **URL & Param Stripping**: Only metric names, rounded numerical values, ratings, and anonymous synthetic IDs are forwarded. URL query parameters, hash fragments, and form values are strictly excluded.
- **Payload Minimization**: Dispatches a standard Google Analytics `web_vitals_measurement` event with zero additional third-party tracking scripts or external npm dependencies.

---

## 4. Laboratory vs. Field Data Comparison

- **Laboratory Baseline (Step 15 Build)**:
  - Prerendered Static Routes: 61/61
  - Shared First Load JS: 103 kB
  - Static Server TTFB: ~40–80 ms (Edge-cached CDN)
- **Field Data (Ongoing RUM)**:
  - Ingested via GA4 Explorations under the `web_vitals_measurement` custom event namespace.
