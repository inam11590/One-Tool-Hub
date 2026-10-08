import type { Metadata } from "next";
import type { ToolItem } from "@/types/tools";

const LOCAL_FALLBACK_ORIGIN = "http://localhost:3000";

export interface SiteUrlConfig {
  /** Validated origin without trailing slash */
  origin: string;
  /** True only when NEXT_PUBLIC_SITE_URL is explicitly configured to a non-localhost, non-preview HTTPS origin */
  isProductionDomainConfigured: boolean;
  /** True when the current environment is a staging, preview, or localhost origin */
  isStagingOrLocal: boolean;
}

/**
 * Validates and normalizes `process.env.NEXT_PUBLIC_SITE_URL`.
 * Never hardcodes an invented production domain.
 */
export function getSiteUrlConfig(): SiteUrlConfig {
  const rawEnvUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV?.trim();

  if (!rawEnvUrl) {
    return {
      origin: LOCAL_FALLBACK_ORIGIN,
      isProductionDomainConfigured: false,
      isStagingOrLocal: true,
    };
  }

  try {
    const parsed = new URL(rawEnvUrl);
    const hostname = parsed.hostname.toLowerCase();
    const isLocalHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local");
    const isPreviewOrStaging =
      vercelEnv === "preview" ||
       vercelEnv === "development" ||
      hostname.endsWith(".vercel.app") ||
      hostname.startsWith("staging.") ||
      hostname.startsWith("dev.") ||
      hostname === "example.com";

    const cleanOrigin = parsed.origin.replace(/\/+$/, "");
    const isProdHttps =
      parsed.protocol === "https:" && !isLocalHost && !isPreviewOrStaging;

    return {
      origin: cleanOrigin,
      isProductionDomainConfigured: isProdHttps,
      isStagingOrLocal: isLocalHost || isPreviewOrStaging,
    };
  } catch {
    return {
      origin: LOCAL_FALLBACK_ORIGIN,
      isProductionDomainConfigured: false,
      isStagingOrLocal: true,
    };
  }
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

/**
 * Validates and returns the optional Google Search Console verification token
 * configured via NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
 */
export function getGoogleSiteVerificationToken(
  rawEnv: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
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
    robots: noIndex
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
