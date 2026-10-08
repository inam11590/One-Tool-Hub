import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug } from "@/lib/tools";
import { buildPageMetadata } from "@/lib/seo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { GpaCalculatorTool } from "@/components/tools/GpaCalculatorTool";

const TOOL_SLUG = "gpa-calculator";

export const metadata: Metadata = buildPageMetadata({
  title: "GPA Calculator — Semester & Cumulative GPA (4.0 & 5.0 Scales)",
  description:
    "Calculate your weighted semester and cumulative GPA online. Supports configurable 4.0 and 5.0 grading scales, editable letter-grade mappings, multiple semesters, and worked examples.",
  path: `/tools/${TOOL_SLUG}`,
});

const OVERVIEW =
  "The OneToolHub GPA Calculator is designed for university, college, and high school students worldwide who need an accurate weighted Grade Point Average calculation. Because grading policies vary between institutions, this tool lets you switch between 4.0 and 5.0 scales, customize the exact point value of every letter grade (A+ through F), and track multiple semesters for cumulative GPA.";

const FEATURES = [
  "Dynamic course list with course name, credit hours, and letter grade inputs.",
  "Configurable 4.0 and 5.0 grading scale presets with fully editable grade-to-point mappings.",
  "Multi-semester support to compute both individual term GPAs and overall cumulative GPA.",
  "Automatic weighted calculation: Sum of (Grade Points × Credit Hours) ÷ Total Credit Hours.",
  "Real-time validation for missing grades, negative or zero credit hours, and zero total credits.",
  "Worked step-by-step calculation breakdown showing quality points per course.",
] as const;

const EXAMPLES = [
  {
    title: "Single Semester Weighted GPA (4.0 Scale)",
    description:
      "A student taking Data Structures (4 credits, A = 4.0), Linear Algebra (3 credits, B+ = 3.3), and Technical Writing (3 credits, A- = 3.7) earns 37.00 grade points across 10 credits.",
    sample: "(16.00 + 9.90 + 11.10) ÷ 10 credits = 3.70 GPA",
  },
  {
    title: "Custom University Grade Mapping",
    description:
      "If your institution defines A- as 3.67 instead of 3.70, open the Grade-to-Point Mapping panel and adjust A- to 3.67 for an exact match.",
  },
] as const;

const INSTRUCTIONS = [
  {
    stepTitle: "Select Your Grading Scale & Verify Grade Mappings",
    stepDescription:
      "Choose between the 4.0 or 5.0 scale preset and customize any letter grade's point value in the Grade-to-Point Mapping panel to match your university's syllabus.",
  },
  {
    stepTitle: "Enter Your Courses, Credit Hours, and Grades",
    stepDescription:
      "Type each course name, enter its positive credit hour weight (e.g., 3 or 4 credits), and select the earned letter grade.",
  },
  {
    stepTitle: "Add Semesters for Cumulative GPA",
    stepDescription:
      "Click 'Add Another Semester for Cumulative GPA' to track multiple academic terms and compare individual semester GPAs against your overall cumulative GPA.",
  },
  {
    stepTitle: "Review Weighted Results & Worked Formula",
    stepDescription:
      "Inspect your live Cumulative GPA, Total Credit Hours, and Total Grade Points rounded to two decimal places.",
  },
] as const;

const FAQS = [
  {
    question: "How is weighted GPA calculated?",
    answer:
      "Weighted GPA is calculated by multiplying each course's grade points by its credit hours to get quality points, summing all quality points, and dividing by the total number of credit hours: GPA = Sum of (Grade Points × Credit Hours) / Total Credit Hours.",
  },
  {
    question: "Why can I edit the grade-to-point mapping table?",
    answer:
      "Universities and colleges around the world use different point values for plus/minus grades (for example, some assign A- = 3.70 while others assign 3.67, or use a 5.0 scale for honors courses). Making the mapping table editable ensures you can match your institution's exact policy.",
  },
  {
    question: "Why might my official university transcript GPA differ slightly?",
    answer:
      "Official transcripts may apply institution-specific rules for pass/fail courses, non-credit labs, repeated course grade forgiveness, or intermediate rounding conventions.",
  },
  {
    question: "Are my course names or grades uploaded anywhere?",
    answer:
      "No. All GPA calculations happen locally in your browser tab without any server requests or account registration.",
  },
] as const;

export default function GpaCalculatorPage() {
  const tool = getToolBySlug(TOOL_SLUG);
  if (!tool) {
    notFound();
  }

  return (
    <ToolPageShell
      tool={tool}
      title="GPA Calculator"
      description="Calculate weighted semester and cumulative GPA with configurable 4.0 and 5.0 scales, editable grade-to-point mappings, and credit hour validation."
      privacyNote="Calculated locally in your browser. Your course list and grades never leave your device."
      overview={OVERVIEW}
      features={FEATURES}
      examples={EXAMPLES}
      instructions={INSTRUCTIONS}
      faqs={FAQS}
    >
      <GpaCalculatorTool />
    </ToolPageShell>
  );
}
