import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { TextCleanerTool } from "@/components/tools/TextCleanerTool";

const TOOL_SLUG = "text-cleaner";

export const metadata: Metadata = buildPageMetadata({
  title: "Text Cleaner & Formatter — Remove Spaces, Empty Lines & HTML Tags",
  description:
    "Clean and format messy text online. Strip duplicate whitespace, remove blank lines, deduplicate repeated rows, eliminate HTML tags, and convert tabs to spaces client-side.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "text cleaner online",
    "text formatter and normalizer",
    "remove extra spaces from text",
    "remove blank empty lines tool",
    "remove duplicate lines online",
    "strip html tags from text",
  ],
});

const OVERVIEW =
  "The OneToolHub Text Cleaner & Formatter solves the common frustration of dealing with malformed, poorly formatted text copied from PDFs, websites, legacy databases, or messy emails. With nine independent cleaning rules and one-click quick presets, you can eliminate unwanted line breaks, strip HTML markup, deduplicate lines, collapse excessive spaces, and normalize line endings in milliseconds.";

const FEATURES = [
  "Nine customizable formatting rules including whitespace collapsing, line trimming, blank line removal, and tab-to-space conversion.",
  "Duplicate line removal with optional case-insensitive deduplication.",
  "HTML tag stripper to sanitize rich web text into pure clean plaintext.",
  "Windows (CRLF) and Unix (LF) newline normalization.",
  "One-click cleaning presets for quick cleanup, email reformatting, list deduplication, and single-line flattening.",
  "Live reduction statistics tracking character, word, and line count savings.",
] as const;

const EXAMPLES = [
  {
    title: "Sanitizing Messy Web Copy with HTML",
    description:
      "Strip embedded spans, divs, and messy spacing when copying text from CMS interfaces or web articles.",
    sample: "Input: <p>Important  <b>announcement</b>   with   extra    spaces.</p>\nOutput: Important announcement with extra spaces.",
  },
  {
    title: "Cleaning and Deduplicating Email Lists",
    description:
      "Trim whitespace and remove redundant duplicated records from an exported list.",
    sample: "Input:  alice@example.com  \n\n bob@example.com \n alice@example.com \nOutput: alice@example.com\nbob@example.com",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Paste Raw Messy Text",
    stepDescription:
      "Paste your text into the 'Raw Messy Input' panel or click 'Sample' to see cleaning capabilities in action.",
  },
  {
    stepTitle: "Select Cleaning Rules or Presets",
    stepDescription:
      "Toggle individual rules (spaces, lines, HTML tags, duplicate lines) or choose a preset like 'All Common Cleanups' or 'Remove HTML & Format'.",
  },
  {
    stepTitle: "Inspect Live Cleaned Output",
    stepDescription:
      "View the formatted text in real time with line-by-line savings statistics and character reductions.",
  },
  {
    stepTitle: "Copy or Download Clean Text",
    stepDescription:
      "Click 'Copy Clean Text' to copy to clipboard or 'Download' to save the formatted result as a text file.",
  },
] as const;

const FAQS = [
  {
    question: "Does the HTML stripper preserve line breaks?",
    answer:
      "Yes. The HTML stripping engine replaces block-level tags like `<p>` and `<br>` with proper line breaks before removing all other formatting tags, ensuring your paragraphs remain structured.",
  },
  {
    question: "How does duplicate line removal work?",
    answer:
      "It compares lines sequentially and removes secondary occurrences of identical lines while preserving the original order of first appearance. You can also enable case-insensitive matching.",
  },
  {
    question: "Is any data uploaded to external servers?",
    answer:
      "No. All cleaning, regex matching, and text formatting algorithms execute entirely in your local browser tab. No text is ever transferred over the internet.",
  },
] as const;

export default function TextCleanerPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Text Cleaner & Formatter"
      description="Clean messy text by stripping extra spaces, removing empty lines, eliminating duplicate rows, and removing HTML tags instantly in your browser."
      privacyNote="All text cleaning operations run 100% locally on your machine. Your text is never sent to external servers."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <TextCleanerTool />
    </ToolPageShell>
  );
}
