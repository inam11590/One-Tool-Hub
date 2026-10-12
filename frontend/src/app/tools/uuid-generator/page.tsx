import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { UuidGeneratorTool } from "@/components/tools/UuidGeneratorTool";

const TOOL_SLUG = "uuid-generator";

export const metadata: Metadata = buildPageMetadata({
  title: "UUID Generator & Validator — Secure RFC 9562 UUID v4 Online",
  description:
    "Generate cryptographically secure RFC 9562 UUID v4 identifiers in bulk and validate existing UUID strings with version detection. Fast, private, and 100% client-side.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "uuid generator and validator online",
    "uuid v4 generator bulk online",
    "validate uuid version rfc 9562",
    "guid generator online free",
    "cryptographically secure random uuid",
  ],
});

const OVERVIEW =
  "The OneToolHub UUID Generator & Validator is a dedicated developer utility for creating standards-compliant Universally Unique Identifiers (UUID / GUID) and validating existing identifier strings. Built on Web Crypto primitives (crypto.randomUUID() and crypto.getRandomValues()), it generates RFC 9562 / RFC 4122 compliant version 4 UUIDs without any pseudo-random Math.random() vulnerabilities, completely in your browser.";

const FEATURES = [
  "Cryptographically secure UUID v4 generation using native Web Crypto APIs.",
  "Bulk generation up to 1,000 UUIDs with instant download as text (.txt) files.",
  "Customizable formatting: Uppercase vs. Lowercase, Hyphenated vs. Compact, and Braced {UUID}.",
  "Comprehensive UUID Validator detecting RFC variants and versions (v1 through v5, and nil).",
  "One-click copying for individual UUIDs or the entire generated batch.",
  "Zero server transmission: generated identifiers remain strictly in browser tab memory.",
] as const;

const EXAMPLES = [
  {
    title: "Generating Database Primary Keys",
    description:
      "Generate batches of standard hyphenated UUID v4 strings for seeding database tables or mocking microservice payloads.",
    sample: "Quantity: 3 →\n8f9b4c2e-7a1d-4e9b-9c3f-1a2b3c4d5e6f\n3d2e1f0a-9b8c-4d7e-8f1a-2b3c4d5e6f7a\n1a2b3c4d-5e6f-4a1b-9c2d-3e4f5a6b7c8d",
  },
  {
    title: "Validating Received Request Identifiers",
    description:
      "Paste an incoming correlation ID or database string to verify that it conforms to standard RFC 4122 / RFC 9562 structure.",
    sample: "Candidate: f47ac10b-58cc-4372-a567-0e02b2c3d479 → Valid UUID v4 (RFC 4122 / RFC 9562)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Choose Batch Size and Formatting",
    stepDescription:
      "Enter the desired quantity (1 to 1,000) and configure formatting options such as uppercase characters, hyphens, or braces.",
  },
  {
    stepTitle: "Generate Identifiers",
    stepDescription:
      "Click 'Regenerate UUIDs' to produce a new batch of cryptographically random version 4 UUIDs instantly.",
  },
  {
    stepTitle: "Copy or Download",
    stepDescription:
      "Copy individual identifiers with the inline 'Copy' button, or export the entire list using 'Copy All' or 'Download .txt'.",
  },
  {
    stepTitle: "Validate Existing UUIDs",
    stepDescription:
      "Scroll to the UUID Validator card, enter any string, and inspect the detected UUID version, RFC variant, and structure.",
  },
] as const;

const FAQS = [
  {
    question: "How are UUID v4 identifiers generated in this tool?",
    answer:
      "The tool uses the browser's native crypto.randomUUID() or crypto.getRandomValues() cryptographic entropy source, strictly masking version bits (0100) and RFC 4122 variant bits (10xx). Math.random() is never used.",
  },
  {
    question: "Can two generated UUID v4 identifiers ever collide?",
    answer:
      "With 122 bits of true cryptographic entropy, the probability of generating a duplicate UUID v4 is approximately 1 in 5.3 x 10^36. For practical purposes across planetary scale systems, collisions are virtually impossible.",
  },
  {
    question: "Should UUIDs be used as secret authentication tokens?",
    answer:
      "No. While UUID v4 is random and suitable for unique resource identification, public UUIDs should not replace cryptographically signed session tokens (like JWTs or API keys) for user authentication.",
  },
] as const;

export default function UuidGeneratorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="UUID Generator & Validator"
      description="Generate cryptographically secure RFC 9562/4122 UUID v4 identifiers in bulk and validate existing UUID strings with instant version detection."
      privacyNote="All UUIDs are generated locally using your browser's cryptographically secure Web Crypto API. Identifiers are never logged, tracked, or sent to external servers."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <UuidGeneratorTool />
    </ToolPageShell>
  );
}
