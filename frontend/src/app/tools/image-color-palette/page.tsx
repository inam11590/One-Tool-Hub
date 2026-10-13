import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ImageColorPaletteTool = dynamic(
  () =>
    import("@/components/tools/ImageColorPaletteTool").then(
      (mod) => mod.ImageColorPaletteTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading Image Color Palette Extractor...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "image-color-palette";

export const metadata: Metadata = buildPageMetadata({
  title: "Image Color Palette Extractor — Extract Dominant Colors Online",
  description:
    "Extract dominant colors and harmonious color schemes from any image. Get HEX and RGB values, interactive swatches, JSON, and CSS export. 100% private in-browser tool.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "image color palette extractor",
    "extract colors from image",
    "image color picker",
    "hex code from image",
    "dominant colors in photo",
    "color palette generator from image",
    "extract rgb from picture",
    "brand palette from image",
  ],
});

const OVERVIEW =
  "The OneToolHub Image Color Palette Extractor analyzes photographs, illustrations, and UI designs to discover their most prominent and harmonious color schemes. Utilizing high-speed deterministic color quantization and Euclidean distance filtering, the tool ignores transparent pixels and extracts a distinct palette of 4 to 12 colors. Designers and developers can inspect HEX and RGB codes, copy individual shades, and export full schemes as JSON, plain text, or CSS custom variables.";

const FEATURES = [
  "100% client-side pixel quantization with zero image uploads or cloud API calls.",
  "Deterministic color clustering: analyzes downsampled pixel arrays for fast execution in milliseconds.",
  "Filters out transparent and near-transparent pixels to avoid skewing graphic palettes.",
  "Euclidean color deduplication: prevents duplicate or near-identical shades in the final output.",
  "Configurable palette size: select 4, 6, 8, 10, or 12 dominant color swatches.",
  "Individual 1-click HEX copy, full palette copy, and export to JSON, Plain Text, or CSS Custom Properties.",
  "Dynamic contrast indicators ensure color code readability across dark and light swatches.",
] as const;

const EXAMPLES = [
  {
    title: "Creating a Brand Color Scheme from a Logo",
    description: "Extract the exact primary, secondary, and accent colors from a company branding graphic.",
    sample: "brand-logo.png → 6 Colors Extracted → Primary #0F172A, Accent #10B981, Light #F8FAFC → Exported to CSS",
  },
  {
    title: "Extracting Natural Photography Palettes for Web Design",
    description: "Extract a cohesive organic palette from a landscape photograph to inspire a website's UI themes.",
    sample: "nature-landscape.jpg → 8 Colors Extracted → Warm Earth Tones (#8B5A2B, #2E8B57, #F4A460)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Image",
    stepDescription: "Drag and drop your image or click to select a JPEG, PNG, or WebP file from your computer.",
  },
  {
    stepTitle: "Select Palette Size",
    stepDescription: "Choose between 4, 6, 8, 10, or 12 swatches based on the complexity of your color needs.",
  },
  {
    stepTitle: "Inspect Colors",
    stepDescription: "Review the continuous palette strip and individual color cards showing HEX, RGB, and percentage share.",
  },
  {
    stepTitle: "Copy or Export",
    stepDescription: "Click any HEX code to copy it individually, or click 'Copy All HEX', 'JSON', or 'CSS' for bulk export.",
  },
] as const;

const FAQS = [
  {
    question: "How does the tool determine dominant colors?",
    answer:
      "The tool downsamples your image onto an in-memory canvas and quantizes pixels into 5-bit color bins. It then sorts bins by frequency and applies Euclidean color distance filtering to ensure every swatch is distinct rather than repeating subtle variations.",
  },
  {
    question: "Does the extractor work with transparent PNG logos?",
    answer:
      "Yes. Pixels with an alpha transparency value below 128 are automatically excluded from the analysis, preventing transparent backgrounds from skewing your color palette toward black or white.",
  },
  {
    question: "Can I use the extracted colors directly in web development?",
    answer:
      "Yes. You can click 'CSS' to download a clean `:root { --color-1: #...; }` custom properties snippet, or 'JSON' to import palette data into design tokens and component libraries.",
  },
  {
    question: "Are my photos sent to an external server?",
    answer:
      "Never. All pixel analysis and color math occur directly in your browser's local memory. No files or image pixels leave your computer.",
  },
] as const;

export default function ImageColorPalettePage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Image Color Palette Extractor"
      description="Extract dominant colors from photos and graphics with HEX/RGB codes, contrast badges, and CSS export."
      privacyNote="Processed 100% locally in your browser canvas. No image data or color tokens are transmitted externally."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageColorPaletteTool />
    </ToolPageShell>
  );
}
