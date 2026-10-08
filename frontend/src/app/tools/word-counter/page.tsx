import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { WordCounterTool } from "@/components/tools/WordCounterTool";

const TOOL_SLUG = "word-counter";

export const metadata: Metadata = buildPageMetadata({
  title: "Word Counter — Count Words, Characters, Sentences & Reading Time",
  description:
    "Free real-time online word and character counter for students, writers, and creators. Count words, characters with and without spaces, sentences, paragraphs, and reading time.",
  path: `/tools/${TOOL_SLUG}`,
});

const OVERVIEW =
  "The OneToolHub Word Counter gives students, journalists, copywriters, and video scriptwriters real-time text statistics as they type or paste drafts. It measures total words, characters with and without spaces, sentences, paragraphs, and estimated reading time using modern Unicode segmentation right in the browser.";

const FEATURES = [
  "Real-time counting of words, total characters, and characters excluding whitespace.",
  "Sentence and paragraph detection for essay, article, and script structure analysis.",
  "Estimated silent reading time based on 200 words per minute (with second-level precision for short scripts).",
  "Unicode-aware word and sentence segmentation via ECMAScript Intl.Segmenter where supported.",
  "One-click clipboard copy and plain-text (.txt) file export.",
  "Instant sample loading and reset controls for rapid drafting.",
] as const;

const EXAMPLES = [
  {
    title: "Checking University Essay & Abstract Limits",
    description:
      "Paste your academic abstract or admissions essay to verify it stays within a strict 250-word or 500-word submission cap.",
  },
  {
    title: "Timing a YouTube Intro or Social Post",
    description:
      "Check both character count (for meta descriptions or social posts) and estimated reading time for spoken or silent scripts.",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Type or Paste Your Text",
    stepDescription:
      "Enter your essay, article, social post, or video script into the main editor.",
  },
  {
    stepTitle: "Monitor Live Metrics",
    stepDescription:
      "View instant updates for Words, Characters (with and without spaces), Sentences, Paragraphs, and Estimated Reading Time.",
  },
  {
    stepTitle: "Copy or Export as .txt",
    stepDescription:
      "Use 'Copy Text' to copy your edited draft to the clipboard, or click 'Download .txt' to save a local plain-text copy.",
  },
  {
    stepTitle: "Clear When Finished",
    stepDescription:
      "Click 'Clear Text' to reset the editor and zero out all counters immediately.",
  },
] as const;

const FAQS = [
  {
    question: "How is reading time calculated?",
    answer:
      "Reading time is estimated using an average silent reading speed of 200 words per minute. Short passages under one minute display the estimated time in seconds.",
  },
  {
    question: "How does the tool handle international languages and Unicode?",
    answer:
      "Where supported by your browser, the counter uses the standard ECMAScript Intl.Segmenter API for word and sentence segmentation, falling back to Unicode-aware regular expressions. Because languages without spaces between words (like Chinese, Japanese, or Thai) segment by algorithmic rules, counts should be treated as estimates.",
  },
  {
    question: "How are paragraphs counted?",
    answer:
      "Paragraphs are counted by splitting non-empty blocks of text separated by one or more blank lines.",
  },
  {
    question: "Is my text saved or sent over the network?",
    answer:
      "No. Your text remains strictly in your browser memory while you use the page and is never transmitted to any server.",
  },
] as const;

export default function WordCounterPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Word Counter"
      description="Count words, characters (with and without spaces), sentences, paragraphs, and estimated reading time in real time."
      privacyNote="Your writing is analyzed locally in your browser with no network requests."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <WordCounterTool />
    </ToolPageShell>
  );
}
