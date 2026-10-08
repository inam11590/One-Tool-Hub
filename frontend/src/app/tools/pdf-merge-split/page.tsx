import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { PdfMergeSplitTool } from "@/components/tools/PdfMergeSplitTool";

const TOOL_SLUG = "pdf-merge-split";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Merge & Split — Combine PDFs or Extract Pages in Browser",
  description:
    "Merge multiple PDF documents into one file or split and extract custom page ranges (e.g., 1-3, 5, 7-10) locally in your browser without uploading files to a server.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "merge and split pdf in browser without uploading",
    "combine pdf files online free",
    "extract specific page ranges from pdf",
    "client side pdf merger",
    "private local pdf splitter",
  ],
});

const OVERVIEW =
  "The OneToolHub PDF Merge & Split utility allows students, freelancers, and office teams to combine multiple PDF files or extract specific pages locally inside their web browser. Because all PDF parsing and page assembly happen in client-side memory buffers, sensitive contracts, academic papers, and financial statements stay on your device.";

const FEATURES = [
  "Merge Mode: Combine up to 25 PDF files (up to 100 MB total and 500 pages) in any custom order.",
  "Split & Extract Mode: Extract custom page ranges such as '1-3, 5, 7-10' or toggle individual pages interactively.",
  "Flexible split output: Download extracted pages as one combined PDF or as separate PDF files per range.",
  "Automatic detection of encrypted/password-protected or corrupted PDF files with clear guidance.",
  "Built-in sample PDF generator so you can test merging and splitting immediately without uploading personal files.",
  "Automatic release of memory buffers when resetting or switching modes.",
] as const;

const EXAMPLES = [
  {
    title: "Combining Signed Contract Pages & Appendices",
    description:
      "Upload a cover letter PDF, a main agreement PDF, and an appendix PDF in Merge Mode, reorder them with the Up/Down buttons, and download a single consolidated packet.",
    sample: "cover-letter.pdf (1p) + agreement.pdf (4p) + appendix.pdf (2p) → merged-packet.pdf (7p)",
  },
  {
    title: "Extracting Specific Chapters from a Lecture Packet",
    description:
      "Switch to Split Mode, upload a 20-page PDF, and enter '1-3, 8, 12-15' to extract only the required reading pages into a new file.",
    sample: "Page Range Input: 1-3, 8, 12-15 → 8 extracted pages",
  },
] as const;

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
      "No. All PDF inspection, page copying, merging, and splitting run locally inside your browser using JavaScript memory buffers. Your documents never leave your device.",
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
      description="Combine multiple PDF files in any order or extract specific page ranges into single or separate PDF documents—directly in your browser."
      privacyNote="Processed locally in your browser. Your PDFs are not uploaded to any external server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfMergeSplitTool />
    </ToolPageShell>
  );
}
