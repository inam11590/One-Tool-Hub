import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, SITE_CONFIG } from "@/lib/tools";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { YouTubeTimestampTool } from "@/components/tools/YouTubeTimestampTool";

const TOOL_SLUG = "youtube-timestamp-formatter";

export const metadata: Metadata = {
  title: "YouTube Timestamp Formatter — Validate & Format Video Chapters",
  description:
    "Format, normalize, and validate YouTube chapter timestamps online. Check for 00:00 start, minimum 3 chapters, 10-second duration, duplicates, and chronological order.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
  },
  openGraph: {
    title: `YouTube Timestamp Formatter | ${SITE_CONFIG.name}`,
    description:
      "Format, normalize, and validate YouTube chapter timestamps ready to paste into your video description.",
    url: `${SITE_CONFIG.url}/tools/${TOOL_SLUG}`,
    type: "website",
  },
};

const INSTRUCTIONS = [
  {
    stepTitle: "Paste Your Raw Chapter List",
    stepDescription:
      "Paste lines containing timestamps in MM:SS or HH:MM:SS format. Titles can appear after or before the timestamp (e.g., '01:20 Setup' or 'Setup - 01:20').",
  },
  {
    stepTitle: "Review the YouTube Requirement Checklist",
    stepDescription:
      "Verify the four top status indicators: starts at 00:00, at least 3 chapters, ascending chronological order, and at least 10 seconds per chapter.",
  },
  {
    stepTitle: "Fix Warnings or Enable Auto-Sort",
    stepDescription:
      "If any lines are malformed, duplicated, or out of order, inspect the validation alert box or toggle 'Auto-Sort Chronologically'.",
  },
  {
    stepTitle: "Copy or Download for Your Description",
    stepDescription:
      "Click 'Copy All Chapters' to paste the normalized list into your YouTube video description, or download it as a .txt file.",
  },
] as const;

const FAQS = [
  {
    question: "What are YouTube's official requirements for video chapters?",
    answer:
      "First, the very first timestamp must be 00:00. Second, you must include at least three timestamps listed in ascending chronological order. Third, each chapter must be at least 10 seconds long.",
  },
  {
    question: "Does valid formatting guarantee YouTube will show chapters?",
    answer:
      "No. While proper formatting is required, YouTube may still omit chapters if a channel has active strikes, if the video content is restricted, or if automatic chapters/channel settings override description timestamps.",
  },
  {
    question: "Can I mix MM:SS and HH:MM:SS timestamps?",
    answer:
      "Yes. If your video includes any timestamp of 1 hour or longer (HH:MM:SS), the formatter automatically normalizes all timestamps in the list to HH:MM:SS for consistency.",
  },
  {
    question: "How are short chapters detected?",
    answer:
      "The tool calculates the difference in seconds between each consecutive chapter timestamp. If any gap is less than 10 seconds, a warning highlights the affected chapter.",
  },
] as const;

export default function YouTubeTimestampFormatterPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="YouTube Timestamp Formatter"
      description="Normalize, sort, and validate video chapter timestamps for YouTube descriptions with instant checks for 00:00 start, order, duplicates, and 10-second chapter durations."
      privacyNote="All timestamp parsing and formatting runs locally in your browser."
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <YouTubeTimestampTool />
    </ToolPageShell>
  );
}
