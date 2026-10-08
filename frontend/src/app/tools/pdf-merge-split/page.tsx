import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, SITE_CONFIG } from "@/lib/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { PdfMergeSplitTool } from "@/components/tools/PdfMergeSplitTool";

const TOOL_SLUG = "pdf-merge-split";

export const metadata: Metadata = {
  title: "PDF Merge & Split — Combine PDFs or Extract Pages in Browser",
  description:
    "Merge multiple PDF documents into one file or split and extract custom page ranges (e.g., 1-3, 5, 7-10) locally in your browser without uploading files to a server.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
  },
  openGraph: {
    title: `PDF Merge & Split | ${SITE_CONFIG.name}`,
    description:
      "Combine multiple PDF files in custom order or extract page ranges into single or separate PDFs directly in your browser.",
    url: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
    type: "website",
  },
};

const INSTRUCTIONS = [
  {
    stepTitle: "Select Merge Mode or Split Mode",
    stepDescription:
      "Use the top tab bar to switch between 'Merge PDFs' (combining multiple files) and 'Split / Extract Pages' (pulling custom page ranges from a single PDF).",
  },
  {
    stepTitle: "Upload or Drag-and-Drop PDF Files",
    stepDescription:
      "Drop your unencrypted PDF documents into the upload zone or click 'Load Sample PDFs' to test merging and splitting immediately.",
  },
  {
    stepTitle: "Arrange File Order or Specify Page Ranges",
    stepDescription:
      "In Merge Mode, use the Up/Down buttons to reorder files. In Split Mode, type page ranges like '1-3, 5, 7-10' or click individual page pills and choose whether to export one combined PDF or separate PDFs per range.",
  },
  {
    stepTitle: "Process & Download Locally",
    stepDescription:
      "Click 'Merge PDFs Now' or 'Extract PDF Pages' to generate your new PDF files in memory and download them directly to your device.",
  },
] as const;

const FAQS = [
  {
    question: "Are my PDF documents uploaded to any cloud server?",
    answer:
      "No. All PDF inspection, page copying, merging, and splitting run locally inside your browser using WebAssembly/JavaScript memory buffers. Your documents never leave your device.",
  },
  {
    question: "Can I merge or split password-protected (encrypted) PDF files?",
    answer:
      "Encrypted or password-protected PDFs are detected automatically and rejected with a clear message. Please remove the password in your PDF reader before uploading.",
  },
  {
    question: "Will digital signatures, interactive forms, or annotations be preserved?",
    answer:
      "Standard page content, text, vector graphics, and embedded images are preserved when copying pages. However, cryptographic digital signatures, interactive AcroForm/XFA fields, or document-level annotations may not be preserved in all cases.",
  },
  {
    question: "What are the file size and page count limits?",
    answer:
      "To prevent browser tab memory exhaustion, individual PDF files are limited to 50 MB (up to 100 MB combined across 25 files in Merge Mode) and 500 total pages.",
  },
] as const;

export default function PdfMergeSplitPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Merge & Split"
      description="Combine multiple PDF files in any order or extract specific page ranges into single or separate PDF documents—100% locally in your browser."
      privacyNote="100% local browser processing. Your PDFs are never uploaded to any external server."
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfMergeSplitTool />
    </ToolPageShell>
  );
}
