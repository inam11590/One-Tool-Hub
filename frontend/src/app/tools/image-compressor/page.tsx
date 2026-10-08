import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, SITE_CONFIG } from "@/lib/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { ImageCompressorTool } from "@/components/tools/ImageCompressorTool";

const TOOL_SLUG = "image-compressor";

export const metadata: Metadata = {
  title: "Image Compressor — Compress JPEG, PNG & WebP in Your Browser",
  description:
    "Compress and convert JPEG, PNG, and WebP images locally in your browser. Adjust quality, compare original and output file sizes, and download optimized images.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
  },
  openGraph: {
    title: `Image Compressor | ${SITE_CONFIG.name}`,
    description:
      "Compress and convert JPEG, PNG, and WebP images locally in your browser with adjustable quality and instant size comparison.",
    url: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
    type: "website",
  },
};

const INSTRUCTIONS = [
  {
    stepTitle: "Select or Drag & Drop an Image",
    stepDescription:
      "Drop a JPEG, PNG, or WebP file into the upload zone or use the file picker. Files up to 25 MB and 40 megapixels are supported.",
  },
  {
    stepTitle: "Choose Output Format & Quality",
    stepDescription:
      "Select WebP or JPEG for adjustable lossy compression, or PNG for browser canvas re-encoding. Adjust the quality slider between 10% and 100%.",
  },
  {
    stepTitle: "Compare File Sizes & Visual Clarity",
    stepDescription:
      "Inspect the original and processed previews side by side along with the exact byte count and percentage change.",
  },
  {
    stepTitle: "Download Your Processed Image",
    stepDescription:
      "Click 'Download Image' to save the optimized file directly to your device, or click 'Reset' to clear memory and start over.",
  },
] as const;

const FAQS = [
  {
    question: "Are my images uploaded to a remote server?",
    answer:
      "No. Your images are decoded and re-encoded locally in your browser using the HTML5 Canvas API. Temporary object URLs are released automatically when you reset or leave the page.",
  },
  {
    question: "Why doesn't the quality slider affect PNG output?",
    answer:
      "Standard browser Canvas PNG encoding is always lossless and ignores lossy quality parameters. To achieve significant file size reductions on photographs or thumbnails, choose WebP or JPEG as your output format.",
  },
  {
    question: "Why did my output file become larger than the original?",
    answer:
      "If you upload an already heavily compressed JPEG or WebP image and export it at 95–100% quality—or convert a photographic JPEG into PNG—the re-encoded file can require more bytes than the source.",
  },
  {
    question: "What happens to transparency when converting PNG to JPEG?",
    answer:
      "Because the JPEG format does not support alpha transparency, transparent pixels are automatically composite-filled onto a clean white background. Use WebP or PNG if you need to preserve transparency.",
  },
] as const;

export default function ImageCompressorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Image Compressor"
      description="Optimize and convert JPEG, PNG, and WebP images right in your browser with adjustable quality and side-by-side preview comparison."
      privacyNote="Images are processed locally via browser Canvas and are never uploaded to any server."
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageCompressorTool />
    </ToolPageShell>
  );
}
