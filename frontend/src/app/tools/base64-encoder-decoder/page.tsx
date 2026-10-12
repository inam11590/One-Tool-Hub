import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { Base64Tool } from "@/components/tools/Base64Tool";

const TOOL_SLUG = "base64-encoder-decoder";

export const metadata: Metadata = buildPageMetadata({
  title: "Base64 Encoder & Decoder — Encode and Decode UTF-8 Text Online",
  description:
    "Encode plain text to Base64 or decode Base64 strings to UTF-8 text with full Unicode and emoji support directly in your browser with zero server transmission.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "base64 encoder online",
    "base64 decoder online",
    "convert text to base64",
    "decode base64 to utf8 text",
    "unicode base64 tool",
  ],
});

const OVERVIEW =
  "The OneToolHub Base64 Encoder & Decoder provides developers, QA testers, and data engineers with a clean, client-side utility to convert arbitrary text to Base64 format and decode Base64 strings back into human-readable text. Powered by the standard browser Web Encoding APIs, it properly handles multi-byte Unicode characters, emojis, and symbols without character corruption.";

const FEATURES = [
  "Bidirectional encoding and decoding with one-click mode switching.",
  "Full UTF-8 Unicode and emoji support via standard browser TextEncoder and TextDecoder APIs.",
  "Quick swap button to reverse input and output immediately.",
  "Malformed Base64 string validation with clear character and padding diagnostic error messages.",
  "One-click copy to clipboard and text file (.txt) download.",
  "Strict local browser execution without server logging or external data transmission.",
] as const;

const EXAMPLES = [
  {
    title: "Encoding an API Authentication Header",
    description:
      "Convert a username and token pair into standard HTTP Basic Authorization header credentials.",
    sample: "username:secret_token_123  →  dXNlcm5hbWU6c2VjcmV0X3Rva2VuXzEyMw==",
  },
  {
    title: "Decoding an Embedded Data Payload",
    description:
      "Decode Base64 payloads found inside webhook callbacks, OAuth tokens, or configuration strings.",
    sample: "eyJ1c2VyIjoiYWxpY2UifQ==  →  {\"user\":\"alice\"}",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select Mode",
    stepDescription:
      "Choose 'Encode Text → Base64' or 'Decode Base64 → Text' using the top toggle.",
  },
  {
    stepTitle: "Input Your Text",
    stepDescription:
      "Type or paste your text into the left input editor. The tool automatically computes results in real time.",
  },
  {
    stepTitle: "Copy or Download",
    stepDescription:
      "Use 'Copy Output' to paste into your code editor or click 'Download (.txt)' to save the processed file.",
  },
] as const;

const FAQS = [
  {
    question: "Is Base64 a form of encryption?",
    answer:
      "No. Base64 is an encoding format designed to safely transmit binary data through text-only communication channels. Anyone can decode a Base64 string back into its original text.",
  },
  {
    question: "Does this encoder support international characters and emojis?",
    answer:
      "Yes. The tool uses modern browser TextEncoder and TextDecoder APIs, ensuring multi-byte Unicode glyphs, accents, and emojis are preserved without mojibake or corrupt byte sequences.",
  },
  {
    question: "Is my text sent to any server?",
    answer:
      "No. All encoding and decoding operations happen 100% locally on your computer inside the browser tab.",
  },
  {
    question: "Why do some Base64 strings end with '=' signs?",
    answer:
      "Base64 operates on 3-byte blocks. When the input length is not divisible by 3, one or two '=' characters are added as padding so decoders know the exact byte length.",
  },
] as const;

export default function Base64Page() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Base64 Encoder & Decoder"
      description="Encode plain text to Base64 or decode Base64 strings to UTF-8 text with full Unicode and emoji support directly in your browser with zero server transmission."
      privacyNote="Processed 100% locally in your browser using standard Web APIs. Your input text is never saved or sent over the internet."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <Base64Tool />
    </ToolPageShell>
  );
}
