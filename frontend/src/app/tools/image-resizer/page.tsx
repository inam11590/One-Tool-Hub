import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { ImageResizerTool } from "@/components/tools/ImageResizerTool";

const TOOL_SLUG = "image-resizer";

export const metadata: Metadata = buildPageMetadata({
  title: "Image Resizer Online — Resize Images to Exact Dimensions",
  description:
    "Resize JPEG, PNG, and WebP images to exact pixel width and height directly in your browser. Lock aspect ratio, select output format, and download without server uploads.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "image resizer online",
    "resize image exact dimensions",
    "change photo width height in browser",
    "resize png jpeg webp without quality loss",
    "aspect ratio photo scaler",
  ],
});

const OVERVIEW =
  "The OneToolHub Image Resizer allows you to scale and resize image files to custom pixel dimensions entirely within your browser. Ideal for YouTube thumbnails, social banners, blog hero headers, and profile avatars, this utility preserves aspect ratios, supports WebP, PNG, and JPEG formats, and ensures your graphic assets never leave your computer.";

const FEATURES = [
  "Exact pixel width and height scaling with high-quality bicubic canvas interpolation.",
  "Aspect ratio lock and unlock toggles to prevent accidental distortion.",
  "Instant dimension presets for YouTube (1280x720), Full HD (1920x1080), and Social Squares (1080x1080).",
  "Support for PNG (transparency preserved), JPEG (with custom quality), and modern WebP.",
  "100% in-browser processing with zero server uploads and automatic memory cleanup.",
  "Clear download buttons with custom resolution filenames.",
] as const;

const EXAMPLES = [
  {
    title: "YouTube Thumbnail (1280×720)",
    description:
      "Scale down a high-resolution 4K or camera photograph to YouTube's recommended 16:9 thumbnail dimensions.",
    sample: "Original: 3840×2160 px (4.8 MB)  →  Resized: 1280×720 px WebP (110 KB)",
  },
  {
    title: "Square Profile Picture (800×800)",
    description:
      "Resize square avatar assets for forums, GitHub, or social profiles with clean edges.",
    sample: "Original: 2400×2400 px PNG  →  Resized: 800×800 px PNG",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Image",
    stepDescription:
      "Drag and drop a JPEG, PNG, or WebP image into the dropzone or select a file from your computer.",
  },
  {
    stepTitle: "Set Target Width and Height",
    stepDescription:
      "Enter your desired width or height. Keep 'Aspect Ratio Locked' checked to prevent image stretching.",
  },
  {
    stepTitle: "Apply Resize & Download",
    stepDescription:
      "Click 'Apply Resize' to render the output canvas preview, inspect file size, and download the resized file.",
  },
] as const;

const FAQS = [
  {
    question: "Are my images uploaded to any server during resizing?",
    answer:
      "No. All resizing operations execute entirely inside your web browser using HTML5 Canvas APIs. Your photos never leave your device.",
  },
  {
    question: "How do I avoid stretching or squishing my photo?",
    answer:
      "Leave 'Aspect Ratio Locked' checked. When locked, changing the width automatically recalculates the exact proportional height, and vice versa.",
  },
  {
    question: "Does the resizer preserve image transparency?",
    answer:
      "Yes, if you export as PNG or WebP. JPEG does not support transparency and will fill transparent regions with solid color.",
  },
  {
    question: "What is the maximum file size or resolution allowed?",
    answer:
      "You can upload images up to 25 MB and 10,000 pixels in either dimension. The tool runs locally without server upload limits.",
  },
] as const;

export default function ImageResizerPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Image Resizer Online"
      description="Resize JPEG, PNG, and WebP images to exact pixel width and height directly in your browser. Lock aspect ratio, select output format, and download without server uploads."
      privacyNote="Processed 100% locally in your browser using HTML5 Canvas. Your graphic assets are never uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageResizerTool />
    </ToolPageShell>
  );
}
