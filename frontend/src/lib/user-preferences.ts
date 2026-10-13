/**
 * Privacy-preserving, client-side user preferences for OneToolHub.
 *
 * Stores user favorites and recently used tools locally in browser `localStorage`.
 * Zero server-side tracking, zero third-party leakage, fully functional offline.
 */

const FAVORITES_STORAGE_KEY = 'onetoolhub_favorite_tools';
const RECENTS_STORAGE_KEY = 'onetoolhub_recent_tools';
const FREQUENCIES_STORAGE_KEY = 'onetoolhub_tool_frequencies';
const PREFS_CHANGE_EVENT = 'onetoolhub:preferences_changed';
const MAX_RECENTS = 6;

function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__oth_test_storage__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PREFS_CHANGE_EVENT));
  }
}

/**
 * Returns the list of favorited tool slugs.
 */
export function getFavoriteTools(): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Checks if a tool slug is currently favorited.
 */
export function isFavoriteTool(slug: string): boolean {
  return getFavoriteTools().includes(slug);
}

/**
 * Toggles favorite state for a given tool slug. Returns the updated array of favorites.
 */
export function toggleFavoriteTool(slug: string): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const current = getFavoriteTools();
    const exists = current.includes(slug);
    const updated = exists ? current.filter((s) => s !== slug) : [...current, slug];
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    emitChange();
    return updated;
  } catch {
    return [];
  }
}

export interface RecentToolEntry {
  slug: string;
  visitedAt: number;
}

/**
 * Returns the list of recently used tool slugs, ordered most recent first.
 */
export function getRecentlyUsedTools(): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is RecentToolEntry => Boolean(entry && typeof entry.slug === 'string'))
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .map((entry) => entry.slug);
  } catch {
    return [];
  }
}

/**
 * Returns tool visit frequencies as a map of slug -> count.
 */
export function getToolFrequencies(): Record<string, number> {
  if (!isLocalStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(FREQUENCIES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Records tool usage frequency count.
 */
export function recordToolUsage(slug: string): void {
  if (!isLocalStorageAvailable() || !slug) return;
  try {
    const freqs = getToolFrequencies();
    const currentCount = typeof freqs[slug] === 'number' ? freqs[slug] : 0;
    freqs[slug] = currentCount + 1;
    window.localStorage.setItem(FREQUENCIES_STORAGE_KEY, JSON.stringify(freqs));
  } catch {
    // Non-blocking
  }
}

/**
 * Returns top frequently used tool items sorted by usage count descending.
 */
export function getFrequentlyUsedTools(limit = 4): { slug: string; count: number }[] {
  const freqs = getToolFrequencies();
  return Object.entries(freqs)
    .filter(([slug, count]) => typeof slug === 'string' && typeof count === 'number' && count > 0)
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Records a tool visit into client-side recents and increments usage frequency.
 */
export function recordRecentlyUsedTool(slug: string): void {
  if (!isLocalStorageAvailable() || !slug) return;
  try {
    // Increment frequency
    recordToolUsage(slug);

    // Update recents
    const raw = window.localStorage.getItem(RECENTS_STORAGE_KEY);
    const existing: RecentToolEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(existing) ? existing.filter((e) => e && e.slug !== slug) : [];
    const updated: RecentToolEntry[] = [
      { slug, visitedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENTS);
    window.localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updated));
    emitChange();
  } catch {
    // Non-blocking fail-safe
  }
}

/**
 * Clears recently used tools from localStorage.
 */
export function clearRecentTools(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(RECENTS_STORAGE_KEY);
    emitChange();
  } catch {
    // Non-blocking
  }
}

/**
 * Clears all usage frequencies from localStorage.
 */
export function clearToolFrequencies(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(FREQUENCIES_STORAGE_KEY);
    emitChange();
  } catch {
    // Non-blocking
  }
}

/**
 * Completely resets all local workspace preferences (favorites, recents, frequencies).
 */
export function resetAllPreferences(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    window.localStorage.removeItem(RECENTS_STORAGE_KEY);
    window.localStorage.removeItem(FREQUENCIES_STORAGE_KEY);
    emitChange();
  } catch {
    // Non-blocking
  }
}

/**
 * Derives recommended tool slugs based on category engagement from favorites and recents.
 */
export function getRecommendedTools(
  toolsRegistry: readonly { slug: string; categoryId: string; status: string }[],
  limit = 4
): string[] {
  const favorites = getFavoriteTools();
  const recents = getRecentlyUsedTools();
  const knownSlugs = new Set([...favorites, ...recents]);

  // Count category engagements
  const categoryCounts: Record<string, number> = {};
  for (const slug of knownSlugs) {
    const tool = toolsRegistry.find((t) => t.slug === slug);
    if (tool) {
      categoryCounts[tool.categoryId] = (categoryCounts[tool.categoryId] || 0) + 1;
    }
  }

  // Sort categories by engagement
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const recommendations: string[] = [];

  // Pick tools from engaged categories not yet known
  for (const cat of sortedCategories) {
    const candidateTools = toolsRegistry.filter(
      (t) => t.categoryId === cat && t.status === 'available' && !knownSlugs.has(t.slug)
    );
    for (const cand of candidateTools) {
      if (!recommendations.includes(cand.slug)) {
        recommendations.push(cand.slug);
      }
      if (recommendations.length >= limit) return recommendations;
    }
  }

  // Fallback: pick general available tools not yet in knownSlugs
  for (const t of toolsRegistry) {
    if (t.status === 'available' && !knownSlugs.has(t.slug) && !recommendations.includes(t.slug)) {
      recommendations.push(t.slug);
    }
    if (recommendations.length >= limit) break;
  }

  return recommendations.slice(0, limit);
}

/**
 * Subscribes to preference changes across tabs or components.
 */
export function subscribeUserPreferences(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key === FAVORITES_STORAGE_KEY ||
      e.key === RECENTS_STORAGE_KEY ||
      e.key === FREQUENCIES_STORAGE_KEY
    ) {
      callback();
    }
  };

  window.addEventListener(PREFS_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(PREFS_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
