import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { TextCaseConverterTool } from "@/components/tools/TextCaseConverterTool";

const TOOL_SLUG = "text-case-converter";

export const metadata: Metadata = buildPageMetadata({
  title: "Text Case Converter — Convert to Title Case, Uppercase, Lowercase & More",
  description:
    "Convert text between Title Case (AP/Chicago style), UPPERCASE, lowercase, Sentence case, camelCase, snake_case, and kebab-case instantly in your browser with live character and word counts.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "text case converter online",
    "title case converter ap chicago style",
    "uppercase lowercase converter tool",
    "sentence case generator",
    "camelcase snake case converter",
    "convert text case free client-side",
  ],
});

const OVERVIEW =
  "The OneToolHub Text Case Converter enables writers, students, publishers, and software engineers to instantly transform text capitalization across ten standard formats. Whether formatting academic article headlines with AP or Chicago style rules, preparing code identifiers in camelCase or snake_case, or fixing accidentally capitalized sentences, the entire transformation happens locally in your browser with zero latency.";

const FEATURES = [
  "Instant conversion across 10 capitalization styles: Title Case, Sentence case, UPPERCASE, lowercase, Capitalize Words, tOGGLE cASE, camelCase, kebab-case, snake_case, and CONSTANT_CASE.",
  "Editorial Title Case engine recognizing AP and Chicago style grammar rules for minor prepositions, conjunctions, and articles.",
  "Preserves punctuation and paragraph structure while correcting case formatting.",
  "Live document statistics reporting total characters, character count excluding whitespace, words, sentences, and paragraphs.",
  "Quick one-click sample loader for testing editorial and technical conversions.",
  "One-click copy to clipboard with visual verification and text file export.",
] as const;

const EXAMPLES = [
  {
    title: "Editorial Headline in Title Case",
    description:
      "Automatically keep short conjunctions and prepositions lowercase while capitalizing major words according to AP style.",
    sample: "Input: THE OLD MAN AND THE SEA BY ERNEST HEMINGWAY\nOutput: The Old Man and the Sea by Ernest Hemingway",
  },
  {
    title: "Variable Formatting for Developers",
    description:
      "Transform human-readable feature titles directly into programming identifiers.",
    sample: "Input: User authentication session timeout\nOutput: userAuthenticationSessionTimeout (camelCase) / USER_AUTHENTICATION_SESSION_TIMEOUT (CONSTANT_CASE)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Paste or Type Your Text",
    stepDescription:
      "Enter your text into the main input box or click 'Sample' to quickly test standard capitalization styles.",
  },
  {
    stepTitle: "Select Your Target Case",
    stepDescription:
      "Click any of the ten case transformation buttons (e.g., Title Case, Sentence case, camelCase) to preview the conversion instantly.",
  },
  {
    stepTitle: "Review Statistics and Preview",
    stepDescription:
      "Examine character, word, sentence, and paragraph counts in the real-time statistics ribbon.",
  },
  {
    stepTitle: "Copy or Download Converted Text",
    stepDescription:
      "Click 'Copy' to copy the formatted text directly to your clipboard, or click 'Download' to save it as a text file.",
  },
] as const;

const FAQS = [
  {
    question: "Does Title Case follow editorial guidelines like AP or Chicago style?",
    answer:
      "Yes. Our title case algorithm capitalizes the first and last words of sentences and titles, while keeping short conjunctions, prepositions, and articles (such as 'and', 'the', 'in', 'of', 'for', 'with', 'to') in lowercase unless they appear at the very start.",
  },
  {
    question: "Is my text uploaded or stored on any server?",
    answer:
      "No. All string manipulation and case transformations occur strictly inside your web browser. No document contents are sent across the internet, ensuring complete privacy.",
  },
  {
    question: "Can I convert text into developer code identifiers?",
    answer:
      "Yes. The tool includes camelCase, snake_case, kebab-case, and CONSTANT_CASE buttons specifically designed for programmers formatting variable names, database columns, and URL slugs.",
  },
] as const;

export default function TextCaseConverterPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Text Case Converter"
      description="Convert text between Title Case, UPPERCASE, lowercase, Sentence case, camelCase, snake_case, and more with instant browser preview and live statistics."
      privacyNote="All text case transformations run 100% locally in your browser. Your text never leaves your device."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <TextCaseConverterTool />
    </ToolPageShell>
  );
}
