import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const PdfWatermarkTool = dynamic(
  () => import("@/components/tools/PdfWatermarkTool").then((mod) => mod.PdfWatermarkTool),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading PDF Watermark Tool...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "pdf-watermark";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Watermark Tool — Add Text Watermarks to PDF Online",
  description:
    "Add custom text watermarks to PDF documents directly in your browser. Configure opacity, rotation angle, font size, custom positioning, and tiled patterns with zero server uploads.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "pdf watermark tool",
    "add watermark to pdf online",
    "stamp pdf confidential draft",
    "watermark pdf document in browser",
    "tiled watermark pdf",
    "free pdf watermarker",
  ],
});

const OVERVIEW =
  "The OneToolHub PDF Watermark Tool lets professionals, freelancers, and businesses stamp confidential documents, contracts, drafts, and invoices with custom text watermarks. Customize rotation angle, transparency opacity, typography, and positions (including full-page tiled grids) with instant client-side vector embedding and zero cloud exposure.";

const FEATURES = [
  "Customizable watermark text with quick presets for CONFIDENTIAL, DRAFT, SAMPLE, and DO NOT COPY.",
  "Full control over rotation angles (-90° to +90°), font size, and text opacity (10% to 100%).",
  "Flexible positioning: Center, Corner placements (Top/Bottom, Left/Right), or full-page Tiled grid patterns.",
  "Selective page targeting: apply to all pages or specify custom page ranges (e.g., 1, 3-5).",
  "Vector text embedding via standard PDF fonts in pdf-lib ensuring crisp rendering at any zoom level.",
  "100% private and offline-capable: documents are processed entirely in browser memory.",
] as const;

const EXAMPLES = [
  {
    title: "Stamping a Legal Agreement as 'CONFIDENTIAL DRAFT'",
    description: "Apply a semi-transparent diagonal red watermark across all pages of a negotiation draft.",
    sample: "Text: 'CONFIDENTIAL DRAFT' • Rotation: -45° • Opacity: 30% • Color: Red",
  },
  {
    title: "Tiled Sample Watermark for Digital Proofs",
    description: "Overlay a repeating grid pattern across presentation slides or creative proofs before client sign-off.",
    sample: "Text: 'SAMPLE PROOF' • Placement: Tile (Grid) • Opacity: 20%",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Your PDF",
    stepDescription: "Drag and drop your PDF into the watermarker or select a file up to 50 MB.",
  },
  {
    stepTitle: "Enter Watermark Text & Style",
    stepDescription: "Type your custom text, choose font size, opacity, rotation angle, and color.",
  },
  {
    stepTitle: "Select Placement & Target Pages",
    stepDescription: "Choose between Center, Corner, or Tiled pattern, and select all pages or a custom range.",
  },
  {
    stepTitle: "Apply & Download",
    stepDescription: "Click 'Apply Watermark to PDF' and download your stamped document immediately.",
  },
] as const;

const FAQS = [
  {
    question: "Does adding a watermark flatten or degrade my original PDF text?",
    answer:
      "No. The watermark text is drawn directly into the PDF as native vector text glyphs using pdf-lib. The underlying text layers and vector illustrations remain 100% intact.",
  },
  {
    question: "Is a text watermark the same as DRM protection?",
    answer:
      "No. A watermark is a visual indicator of status and provenance intended to discourage casual copying. It does not provide cryptographic encryption or copy-paste blocking.",
  },
  {
    question: "Are my confidential contracts uploaded to any server?",
    answer:
      "Never. All watermarking operations take place strictly inside your browser tab using JavaScript and WebAssembly. No document content is ever sent over the network.",
  },
  {
    question: "What does the 'Tile (Grid)' placement mode do?",
    answer:
      "Tile mode repeats the watermark text in a uniform diagonal pattern across the entire page, ensuring the watermark is visible even if someone crops parts of the page.",
  },
] as const;

export default function PdfWatermarkPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Watermark Tool"
      description="Add custom text watermarks to PDF pages with live rotation, opacity, corner/center positioning, and tiled patterns."
      privacyNote="Processed 100% locally in your browser using pdf-lib. Your confidential documents and watermark texts are never uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfWatermarkTool />
    </ToolPageShell>
  );
}
