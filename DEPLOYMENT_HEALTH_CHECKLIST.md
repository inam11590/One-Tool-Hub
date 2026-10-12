# DEPLOYMENT HEALTH CHECKLIST — ONETOOLHUB (STEP 16)

**Effective Date**: October 12, 2026  
**Document Owner**: Senior Release Engineer & QA Specialist  
**Target Environment**: Production (https://one-tool-hub-sooty.vercel.app) & Vercel Preview Deployments  

---

## 1. Pre-Deployment Gate (CI / Local Verification)

Prior to issuing authorization to merge or deploy to production:
- [ ] **Type Safety**: `npm run typecheck` passes with 0 errors (`tsc --noEmit`).
- [ ] **Lint & Code Quality**: `npm run lint` passes with 0 errors and 0 warnings.
- [ ] **Automated Tests**: `npm test` passes 100% of test suites with zero failures.
- [ ] **Production Build**: `npm run build` generates 61 static routes with shared JS <= 110 kB.
- [ ] **Git Working Tree**: Clean working tree with all assets committed to version control.

---

## 2. Post-Deployment Verification (Smoke Test Protocol)

Execute immediately following an authorized deployment to verify operational integrity:

### 2.1 Critical Infrastructure & Edge Health
- [ ] **Edge Health Endpoint**:
  ```bash
  curl -s -i https://one-tool-hub-sooty.vercel.app/api/health
  # Expected: HTTP 200 OK, Content-Type: application/json, {"status":"ok", ...}
  ```
- [ ] **Robots Exclusion**:
  ```bash
  curl -s https://one-tool-hub-sooty.vercel.app/robots.txt
  # Expected: Allow: /, Disallow: /growth, Disallow: /api/, Sitemap declared
  ```
- [ ] **XML Sitemap Availability**:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://one-tool-hub-sooty.vercel.app/sitemap.xml
  # Expected: HTTP 200 OK
  ```
- [ ] **Security Headers Validation**:
  ```bash
  curl -s -I https://one-tool-hub-sooty.vercel.app/ | grep -E "x-frame-options|content-security-policy|x-content-type-options"
  # Expected: x-frame-options: DENY, x-content-type-options: nosniff
  ```

### 2.2 Core Hub & Navigation Smoke Tests
- [ ] **Homepage (`/`)**: Loads hero, category navigation, featured tools, and footer.
- [ ] **Tools Directory (`/tools`)**: Category pills filter tools, search shortcut `Ctrl+K` responds.
- [ ] **Learning Center (`/learn`)**: Loads tutorial cards and individual article slug routes.

### 2.3 Representative Tool Functional Smoke Tests
- [ ] **Developer Category**: `/tools/json-formatter` loads sample JSON, formats cleanly.
- [ ] **Student Category**: `/tools/word-counter` calculates word, character, and reading time metrics.
- [ ] **Freelancer Category**: `/tools/invoice-generator` renders calculation table and sample rows.
- [ ] **Creator Category**: `/tools/youtube-timestamp-formatter` validates sample timestamps.
- [ ] **PDF Utility**: `/tools/pdf-to-image` renders dropzone without console runtime errors.

---

## 3. Rollback Protocol
If any critical check in Section 2 fails and cannot be fixed within 15 minutes, promote the previous stable deployment immediately via Vercel Instant Rollback.
