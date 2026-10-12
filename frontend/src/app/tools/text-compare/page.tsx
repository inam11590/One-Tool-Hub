import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { TextCompareTool } from "@/components/tools/TextCompareTool";

const TOOL_SLUG = "text-compare";

export const metadata: Metadata = buildPageMetadata({
  title: "Text Compare & Difference Checker — Compare Two Texts Online",
  description:
    "Compare two texts side-by-side or inline to find additions, deletions, and word-level modifications. Fast, private, and 100% in-browser text difference checker for documents and essays.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "text compare online free",
    "text difference checker",
    "compare two texts side by side",
    "diff checker for prose and essays",
    "word level difference finder",
    "document comparison tool online",
  ],
});

const OVERVIEW =
  "The OneToolHub Text Compare & Difference Checker is built for writers, editors, legal professionals, and students who need to identify differences between revisions of essays, contracts, articles, or notes. Unlike software code diff engines, this utility provides granular word-level and line-level prose comparison with color-coded additions and deletions, case and whitespace normalization toggles, and instant summary metrics.";

const FEATURES = [
  "Dual comparison granularity: Word-level diffing for prose and sentence revisions, and line-level diffing for structured paragraphs.",
  "Side-by-side split view and unified inline view for flexible editorial review.",
  "Optional case-insensitive and whitespace-trimming comparison modes.",
  "Real-time change metrics calculating added words, removed words, unchanged segments, and overall similarity percentage.",
  "Quick Swap Texts button to easily flip comparison orientation between original and revised drafts.",
  "Detailed comparison report export (.txt) and instant clipboard copying.",
] as const;

const EXAMPLES = [
  {
    title: "Editorial Manuscript Revisions",
    description:
      "Detect subtle phrasing tweaks, removed adjectives, and added references between author drafts.",
    sample: "Original: The initial experiment yielded promising outcomes in clinical trials.\nModified: The initial study demonstrated statistically significant outcomes across three global trials.",
  },
  {
    title: "Legal Contract Clause Revisions",
    description:
      "Verify that indemnity clauses or payment timeline terms have not been subtly modified prior to countersigning.",
    sample: "Original: Payment terms net 30 days upon invoice receipt.\nModified: Payment terms net 45 calendar days upon verified invoice submission.",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Paste Original Draft",
    stepDescription:
      "Paste your base document or earlier version into the 'Original Text' panel on the left.",
  },
  {
    stepTitle: "Paste Modified Version",
    stepDescription:
      "Paste your edited, reviewed, or rewritten draft into the 'Modified Text' panel on the right.",
  },
  {
    stepTitle: "Adjust Comparison Granularity",
    stepDescription:
      "Toggle between 'Words' (ideal for essays and articles) and 'Lines' (ideal for lists and logs). Choose Split or Inline view.",
  },
  {
    stepTitle: "Inspect and Export",
    stepDescription:
      "Review color-coded additions (green) and removals (red). Download a comprehensive text diff report or copy the results directly.",
  },
] as const;

const FAQS = [
  {
    question: "How is Text Compare different from the Code Diff Checker?",
    answer:
      "While the Code Diff Checker is optimized for programming syntax, indentation, and unified patch files, Text Compare is tailored for prose, essays, articles, and documents with word-level highlight granularity and editorial similarity metrics.",
  },
  {
    question: "Are my confidential documents uploaded to a cloud server?",
    answer:
      "Never. All difference computation occurs entirely on your device using client-side JavaScript. No document content is ever sent over the network or saved externally.",
  },
  {
    question: "Can I ignore capitalization or extra spacing differences?",
    answer:
      "Yes. You can enable 'Ignore Case' to treat uppercase and lowercase words as identical, or enable 'Ignore Extra Whitespace' to eliminate noise caused by trailing spaces or line breaks.",
  },
] as const;

export default function TextComparePage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Text Compare & Difference Checker"
      description="Compare two text revisions side-by-side or inline to spot word additions, deletions, and edits with high-contrast visual highlighting."
      privacyNote="All document diff calculations happen locally in your web browser. No document text is ever transmitted or stored."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <TextCompareTool />
    </ToolPageShell>
  );
}
