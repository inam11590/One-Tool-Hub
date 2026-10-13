import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { CollectionsClient } from "@/components/collections/CollectionsClient";

export const metadata: Metadata = buildPageMetadata({
  title: "منتخب ٹول مجموعہ جات — ہر شعبے کے لیے خصوصی ٹول بنڈلز",
  description:
    "طلباء، ڈویلپرز، مواد تخلیق کاروں، پی ڈی ایف صارفین اور مصنفین کے لیے 5 خصوصی ٹول مجموعے۔ وقت بچائیں اور براؤزر میں تمام ضروری ٹولز فوری استعمال کریں۔",
  pathname: "/ur/collections",
  locale: "ur",
  keywords: [
    "ٹول مجموعے",
    "ڈویلپر ٹولز بنڈل",
    "طلباء ٹولز",
    "تخلیق کار ٹولز",
    "پی ڈی ایف مجموعہ",
  ],
});

export default function UrduCollectionsPage() {
  return (
    <div dir="rtl" lang="ur" className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
              خصوصی بنڈلز
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              منتخب ٹول مجموعہ جات
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              علیحدہ علیحدہ ٹولز تلاش کرنے کی بجائے اپنے شعبے کے مطابق مکمل بنڈل منتخب کریں، اپنے ورک اسپیس میں محفوظ کریں اور اپنا کام تیزی سے مکمل کریں۔
            </p>
          </div>

          <CollectionsClient lang="ur" />
        </div>
      </Container>
    </div>
  );
}
