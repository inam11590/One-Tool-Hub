# MULTILINGUAL WEB PERFORMANCE REPORT — ONETOOLHUB (STEP 18)

**Audit Date**: October 13, 2026  
**Auditor**: Principal Web Performance Engineer & Next.js Architect  
**Production Site**: https://one-tool-hub-sooty.vercel.app  
**Target Profile**: Core Web Vitals (LCP, INP, CLS) across English & Urdu Viewports  

---

## 1. Executive Summary

This performance report analyzes bundle distribution, dictionary loading, font rendering, and Core Web Vitals impact following the deployment of the Step 17 & Step 18 multilingual architecture.

### Key Performance Findings:
1. **Zero Runtime i18n Bloat**: By avoiding heavy external internationalization dependencies, the shared first load JavaScript remains unchanged at **103 kB** across all 64 static routes.
2. **Lean Route Payloads**:
   - English Homepage (`/`): 130 kB First Load JS.
   - Urdu Homepage (`/ur`): 130 kB First Load JS.
   - English Directory (`/tools`): 126 kB First Load JS.
   - Urdu Directory (`/ur/tools`): 126 kB First Load JS.
3. **No Duplicate Translation Bundling**: Localized strings are compiled into static page HTML at build time, eliminating client-side JSON translation network fetches.
4. **Font Optimization**: Uses high-performance system font stacks (`system-ui, "Noto Naskh Arabic", "Segoe UI", Tahoma, sans-serif`), preventing external web font downloads or Flash of Unstyled Text (FOUT).

---

## 2. Laboratory Metrics & Measured Build Timings

| Metric | Measured Value | Standard Threshold | Evaluation |
| :--- | :---: | :---: | :---: |
| **Shared Base JS** | 103 kB | < 120 kB | **Excellent** |
| **Urdu Route Overhead** | +0 kB (100% Shared) | < 10 kB | **Optimal** |
| **Build Prerender Duration** | 4.4 seconds | < 30 seconds | **Ultra-Fast** |
| **Static Route Count** | 64 routes | Prerendered | **100% SSG** |
| **Code-Split PDF Tools** | Lazy-loaded on demand | Isolated | **Non-blocking** |

---

## 3. Real User Monitoring (RUM) Readiness

In Step 16, client-side Web Vitals telemetry was implemented via `frontend/src/lib/web-vitals.ts`. 
- Gated strictly by user cookie consent.
- Captures LCP, INP, and CLS field metrics anonymously via GA4 custom events (`web_vitals_measurement`).
- Reports zero user inputs, URLs, or query parameters.
