import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Info,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ToolFaqItem, ToolItem } from "@/types/tools";
import type { ValidToolSlug } from "@/lib/analytics";
import { buildToolPageJsonLd } from "@/lib/seo";
import { getRelatedTools } from "@/lib/tools";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ToolCard } from "@/components/ui/ToolCard";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { ToolOpenTracker } from "@/components/analytics/ToolOpenTracker";
import { ToolFeedbackCard } from "@/components/tools/ToolFeedbackCard";

export interface ToolPracticalExample {
  title: string;
  scenario?: string;
  description?: string;
  sample?: string;
}

interface ToolPageShellProps {
  tool: ToolItem;
  title: string;
  description: string;
  privacyNote: string;
  overview?: string | readonly string[];
  features?: readonly string[];
  examples?: readonly ToolPracticalExample[];
  instructions: readonly {
    stepTitle: string;
    stepDescription: string;
  }[];
  faqs: readonly ToolFaqItem[];
  children: ReactNode;
}

export function ToolPageShell({
  tool,
  title,
  description,
  privacyNote,
  overview,
  features,
  examples,
  instructions,
  faqs,
  children,
}: ToolPageShellProps) {
  const relatedTools = getRelatedTools(tool.slug, 4);
  const jsonLdItems = buildToolPageJsonLd(tool, title, description);

  return (
    <div className="py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdItems),
        }}
      />
      <Container>
        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600 sm:text-sm">
            <li>
              <Link
                href="/"
                className="rounded-xs transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </li>
            <li>
              <Link
                href="/tools"
                className="rounded-xs transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                All Tools
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </li>
            <li aria-current="page" className="font-semibold text-slate-900">
              {tool.name}
            </li>
          </ol>
        </nav>

        {/* 2. Clear H1 Title & Short Introduction */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
                <ToolIcon
                  name={tool.icon}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </span>
              <Badge variant="primary">{tool.categoryLabel}</Badge>
              <Badge variant="emerald">Browser-Processed</Badge>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              {description}
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs leading-relaxed text-emerald-950 lg:max-w-xs">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <span>{privacyNote}</span>
          </div>
        </div>

        {/* 3. Interactive Tool Workspace */}
        <section aria-label={`${tool.name} Workspace`} className="mt-8">
          <ToolOpenTracker
            toolSlug={tool.slug as ValidToolSlug}
            toolCategory={tool.categoryId}
          />
          {children}
        </section>

        {/* 3b. Lightweight User Feedback Card */}
        <ToolFeedbackCard
          toolSlug={tool.slug as ValidToolSlug}
          toolName={tool.name}
        />

        {/* 4. Tool Overview, Supported Features & Practical Examples */}
        {(overview || features?.length || examples?.length) ? (
          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-slate-200 pt-14 lg:grid-cols-12">
            {/* Explanation of What the Tool Does & Supported Features */}
            <section
              aria-labelledby="tool-overview-heading"
              className="space-y-6 lg:col-span-6"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  <Info className="h-4 w-4" aria-hidden="true" />
                  <span>About This Utility</span>
                </div>
                <h2
                  id="tool-overview-heading"
                  className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl"
                >
                  What the {tool.name} Does
                </h2>
                {(typeof overview === "string" ? [overview] : overview ?? []).map(
                  (paragraph, idx) => (
                    <p
                      key={idx}
                      className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base"
                    >
                      {paragraph}
                    </p>
                  )
                )}
              </div>

              {features && features.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <h3 className="text-base font-bold text-slate-900">
                    Supported Features &amp; Specifications
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
                          aria-hidden="true"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            {/* Practical Examples */}
            {examples && examples.length > 0 ? (
              <section
                aria-labelledby="tool-examples-heading"
                className="lg:col-span-6"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  <Lightbulb className="h-4 w-4" aria-hidden="true" />
                  <span>Real-World Workflows</span>
                </div>
                <h2
                  id="tool-examples-heading"
                  className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl"
                >
                  Practical Examples
                </h2>
                <div className="mt-4 space-y-4">
                  {examples.map((ex) => (
                    <div
                      key={ex.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                    >
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                        {ex.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {ex.scenario ?? ex.description}
                      </p>
                      {ex.sample ? (
                        <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-800">
                          <code>{ex.sample}</code>
                        </pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {/* 5. Instructions & FAQs Grid */}
        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-slate-200 pt-14 lg:grid-cols-12">
          {/* Instructions */}
          <section
            aria-labelledby="how-to-use-heading"
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Step-by-Step Guide</span>
            </div>
            <h2
              id="how-to-use-heading"
              className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              How to Use the {tool.name}
            </h2>
            <ol className="mt-6 space-y-4">
              {instructions.map((item, idx) => (
                <li
                  key={item.stepTitle}
                  className="flex gap-4 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.stepTitle}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.stepDescription}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Frequently Asked Questions */}
          <section aria-labelledby="faq-heading" className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span>Questions &amp; Answers</span>
            </div>
            <h2
              id="faq-heading"
              className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              Frequently Asked Questions
            </h2>
            <dl className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <dt className="text-sm font-bold text-slate-900 sm:text-base">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-600">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* 6. Related Tools Section */}
        <section
          aria-labelledby="related-tools-heading"
          className="mt-16 border-t border-slate-200 pt-14"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Explore More Utilities
              </p>
              <h2
                id="related-tools-heading"
                className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Related Tools on OneToolHub
              </h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View All Tools Directory &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((related) => (
              <ToolCard key={related.id} tool={related} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
