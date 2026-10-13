import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ImageFormatConverterTool = dynamic(
  () =>
    import("@/components/tools/ImageFormatConverterTool").then(
      (mod) => mod.ImageFormatConverterTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading Image Format Converter...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "image-format-converter";

export const metadata: Metadata = buildPageMetadata({
  title: "Image Format Converter — Convert JPG, PNG & WebP Online",
  description:
    "Free client-side image format converter. Convert images between JPG, PNG, and WebP with custom compression quality, background transparency flattening, and instant download.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "image format converter",
    "convert image to webp",
    "png to jpg converter",
    "jpg to png converter",
    "convert webp to png",
    "in-browser image converter",
    "free image converter online",
    "convert image without upload",
  ],
});

const OVERVIEW =
  "The OneToolHub Image Format Converter enables instant, private image conversion across modern web formats including JPEG, PNG, and WebP. Operating entirely within your browser using HTML5 Canvas APIs, your images are never uploaded to any remote server or third-party cloud. The converter features adjustable compression quality for lossy formats, safe file size checking, and intelligent transparency flattening when converting alpha-channel PNGs or WebPs into opaque JPEGs.";

const FEATURES = [
  "100% private in-browser image conversion with zero server uploads or cloud processing.",
  "Supports universal web formats: JPEG (JPG), PNG (Portable Network Graphics), and WebP.",
  "Configurable quality slider for lossy JPEG and WebP conversions to balance fidelity and file size.",
  "Customizable background color filler when converting transparent PNG or WebP images to JPEG.",
  "Real-time file size comparison calculating exact byte reductions or increases.",
  "Side-by-side visual preview of the original and converted image before downloading.",
  "Maintains natural aspect ratio with strictly zero automatic upscaling.",
] as const;

const EXAMPLES = [
  {
    title: "Converting Heavy PNG Screenshots to Optimized WebP",
    description: "Convert a 4.2 MB PNG desktop screenshot into a lightweight 380 KB WebP image for faster website loading speeds.",
    sample: "screenshot.png (4.2 MB) → WebP (85% Quality) → screenshot-converted.webp (380 KB, -91% size)",
  },
  {
    title: "Converting Transparent Brand Graphics to White-Background JPG",
    description: "Convert a transparent logo PNG to an opaque JPG with a clean white background for email signatures or legacy PDF attachments.",
    sample: "logo-transparent.png → JPEG (White Background #FFFFFF) → logo-converted.jpg",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select or Drop Image",
    stepDescription: "Drag and drop your JPEG, PNG, or WebP image into the upload dropzone or click to select from your device.",
  },
  {
    stepTitle: "Choose Target Format & Quality",
    stepDescription: "Select your desired target format (WebP, JPG, or PNG). If converting to JPG or WebP, adjust the quality slider to your preference.",
  },
  {
    stepTitle: "Set Background Color (If JPG)",
    stepDescription: "When converting to JPG, choose a background fill color (default white #FFFFFF) to seamlessly handle transparent areas.",
  },
  {
    stepTitle: "Convert & Download",
    stepDescription: "Click 'Convert Format' to process the image locally, review the file size comparison, and download your converted file.",
  },
] as const;

const FAQS = [
  {
    question: "Are my photos uploaded to a remote server?",
    answer:
      "No. All image encoding and format transformations are executed directly inside your web browser using HTML5 Canvas. Your images never leave your local computer or phone.",
  },
  {
    question: "What happens to transparency when converting PNG to JPG?",
    answer:
      "The JPEG format does not support transparency (alpha channels). Our tool flattens transparent pixels against your chosen background color (white by default), ensuring no black artifacts or distorted edges.",
  },
  {
    question: "Why should I convert my images to WebP?",
    answer:
      "WebP is a modern image format developed by Google that provides superior lossless and lossy compression. Converting PNG and JPG images to WebP typically reduces file sizes by 25% to 35% without visible quality degradation.",
  },
  {
    question: "Is there a maximum file size limit?",
    answer:
      "To prevent high browser memory consumption on mobile devices, the tool supports files up to 25 MB and 40 megapixels, which comfortably handles high-resolution smartphone and DSLR photos.",
  },
] as const;

export default function ImageFormatConverterPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Image Format Converter"
      description="Convert images between JPG, PNG, and WebP directly in your browser with custom quality and zero server uploads."
      privacyNote="Processed 100% locally in your browser. Your images are never uploaded to any external server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageFormatConverterTool />
    </ToolPageShell>
  );
}
