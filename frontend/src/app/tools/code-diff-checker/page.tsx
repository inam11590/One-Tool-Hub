import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { CodeDiffCheckerTool } from "@/components/tools/CodeDiffCheckerTool";

const TOOL_SLUG = "code-diff-checker";

export const metadata: Metadata = buildPageMetadata({
  title: "Code Diff Checker — Compare Text & Code Differences Online",
  description:
    "Compare two code or text snippets side-by-side or unified online. Highlight added, removed, and modified lines, inspect line numbers, and export standard .patch files locally.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "code diff checker online",
    "text diff comparison side by side",
    "unified diff viewer online",
    "git patch generator online",
    "compare two files online private",
  ],
});

const OVERVIEW =
  "The OneToolHub Code Diff Checker allows developers, writers, and students to compare source code files, configuration files, and text documents without exposing sensitive code to third-party cloud servers. Featuring side-by-side split and unified single-column views, change statistics, file upload support, and standard .patch file generation, it provides an intuitive local comparison workflow.";

const FEATURES = [
  "Side-by-side split comparison and unified inline diff viewing modes.",
  "Clear visual highlighting for added lines (green) and removed lines (red) with line numbers.",
  "Options to ignore whitespace differences and case-insensitive comparison.",
  "Change statistics tracking additions, deletions, and total modified lines.",
  "Local file upload for both original and modified inputs (code, JSON, text, markdown).",
  "One-click input swap and export to standard unified diff (.patch) files.",
] as const;

const EXAMPLES = [
  {
    title: "Comparing Git Refactorings",
    description:
      "Paste your previous function implementation alongside the refactored version to verify logic changes before staging a commit.",
    sample: "Original: for (let i = 0; i < items.length; i++) { ... }\nModified: const total = items.reduce((sum, item) => sum + item.price, 0);",
  },
  {
    title: "Checking Configuration Drift",
    description:
      "Compare staging and production environment variables or configuration JSON to spot missing flags or misconfigured ports.",
    sample: "Original: PORT=3000\\nDEBUG=true\\nModified: PORT=8080\\nDEBUG=false",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Supply Original and Modified Content",
    stepDescription:
      "Paste your text directly into the 'Original' and 'Modified' editors, or click 'Upload File' to load local documents.",
  },
  {
    stepTitle: "Select Comparison Settings",
    stepDescription:
      "Switch between 'Side-by-Side' and 'Unified' view, and toggle 'Ignore Whitespace' or 'Ignore Case' to filter out cosmetic changes.",
  },
  {
    stepTitle: "Review Differences and Statistics",
    stepDescription:
      "Inspect the added (+) and removed (-) line count statistics and review highlighted changes in the interactive diff table.",
  },
  {
    stepTitle: "Copy or Download Changes",
    stepDescription:
      "Click 'Copy Patch' to copy standard unified diff text, or click 'Download .patch' to save a Git-compatible patch file.",
  },
] as const;

const FAQS = [
  {
    question: "How does the comparison algorithm detect changes?",
    answer:
      "The tool uses the Myers difference algorithm (via the standard diff package) to compute the shortest edit script between lines of text, ensuring accurate addition and deletion detection.",
  },
  {
    question: "Can I compare proprietary code without confidentiality risks?",
    answer:
      "Yes. The diff algorithm executes entirely inside your browser tab using client-side JavaScript. No source code or comparison output is sent over the network.",
  },
  {
    question: "Can the exported .patch file be applied using Git?",
    answer:
      "Yes. The downloaded file is formatted in standard two-file unified diff syntax compatible with the 'git apply changes.patch' command.",
  },
] as const;

export default function CodeDiffCheckerPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Code Diff Checker"
      description="Compare two code snippets, text files, or configuration files side-by-side or unified online with syntax highlighting, whitespace filters, and .patch export."
      privacyNote="All code and text comparisons execute 100% locally in your browser. Your confidential files, code snippets, and diffs are never uploaded to any remote server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <CodeDiffCheckerTool />
    </ToolPageShell>
  );
}
