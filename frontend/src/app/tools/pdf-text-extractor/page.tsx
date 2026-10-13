import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const PdfTextExtractorTool = dynamic(
  () =>
    import("@/components/tools/PdfTextExtractorTool").then(
      (mod) => mod.PdfTextExtractorTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading PDF Text Extractor...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "pdf-text-extractor";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Text Extractor — Extract Text from PDF Documents Online",
  description:
    "Extract clean, selectable text from PDF documents and multi-page reports with word count statistics, instant copy, and TXT file download. 100% private in-browser extraction.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "pdf text extractor",
    "extract text from pdf",
    "pdf to text converter",
    "copy text from pdf",
    "extract words from pdf",
    "pdf to txt online",
    "client-side pdf text extraction",
    "free pdf reader online",
  ],
});

const OVERVIEW =
  "The OneToolHub PDF Text Extractor provides an ultra-fast, completely client-side solution to extract readable text streams from PDF documents, academic papers, and multi-page reports. Powered by PDF.js running in modern web workers, this tool parses fonts and text chunks locally without sending sensitive agreements or data to remote servers. If a scanned document with no selectable text is detected, it transparently notifies you that Optical Character Recognition (OCR) is required.";

const FEATURES = [
  "100% browser-based text extraction with zero server uploads or external API transmission.",
  "Multi-page range extraction: parse the entire document or specify custom page intervals.",
  "Real-time word and character statistics to analyze document density and vocabulary length.",
  "Scanned document detection: automatically alerts when a PDF contains pure raster images without selectable font streams.",
  "One-click clipboard copy and formatted .txt file export for immediate note-taking.",
  "Preserves clean paragraph spacing and structure across multi-column pages.",
] as const;

const EXAMPLES = [
  {
    title: "Extracting Research Paper Citations & Abstracts",
    description: "Extract the abstract and references from pages 1 to 3 of an academic journal without copying unformatted line breaks.",
    sample: "research-paper.pdf (Pages 1–3) → 1,420 words extracted → exported to research-paper-extracted.txt",
  },
  {
    title: "Auditing Terms & Conditions in Legal Contracts",
    description: "Extract text from a vendor agreement to search for specific indemnification and liability clauses.",
    sample: "service-agreement.pdf (All 12 pages) → 8,650 words extracted → copied to clipboard",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select or Drop PDF File",
    stepDescription: "Drag and drop your PDF document into the upload dropzone or click to select from your device.",
  },
  {
    stepTitle: "Choose Page Range",
    stepDescription: "Choose 'All Pages' to parse the full document or select 'Custom Range' and enter comma-separated numbers and hyphens (e.g., 1-5, 8).",
  },
  {
    stepTitle: "Extract Selectable Text",
    stepDescription: "Click 'Extract Text' to process the document in memory with live progress feedback.",
  },
  {
    stepTitle: "Copy or Download",
    stepDescription: "Review the extracted text preview, check live word and character counters, and click 'Copy to Clipboard' or 'Download .txt File'.",
  },
] as const;

const FAQS = [
  {
    question: "Are my documents uploaded to a server to extract text?",
    answer:
      "No. All text parsing and font extraction are executed 100% locally in your web browser using HTML5 Web Workers and PDF.js. Your document data never leaves your device.",
  },
  {
    question: "Why did the tool tell me no selectable text was found?",
    answer:
      "Some PDFs are scanned documents composed of flat raster images (like photos or photocopies) rather than true font glyphs. Because this tool extracts native text streams directly without destructive cloud OCR, image-only scans require an OCR utility.",
  },
  {
    question: "Can I extract text from password-protected PDFs?",
    answer:
      "If the PDF is encrypted with an owner or user password, you must unlock or remove the password before extracting text, as client-side decryption without credentials is intentionally restricted.",
  },
  {
    question: "Is there a limit on the number of pages I can extract?",
    answer:
      "You can extract documents with hundreds of pages. For very long reports (300+ pages), we recommend extracting in ranges of 50 to 100 pages to avoid high browser RAM usage.",
  },
] as const;

export default function PdfTextExtractorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Text Extractor"
      description="Extract clean, selectable text from PDF documents with word counts, preview, and TXT file export."
      privacyNote="Processed 100% locally in your browser using PDF.js. Your document contents are never transmitted to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfTextExtractorTool />
    </ToolPageShell>
  );
}
