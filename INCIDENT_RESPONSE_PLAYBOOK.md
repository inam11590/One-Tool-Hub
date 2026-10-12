# INCIDENT RESPONSE PLAYBOOK — ONETOOLHUB (STEP 16)

**Effective Date**: October 12, 2026  
**Document Owner**: Principal Site Reliability Engineer (SRE) & Incident Commander  
**Scope**: All production systems supporting https://one-tool-hub-sooty.vercel.app  

---

## 1. Incident Severity Classification Matrix

Incidents are classified from **P1 (Critical)** to **P4 (Low)** based on blast radius, user data impact, and platform availability:

| Severity | Definition & Scope | Example Scenarios | Target Initial Response | Target Resolution |
| :---: | :--- | :--- | :---: | :---: |
| **P1** | **Critical Platform Outage / Security Incident** | Complete site 500 error; Vercel DNS outage; data leak vulnerability. | < 15 minutes | < 1 hour |
| **P2** | **Major Functional Impairment** | Multiple core tools broken (e.g. PDF processing broken across browser family). | < 30 minutes | < 4 hours |
| **P3** | **Moderate Feature Degradation** | Single utility failing; layout glitch on specific mobile resolution. | < 2 hours | < 24 hours |
| **P4** | **Low-Impact Glitch / Cosmetic Issue** | Minor typo; non-critical metadata discrepancy; button styling flaw. | Next business day | Next sprint release |

---

## 2. Incident Lifecycle & Standard Operating Procedure (SOP)

```
[1. Detection] ──> [2. Triage & Severity] ──> [3. Containment] ──> [4. Resolution] ──> [5. Post-Mortem]
```

### Phase 1: Detection & Alerting
- Signals: External uptime check alert on `/api/health`, spike in GA4 `tool_process_error` events, or user feedback submission.

### Phase 2: Triage & Initial Investigation
1. Verify if the issue is reproducible across multiple browsers (Chrome, Safari, Firefox).
2. Check Vercel status page (`status.vercel.com`) for edge network incidents.
3. Check `/api/health` response status and latency.
4. Inspect browser console for client-side JavaScript execution exceptions.

### Phase 3: Containment & Mitigation
- **Rollback Decision Process**:
  - If a recent deployment introduced breaking changes causing P1 or P2, execute an immediate **Instant Rollback** in the Vercel Dashboard (`Deployments > Previous Working Deployment > Promote to Production`).
  - *Note: Rollbacks are executed intentionally through human confirmation; no automated unverified rollbacks.*

### Phase 4: Resolution Verification
- Confirm `/api/health` returns HTTP 200 `{"status":"ok"}`.
- Test affected tool routes on staging/preview URL.
- Verify analytics error rates return to normal baseline.

### Phase 5: Post-Incident Review (PIR)
- Produce a Blameless Post-Mortem documenting root cause, timeline, impact, and preventive regression tests.
