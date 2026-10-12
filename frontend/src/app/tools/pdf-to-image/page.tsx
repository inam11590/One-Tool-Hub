import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const PdfToImageTool = dynamic(
  () => import("@/components/tools/PdfToImageTool").then((mod) => mod.PdfToImageTool),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading PDF to Image Converter...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "pdf-to-image";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF to JPG / PNG Converter — Extract PDF Pages to Images Online",
  description:
    "Convert PDF document pages into high-resolution JPG or PNG images directly in your browser. Choose custom resolutions, select page ranges, and download single images or a ZIP file.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "pdf to image converter",
    "pdf to jpg online",
    "pdf to png",
    "extract pages from pdf",
    "rasterize pdf to image",
    "convert pdf pages without upload",
    "pdf to zip images",
  ],
});

const OVERVIEW =
  "The OneToolHub PDF to JPG / PNG Converter transforms multi-page PDF documents into crisp image files directly inside your browser. Built with client-side PDF.js rendering technology, this utility lets you extract individual pages or entire documents into JPEG or PNG formats, customize resolution scales, and download single graphics or bundled ZIP archives with zero server storage.";

const FEATURES = [
  "High-resolution page rendering powered by browser-native HTML5 Canvas and PDF.js.",
  "Flexible output formats: JPEG (with compression quality slider) or lossless PNG.",
  "Adjustable resolution scale: 1x (72 DPI), 1.5x (108 DPI), or 2x (144 DPI) for print and retina displays.",
  "Interactive page selection grid with quick Select All and Deselect All controls.",
  "Single-click individual image downloads or full-document ZIP archive export.",
  "100% private and offline-capable: documents are never uploaded to any remote server.",
] as const;

const EXAMPLES = [
  {
    title: "Converting a Multi-Page Presentation to JPG Slides",
    description: "Extract 10 PDF slide deck pages into lightweight 1.5x JPG images for web sharing.",
    sample: "presentation.pdf (10 pages)  →  presentation-page-001.jpg ... (bundled ZIP)",
  },
  {
    title: "Extracting a High-Fidelity Infographic as PNG",
    description: "Convert a single vector PDF poster into a 2x lossless PNG graphic preserving sharp typography.",
    sample: "poster.pdf (Page 1)  →  poster-page-001.png (2x scale, lossless)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Your PDF",
    stepDescription: "Drag and drop your PDF into the upload box or select a file from your device up to 50 MB.",
  },
  {
    stepTitle: "Configure Format & Resolution",
    stepDescription: "Choose between JPG (smaller file size) or PNG (lossless), and pick your desired resolution scale.",
  },
  {
    stepTitle: "Select Target Pages",
    stepDescription: "Click individual page cards in the visual thumbnail grid to toggle selection, or keep all pages selected.",
  },
  {
    stepTitle: "Convert & Download",
    stepDescription: "Click 'Convert Pages' and download images individually or download all pages at once in a single ZIP file.",
  },
] as const;

const FAQS = [
  {
    question: "Are my PDF files uploaded to any server during conversion?",
    answer:
      "No. All PDF loading, page rendering, and image encoding happen 100% locally in your web browser. Your confidential files never leave your device.",
  },
  {
    question: "What is the difference between JPG and PNG output?",
    answer:
      "JPG produces significantly smaller file sizes with adjustable quality, ideal for photographs and general slides. PNG produces lossless, artifact-free images best for line art, diagrams, and text documents.",
  },
  {
    question: "Can I convert password-protected PDFs?",
    answer:
      "For security and privacy reasons, please remove password encryption before uploading, as client-side decryption of encrypted PDFs without passwords is not supported.",
  },
  {
    question: "How many pages can I convert at once?",
    answer:
      "You can convert documents up to 500 pages. For very large PDFs, we recommend converting in batches of 20 to 50 pages to prevent browser memory exhaustion.",
  },
] as const;

export default function PdfToImagePage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF to JPG / PNG Converter"
      description="Convert PDF document pages into high-resolution JPG or PNG images with custom scaling, page ranges, and ZIP export."
      privacyNote="Processed 100% locally in your browser using HTML5 Canvas and PDF.js. Your document contents are never uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfToImageTool />
    </ToolPageShell>
  );
}
