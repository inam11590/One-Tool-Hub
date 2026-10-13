import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { WorkflowsClient } from "@/components/workflows/WorkflowsClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Productivity Workflows — Step-by-Step Multi-Tool Guides",
  description:
    "Follow guided recipes that connect multiple tools into seamless pipelines: optimize website images, brand official PDFs, prep mock API data, and format YouTube uploads.",
  pathname: "/workflows",
  keywords: [
    "productivity workflows",
    "multi tool guides",
    "web image pipeline",
    "pdf branding workflow",
    "developer data pipeline",
    "youtube publishing workflow",
  ],
});

export default function WorkflowsPage() {
  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
              Guided Recipes
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Productivity Workflows
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Real-world tasks rarely require only one tool. Follow these step-by-step interactive recipes to chain multiple browser tools together, track your progress, and get your work done with zero hassle.
            </p>
          </div>

          <WorkflowsClient lang="en" />
        </div>
      </Container>
    </div>
  );
}
