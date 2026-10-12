# LOCALIZATION & I18N ARCHITECTURE SPECIFICATION — ONETOOLHUB (STEP 17)

**Specification Date**: October 12, 2026  
**Architect**: Principal Next.js Architect & Senior Localization Engineer  
**Production URL**: https://one-tool-hub-sooty.vercel.app  
**System Status**: Production-grade Zero-Dependency Internationalization Architecture  

---

## 1. Architectural Philosophy & Design Invariants

OneToolHub’s internationalization (i18n) system is built on four core design principles:
1. **Preserve Default English URLs**: Existing English routes (`/`, `/tools`, `/learn`, `/tools/[slug]`) remain canonical, root-level, and completely unaffected.
2. **Sub-Path Locale Prefixing**: Localized languages reside under dedicated sub-paths (e.g. `/ur` for Urdu, `/ur/tools`, `/ur/learn`).
3. **Zero-Dependency Lightweight Typed Dictionaries**: Rather than introducing heavy external libraries (like `next-intl` or `react-i18next` that add runtime bundle bloat and middleware complexity), localization is driven by strongly-typed TypeScript dictionaries (`frontend/src/lib/i18n/types.ts`).
4. **Bi-Directional RTL Support Without Logic Duplication**: Business logic, math algorithms, WebCrypto routines, and canvas image manipulation remain shared and 100% client-side. Only UI strings, directionality (`dir="rtl"`), and fonts adapt.

---

## 2. Directory Structure & Module Breakdown

```
frontend/src/
├── lib/
│   └── i18n/
│       ├── config.ts            # Locale definitions (en, ur), directionality, path formatters
│       ├── types.ts             # Strongly-typed TranslationDictionary interface
│       ├── index.ts             # Dictionary loader & fallback getter
│       ├── tools-ur.ts          # Complete Urdu metadata mapping for all 24 tools
│       └── dictionaries/
│           ├── en.ts            # Full English dictionary
│           └── ur.ts            # Full Urdu dictionary (authentic native translations)
├── components/
│   └── layout/
│       └── LanguageSwitcher.tsx # Accessible header language toggle (English <-> اردو)
└── app/
    ├── ur/
    │   ├── page.tsx             # Localized Urdu Homepage (dir="rtl", lang="ur")
    │   ├── tools/
    │   │   └── page.tsx         # Localized Urdu Tools Directory
    │   └── learn/
    │       └── page.tsx         # Localized Urdu Learning Center
```

---

## 3. Directionality & Typography Strategy (RTL / LTR)

- **Layout Hierarchy**:
  - English pages inherit `<html lang="en">` with natural `dir="ltr"`.
  - Urdu routes (`/ur`, `/ur/tools`, `/ur/learn`) declare `<div dir="rtl" lang="ur">` at the root layout boundary.
- **Code & Output Preservations**:
  - Code editors, JSON output viewports, Regex test panels, UUID displays, and mathematical calculations are strictly protected with `dir="ltr"` and `text-left` to preserve technical integrity.
- **Font Stack**:
  - Urdu typography uses system Arabic/Urdu Naskh fallback stacks (`system-ui, "Noto Naskh Arabic", "Segoe UI", Tahoma, sans-serif`) to ensure legible font rendering across Windows, macOS, Android, and iOS.

---

## 4. Scalability for Future Locales

Adding a new language (e.g. Spanish, Arabic, French) requires three simple steps without re-architecting the application:
1. Add the locale code to `SUPPORTED_LOCALES` in `lib/i18n/config.ts`.
2. Implement the typed `TranslationDictionary` file in `lib/i18n/dictionaries/<locale>.ts`.
3. Add the sub-path route folder under `app/<locale>/`.
