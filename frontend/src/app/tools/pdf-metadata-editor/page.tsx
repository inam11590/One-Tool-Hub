import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const PdfMetadataEditorTool = dynamic(
  () =>
    import("@/components/tools/PdfMetadataEditorTool").then(
      (mod) => mod.PdfMetadataEditorTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading PDF Metadata Editor...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "pdf-metadata-editor";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Metadata Viewer & Editor — View, Edit, or Strip PDF Metadata Online",
  description:
    "View and edit Title, Author, Subject, Keywords, Creator, and Producer metadata in PDF files directly in your browser. Wipe hidden personal metadata for privacy with 1 click.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "pdf metadata editor",
    "view pdf metadata",
    "edit pdf author",
    "remove pdf metadata",
    "strip pdf metadata",
    "clean pdf metadata",
    "change pdf title",
    "free pdf metadata viewer",
  ],
});

const OVERVIEW =
  "Every PDF document contains internal document metadata dictionaries that frequently store sensitive information: author names, corporate usernames, computer hostnames, word processor versions, and exact modification timestamps. The OneToolHub PDF Metadata Viewer & Editor enables you to inspect these hidden properties, update fields like Title and Subject for search discoverability, or completely wipe all metadata with a single click before sharing sensitive files externally.";

const FEATURES = [
  "Inspect full PDF Info dictionary properties including Title, Author, Subject, Keywords, Creator, Producer, and Timestamps.",
  "Edit individual metadata fields to enhance digital document cataloging and archival compliance.",
  "1-Click 'Clear All Metadata' privacy wipe to sanitize sensitive author names and creation dates.",
  "Transparent privacy boundary notice explaining document catalog Info dictionary vs stream annotations.",
  "Maintains complete document content integrity: pages, vector artwork, fonts, and text remain untouched.",
  "100% private and in-browser: zero server uploads or external telemetry.",
] as const;

const EXAMPLES = [
  {
    title: "Sanitizing Client Legal Proposals Before Submission",
    description: "Remove the internal author username, word processor version, and computer network path before sending a RFP response.",
    sample: "rfp-proposal.pdf (Author: JohnDoe_MacBook_Pro) → Clear All Metadata → rfp-proposal-cleaned.pdf (All fields empty)",
  },
  {
    title: "Standardizing Title & Keywords for Academic Publishing",
    description: "Add a clean publication title, subject summary, and comma-separated index terms to an accepted conference paper.",
    sample: "manuscript.pdf → Set Title: 'Advances in Graph Networks', Keywords: 'ai, machine-learning, graphs' → manuscript-updated.pdf",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Your PDF Document",
    stepDescription: "Drag and drop your PDF into the upload zone or browse from your device.",
  },
  {
    stepTitle: "Inspect Existing Metadata",
    stepDescription: "Review current properties including Title, Author, Subject, Keywords, Creator, Producer, and Creation/Modification timestamps.",
  },
  {
    stepTitle: "Modify or Wipe Fields",
    stepDescription: "Type new values into any field, or click 'Clear All Metadata' to immediately erase all personal identifiers.",
  },
  {
    stepTitle: "Save Updated PDF",
    stepDescription: "Click 'Save & Download PDF' to export the sanitized document directly from your browser memory.",
  },
] as const;

const FAQS = [
  {
    question: "What information is typically stored in PDF metadata?",
    answer:
      "PDFs often store the full name or operating system username of the author, the exact software used to create the document (e.g. Word, Acrobat, InDesign), the computer printer driver, and timestamps detailing when the file was initially compiled.",
  },
  {
    question: "Does clearing metadata affect the text or images in the PDF?",
    answer:
      "No. Clearing metadata only updates the /Info dictionary and document catalog header. The body text, images, fonts, and layouts remain completely unchanged.",
  },
  {
    question: "Does this tool strip hidden XMP metadata streams as well?",
    answer:
      "This tool sanitizes the standard PDF Info dictionary entries (Title, Author, Subject, Keywords, Creator, Producer, and modification dates). Embedded page annotations, forms, and secondary XMP XML streams inside embedded raster objects are not rewritten.",
  },
  {
    question: "Are my files uploaded to your servers to inspect metadata?",
    answer:
      "No. All parsing and binary modification occur 100% locally in your browser RAM using pdf-lib. Your confidential files never leave your device.",
  },
] as const;

export default function PdfMetadataEditorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Metadata Viewer & Editor"
      description="Inspect, edit, or wipe PDF document metadata including Title, Author, Subject, Keywords, and Creator directly in browser."
      privacyNote="Processed 100% locally in your browser using pdf-lib. Your document contents and metadata never leave your computer."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfMetadataEditorTool />
    </ToolPageShell>
  );
}
