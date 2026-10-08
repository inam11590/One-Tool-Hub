import type { Metadata } from "next";
import type { ToolItem } from "@/types/tools";

const LOCAL_FALLBACK_ORIGIN = "http://localhost:3000";
const VERCEL_PRODUCTION_FALLBACK_ORIGIN = "https://one-tool-hub-sooty.vercel.app";

export interface SiteUrlConfig {
  /** Validated origin without trailing slash */
  origin: string;
  /** True when the resolved origin is a production HTTPS domain (custom domain or Vercel production alias) */
  isProductionDomainConfigured: boolean;
  /** True when the current environment is a preview, staging, or localhost origin */
  isStagingOrLocal: boolean;
  /** True specifically when running in a Vercel preview or staging environment that must not be indexed */
  isPreview: boolean;
}

function normalizeCandidateOrigin(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates and normalizes `process.env.NEXT_PUBLIC_SITE_URL`, falling back to
 * Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL` or `https://one-tool-hub-sooty.vercel.app`)
 * when running in a Vercel production environment without an explicit custom domain override,
 * and `http://localhost:3000` in local development.
 */
export function getSiteUrlConfig(): SiteUrlConfig {
  const rawEnvUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelEnv = (
    process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? ""
  )
    .trim()
    .toLowerCase();
  const vercelProdUrl = (
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    ""
  ).trim();
  const isOnVercel =
    process.env.VERCEL === "1" ||
    vercelEnv === "production" ||
    vercelEnv === "preview";

  const candidateUrl =
    rawEnvUrl ||
    (vercelProdUrl ? normalizeCandidateOrigin(vercelProdUrl) : "") ||
    (isOnVercel ? VERCEL_PRODUCTION_FALLBACK_ORIGIN : "");

  if (!candidateUrl) {
    return {
      origin: LOCAL_FALLBACK_ORIGIN,
      isProductionDomainConfigured: false,
      isStagingOrLocal: true,
      isPreview: false,
    };
  }

  try {
    const parsed = new URL(candidateUrl);
    const hostname = parsed.hostname.toLowerCase();
    const isLocalHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local");
    const isExplicitStagingHost =
      hostname.startsWith("staging.") ||
      hostname.startsWith("dev.") ||
      hostname.startsWith("preview.") ||
      hostname === "example.com";
    const isPreviewEnv =
      vercelEnv === "preview" ||
      isExplicitStagingHost ||
      (hostname.endsWith(".vercel.app") &&
        vercelEnv === "development");

    const cleanOrigin = parsed.origin.replace(/\/+$/, "");
    const isProdHttps =
      parsed.protocol === "https:" && !isLocalHost && !isPreviewEnv;

    return {
      origin: cleanOrigin,
      isProductionDomainConfigured: isProdHttps,
      isStagingOrLocal: isLocalHost || isPreviewEnv,
      isPreview: isPreviewEnv,
    };
  } catch {
    return {
      origin: LOCAL_FALLBACK_ORIGIN,
      isProductionDomainConfigured: false,
      isStagingOrLocal: true,
      isPreview: false,
    };
  }
}

export function isPreviewDeployment(): boolean {
  return getSiteUrlConfig().isPreview;
}

export function getSiteOrigin(): string {
  return getSiteUrlConfig().origin;
}

export function getAbsoluteUrl(pathname: string): string {
  const origin = getSiteOrigin();
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalizedPath === "/" ? origin : `${origin}${normalizedPath}`;
}

const GOOGLE_SITE_VERIFICATION_REGEX = /^[A-Za-z0-9_-]{10,128}$/;
const DEFAULT_GOOGLE_SITE_VERIFICATION =
  "VzTJTHFVF7UaofXkbpnYPaFnn97slv1Gbq9rjnkw7gY";

/**
 * Validates and returns the Google Search Console verification token
 * configured via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION (or the production default).
 */
export function getGoogleSiteVerificationToken(
  rawEnv: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
    DEFAULT_GOOGLE_SITE_VERIFICATION
): string | null {
  if (!rawEnv || typeof rawEnv !== "string") {
    return null;
  }
  const cleaned = rawEnv
    .trim()
    .replace(/^google-site-verification=/i, "")
    .trim();
  if (!GOOGLE_SITE_VERIFICATION_REGEX.test(cleaned)) {
    return null;
  }
  return cleaned;
}

export interface PageMetadataOptions {
  title: string;
  description: string;
  pathname?: string;
  path?: string;
  keywords?: readonly string[];
  noIndex?: boolean;
}

/**
 * Builds consistent Next.js App Router Metadata with unique title, description,
 * canonical path, Open Graph, and Twitter/X cards.
 */
export function buildPageMetadata({
  title,
  description,
  pathname,
  path,
  keywords,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const rawPath = pathname ?? path ?? "/";
  const canonicalPath = rawPath === "/" ? "/" : rawPath.replace(/\/+$/, "");
  const shouldNoIndex = noIndex || isPreviewDeployment();

  return {
    title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: noIndex
      ? undefined
      : {
          canonical: canonicalPath,
        },
    openGraph: {
      title: `${title} | OneToolHub`,
      description,
      url: canonicalPath,
      siteName: "OneToolHub",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | OneToolHub`,
      description,
    },
    robots: shouldNoIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

/**
 * Generates accurate WebSite JSON-LD structured data for the homepage.
 * Does not include invented ratings, reviews, or fake company addresses.
 */
export function buildWebsiteJsonLd(siteName: string, description: string) {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: origin,
    description,
    inLanguage: "en",
  };
}

/**
 * Generates accurate BreadcrumbList and SoftwareApplication JSON-LD for a tool page.
 * Strictly avoids fake aggregateRating, offers prices, or invented reviews.
 */
export function buildToolPageJsonLd(
  tool: ToolItem,
  pageTitle: string,
  pageDescription: string
) {
  const origin = getSiteOrigin();
  const toolUrl = getAbsoluteUrl(`/tools/${tool.slug}`);

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All Tools",
        item: getAbsoluteUrl("/tools"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: toolUrl,
      },
    ],
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pageTitle,
    description: pageDescription,
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web Browser)",
    isAccessibleForFree: true,
  };

  return [breadcrumbList, softwareApplication];
}
