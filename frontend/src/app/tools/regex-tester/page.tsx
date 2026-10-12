import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { RegexTesterTool } from "@/components/tools/RegexTesterTool";

const TOOL_SLUG = "regex-tester";

export const metadata: Metadata = buildPageMetadata({
  title: "Regex Tester & Debugger — Real-Time Regular Expression Evaluator",
  description:
    "Test, debug, and analyze regular expressions online in real time. Inspect match positions, capture groups, flags (g, i, m, s, u), and potential ReDoS backtracking locally in your browser.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "regex tester and debugger online",
    "regular expression tester javascript",
    "test regex capture groups online",
    "regex flags global multiline dotall",
    "redos regex backtrack safe tester",
  ],
});

const OVERVIEW =
  "The OneToolHub Regex Tester & Debugger gives software engineers, system administrators, and students an interactive, secure sandbox to write, test, and debug regular expressions. Powered by modern ECMAScript RegExp execution, it highlights matches in real time, lists numbered and named capture groups, calculates execution timing, and guards against infinite loops without sending any test text or patterns to an external server.";

const FEATURES = [
  "Real-time JavaScript regular expression pattern evaluation and syntax validation.",
  "Interactive text highlighting showing exact match boundaries and character ranges.",
  "Detailed match inspection table with start/end indices, length, and numbered or named capture groups.",
  "Configurable ECMAScript syntax flags: Global (g), Ignore Case (i), Multiline (m), DotAll (s), and Unicode (u).",
  "Zero-length progression guards to prevent browser lockups on patterns matching empty boundaries.",
  "Pre-configured regex library presets for emails, URLs, dates, IPv4 addresses, and hex colors.",
] as const;

const EXAMPLES = [
  {
    title: "Extracting ISO Date Components with Named Capture Groups",
    description:
      "Use named capture groups (?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2}) to parse structured dates directly into key-value pairs.",
    sample: "Pattern: (?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})\nText: Project launched on 2026-10-12.",
  },
  {
    title: "Validating Email Addresses",
    description:
      "Match standard email patterns across input text to verify form input logic or extract contact info.",
    sample: "Pattern: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\nText: Reach us at contact@onetoolhub.com.",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Enter Your Regular Expression",
    stepDescription:
      "Type your pattern in the pattern input bar between the delimiters. Toggle flags such as 'g' (global) or 'i' (ignore case) as needed.",
  },
  {
    stepTitle: "Supply Test Text",
    stepDescription:
      "Paste or type the text you want to evaluate into the 'Test String' box, or click a common preset to populate a sample.",
  },
  {
    stepTitle: "Inspect Matches and Capture Groups",
    stepDescription:
      "Review the highlighted visual overlay, match counts, execution time, and individual capture groups in the details table.",
  },
  {
    stepTitle: "Copy Regex or Matches",
    stepDescription:
      "Click 'Copy Regex' to export the pattern with flags, or click 'Copy All Matches' to extract the matched substrings.",
  },
] as const;

const FAQS = [
  {
    question: "Which regular expression engine does this tester use?",
    answer:
      "This tool executes using your browser's native JavaScript (ECMAScript) RegExp engine. While most core patterns are compatible across Python, PCRE, and Java, advanced features like lookbehinds or possessive quantifiers may behave differently in other languages.",
  },
  {
    question: "Is my test text or regex sent to any server?",
    answer:
      "No. All pattern compilation, text matching, and capture group extraction occur 100% client-side in your browser tab. No code or text is transmitted over the internet.",
  },
  {
    question: "How does the tool prevent browser freezes on complex expressions?",
    answer:
      "The engine enforces strict iteration caps (50,000 maximum iterations), limits test string sizes to 100 KB, advances indices on zero-length matches, and screens for obvious nested quantifier backtracking patterns.",
  },
] as const;

export default function RegexTesterPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Regex Tester & Debugger"
      description="Test and debug JavaScript regular expressions in real time with interactive match highlighting, capture group inspection, and ReDoS safety checks."
      privacyNote="All regular expressions and test strings are evaluated 100% locally in your browser tab. Your data is never sent to external servers."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <RegexTesterTool />
    </ToolPageShell>
  );
}
