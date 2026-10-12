import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { ColorPickerTool } from "@/components/tools/ColorPickerTool";

const TOOL_SLUG = "color-picker";

export const metadata: Metadata = buildPageMetadata({
  title: "Color Picker & Converter — HEX, RGB, HSL with WCAG Contrast Checker",
  description:
    "Pick and convert colors across HEX, RGB, and HSL online. Calculate WCAG 2.1 contrast ratios against black and white, generate harmonic palettes, and export CSS custom properties.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "color picker and converter online",
    "hex to rgb to hsl converter",
    "wcag 2.1 contrast ratio checker",
    "color palette generator online",
    "css custom properties color export",
  ],
});

const OVERVIEW =
  "The OneToolHub Color Picker & Converter provides web developers, UI/UX designers, and accessibility auditors with a comprehensive, client-side color workbench. Inspect colors with high precision across HEX, RGB, and HSL formats, evaluate WCAG 2.1 AA/AAA contrast ratios against light and dark backgrounds, generate complementary and analogous palettes, and export CSS variables directly.";

const FEATURES = [
  "Bidirectional color conversion across 6-digit Hex, RGB (0–255), and HSL (0–360°, 0–100%).",
  "Visual color canvas preview with native system color picker integration.",
  "Mathematical WCAG 2.1 relative luminance and contrast ratio calculations.",
  "Instant AA and AAA accessibility pass/fail compliance indicators for normal and large text.",
  "Harmonic color palette generator producing complementary, analogous, and monochromatic swatches.",
  "One-click export of color palettes as CSS custom properties (:root variables) or JSON.",
] as const;

const EXAMPLES = [
  {
    title: "Converting Brand Colors to CSS Variables",
    description:
      "Input a marketing HEX color like #10b981 to inspect its RGB equivalent rgb(16, 185, 129) and export ready-to-use CSS custom properties.",
    sample: "HEX #10b981 → RGB(16, 185, 129) → HSL(160, 84%, 39%)\nCSS: --color-primary: #10b981;",
  },
  {
    title: "Checking Text Readability Against White",
    description:
      "Verify whether a button text color meets WCAG AA (4.5:1 minimum) against a white container before deploying to production.",
    sample: "Foreground: #10b981 vs White (#fff) → Contrast Ratio: 4.82:1 (Normal AA: PASS)",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Pick or Enter a Color",
    stepDescription:
      "Click the visual color canvas to launch the system picker, or paste an existing HEX code, RGB values, or HSL percentages.",
  },
  {
    stepTitle: "Adjust Color Channels",
    stepDescription:
      "Use the granular Red, Green, Blue, Hue, Saturation, or Lightness sliders to fine-tune color balance and shades.",
  },
  {
    stepTitle: "Verify WCAG Accessibility",
    stepDescription:
      "Check the contrast ratio cards against white (#fff) and black (#000) to ensure compliance with WCAG 2.1 AA/AAA standards.",
  },
  {
    stepTitle: "Export Palettes & CSS",
    stepDescription:
      "Click 'Export CSS' to download CSS variables or click individual harmonic swatches to explore complementary schemes.",
  },
] as const;

const FAQS = [
  {
    question: "How is the WCAG contrast ratio calculated?",
    answer:
      "The tool calculates the sRGB relative luminance of both colors using the formula defined in WCAG 2.1 guidelines, and computes the ratio (L1 + 0.05) / (L2 + 0.05), ranging from 1:1 (no contrast) to 21:1 (maximum contrast).",
  },
  {
    question: "What is the difference between normal and large text thresholds?",
    answer:
      "Under WCAG 2.1 AA, normal text requires a minimum contrast ratio of 4.5:1. Large text (defined as at least 18pt regular or 14pt bold) requires a lower threshold of 3.0:1.",
  },
  {
    question: "Does passing contrast checks guarantee complete accessibility?",
    answer:
      "While sufficient contrast is essential for readability, full accessibility also involves font size, typography weights, color blindness considerations, and avoiding reliance solely on color to convey information.",
  },
] as const;

export default function ColorPickerPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) notFound();

  return (
    <ToolPageShell
      tool={tool}
      title="Color Picker & Converter"
      description="Convert colors across HEX, RGB, and HSL formats, evaluate WCAG 2.1 AA/AAA contrast ratios, and export accessible color palettes as CSS custom properties."
      privacyNote="All color calculations, contrast checks, and palette exports are executed 100% locally in your browser. No data is tracked or transmitted to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <ColorPickerTool />
    </ToolPageShell>
  );
}
