/**
 * Privacy-preserving, client-side user preferences for OneToolHub.
 *
 * Stores user favorites and recently used tools locally in browser `localStorage`.
 * Zero server-side tracking, zero third-party leakage, fully functional offline.
 */

const FAVORITES_STORAGE_KEY = 'onetoolhub_favorite_tools';
const RECENTS_STORAGE_KEY = 'onetoolhub_recent_tools';
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
 * Records a tool visit into client-side recents.
 */
export function recordRecentlyUsedTool(slug: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
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
 * Subscribes to preference changes across tabs or components.
 */
export function subscribeUserPreferences(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === FAVORITES_STORAGE_KEY || e.key === RECENTS_STORAGE_KEY) {
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
