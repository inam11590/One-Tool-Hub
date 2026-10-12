# INTERNATIONALIZATION & MULTILINGUAL BASELINE AUDIT — ONETOOLHUB (STEP 17)

**Audit Date**: October 12, 2026  
**Auditor**: Principal Next.js Architect & International SEO Specialist  
**Production Site**: https://one-tool-hub-sooty.vercel.app  
**Baseline Status**: Clean working tree, 54/54 automated tests passing, 0 TypeScript errors, 0 ESLint warnings, 61 static routes + 1 edge dynamic health route.

---

## 1. Executive Summary

This baseline audit evaluates the existing routing, metadata architecture, layout directionality, typography, search capabilities, and sitemap generation prior to implementing the Step 17 internationalization (i18n) and Urdu localization pilot.

### Baseline Metrics & Invariants
- **Default Locale**: English (`en`), root URLs (e.g. `/`, `/tools`, `/learn`, `/tools/[slug]`).
- **Target Additional Locale**: Urdu (`ur`), routed under the prefix `/ur` (e.g. `/ur`, `/ur/tools`, `/ur/learn`, `/ur/tools/[slug]`).
- **Total Existing Tools**: 24 working browser-based tools.
- **Total Existing Tutorials**: 24 educational articles in the Learning Center.
- **Root Layout Language**: Currently hardcoded to `<html lang="en">` in `frontend/src/app/layout.tsx`.
- **Directionality**: Left-to-Right (`dir="ltr"`). RTL styles not yet configured in Tailwind or global styles.
- **Typography**: Inter/system UI sans-serif fonts; no Arabic/Urdu Naskh or Nastaliq fallback stack defined.
- **Shared First Load JS**: 103 kB.

---

## 2. Existing Routing & Metadata Inspection

1. **App Router Structure**:
   - Flat directory structure: `src/app/tools/[slug]/page.tsx` exists as individual route folders (e.g. `src/app/tools/json-formatter/page.tsx`), providing custom SEO metadata, FAQs, and overview descriptions per tool.
   - Learning Center dynamic route: `src/app/learn/[slug]/page.tsx` using `generateStaticParams()` over `LEARN_ARTICLES`.
2. **SEO & Canonical Generator (`src/lib/seo.ts`)**:
   - `buildPageMetadata()` constructs canonical URLs against `https://one-tool-hub-sooty.vercel.app`.
   - Lacks `alternates.languages` (hreflang) support.
   - OpenGraph locale is hardcoded to `en_US`.
3. **XML Sitemap (`src/app/sitemap.ts`)**:
   - Currently generates 55 English URLs with `changeFrequency` and `priority`.
   - Does not yet emit localized `/ur` URLs or hreflang alternate relationship attributes.

---

## 3. Localization Architecture Strategy

To prevent bloating bundle size and to avoid duplicating business logic across hundreds of duplicate files:
1. **Zero-Dependency Lightweight Dictionary System**:
   - Define typed translation dictionaries (`src/lib/i18n/dictionaries/ur.ts` and `en.ts`).
   - Define route-level localization maps for navigation, headers, footers, tool categories, and interface strings.
2. **Route Preservation**:
   - All 24 English routes remain canonical and primary at `/tools/...` and `/learn/...`.
   - Urdu localized pilot routes are hosted under `/ur`, `/ur/tools`, `/ur/learn`, and `/ur/tools/[slug]`.
3. **Bi-Directional RTL Support**:
   - Dynamic `dir="rtl"` and `lang="ur"` applied to Urdu pages.
   - Code blocks, JSON viewports, regex inputs, UUIDs, and numbers strictly preserved as LTR (`dir="ltr"`).
4. **Accessible Language Switcher**:
   - Placed in the global header with reciprocal navigation (`/tools/X` <-> `/ur/tools/X`).
