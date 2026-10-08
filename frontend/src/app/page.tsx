import type { Metadata } from "next";
import { buildWebsiteJsonLd } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/tools";
import { HomeClient } from "@/components/home/HomeClient";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  },
  description: SITE_CONFIG.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: "/",
    siteName: SITE_CONFIG.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
};

export default function HomePage() {
  const websiteJsonLd = buildWebsiteJsonLd(
    SITE_CONFIG.name,
    SITE_CONFIG.description
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <HomeClient />
    </>
  );
}
