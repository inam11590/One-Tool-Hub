import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { WorkflowsClient } from "@/components/workflows/WorkflowsClient";

export const metadata: Metadata = buildPageMetadata({
  title: "پیداواری ورک فلو — مرحلہ وار کثیر ٹول گائیڈز",
  description:
    "مختلف ٹولز کو ملا کر مرحلہ وار کام مکمل کریں: ویب سائٹ کی تصاویر بہتر بنائیں، پی ڈی ایف دستاویزات برانڈ کریں، ڈویلپر ڈیٹا تیار کریں، اور یوٹیوب مواد ترتیب دیں۔",
  pathname: "/ur/workflows",
  locale: "ur",
  keywords: [
    "ورک فلو گائیڈز",
    "ملٹی ٹول پائپ لائن",
    "اردو پیداواری گائیڈز",
    "پی ڈی ایف ورک فلو",
  ],
});

export default function UrduWorkflowsPage() {
  return (
    <div dir="rtl" lang="ur" className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
              رہنما پائپ لائنز
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              پیداواری ورک فلو گائیڈز
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              پیچیدہ کاموں کے لیے کئی ٹولز کی ضرورت ہوتی ہے۔ ان انٹرایکٹو گائیڈز پر عمل کرتے ہوئے مختلف ٹولز کو ایک ساتھ استعمال کریں اور اپنی پیش رفت کو ٹریک کریں۔
            </p>
          </div>

          <WorkflowsClient lang="ur" />
        </div>
      </Container>
    </div>
  );
}
