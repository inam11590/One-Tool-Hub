import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { PdfOrganizerTool } from "@/components/tools/PdfOrganizerTool";

const TOOL_SLUG = "pdf-organizer";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Page Organizer — Reorder, Rotate, and Delete PDF Pages Online",
  description:
    "Reorder, rotate, and delete pages in your PDF document interactively with visual thumbnails. Rearrange documents with undo support and zero server uploads.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "pdf organizer online",
    "reorder pdf pages",
    "rotate pdf pages",
    "delete pages from pdf",
    "rearrange pdf sheets",
    "organize pdf document in browser",
    "free pdf page manager",
  ],
});

const OVERVIEW =
  "The OneToolHub PDF Page Organizer provides an interactive visual workspace to rearrange, rotate, and prune PDF pages with total precision. Whether you need to fix a scanned page that was fed upside down, remove blank pages from a scanned contract, or resequence presentation slides, this client-side utility organizes your document in seconds without uploading sensitive records to any cloud service.";

const FEATURES = [
  "Visual page thumbnail grid displaying current and original page indices.",
  "Accessible page movement controls (Move Left, Move Right) alongside keyboard shortcuts.",
  "Single-page and bulk 90-degree clockwise and counter-clockwise rotation.",
  "Safe page deletion with protection against accidental empty-document creation.",
  "Multi-step undo history and one-click reset to restore original document order.",
  "100% client-side vector page extraction using pdf-lib: your files never leave your computer.",
] as const;

const EXAMPLES = [
  {
    title: "Fixing Inverted Scanned Invoices",
    description: "Rotate sideways or upside-down scanned receipt pages by 90 or 180 degrees.",
    sample: "Page 2 (sideways scan)  →  Rotate 90° CW  →  Upright clean document",
  },
  {
    title: "Deleting Blank Filler Pages from a Contract",
    description: "Prune accidental trailing blank pages from multi-page agreements before sending to clients.",
    sample: "agreement.pdf (12 pages)  →  Delete pages 11 & 12  →  agreement-clean.pdf (10 pages)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Your PDF",
    stepDescription: "Drag and drop your PDF into the organizer box or pick a file up to 50 MB.",
  },
  {
    stepTitle: "Rearrange Page Order",
    stepDescription: "Click the Left or Right arrow buttons beneath any page card to shift its position in the document.",
  },
  {
    stepTitle: "Rotate or Remove Pages",
    stepDescription: "Use the rotation icons to fix sideways pages, or click the trash icon to remove unnecessary sheets.",
  },
  {
    stepTitle: "Export Clean Document",
    stepDescription: "Review the updated page flow and click 'Export Organized PDF' to download your final file.",
  },
] as const;

const FAQS = [
  {
    question: "Does reordering PDF pages compromise text quality?",
    answer:
      "No. The organizer extracts and copies the native vector and font streams directly using pdf-lib. Page contents are not rasterized or compressed, preserving 100% original sharpness.",
  },
  {
    question: "Can I undo a change if I delete the wrong page?",
    answer:
      "Yes. The organizer maintains an undo history stack. Simply click the 'Undo' button in the toolbar to revert your latest page move, rotation, or deletion.",
  },
  {
    question: "What happens to digital signatures or interactive form fields?",
    answer:
      "Modifying page sequences or deleting pages will invalidate cryptographic document signatures and may flatten interactive form fields into static text.",
  },
  {
    question: "Is my document stored on OneToolHub servers?",
    answer:
      "Never. All PDF parsing, thumbnail generation, page reordering, and file saving execute locally in your web browser. No files are ever sent to any remote server.",
  },
] as const;

export default function PdfOrganizerPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Page Organizer"
      description="Reorder, rotate, and delete pages within PDF documents interactively with visual thumbnails, undo, and instant export."
      privacyNote="Processed 100% locally in your browser using pdf-lib and PDF.js. Your document contents are never uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfOrganizerTool />
    </ToolPageShell>
  );
}
