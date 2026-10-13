import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ToolFinderClient } from "@/components/tools/ToolFinderClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Smart Tool Finder — Find the Right Tool for Any Task",
  description:
    "Describe what you want to do in natural language and discover the best free browser-based utility instantly. 100% private, client-side task matching.",
  pathname: "/tool-finder",
  keywords: [
    "tool finder",
    "smart tool search",
    "task to tool finder",
    "online utilities finder",
    "free browser tools matching",
  ],
});

export default function ToolFinderPage() {
  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
              Intent-Driven Discovery
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Smart Tool Finder
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Tell us what you want to achieve in plain English. Our deterministic matching engine recommends the perfect free browser utility instantly with zero tracking.
            </p>
          </div>

          <ToolFinderClient lang="en" />
        </div>
      </Container>
    </div>
  );
}
