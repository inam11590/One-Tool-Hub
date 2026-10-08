import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, SITE_CONFIG } from "@/lib/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";

const TOOL_SLUG = "json-formatter";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator — Prettify & Minify JSON Online",
  description:
    "Format, validate, and minify JSON documents directly in your browser. Choose 2-space or 4-space indentation, inspect syntax errors, upload .json files, and download clean JSON.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
  },
  openGraph: {
    title: `JSON Formatter & Validator | ${SITE_CONFIG.name}`,
    description:
      "Format, validate, and minify JSON documents directly in your browser with 2-space or 4-space indentation and syntax error reporting.",
    url: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
    type: "website",
  },
};

const INSTRUCTIONS = [
  {
    stepTitle: "Paste or Upload Your JSON",
    stepDescription:
      "Paste raw JSON text into the Input JSON editor or click 'Upload .json' to load a local file up to 2 MB.",
  },
  {
    stepTitle: "Choose Formatting or Minification",
    stepDescription:
      "Select 'Format (2 Spaces)', 'Format (4 Spaces)', or 'Minify' to validate syntax and transform the output.",
  },
  {
    stepTitle: "Review Syntax Diagnostics",
    stepDescription:
      "If your JSON has a missing comma, unclosed brace, or trailing quote, the error banner highlights the parser message and approximate line.",
  },
  {
    stepTitle: "Copy or Download",
    stepDescription:
      "Copy the formatted JSON to your clipboard in one click or download it as a clean .json file.",
  },
] as const;

const FAQS = [
  {
    question: "Is my JSON data sent to any external server?",
    answer:
      "No. All JSON parsing, validation, formatting, and minification happen locally inside your web browser using standard JavaScript JSON.parse and JSON.stringify APIs.",
  },
  {
    question: "Does this tool execute JavaScript inside my JSON?",
    answer:
      "Never. The tool strictly uses JSON.parse() and never calls eval() or executes code, ensuring untrusted payloads are handled safely as plain data.",
  },
  {
    question: "What is the maximum JSON size supported?",
    answer:
      "To keep your browser tab responsive and prevent memory freezes, the editor enforces a 2 MB UTF-8 size limit.",
  },
  {
    question: "What is the difference between 2-space, 4-space, and Minify?",
    answer:
      "2-space and 4-space indentation add human-readable line breaks and spacing, while Minify removes all non-essential whitespace to reduce payload byte size.",
  },
] as const;

export default function JsonFormatterPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="JSON Formatter & Validator"
      description="Prettify, validate, and minify JSON payloads with 2-space or 4-space indentation, byte size inspection, and syntax error reporting."
      privacyNote="100% client-side processing. Your JSON never leaves your browser."
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <JsonFormatterTool />
    </ToolPageShell>
  );
}
