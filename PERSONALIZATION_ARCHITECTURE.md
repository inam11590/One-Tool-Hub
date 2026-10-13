# OneToolHub — Client-Side Personalization Architecture

## 1. Privacy-First Personalization Philosophy

OneToolHub delivers a tailored, productivity-boosting workspace **without requiring user accounts, authentication passwords, database backends, or third-party profiling cookies**.

All personalization state is stored entirely within the visitor's local browser sandbox (`localStorage`). This architecture guarantees:
1. **Zero Data Leakage**: Favorites, recent tools, and usage counts never leave the user's device.
2. **Offline Resilience**: The personal dashboard works completely offline without network availability.
3. **Instant Responsiveness**: Reading and updating preferences executes synchronously in under 1ms.
4. **Complete User Control**: Users can reset or clear all personal data with a single click.

---

## 2. Storage Schema & Key Architecture

The preferences system (`frontend/src/lib/user-preferences.ts`) manages three primary client keys:

### 1. `onetoolhub_favorite_tools`
- **Type**: `string[]` (JSON-encoded array of tool slugs)
- **Example**: `["json-formatter", "image-compressor", "gpa-calculator"]`
- **Behavior**: Users pin tools by clicking the star icon. Pinned tools persist indefinitely until unfavorited or cleared.

### 2. `onetoolhub_recent_tools`
- **Type**: `Array<{ slug: string; visitedAt: number }>`
- **Capacity Limit**: Max 6 entries (FIFO with recency sorting).
- **Behavior**: When a user navigates to any tool page, `recordRecentlyUsedTool(slug)` updates the recency queue.

### 3. `onetoolhub_tool_frequencies`
- **Type**: `Record<string, number>` (Map of slug -> invocation count)
- **Example**: `{"json-formatter": 14, "image-compressor": 8, "uuid-generator": 5}`
- **Behavior**: Incremented on each tool visit or operation, powering the "Frequent Tools" workspace tab.

---

## 3. Category-Based Recommendation Algorithm

The recommendation engine (`getRecommendedTools`) derives suggested utilities by analyzing the user's category engagement:

1. **Engagement Scoring**:
   $$\text{CategoryScore}(C) = \sum_{t \in \text{Favorites} \cup \text{Recents}} [ \text{Category}(t) == C ]$$
2. **Category Prioritization**: Categories are sorted in descending order of engagement.
3. **Candidate Filtering**: For each prioritized category, tools from `TOOLS_REGISTRY` that are `available` and **not already in the user's favorites or recents** are selected.
4. **Graceful Fallback**: If a user is new (zero favorites and recents), popular starter utilities (`json-formatter`, `image-compressor`, `pdf-merge-split`) are recommended.

---

## 4. Multi-Tab Synchronization & Event Architecture

To ensure a seamless user experience when working across multiple browser tabs:
- State changes dispatch an internal custom DOM event: `onetoolhub:preferences_changed`.
- All dashboard instances listen for `storage` events across windows:
  ```typescript
  window.addEventListener('storage', (e) => {
    if (e.key === FAVORITES_KEY || e.key === RECENTS_KEY || e.key === FREQUENCIES_KEY) {
      syncState();
    }
  });
  ```
- Any star toggle, tool visit, or workspace reset in Tab A immediately updates Tab B in real-time.

---

## 5. Hydration Guard & SSR Safety

Because Next.js App Router renders pages on the server (where `window` and `localStorage` do not exist):
- Components reading preferences (`QuickAccessTools.tsx`) utilize an `isMounted` state gate.
- Before hydration completes, the component safely renders `null` or a server-safe placeholder, preventing React hydration mismatch warnings.
