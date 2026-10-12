# PRODUCTION UPTIME MONITORING SETUP — ONETOOLHUB (STEP 16)

**Audit Date**: October 12, 2026  
**Author**: Principal Site Reliability Engineer (SRE)  
**Production Site**: https://one-tool-hub-sooty.vercel.app  
**Health Check Endpoint**: https://one-tool-hub-sooty.vercel.app/api/health  

---

## 1. Overview & Health Endpoint Design

To enable continuous synthetic availability monitoring without exposing internal infrastructure, OneToolHub provides a lightweight edge health route at:
`GET /api/health`

### Payload Specification:
```json
{
  "status": "ok",
  "timestamp": "2026-10-12T13:48:29.000Z",
  "service": "onetoolhub-web",
  "version": "0.1.0",
  "region": "iad1"
}
```

### Security & Privacy Protections:
1. **Zero Secret Leakage**: No environment variables, secret keys, deployment hashes, or build parameters are returned.
2. **Cache Prevention**: Emits `Cache-Control: no-store, no-cache, must-revalidate` to ensure monitors receive fresh edge responses rather than stale cached hits.
3. **Zero Resource Overhead**: The endpoint executes entirely in-memory at the Vercel Edge with zero database queries.

---

## 2. External Provider Configuration Options

*Note: Per the critical instructions, external monitoring accounts are NOT registered automatically. Below are the recommended, cost-free setup steps for manual activation.*

### Option A: Better Stack (Recommended)
1. **Monitor Type**: HTTP / HTTPS.
2. **URL to Monitor**: `https://one-tool-hub-sooty.vercel.app/api/health`
3. **Heartbeat Frequency**: 3 minutes.
4. **Expected Status Code**: `200`.
5. **Response Body Keyword Assertion**: `"status":"ok"`
6. **Alert Policy**: Send email / webhook if down for 2 consecutive checks (> 6 minutes).

### Option B: UptimeRobot (Free Alternative)
1. **Monitor Type**: HTTP(s).
2. **Friendly Name**: `OneToolHub Edge Health`.
3. **URL**: `https://one-tool-hub-sooty.vercel.app/api/health`
4. **Monitoring Interval**: 5 minutes.
5. **HTTP Method**: `GET`.
6. **SSL Verification**: Enable (Notify before domain/SSL certificate expiry).

### Option C: Vercel Native Edge Checks
- If utilizing Vercel Pro or Enterprise, enable **Vercel Checks** in the project dashboard (`Settings > Functions & Edge Monitoring`).

---

## 3. SLA & Target Availability Thresholds

- **Target Monthly Uptime**: **99.9%** (Maximum monthly allowable downtime: ~43 minutes).
- **Incident Escalation**: Any consecutive downtime exceeding 5 minutes triggers a P1 or P2 incident per the [INCIDENT_RESPONSE_PLAYBOOK.md](file:///Users/mac/Documents/One-Tool-Hub/INCIDENT_RESPONSE_PLAYBOOK.md).
