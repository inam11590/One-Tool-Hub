import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { LoremIpsumGeneratorTool } from "@/components/tools/LoremIpsumGeneratorTool";

const TOOL_SLUG = "lorem-ipsum-generator";

export const metadata: Metadata = buildPageMetadata({
  title: "Lorem Ipsum & Placeholder Text Generator — Mock Dummy Text Tool",
  description:
    "Generate customizable Lorem Ipsum placeholder dummy text by paragraphs, sentences, or words. Choose classic Latin Cicero vocabulary or mock English prototype text with HTML tag wrapping.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "lorem ipsum generator online",
    "placeholder dummy text generator",
    "generate lorem ipsum paragraphs",
    "mock text generator for designers",
    "lorem ipsum with html tags",
    "dummy text generator english latin",
  ],
});

const OVERVIEW =
  "The OneToolHub Lorem Ipsum & Placeholder Text Generator is designed for UI/UX designers, web developers, copywriters, and typesetters who need dummy text for layouts, prototypes, wireframes, and design presentations. It features both classical Latin Cicero vocabulary and readable modern mock English, with custom quantities, HTML `<p>` tag wrapping, and instant clipboard copying.";

const FEATURES = [
  "Custom generation by paragraphs (up to 20), sentences (up to 50), or words (up to 500).",
  "Dual vocabulary flavors: Classic Latin (Cicero's de Finibus Bonorum et Malorum) and Modern Mock English prototype phrasing.",
  "Optional standard 'Lorem ipsum dolor sit amet...' prefix toggle.",
  "Optional HTML `<p>` paragraph tag formatting for rapid CMS and code integration.",
  "Quick one-click presets for teasers, standard articles, excerpts, and headers.",
  "Live character, word, and paragraph statistics with one-click copy and text/HTML download.",
] as const;

const EXAMPLES = [
  {
    title: "Classic Latin Dummy Paragraph",
    description:
      "Standard Cicero-derived dummy text perfect for typography and layout balancing.",
    sample: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "HTML-Wrapped Paragraph for Web Mockup",
    description:
      "Directly embeddable HTML markup ready to paste into web templates.",
    sample: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...</p>\n\n<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur...</p>",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select Unit Mode",
    stepDescription:
      "Choose whether to generate dummy text by Paragraphs, Sentences, or Words.",
  },
  {
    stepTitle: "Choose Quantity & Flavor",
    stepDescription:
      "Use the slider to pick your desired count. Toggle between Classic Latin and Mock English.",
  },
  {
    stepTitle: "Customize Formatting Options",
    stepDescription:
      "Enable or disable the standard 'Lorem ipsum...' opening prefix, or toggle `<p>` HTML tags if embedding in code.",
  },
  {
    stepTitle: "Copy or Download Text",
    stepDescription:
      "Click 'Copy Text' to copy to clipboard, or click 'Download' to save the output as a `.txt` or `.html` file.",
  },
] as const;

const FAQS = [
  {
    question: "What is the origin of Lorem Ipsum text?",
    answer:
      "Lorem Ipsum originates from sections 1.10.32 and 1.10.33 of Cicero's 'de Finibus Bonorum et Malorum' (On the Extremes of Good and Evil), written in 45 BC. It has been used as the typesetting industry's standard dummy text since the 1500s.",
  },
  {
    question: "Why use Mock English instead of Latin?",
    answer:
      "While Latin prevents readers from being distracted by content when focusing on design layouts, Mock English helps assess natural word length distributions and readability flow in English-focused UI/UX prototypes.",
  },
  {
    question: "Is internet access required to generate text?",
    answer:
      "No. All placeholder text is generated 100% locally in your browser using local dictionaries and random seed algorithms. It works seamlessly offline with zero latency.",
  },
] as const;

export default function LoremIpsumGeneratorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Lorem Ipsum & Placeholder Text Generator"
      description="Generate custom dummy text by paragraphs, sentences, or words with classic Latin Cicero or mock English vocabulary and HTML tag support."
      privacyNote="All placeholder generation occurs 100% locally in your browser tab. No requests are made to external servers."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <LoremIpsumGeneratorTool />
    </ToolPageShell>
  );
}
