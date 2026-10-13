import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ImageCropperTool = dynamic(
  () =>
    import("@/components/tools/ImageCropperTool").then(
      (mod) => mod.ImageCropperTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading Image Cropper...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "image-cropper";

export const metadata: Metadata = buildPageMetadata({
  title: "Image Cropper — Crop Images Online for Social Media & Web",
  description:
    "Crop images online with aspect ratio presets for Instagram (1:1), YouTube (16:9), TikTok (9:16), and custom dimensions. 100% private in-browser canvas cropping.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "image cropper",
    "crop image online",
    "crop photo free",
    "square image cropper",
    "16:9 image crop",
    "social media image cropper",
    "in-browser photo cropper",
    "crop picture without upload",
  ],
});

const OVERVIEW =
  "The OneToolHub Image Cropper is a fast, versatile browser utility designed to trim and reframe images for social media posts, thumbnails, banners, and website headers. Supporting standard aspect ratios including 1:1 square, 16:9 widescreen, 9:16 vertical stories, and 4:3 photography, it operates directly on your local device with zero file uploads or cloud processing. Easily fine-tune pixel offsets, preview the framed crop, and export in PNG, JPG, or WebP.";

const FEATURES = [
  "100% in-browser cropping with zero server uploads and complete user privacy.",
  "Preset aspect ratios: Freeform, 1:1 (Square / Instagram), 16:9 (Landscape / YouTube), 9:16 (Stories / TikTok), and 4:3 (Standard Photo).",
  "Custom crop dimensions with exact pixel precision and boundary enforcement.",
  "Supports output format selection: PNG (preserves transparency), JPG (compact), or WebP (modern).",
  "Real-time visual preview displaying exact selection dimensions and output file size.",
  "Works across desktops, tablets, and mobile devices without requiring third-party software.",
] as const;

const EXAMPLES = [
  {
    title: "Framing a 1:1 Profile Picture for Social Media",
    description: "Crop a wide portrait photograph into a centered square avatar for LinkedIn, Discord, or Instagram.",
    sample: "portrait-raw.jpg (4000 × 3000 px) → 1:1 Aspect Ratio Preset → profile-cropped.png (2400 × 2400 px)",
  },
  {
    title: "Creating a 16:9 YouTube Video Thumbnail",
    description: "Crop a landscape photo to standard 16:9 widescreen proportions to fit high-definition 1080p and 4K displays.",
    sample: "vlog-still.png (3840 × 2160 px) → 16:9 Aspect Ratio Preset → thumbnail-cropped.webp",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Image",
    stepDescription: "Drag and drop your image or click to select a JPEG, PNG, or WebP file from your computer or phone.",
  },
  {
    stepTitle: "Select Aspect Ratio or Set Dimensions",
    stepDescription: "Choose an aspect ratio preset (Freeform, 1:1, 16:9, 9:16, 4:3) or adjust the pixel width, height, and offsets.",
  },
  {
    stepTitle: "Choose Output Format",
    stepDescription: "Select PNG (recommended for transparent graphics), JPG (for small photo file sizes), or WebP (for websites).",
  },
  {
    stepTitle: "Apply & Download",
    stepDescription: "Click 'Apply Crop' to generate the cropped image on canvas, inspect the preview, and download your final file.",
  },
] as const;

const FAQS = [
  {
    question: "Does cropping reduce image quality?",
    answer:
      "Cropping extracts only the designated area of your image at its original native resolution without resampling or downscaling. If you save as PNG, the result is completely lossless.",
  },
  {
    question: "Can I crop transparent PNG images?",
    answer:
      "Yes. If your original image has transparent areas, selecting PNG or WebP as the output format will fully preserve alpha channel transparency.",
  },
  {
    question: "Are my photos sent to a server?",
    answer:
      "No. All cropping and canvas drawing occur directly in your browser's local memory. No files or image data are ever transmitted across the internet.",
  },
  {
    question: "Can I enter exact pixel dimensions?",
    answer:
      "Yes. The tool provides manual pixel input fields for Width, Height, Offset X, and Offset Y, allowing you to crop to specific exact requirements.",
  },
] as const;

export default function ImageCropperPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Image Cropper"
      description="Crop photos and graphics with standard aspect ratio presets (1:1, 16:9, 9:16, 4:3) directly in your browser."
      privacyNote="Processed 100% locally in your browser canvas. No image data is ever uploaded or stored externally."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageCropperTool />
    </ToolPageShell>
  );
}
