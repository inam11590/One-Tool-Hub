/**
 * Deterministic, typo-tolerant search engine for OneToolHub.
 *
 * Lightweight, zero-dependency, runs 100% in-browser on client threads.
 * Supports exact prefix, keyword matching, category filters, and Levenshtein typo tolerance.
 */

import type { ToolItem, ToolCategoryId } from '@/types/tools';

export interface SearchResultItem {
  tool: ToolItem;
  item: ToolItem; // alias for backwards compatibility
  score: number;
  matchReason: 'name' | 'keyword' | 'category' | 'description' | 'fuzzy';
  matchedTerm?: string;
}

/**
 * Computes Levenshtein distance between two normalized strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]!
          : Math.min(row[j - 1]!, row[j]!, prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }

  return row[b.length]!;
}

/**
 * Checks whether word B is a fuzzy match for query token A.
 * Allows edit distance of 1 for 4-5 char tokens, 2 for >= 6 char tokens.
 */
function isFuzzyMatch(queryToken: string, candidateWord: string): boolean {
  if (queryToken.length < 4) return false;
  // If lengths differ by more than 2, it is not a typo match
  if (Math.abs(queryToken.length - candidateWord.length) > 2) return false;

  const maxDistance = queryToken.length >= 6 ? 2 : 1;
  const dist = levenshteinDistance(queryToken, candidateWord);
  return dist <= maxDistance;
}

export interface SearchToolsOptions {
  maxResults?: number;
  categoryId?: ToolCategoryId | 'all';
  availableOnly?: boolean;
}

/**
 * Searches and ranks tools based on multi-field relevance and typo tolerance.
 */
export function searchTools(
  tools: readonly ToolItem[],
  rawQuery: string,
  options: SearchToolsOptions = {}
): SearchResultItem[] {
  const { maxResults = 10, categoryId = 'all', availableOnly = false } = options;
  const cleanQuery = (rawQuery || '').trim().toLowerCase();

  // Filter category and availability first
  const candidateTools = tools.filter((tool) => {
    if (categoryId !== 'all' && tool.categoryId !== categoryId) return false;
    if (availableOnly && tool.status !== 'available') return false;
    return true;
  });

  if (!cleanQuery) {
    return candidateTools.slice(0, maxResults).map((tool) => ({
      tool,
      item: tool,
      score: 10,
      matchReason: 'name',
    }));
  }

  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
  const results: SearchResultItem[] = [];

  for (const tool of candidateTools) {
    const nameLower = tool.name.toLowerCase();
    const descLower = tool.shortDescription.toLowerCase();
    const catLower = tool.categoryLabel.toLowerCase();
    const keywordsLower = tool.keywords.map((k) => k.toLowerCase());
    const nameTokens = nameLower.split(/\s+/);

    let score = 0;
    let matchReason: SearchResultItem['matchReason'] = 'name';
    let matchedTerm: string | undefined;

    // 1. Exact full name match
    if (nameLower === cleanQuery) {
      score += 150;
      matchReason = 'name';
    }
    // 2. Name starts with full query
    else if (nameLower.startsWith(cleanQuery)) {
      score += 120;
      matchReason = 'name';
    }
    // 3. Name contains full query substring
    else if (nameLower.includes(cleanQuery)) {
      score += 100;
      matchReason = 'name';
    }
    // 4. Exact keyword match
    else if (keywordsLower.includes(cleanQuery)) {
      score += 85;
      matchReason = 'keyword';
      matchedTerm = cleanQuery;
    }
    // 5. Category label match
    else if (catLower.includes(cleanQuery)) {
      score += 60;
      matchReason = 'category';
      matchedTerm = tool.categoryLabel;
    }
    // 6. Description contains query
    else if (descLower.includes(cleanQuery)) {
      score += 40;
      matchReason = 'description';
    }

    // Token-by-token matching (handles queries like "yt chapters" or "qr code")
    let tokenMatches = 0;
    for (const token of queryTokens) {
      if (nameLower.includes(token)) {
        tokenMatches += 50;
      } else if (keywordsLower.some((kw) => kw.includes(token))) {
        tokenMatches += 35;
      } else {
        // Find best fuzzy match across name tokens
        let bestNameDist = 99;
        let bestNameWord = '';
        for (const w of nameTokens) {
          if (isFuzzyMatch(token, w)) {
            const d = levenshteinDistance(token, w);
            if (d < bestNameDist) {
              bestNameDist = d;
              bestNameWord = w;
            }
          }
        }

        let bestKwDist = 99;
        let bestKwWord = '';
        for (const kw of keywordsLower) {
          if (isFuzzyMatch(token, kw)) {
            const d = levenshteinDistance(token, kw);
            if (d < bestKwDist) {
              bestKwDist = d;
              bestKwWord = kw;
            }
          }
        }

        if (bestNameDist < 99) {
          tokenMatches += Math.max(10, 60 - bestNameDist * 15);
          if (score === 0) {
            matchReason = 'fuzzy';
            matchedTerm = bestNameWord;
          }
        } else if (bestKwDist < 99) {
          tokenMatches += Math.max(10, 45 - bestKwDist * 15);
          if (score === 0) {
            matchReason = 'fuzzy';
            matchedTerm = bestKwWord;
          }
        } else if (catLower.includes(token)) {
          tokenMatches += 15;
        } else if (descLower.includes(token)) {
          tokenMatches += 10;
        }
      }
    }

    score += tokenMatches;

    // Available tools receive slight priority over coming soon tools
    if (tool.status === 'available') {
      score += 5;
    }

    if (score > 0) {
      results.push({
        tool,
        item: tool,
        score,
        matchReason,
        matchedTerm,
      });
    }
  }

  // Sort descending by relevance score
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
