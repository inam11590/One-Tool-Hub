import type { Metadata } from "next";
import { buildWebsiteJsonLd, isPreviewDeployment } from "@/lib/seo";
import { UR_DICTIONARY } from "@/lib/i18n/dictionaries/ur";
import { HomeClient } from "@/components/home/HomeClient";
import { FeaturedGuides } from "@/components/home/FeaturedGuides";
import { Benefits } from "@/components/home/Benefits";

const previewNoIndex = isPreviewDeployment();

export const metadata: Metadata = {
  title: {
    absolute: `${UR_DICTIONARY.common.siteName} — ${UR_DICTIONARY.common.tagline}`,
  },
  description: UR_DICTIONARY.common.description,
  alternates: {
    canonical: "/ur",
    languages: {
      en: "/",
      ur: "/ur",
      "x-default": "/",
    },
  },
  openGraph: {
    title: `${UR_DICTIONARY.common.siteName} — ${UR_DICTIONARY.common.tagline}`,
    description: UR_DICTIONARY.common.description,
    url: "/ur",
    siteName: UR_DICTIONARY.common.siteName,
    locale: "ur_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${UR_DICTIONARY.common.siteName} — ${UR_DICTIONARY.common.tagline}`,
    description: UR_DICTIONARY.common.description,
  },
  robots: previewNoIndex
    ? {
        index: false,
        follow: false,
      }
    : {
        index: true,
        follow: true,
      },
};

export default function UrduHomePage() {
  const websiteJsonLd = buildWebsiteJsonLd(
    UR_DICTIONARY.common.siteName,
    UR_DICTIONARY.common.description
  );

  return (
    <div dir="rtl" lang="ur">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <HomeClient />
      <FeaturedGuides />
      <Benefits />
    </div>
  );
}
