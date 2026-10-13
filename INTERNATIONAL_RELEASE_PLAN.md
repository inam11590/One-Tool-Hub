# OneToolHub — International Production Release & Rollback Plan

## 1. Release Objective & Architecture Context
This document governs the controlled production deployment of **Step 18: International Production Launch Readiness & Multilingual SEO Validation** for OneToolHub (`https://one-tool-hub-sooty.vercel.app`).

### Release Scope
- Launch of English + Urdu multilingual routing architecture.
- Full release of 24 localized Urdu tool pages (`/ur/tools/[slug]`).
- Directional RTL layout support (`dir="rtl"`) with Urdu typography.
- Bi-directional client-side language switcher with deep-link path preservation.
- Reciprocal `hreflang` tags (`en`, `ur`, `x-default`) and self-referencing canonical URLs.
- Multi-language XML sitemap (`/sitemap.xml`) including all verified English & Urdu routes.
- Exclusion of unverified Urdu tutorials to protect search quality and prevent thin-content penalties.

---

## 2. Pre-Release Verification Gates (Go / No-Go Criteria)

All six gates must strictly evaluate to **PASSED** before initiating production deployment:

| Gate | Verification Command / Metric | Required Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Gate 1: TypeScript Quality** | `npm run typecheck` | 0 errors | **PASSED** |
| **Gate 2: Code Linting** | `npm run lint` | 0 warnings, 0 errors | **PASSED** |
| **Gate 3: Automated Unit & Regress Tests** | `npm test` | 100% passing (57+ tests) | **PASSED** |
| **Gate 4: Static Site Generation Build** | `npm run build` | 64 static routes, 0 errors | **PASSED** |
| **Gate 5: Shared JS Bundle Size** | Next.js Build Output | First Load JS < 110 kB (Actual: 103 kB) | **PASSED** |
| **Gate 6: SEO Reciprocity** | Hreflang & Canonical Audit | 100% reciprocal symmetry | **PASSED** |

**Go / No-Go Decision**: **GO FOR PRODUCTION RELEASE** (Subject to user approval).

---

## 3. Production Deployment Execution Steps

```
[Phase 1: Local Sanity] ---> [Phase 2: GitHub Push] ---> [Phase 3: Vercel Production Build] ---> [Phase 4: Smoke Test]
```

### Phase 1: Local Commit & Verification
1. Ensure all documentation and test suites are saved and clean.
2. Confirm zero untracked runtime artifacts or build artifacts in Git staging.

### Phase 2: Remote Triggering
1. Commit changes to `main` branch: `git commit -m "feat(i18n): finalize step 18 international release validation and multilingual launch readiness"`.
2. Push to GitHub: `git push origin main`.
3. Vercel automatically detects new commit on `main` and initiates atomic preview and production build.

### Phase 3: Vercel Atomic Build Verification
1. Monitor build execution in Vercel dashboard or CLI.
2. Verify Next.js App Router prerenders all 64 static routes without dynamic bailouts.
3. Verify edge route `/api/health` builds as Edge Function.

---

## 4. Post-Deployment Smoke Test Protocol (Live Production)

Execute immediately following Vercel deployment completion:

### 4.1 Production URL Checklist
Run HTTP curl checks against the live production host:

```bash
# 1. Edge Health Endpoint
curl -I -s https://one-tool-hub-sooty.vercel.app/api/health | head -n 1
# Expected: HTTP/2 200

# 2. English Homepage & Urdu Homepage
curl -I -s https://one-tool-hub-sooty.vercel.app/ | head -n 1
curl -I -s https://one-tool-hub-sooty.vercel.app/ur | head -n 1
# Expected: HTTP/2 200

# 3. Tool Route Parity (Example: JSON Formatter)
curl -I -s https://one-tool-hub-sooty.vercel.app/tools/json-formatter | head -n 1
curl -I -s https://one-tool-hub-sooty.vercel.app/ur/tools/json-formatter | head -n 1
# Expected: HTTP/2 200

# 4. XML Sitemap & Robots.txt
curl -I -s https://one-tool-hub-sooty.vercel.app/sitemap.xml | head -n 1
curl -I -s https://one-tool-hub-sooty.vercel.app/robots.txt | head -n 1
# Expected: HTTP/2 200
```

### 4.2 Interactive Browser Validation
1. **Language Switching**:
   - Navigate to `https://one-tool-hub-sooty.vercel.app/tools/image-compressor`.
   - Click Language Switcher -> Select **اردو**.
   - Verify URL changes seamlessly to `/ur/tools/image-compressor`.
   - Verify page direction switches to RTL and typography uses Urdu font.
   - Verify tool operates identically in-browser (e.g. compress test image).
2. **Search Discovery**:
   - Open Search dialog (`Ctrl+K` / `Cmd+K`).
   - Query in English: "diff" -> Verify "Code Diff Checker" surfaces.
   - Query in Urdu: "پاس ورڈ" -> Verify "محفوظ پاس ورڈ جنریٹر" surfaces.
3. **Safe Fallback**:
   - Navigate to `/ur/learn/how-to-compress-images-without-losing-quality`.
   - Verify page gracefully renders notice that Urdu review is ongoing and presents English guide link, without breaking or throwing 500 error.

---

## 5. Instant Rollback & Incident Recovery Procedures

In the event of an unexpected runtime failure, UI regression, or SEO misconfiguration in production:

### 5.1 Plan A: Vercel Instant Rollback (Recovery Time: < 30 seconds)
Vercel keeps immutable instant snapshots of previous production deployments:
1. Log into Vercel Dashboard -> Project `OneToolHub`.
2. Navigate to **Deployments**.
3. Locate the pre-Step-18 production deployment (Step 16 / Step 17 release hash).
4. Click `...` (options menu) -> Select **Instant Rollback (Promote to Production)**.
5. Traffic is immediately redirected to the prior immutable build at the edge with zero build delay.

### 5.2 Plan B: Git Revert (Recovery Time: ~2 minutes)
If redeploying from source:
```bash
git revert HEAD -m "revert: rollback Step 18 international release"
git push origin main
```
Vercel will rebuild and deploy the prior state automatically.

### 5.3 Incident Classification & Response Matrix
| Severity | Description | Immediate Action |
| :--- | :--- | :--- |
| **P0 (Critical)** | Production site down (5xx errors) or tools throwing fatal exceptions | Trigger Vercel Instant Rollback immediately; alert engineering team |
| **P1 (High)** | Language switcher routing to 404 or hreflang tags causing canonical loops | Deploy hotfix branch or rollback to Step 17 |
| **P2 (Medium)** | Minor translation typo or styling glitch in RTL layout | Patch via hotfix commit without rolling back entire release |
| **P3 (Low)** | Non-blocking telemetry or analytics discrepancy | Schedule for standard maintenance update |

---

## 6. Release Authority & Approval
- **Release Status**: Staged and verified locally. Ready for production push.
- **Next Step**: Await user command to commit and push to GitHub.
