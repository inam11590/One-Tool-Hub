import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { PasswordGeneratorTool } from "@/components/tools/PasswordGeneratorTool";

const TOOL_SLUG = "password-generator";

export const metadata: Metadata = buildPageMetadata({
  title: "Secure Password Generator — Strong Random Password Maker",
  description:
    "Generate strong, random, cryptographically secure passwords locally in your browser with custom lengths, symbols, numbers, and zero server storage.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "secure password generator",
    "random password maker",
    "strong password generator online",
    "client side password generator",
    "crypto secure random password",
  ],
});

const OVERVIEW =
  "The OneToolHub Secure Password Generator creates cryptographically secure passwords directly on your device using the browser's native Web Cryptography API (`crypto.getRandomValues()`). Designed for developers, freelancers, students, and IT professionals, this tool eliminates modulo bias, guarantees character diversity, and operates completely offline without ever transmitting credentials over the network.";

const FEATURES = [
  "Cryptographically secure randomness powered by browser-native crypto.getRandomValues().",
  "Customizable length from 8 to 128 characters with live entropy calculations.",
  "Flexible character sets: uppercase, lowercase, numbers, and symbols.",
  "Optional exclusion of ambiguous characters (such as I, l, 1, O, 0) for clear readability.",
  "100% client-side execution with zero logging, zero cookies, and zero server transmission.",
  "One-click copy to clipboard with instant confirmation.",
] as const;

const EXAMPLES = [
  {
    title: "16-Character High-Security Web Account",
    description:
      "Recommended standard for banking, email, and social accounts with all character classes enabled.",
    sample: "p9#Kz!8L$qR2v*Tx",
  },
  {
    title: "32-Character API & Database Secret",
    description:
      "Ideal for cloud environment variables, database passwords, and encryption keys.",
    sample: "mN4$wK9@pB!7zX#2vL&8qR*5tY^1cD~6",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select Password Length",
    stepDescription:
      "Adjust the slider between 8 and 128 characters. We recommend at least 16 characters for high-value services.",
  },
  {
    stepTitle: "Choose Character Sets",
    stepDescription:
      "Check or uncheck uppercase, lowercase, numbers, and symbols according to your target website's password policy.",
  },
  {
    stepTitle: "Copy or Regenerate",
    stepDescription:
      "Click 'Copy' to paste your new password into your password manager, or click 'Regenerate' to create another option.",
  },
] as const;

const FAQS = [
  {
    question: "Are generated passwords sent across the internet to OneToolHub?",
    answer:
      "No. All password generation uses window.crypto.getRandomValues() directly inside your browser. No passwords, lengths, or options are ever transmitted to any server.",
  },
  {
    question: "Why is crypto.getRandomValues() better than Math.random()?",
    answer:
      "Math.random() is a pseudo-random generator designed for speed, not security, and its output can be predicted. crypto.getRandomValues() is a cryptographically secure random number generator (CSPRNG) seeded by OS entropy.",
  },
  {
    question: "How long should my passwords be?",
    answer:
      "Security standards recommend at least 16 characters for typical online accounts and 24 to 32 characters for critical credentials like password managers or cloud server access.",
  },
  {
    question: "What are ambiguous characters?",
    answer:
      "Ambiguous characters are glyphs that look alike in many fonts, such as uppercase 'I', lowercase 'l', digit '1', uppercase 'O', and digit '0'. Excluding them prevents transcription mistakes.",
  },
] as const;

export default function PasswordGeneratorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Secure Password Generator"
      description="Generate strong, random, cryptographically secure passwords locally in your browser with custom lengths, symbols, numbers, and zero server storage."
      privacyNote="Processed 100% locally in your browser using crypto.getRandomValues(). Generated passwords are never saved, tracked, or sent across the network."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PasswordGeneratorTool />
    </ToolPageShell>
  );
}
