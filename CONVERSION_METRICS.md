# OneToolHub — Conversion & Retention Product Metrics

This document defines the key performance indicators (KPIs), conversion funnels, event definitions, and privacy boundaries for **OneToolHub** (Step 10: UX, Retention & Conversion Optimization).

---

## 1. Executive Summary

OneToolHub is a client-side, utility-driven web platform designed for four core personas:
1. **Students** (GPA calculation, essay word counting, reference formatting)
2. **Freelancers** (Invoice generation, PDF assembly, contract preparation)
3. **YouTubers** (Chapter formatting, thumbnail/graphic compression, channel linking)
4. **Developers** (JSON formatting/linting, QR code generation, rapid data manipulation)

Because tools operate locally in the browser with **zero account creation** and **zero server-side user data persistence**, our product measurement philosophy is:
> **High Utility Telemetry with Zero Personal Data Risk.** We measure intent, completion, and retention without ever touching, transmitting, or inspecting file contents, calculations, or client names.

---

## 2. Key Conversion Formulas & KPIs

### 2.1. Tool Completion Rate (TCR)
Measures the percentage of users who successfully complete a task after initiating it:
$$\text{Tool Completion Rate} = \frac{\text{Successful Tool Completions (tool\_process\_success)}}{\text{Tool Initiations (tool\_process\_start or tool\_open)}} \times 100\%$$
* **Benchmark Target**: $\ge 72\%$ across all tools.
* **Why it matters**: A drop in completion rate flags input validation confusion, file size rejections, or UX friction.

### 2.2. Search-to-Tool Discovery Rate (STR)
Measures how effectively the search interface (Hero search bar, All Tools filter, or Cmd+K Command Palette) directs intent into tool engagement:
$$\text{Search-to-Tool Discovery Rate} = \frac{\text{Tool Opens Originating from Search}}{\text{Total Search Queries Executed}} \times 100\%$$
* **Benchmark Target**: $\ge 80\%$.
* **Why it matters**: Low discovery rate indicates missing keywords, poor typo tolerance, or unhelpful no-results states.

### 2.3. Output Export & Delivery Rate (ODR)
Measures the proportion of successful operations that lead to a tangible user takeaway (copying formatted output to clipboard or downloading a generated PDF/image):
$$\text{Output Delivery Rate} = \frac{\text{tool\_download} + \text{tool\_copy}}{\text{tool\_process\_success}} \times 100\%$$
* **Benchmark Target**: $\ge 65\%$.
* **Why it matters**: Confirms users received actual utility from the tool rather than abandoning the tab.

### 2.4. Returning Visitor Retention (RVR - 7-Day & 30-Day)
Measures the percentage of visitors who return to OneToolHub within 7 days or 30 days:
$$\text{7-Day Retention} = \frac{\text{Active Users in Day 7 Cohort with Previous Visit}}{\text{Total First-Time Users in Day 0 Cohort}} \times 100\%$$
* **Benchmark Target**: $\ge 22\%$ for 7-day retention; $\ge 15\%$ for 30-day retention.
* **Key Drivers**: Browser-saved favorites, recently used tools workspace, and quick-resume banners.

### 2.5. Bookmark & Favorite Adoption Rate (FAR)
Measures the percentage of active sessions that add at least one tool to their local workspace:
$$\text{Favorite Adoption Rate} = \frac{\text{Unique Sessions with } \ge 1\text{ Favorite Added}}{\text{Total Unique Active Sessions}} \times 100\%$$
* **Benchmark Target**: $\ge 8\%$.

---

## 3. Product Funnel Architecture

```
Stage 1: Ingestion & Discovery
  [ Organic Search / Referral / Direct ]
                    │
                    ▼
Stage 2: Navigation & Search
  [ Hero Search Bar | Cmd+K Palette | Category Navigation | Directory ]
                    │
                    ▼
Stage 3: Tool Landing & Onboarding
  [ Tool Page Open (tool_open) ]
  ├── Empty State Review
  ├── Load Demo / Preset Exploration
  └── User Input Provided
                    │
                    ▼
Stage 4: Execution & Processing
  [ Processing Initiated (tool_process_start) ]
  ├── Client-side Validation (Success / Error)
  └── [ tool_process_success ] or [ tool_process_error ]
                    │
                    ▼
Stage 5: Output Delivery
  [ tool_copy ] (Clipboard)  OR  [ tool_download ] (PDF, Image, Text)
                    │
                    ▼
Stage 6: Retention & Return Loops
  ├── [ favorite_add ] (Saved in Local Workspace)
  ├── Related Tool Discovery Card Clicks
  └── Next Visit via Browser Bookmark or Recent Tools Bar
```

---

## 4. Telemetry Schema & Event Matrix

All events conform to the schema defined in `frontend/src/lib/analytics.ts`.

| Event Name | Allowed Parameters | Trigger Point |
|---|---|---|
| `tool_open` | `tool_slug`, `tool_category` | When a tool page mounts in the browser. |
| `tool_process_start` | `tool_slug`, `tool_category`, `operation_type` | When user triggers an operation (e.g. compress, merge, split). |
| `tool_process_success` | `tool_slug`, `tool_category`, `operation_type` | When calculation, formatting, or compilation finishes cleanly. |
| `tool_process_error` | `tool_slug`, `tool_category`, `operation_type`, `error_category` | When client validation fails or processing throws an exception. |
| `tool_download` | `tool_slug`, `tool_category`, `operation_type` | When user clicks Download PDF, Download Image, or Download Chapters. |
| `tool_copy` | `tool_slug`, `tool_category`, `operation_type` | When user copies formatted output or QR image to clipboard. |
| `tool_reset` | `tool_slug`, `tool_category`, `operation_type` | When user clears or resets the workspace. |
| `tool_search` | `tool_slug`, `tool_category`, `operation_type` | When user executes a search query from the hero or palette. |
| `favorite_add` | `tool_slug`, `tool_category` | When user clicks the star icon to pin a tool to their workspace. |
| `favorite_remove` | `tool_slug`, `tool_category` | When user unpins a tool from their workspace. |

---

## 5. Strict Privacy & Zero-Data Exfiltration Rules

1. **Zero Content Transmission**: No file names, text content, JSON structures, invoice totals, client names, student course names, or URLs are ever transmitted in analytics payloads.
2. **Whitelist-Only Parameters**: Only pre-approved tokens (`tool_slug`, `tool_category`, `operation_type`, `error_category`) pass the `sanitizeToolAnalyticsParams` gate. Unrecognized keys are discarded.
3. **Consent Enforced**: GA4 cookies and measurement scripts only execute when `onetoolhub_analytics_consent_v1` is `"accepted"`. In `undecided` or `rejected` state, all tracking calls no-op immediately and cookies are deleted.
4. **Local Workspace Only**: Favorites, recently used history, and draft backups reside exclusively in browser `localStorage`. No user profiles exist on any server.
