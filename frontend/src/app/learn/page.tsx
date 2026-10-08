import type { Metadata } from "next";
import { getLearnArticleSummaries } from "@/lib/learn";
import { buildLearnDirectoryJsonLd, buildPageMetadata } from "@/lib/seo";
import { LearnDirectoryClient } from "@/components/learn/LearnDirectoryClient";

export const metadata: Metadata = buildPageMetadata({
  title:
    "Learning Center — Step-by-Step Guides for Students, Freelancers, Creators & Developers",
  description:
    "Explore practical tutorials on JSON validation, image compression, QR code scannability, word counting, YouTube video chapters, weighted college GPA, freelance invoicing, and local PDF merging.",
  pathname: "/learn",
  keywords: [
    "onetoolhub learning center",
    "json formatting tutorial",
    "image compression guide",
    "youtube chapters guide",
    "college gpa calculation guide",
    "freelance invoice guide",
    "merge and split pdf tutorial",
  ],
});

export default function LearnPage() {
  const breadcrumbJsonLd = buildLearnDirectoryJsonLd();
  const articles = getLearnArticleSummaries();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <LearnDirectoryClient articles={articles} />
    </>
  );
}
