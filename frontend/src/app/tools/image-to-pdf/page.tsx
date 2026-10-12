import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const ImageToPdfTool = dynamic(
  () => import("@/components/tools/ImageToPdfTool").then((mod) => mod.ImageToPdfTool),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading JPG / PNG to PDF Converter...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "image-to-pdf";

export const metadata: Metadata = buildPageMetadata({
  title: "JPG / PNG to PDF Converter — Combine Images into PDF Online",
  description:
    "Convert JPG, PNG, and WebP images into a single clean PDF document directly in your browser. Configure page sizes, margins, orientations, and reorder pages with zero server uploads.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "image to pdf converter",
    "jpg to pdf online",
    "png to pdf",
    "photos to pdf maker",
    "combine pictures into pdf",
    "convert images to single pdf",
    "document scan to pdf",
  ],
});

const OVERVIEW =
  "The OneToolHub JPG / PNG to PDF Converter allows students, freelancers, and professionals to merge multiple photo files, document scans, and graphics into a single structured PDF file. Configure page dimensions (A4, US Letter, or Fit to Image), customize margins, toggle portrait and landscape orientations, and arrange pages in any sequence with total client-side data privacy.";

const FEATURES = [
  "Seamless multi-image upload supporting JPEG, PNG, and modern WebP image formats.",
  "Custom page dimensions including international A4, US Letter, and exact Fit-to-Image.",
  "Configurable page margins (None, Small, Medium, Large) with aspect-ratio preserving fit modes.",
  "Interactive page reordering with intuitive move up and move down controls.",
  "Fast client-side vector embedding using pdf-lib with zero upload latency.",
  "100% private and offline-capable: your images and documents never leave your local device.",
] as const;

const EXAMPLES = [
  {
    title: "Combining Student Homework Scans into a Single PDF",
    description: "Assemble 5 photos of handwritten assignments into a clean multi-page A4 PDF submission.",
    sample: "hw-page1.jpg, hw-page2.jpg ...  →  Assignment_Submission.pdf (5 pages, A4)",
  },
  {
    title: "Creating a Freelance Portfolio or Receipt Packet",
    description: "Combine multiple client receipt snapshots or design screenshots into a single document.",
    sample: "receipt-01.png, receipt-02.png  →  Expense_Receipts.pdf (Letter, Small Margins)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Images",
    stepDescription: "Select or drag and drop JPG, PNG, or WebP files from your computer or mobile device.",
  },
  {
    stepTitle: "Arrange Page Order",
    stepDescription: "Use the arrow controls to reorder images into your desired page sequence.",
  },
  {
    stepTitle: "Configure Layout & Margins",
    stepDescription: "Pick your target page size (A4, Letter, Fit), orientation, margins, and output filename.",
  },
  {
    stepTitle: "Generate & Download PDF",
    stepDescription: "Click 'Generate PDF' and download your combined document immediately.",
  },
] as const;

const FAQS = [
  {
    question: "Will my images be uploaded to OneToolHub servers?",
    answer:
      "No. All image processing, scaling, and PDF encoding execute entirely inside your local web browser using pdf-lib. No images are ever sent over the network.",
  },
  {
    question: "Does the converter support PNG transparency?",
    answer:
      "Yes. When PNG images are embedded into the PDF, their transparent backgrounds are preserved against the document page canvas.",
  },
  {
    question: "What does 'Fit to Image' mean?",
    answer:
      "'Fit to Image' dynamically sets the width and height of each PDF page to match the exact pixel dimensions of the source image, preventing any white margins or letterboxing.",
  },
  {
    question: "How many images can I merge into one PDF?",
    answer:
      "You can combine dozens of images up to a combined memory limit of approximately 100 MB, which accommodates most academic and business document requirements.",
  },
] as const;

export default function ImageToPdfPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="JPG / PNG to PDF Converter"
      description="Convert multiple JPG, PNG, and WebP images into a single clean PDF document with custom page sizes, orientations, and margins."
      privacyNote="Processed 100% locally in your browser using pdf-lib. Your photos and documents are never uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ImageToPdfTool />
    </ToolPageShell>
  );
}
