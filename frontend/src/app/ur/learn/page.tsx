import type { Metadata } from "next";
import { getLearnArticleSummaries } from "@/lib/learn";
import { buildLearnDirectoryJsonLd, buildPageMetadata } from "@/lib/seo";
import { LearnDirectoryClient } from "@/components/learn/LearnDirectoryClient";

export const metadata: Metadata = buildPageMetadata({
  title: "لرننگ سینٹر — طلباء، فری لانسرز، تخلیق کاروں اور ڈویلپرز کے لیے مرحلہ وار گائیڈز",
  description:
    "JSON تصدیق، امیج کمپریشن، QR کوڈ گائیڈ، ورڈ کاؤنٹر، یوٹیوب چیپٹرز، کالج GPA، انوائس جنریٹر اور پی ڈی ایف ٹولز پر عملی تکنیکی گائیڈز دریافت کریں۔",
  pathname: "/ur/learn",
  locale: "ur",
  keywords: [
    "ون ٹول ہب لرننگ سینٹر",
    "json فارمیٹنگ گائیڈ",
    "امیج کمپریشن طریقہ",
    "یوٹیوب چیپٹرز گائیڈ",
    "کالج gpa طریقہ",
    "فری لانس انوائس گائیڈ",
  ],
});

export default function UrduLearnPage() {
  const breadcrumbJsonLd = buildLearnDirectoryJsonLd();
  const articles = getLearnArticleSummaries();

  return (
    <div dir="rtl" lang="ur">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <LearnDirectoryClient articles={articles} />
    </div>
  );
}
