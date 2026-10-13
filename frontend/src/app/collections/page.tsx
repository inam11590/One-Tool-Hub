import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { CollectionsClient } from "@/components/collections/CollectionsClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Curated Tool Collections — Productivity Bundles for Every Role",
  description:
    "Explore 5 hand-picked tool bundles for students, developers, content creators, PDF power users, and writers. Save time with purpose-built browser tool sets.",
  pathname: "/collections",
  keywords: [
    "tool collections",
    "developer tools bundle",
    "student productivity tools",
    "creator tools pack",
    "pdf tools collection",
    "online utilities bundles",
  ],
});

export default function CollectionsPage() {
  return (
    <div className="py-8 sm:py-12 bg-slate-50/50 min-h-screen">
      <Container>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
              Role-Based Bundles
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curated Tool Collections
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Skip searching for individual utilities. Choose a ready-made collection tailored to your exact workflow, pin it to your browser workspace, and finish your tasks faster.
            </p>
          </div>

          <CollectionsClient lang="en" />
        </div>
      </Container>
    </div>
  );
}
