import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { PercentageCalculatorTool } from "@/components/tools/PercentageCalculatorTool";

const TOOL_SLUG = "percentage-calculator";

export const metadata: Metadata = buildPageMetadata({
  title: "Percentage Calculator — Free Online Multi-Mode Percentage Tool",
  description:
    "Calculate percentages, percentage increases, discounts, markups, and differences quickly. Includes step-by-step mathematical formulas and explanations.",
  path: `/tools/${TOOL_SLUG}`,
  keywords: [
    "percentage calculator online",
    "calculate percentage increase decrease",
    "what is x percent of y",
    "discount percentage calculator",
    "math percentage tool student",
  ],
});

const OVERVIEW =
  "The OneToolHub Percentage Calculator simplifies everyday mathematical and financial percentage calculations for students, freelancers, shoppers, and analysts. Whether you need to find a tip percentage, calculate a freelance tax markup, determine a store discount, or measure academic score increases, this tool provides instant answers alongside step-by-step formulas.";

const FEATURES = [
  "5 distinct calculation modes covering discounts, markups, percentage shares, and increases.",
  "Step-by-step mathematical formulas and clear natural language explanations for every result.",
  "Accurate floating-point arithmetic with decimal rounding controls.",
  "Safe handling of edge cases including division by zero and negative numbers.",
  "One-click copy to clipboard with instant feedback.",
  "Simple, distraction-free interface built for mobile and desktop screens.",
] as const;

const EXAMPLES = [
  {
    title: "Calculating a 15% Tip or Service Fee",
    description: "Determine the exact dollar surcharge on a $250 bill.",
    sample: "What is 15% of 250?  →  $37.50",
  },
  {
    title: "Store Discount (20% Off $80)",
    description: "Calculate final checkout price after applying a percentage discount.",
    sample: "Subtract 20% from 80  →  64",
  },
  {
    title: "Traffic or Revenue Growth Rate",
    description: "Measure the percentage change between an initial and final metric.",
    sample: "Increase from 80 to 100  →  +25%",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select Mode",
    stepDescription:
      "Choose the calculation mode matching your question (e.g. 'What is X% of Y?', '% Increase / Decrease', or 'Discount').",
  },
  {
    stepTitle: "Enter Numbers",
    stepDescription:
      "Type your values into the X and Y input boxes. Results update automatically as you type.",
  },
  {
    stepTitle: "Review & Copy",
    stepDescription:
      "Inspect the answer and review the formula breakdown. Click 'Copy Result' to paste it anywhere.",
  },
] as const;

const FAQS = [
  {
    question: "How do I calculate a percentage increase?",
    answer:
      "Subtract the starting value from the new value, divide by the starting value, and multiply by 100. For example, from 50 to 75: ((75 - 50) / 50) * 100 = 50% increase.",
  },
  {
    question: "What happens if I enter 0 as the starting value in percentage change?",
    answer:
      "Division by zero is mathematically undefined. The calculator will alert you to enter a non-zero starting base.",
  },
  {
    question: "Can percentages be negative?",
    answer:
      "Yes. A negative percentage change indicates a percentage decrease from the initial baseline.",
  },
  {
    question: "Are my calculations logged or saved?",
    answer:
      "No. All math is performed instantaneously on your device. We do not store or track any of your calculation values.",
  },
] as const;

export default function PercentageCalculatorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="Percentage Calculator"
      description="Calculate percentages, percentage increases, discounts, markups, and differences quickly. Includes step-by-step mathematical formulas and explanations."
      privacyNote="Processed 100% locally in your browser. Calculation values are never transmitted to any server."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <PercentageCalculatorTool />
    </ToolPageShell>
  );
}
