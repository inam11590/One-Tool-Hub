import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { TOOL_CATEGORIES, TOOLS_REGISTRY } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the OneToolHub project mission, planned utility categories, and development roadmap.",
};

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="primary">Project Overview</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            About OneToolHub
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            OneToolHub is an online utility platform being built to bring
            essential everyday digital tools into one clean, fast, and
            accessible interface for students, freelancers, creators, and
            software developers.
          </p>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10">
            <section aria-labelledby="mission-heading">
              <h2
                id="mission-heading"
                className="text-xl font-bold text-slate-900"
              >
                Why We Are Building OneToolHub
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Finding simple utilities online—such as formatting JSON,
                generating a clean QR code, counting words for an assignment, or
                preparing YouTube chapter timestamps—often requires jumping
                across dozens of cluttered, ad-heavy websites. OneToolHub is
                designed as a unified, distraction-free workspace with
                consistent design, keyboard accessibility, and responsive
                support across mobile and desktop devices.
              </p>
            </section>

            <section aria-labelledby="categories-overview-heading">
              <h2
                id="categories-overview-heading"
                className="text-xl font-bold text-slate-900"
              >
                Planned Tool Suites
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {TOOL_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-5"
                  >
                    <h3 className="text-base font-semibold text-slate-900">
                      {category.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="status-heading">
              <h2
                id="status-heading"
                className="text-xl font-bold text-slate-900"
              >
                Current Development Stage (Step 2 Release)
              </h2>
              <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 text-sm leading-relaxed text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-indigo-900">
                  <Layers className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  <span>Transparent Roadmap Status</span>
                </div>
                <p className="mt-2">
                  OneToolHub now features <strong>5 live browser-based tools</strong>{" "}
                  (JSON Formatter &amp; Validator, Image Compressor, QR Code
                  Generator, Word Counter, and YouTube Timestamp Formatter) out
                  of our initial catalog of {TOOLS_REGISTRY.length} utilities.
                  The remaining 3 tools (GPA Calculator, Invoice Generator, and
                  PDF Merge &amp; Split) are clearly marked as{" "}
                  <strong>Coming Soon</strong> for the next release phase.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-8">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span>Browse All Tools</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span>Contact &amp; Feedback</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
