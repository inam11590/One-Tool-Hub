import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";

export const metadata: Metadata = buildPageMetadata({
  title: "تمام آن لائن ٹولز کی ڈائریکٹری — 31 مفت براؤزر یوٹیلیٹیز",
  description:
    "طلباء، فری لانسرز، تخلیق کاروں اور ڈویلپرز کے لیے ون ٹول ہب کے تمام 31 براؤزر ٹولز براؤز اور فلٹر کریں۔ سرور پر کوئی فائل اپ لوڈ نہیں، 100% مفت اور نجی۔",
  pathname: "/ur/tools",
  locale: "ur",
});

export default function UrduAllToolsPage() {
  return (
    <div dir="rtl" lang="ur">
      <ToolsDirectoryClient />
    </div>
  );
}
