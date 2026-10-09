/**
 * Local-First Growth & Analytics Parser for OneToolHub.
 *
 * Parses standard Google Analytics 4 (GA4) and Google Search Console (GSC) CSV exports
 * entirely in-browser or in Node.js without sending data to any external network.
 */

export interface GscQueryRecord {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number; // percentage, e.g. 4.2
  position: number;
}

export interface GscPageRecord {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscCountryRecord {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Ga4PageRecord {
  pagePath: string;
  pageTitle: string;
  views: number;
  activeUsers: number;
  eventCount: number;
  keyEvents: number;
}

export interface GrowthMetricsSummary {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  totalViews: number;
  totalActiveUsers: number;
  topQueries: GscQueryRecord[];
  topPages: GscPageRecord[];
  topCountries: GscCountryRecord[];
  topTools: { slug: string; name: string; viewsOrClicks: number }[];
  topTutorials: { slug: string; title: string; viewsOrClicks: number }[];
  dateRangeNotice?: string;
}

/**
 * Parses raw CSV string into an array of object records based on the first row header.
 * Correctly handles quoted fields containing commas and escaped quotes.
 */
export function parseCsvText(csvText: string): Record<string, string>[] {
  if (!csvText || typeof csvText !== "string") {
    return [];
  }

  // Remove potential UTF-8 BOM
  const cleaned = csvText.replace(/^\uFEFF/, "").trim();
  if (!cleaned) {
    return [];
  }

  const lines = cleaned.split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }

  const headerTokens = parseCsvLine(lines[0] || "");
  const normalizedHeaders = headerTokens.map((h) =>
    h.trim().toLowerCase().replace(/[\s_-]+/g, "_")
  );

  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i]?.trim();
    if (!rawLine) continue;

    const values = parseCsvLine(rawLine);
    const row: Record<string, string> = {};

    for (let j = 0; j < normalizedHeaders.length; j++) {
      const header = normalizedHeaders[j];
      if (header) {
        row[header] = (values[j] ?? "").trim();
      }
    }

    records.push(row);
  }

  return records;
}

/**
 * Splits a single CSV row respecting quoted fields with commas.
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Cleans numeric strings that may include commas, quotes, or percentages.
 */
function parseNumeric(val: unknown, fallback = 0): number {
  if (typeof val === "number" && !isNaN(val)) {
    return val;
  }
  if (typeof val !== "string") {
    return fallback;
  }
  const clean = val.replace(/["%,]/g, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? fallback : num;
}

/**
 * Analyzes parsed Search Console query records.
 */
export function parseGscQueries(records: Record<string, string>[]): GscQueryRecord[] {
  return records
    .filter((r) => r.query || r.top_queries)
    .map((r) => {
      const query = r.query || r.top_queries || "";
      const clicks = parseNumeric(r.clicks);
      const impressions = parseNumeric(r.impressions);
      const ctr = parseNumeric(r.ctr);
      const position = parseNumeric(r.position);
      return { query, clicks, impressions, ctr, position };
    })
    .filter((q) => q.query.length > 0)
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
}

/**
 * Analyzes parsed Search Console page records.
 */
export function parseGscPages(records: Record<string, string>[]): GscPageRecord[] {
  return records
    .filter((r) => r.page || r.top_pages)
    .map((r) => {
      const page = r.page || r.top_pages || "";
      const clicks = parseNumeric(r.clicks);
      const impressions = parseNumeric(r.impressions);
      const ctr = parseNumeric(r.ctr);
      const position = parseNumeric(r.position);
      return { page, clicks, impressions, ctr, position };
    })
    .filter((p) => p.page.length > 0)
    .sort((a, b) => b.clicks - a.clicks);
}

/**
 * Analyzes parsed Search Console country records.
 */
export function parseGscCountries(records: Record<string, string>[]): GscCountryRecord[] {
  return records
    .filter((r) => r.country || r.country_name)
    .map((r) => {
      const country = r.country || r.country_name || "";
      const clicks = parseNumeric(r.clicks);
      const impressions = parseNumeric(r.impressions);
      const ctr = parseNumeric(r.ctr);
      const position = parseNumeric(r.position);
      return { country, clicks, impressions, ctr, position };
    })
    .sort((a, b) => b.clicks - a.clicks);
}

/**
 * Analyzes parsed GA4 Pages & Screens records.
 */
export function parseGa4Pages(records: Record<string, string>[]): Ga4PageRecord[] {
  return records
    .map((r) => {
      const pagePath =
        r.page_path ||
        r.page_path_and_screen_class ||
        r.page_location ||
        r.unified_screen_name ||
        "";
      const pageTitle = r.page_title || "";
      const views = parseNumeric(r.views || r.screen_views);
      const activeUsers = parseNumeric(r.active_users || r.users || r.total_users);
      const eventCount = parseNumeric(r.event_count);
      const keyEvents = parseNumeric(r.key_events || r.conversions);
      return { pagePath, pageTitle, views, activeUsers, eventCount, keyEvents };
    })
    .filter((p) => p.pagePath.length > 0)
    .sort((a, b) => b.views - a.views);
}

const KNOWN_TOOL_SLUGS: Record<string, string> = {
  "json-formatter": "JSON Formatter & Validator",
  "image-compressor": "Image Compressor",
  "qr-code-generator": "QR Code Generator",
  "word-counter": "Word Counter",
  "youtube-timestamp-formatter": "YouTube Timestamp Formatter",
  "gpa-calculator": "GPA Calculator",
  "invoice-generator": "Invoice Generator",
  "pdf-merge-split": "PDF Merge & Split",
};

/**
 * Generates an aggregated growth summary from parsed records.
 */
export function buildGrowthSummary(params: {
  queries?: GscQueryRecord[];
  pages?: GscPageRecord[];
  countries?: GscCountryRecord[];
  gaPages?: Ga4PageRecord[];
}): GrowthMetricsSummary {
  const queries = params.queries ?? [];
  const pages = params.pages ?? [];
  const countries = params.countries ?? [];
  const gaPages = params.gaPages ?? [];

  const totalClicks = pages.reduce((acc, p) => acc + p.clicks, 0) ||
    queries.reduce((acc, q) => acc + q.clicks, 0);

  const totalImpressions = pages.reduce((acc, p) => acc + p.impressions, 0) ||
    queries.reduce((acc, q) => acc + q.impressions, 0);

  const averageCtr =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const validPositions = queries
    .map((q) => q.position)
    .filter((p) => p > 0);
  const averagePosition =
    validPositions.length > 0
      ? validPositions.reduce((a, b) => a + b, 0) / validPositions.length
      : 0;

  const totalViews = gaPages.reduce((acc, p) => acc + p.views, 0);
  const totalActiveUsers = gaPages.reduce((acc, p) => acc + p.activeUsers, 0);

  // Categorize pages into Tools and Tutorials
  const topTools: { slug: string; name: string; viewsOrClicks: number }[] = [];
  const topTutorials: { slug: string; title: string; viewsOrClicks: number }[] = [];

  // Match from GA4 pages first if available, else GSC pages
  if (gaPages.length > 0) {
    for (const p of gaPages) {
      for (const [slug, name] of Object.entries(KNOWN_TOOL_SLUGS)) {
        if (p.pagePath.includes(`/tools/${slug}`)) {
          topTools.push({ slug, name, viewsOrClicks: p.views });
        }
      }
      if (p.pagePath.includes("/learn/") && !p.pagePath.endsWith("/learn/")) {
        const slug = p.pagePath.split("/learn/")[1]?.replace(/\/$/, "") || "";
        topTutorials.push({
          slug,
          title: p.pageTitle || slug,
          viewsOrClicks: p.views,
        });
      }
    }
  } else if (pages.length > 0) {
    for (const p of pages) {
      for (const [slug, name] of Object.entries(KNOWN_TOOL_SLUGS)) {
        if (p.page.includes(`/tools/${slug}`)) {
          topTools.push({ slug, name, viewsOrClicks: p.clicks });
        }
      }
      if (p.page.includes("/learn/") && !p.page.endsWith("/learn/")) {
        const slug = p.page.split("/learn/")[1]?.replace(/\/$/, "") || "";
        topTutorials.push({
          slug,
          title: slug,
          viewsOrClicks: p.clicks,
        });
      }
    }
  }

  return {
    totalClicks,
    totalImpressions,
    averageCtr: parseFloat(averageCtr.toFixed(2)),
    averagePosition: parseFloat(averagePosition.toFixed(1)),
    totalViews,
    totalActiveUsers,
    topQueries: queries.slice(0, 10),
    topPages: pages.slice(0, 10),
    topCountries: countries.slice(0, 8),
    topTools: topTools.slice(0, 8),
    topTutorials: topTutorials.slice(0, 8),
  };
}
