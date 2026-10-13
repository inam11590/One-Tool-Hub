import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";
import { ToolPageShell } from "@/components/tools/ToolPageShell";

const PdfPageRotatorTool = dynamic(
  () =>
    import("@/components/tools/PdfPageRotatorTool").then(
      (mod) => mod.PdfPageRotatorTool
    ),
  {
    loading: () => (
      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Loading PDF Page Rotator...</p>
      </div>
    ),
  }
);

const TOOL_SLUG = "pdf-page-rotator";

export const metadata: Metadata = buildPageMetadata({
  title: "PDF Page Rotator — Rotate PDF Pages Online (90°, 180°, 270°)",
  description:
    "Rotate individual PDF pages or entire documents clockwise (+90°), counter-clockwise (-90°), or upside down (180°) directly in your browser. Download lossless rotated PDFs instantly.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "rotate pdf pages",
    "pdf rotator online",
    "rotate pdf 90 degrees",
    "fix upside down pdf",
    "turn pdf sideways",
    "bulk rotate pdf",
    "free pdf page rotator",
    "lossless pdf rotation",
  ],
});

const OVERVIEW =
  "The OneToolHub PDF Page Rotator gives you full granular control over the orientation of your PDF documents. Whether you scanned a contract upside down, received architectural drawings in landscape orientation, or need to correct mixed-orientation presentations, you can rotate individual pages or the entire document in increments of 90 degrees. All modifications are made directly to the internal PDF dictionary objects without re-compressing images or degrading vector sharpness.";

const FEATURES = [
  "True lossless rotation: updates internal PDF viewport transformation matrices without rasterizing or recompressing pages.",
  "Flexible rotation controls: rotate by +90° (clockwise), -90° (counter-clockwise), or 180° (upside down).",
  "Visual page orientation previews: see the live angle of every page before saving.",
  "Bulk rotation shortcuts: rotate all pages at once or target individual selected pages.",
  "Preserves all fonts, vectors, links, form fields, and embedded annotations.",
  "100% private and in-browser: zero external server uploads or data retention.",
] as const;

const EXAMPLES = [
  {
    title: "Correcting Inverted Scanner Output",
    description: "Rotate all pages of an upside-down invoice scan by 180° to restore readable orientation.",
    sample: "invoice-scan.pdf (Pages 1–4 at 180°) → Rotate 180° → invoice-scan-rotated.pdf (right side up)",
  },
  {
    title: "Aligning Landscape Blueprint Sheets in a Mixed Document",
    description: "Rotate only pages 3 and 7 by 90° clockwise so landscape schematics match the rest of the report.",
    sample: "construction-report.pdf (Pages 3, 7) → Rotate +90° → construction-report-rotated.pdf",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Upload Your PDF",
    stepDescription: "Drag and drop your PDF file into the dropzone or choose it from your local files.",
  },
  {
    stepTitle: "Choose Pages to Rotate",
    stepDescription: "Click specific page cards to select target pages, or keep all pages selected for document-wide rotation.",
  },
  {
    stepTitle: "Apply Rotation Angle",
    stepDescription: "Click '+90° (Clockwise)', '-90° (Counter-clockwise)', or '180° (Flip)' to orient your pages properly.",
  },
  {
    stepTitle: "Download Rotated PDF",
    stepDescription: "Click 'Download Rotated PDF' to save your updated, high-fidelity PDF immediately with zero waiting.",
  },
] as const;

const FAQS = [
  {
    question: "Does rotating PDF pages degrade document visual quality?",
    answer:
      "No. Unlike converting to images, PDF page rotation simply updates the standard /Rotate metadata entry on the page object in the PDF catalog. Fonts, vector paths, and images remain 100% untouched and sharp.",
  },
  {
    question: "Can I rotate only a single page while keeping the rest unchanged?",
    answer:
      "Yes. You can select any single page card and apply rotation to just that page while preserving the original angles of all other pages in the document.",
  },
  {
    question: "Are my confidential files uploaded to any third-party server?",
    answer:
      "Never. All rotation and binary export are executed purely client-side inside your browser memory using pdf-lib. Your files never touch our servers.",
  },
  {
    question: "What rotation angles are supported?",
    answer:
      "PDF standards specify page rotation in 90-degree multiples: 0°, 90°, 180°, and 270°. You can rotate incrementally in either direction or reset to 0° at any time.",
  },
] as const;

export default function PdfPageRotatorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="PDF Page Rotator"
      description="Rotate individual PDF pages or entire documents clockwise (+90°), counter-clockwise (-90°), or 180° upside down."
      privacyNote="Processed 100% locally in your browser using pdf-lib. Your documents are never uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PdfPageRotatorTool />
    </ToolPageShell>
  );
}
