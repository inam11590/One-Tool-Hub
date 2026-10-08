import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { YouTubeTimestampTool } from "@/components/tools/YouTubeTimestampTool";

const TOOL_SLUG = "youtube-timestamp-formatter";

export const metadata: Metadata = buildPageMetadata({
  title: "YouTube Timestamp Formatter — Validate & Format Video Chapters",
  description:
    "Format, normalize, and validate YouTube chapter timestamps online. Check for 00:00 start, minimum 3 chapters, 10-second duration, duplicates, and chronological order.",
  path: `/tools/${TOOL_SLUG}`,
});

const OVERVIEW =
  "The OneToolHub YouTube Timestamp Formatter helps video creators, podcast editors, and educators turn rough editing notes into clean, YouTube-ready chapter lists. It automatically normalizes MM:SS and HH:MM:SS timestamps, strips inconsistent separator characters, and checks your chapter list against YouTube's four core chapter eligibility rules.";

const FEATURES = [
  "Parses timestamps placed either at the beginning ('01:25 Setup') or end ('Setup - 01:25') of each line.",
  "Normalizes all timestamps to MM:SS (or HH:MM:SS when any chapter reaches 1 hour or longer).",
  "Four-point YouTube chapter validator: 00:00 start check, minimum 3 chapters, chronological order, and 10-second minimum duration.",
  "Optional one-click chronological auto-sorting for out-of-order notes.",
  "Line-specific warnings for malformed timestamps, missing titles, duplicates, and short chapters.",
  "Instant clipboard copy and .txt file download ready for your YouTube description box.",
] as const;

const EXAMPLES = [
  {
    title: "Cleaning Rough Editing Notes",
    description:
      "Paste mixed-format notes with dashes or brackets and normalize them into clean 'MM:SS Title' lines.",
    sample: "0:00 - Intro\n1:45 — Project Setup\n05:10 Building Components  →  00:00 Intro / 01:45 Project Setup / 05:10 Building Components",
  },
  {
    title: "Long-Form Podcast or Lecture Chapters",
    description:
      "When a list includes timestamps over one hour, every line is normalized to HH:MM:SS for consistent alignment.",
    sample: "00:00:00 Welcome\n00:18:30 Guest Interview\n01:04:15 Audience Q&A",
  },
] as const;

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
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <YouTubeTimestampTool />
    </ToolPageShell>
  );
}
