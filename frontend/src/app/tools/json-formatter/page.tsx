import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";

const TOOL_SLUG = "json-formatter";

export const metadata: Metadata = buildPageMetadata({
  title: "JSON Formatter & Validator — Prettify & Minify JSON Online",
  description:
    "Format, validate, and minify JSON documents directly in your browser. Choose 2-space or 4-space indentation, inspect syntax errors, upload .json files, and download clean JSON.",
  path: `/tools/${TOOL_SLUG}`,
});

const OVERVIEW =
  "The OneToolHub JSON Formatter & Validator helps software engineers, API developers, and data analysts inspect, prettify, and compact JSON payloads without sending sensitive configuration or API response data to an external server. Whether you are debugging a minified REST webhook, checking syntax before committing a configuration file, or preparing compact JSON for production headers, the tool parses and formats your data directly in browser memory.";

const FEATURES = [
  "2-space and 4-space indentation formatting for readable nested objects and arrays.",
  "One-click JSON minification to strip unnecessary whitespace and reduce payload byte size.",
  "Syntax validation powered by standard ECMAScript JSON.parse() with line and column error diagnostics.",
  "Local .json file upload (up to 2 MB) and one-click formatted .json file download.",
  "Live UTF-8 byte size measurement for both input and formatted output.",
  "Safe data handling that never executes scripts or evaluates arbitrary code.",
] as const;

const EXAMPLES = [
  {
    title: "Prettifying a Minified API Response",
    description:
      "Paste a single-line REST or GraphQL response and select 'Format (2 Spaces)' to inspect nested keys, arrays, and boolean flags.",
    sample: '{"status":200,"data":{"userId":42,"roles":["editor","admin"]}}',
  },
  {
    title: "Compacting Configuration Payloads",
    description:
      "Convert a multi-line JSON document into a single-line string using 'Minify' before embedding it in environment variables or HTTP test scripts.",
    sample: '{\n  "region": "eu-west-1",\n  "retries": 3\n}  →  {"region":"eu-west-1","retries":3}',
  },
] as const;

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
      privacyNote="Processed locally in your browser. Your JSON payload is not uploaded to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <JsonFormatterTool />
    </ToolPageShell>
  );
}
