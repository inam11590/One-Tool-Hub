import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ToolFinderClient } from "@/components/tools/ToolFinderClient";

export const metadata: Metadata = buildPageMetadata({
  title: "سمارٹ ٹول فائنڈر — اپنے مقصد کے مطابق بہترین ٹول تلاش کریں",
  description:
    "آسان اور سادہ الفاظ میں بتائیں کہ آپ کیا کرنا چاہتے ہیں، اور مناسب ترین مفت براؤزر یوٹیلیٹی فوری حاصل کریں۔ 100% نجی اور مفت۔",
  pathname: "/ur/tool-finder",
  locale: "ur",
  keywords: [
    "سمارٹ ٹول فائنڈر",
    "ٹول تلاش",
    "اردو آن لائن ٹولز",
    "براؤزر یوٹیلیٹیز",
  ],
});

export default function UrduToolFinderPage() {
  return (
    <div dir="rtl" lang="ur" className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
              مقصد پر مبنی تلاش
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              سمارٹ ٹول فائنڈر
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              اپنا مطلوبہ کام سادہ الفاظ میں لکھیں۔ ہمارا سسٹم آپ کے لیے موزوں ترین ٹول فوری تجویز کرے گا، مکمل رازداری کے ساتھ۔
            </p>
          </div>

          <ToolFinderClient lang="ur" />
        </div>
      </Container>
    </div>
  );
}
