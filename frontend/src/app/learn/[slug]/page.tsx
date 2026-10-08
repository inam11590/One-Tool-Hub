import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  getArticleBySlug,
  getRelatedArticles,
  LEARN_ARTICLES,
} from "@/lib/learn";
import { getToolBySlug } from "@/lib/tools";
import { buildArticleJsonLd, buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { ArticleCard } from "@/components/learn/ArticleCard";
import { ToolCard } from "@/components/ui/ToolCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return buildPageMetadata({
      title: "Tutorial Not Found",
      description: "The requested tutorial could not be found.",
      pathname: "/learn",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: article.seoTitle,
    description: article.metaDescription,
    pathname: `/learn/${article.slug}`,
    keywords: article.keywords,
  });
}

export default async function LearnArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const primaryTool = getToolBySlug(article.primaryToolSlug);
  const relatedTools = [
    ...(primaryTool ? [primaryTool] : []),
    ...article.relatedToolSlugs
      .map((toolSlug) => getToolBySlug(toolSlug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t)),
  ].slice(0, 4);

  const relatedArticles = getRelatedArticles(article.slug, 3);
  const jsonLdItems = buildArticleJsonLd(article);

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
                href="/learn"
                className="rounded-xs transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Learning Center
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </li>
            <li aria-current="page" className="font-semibold text-slate-900">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* 2. Article Header */}
        <header className="border-b border-slate-200 pb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
              <ToolIcon
                name={article.icon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>
            <Badge variant="primary">{article.categoryLabel}</Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>{article.readingTimeMinutes} min read</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <Calendar
                className="h-3.5 w-3.5 text-slate-500"
                aria-hidden="true"
              />
              <span>Updated {article.updatedAt}</span>
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {article.title}
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {article.excerpt}
          </p>
        </header>

        {/* 3. Main Content + Sidebar Grid */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Article Body (Readable column) */}
          <article className="space-y-12 lg:col-span-8">
            {/* Introduction */}
            <section aria-label="Introduction" className="space-y-4">
              {article.introduction.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base leading-relaxed text-slate-700 sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}

              {primaryTool ? (
                <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Interactive Companion Utility
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900 sm:text-base">
                      Need to run this right now? Open the {primaryTool.name}.
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                      {primaryTool.shortDescription}
                    </p>
                  </div>
                  <Link
                    href={`/tools/${primaryTool.slug}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
                  >
                    <span>Launch {primaryTool.name}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </section>

            {/* Section 1: The Problem Being Solved */}
            <section
              id="problem-solved"
              aria-labelledby="problem-solved-heading"
              className="scroll-mt-24 space-y-4 border-t border-slate-200 pt-10"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Why This Matters</span>
              </div>
              <h2
                id="problem-solved-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                {article.problemSolved.heading}
              </h2>
              {article.problemSolved.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-sm leading-relaxed text-slate-700 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Key Takeaways
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
                  {article.problemSolved.keyTakeaways.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 2: Step-by-Step Instructions */}
            <section
              id="step-by-step"
              aria-labelledby="step-by-step-heading"
              className="scroll-mt-24 space-y-5 border-t border-slate-200 pt-10"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                <span>Step-by-Step Walkthrough</span>
              </div>
              <h2
                id="step-by-step-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Step-by-Step Instructions
              </h2>
              <ol className="space-y-4">
                {article.steps.map((step, index) => (
                  <li
                    key={step.stepTitle}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900">
                          {step.stepTitle}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700 sm:text-base">
                          {step.stepDescription}
                        </p>
                        {step.proTip ? (
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5 text-xs leading-relaxed text-indigo-950">
                            <Lightbulb
                              className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
                              aria-hidden="true"
                            />
                            <span>
                              <strong>Tip:</strong> {step.proTip}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Section 3: Practical Worked Example */}
            <section
              id="practical-example"
              aria-labelledby="practical-example-heading"
              className="scroll-mt-24 space-y-4 border-t border-slate-200 pt-10"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                <span>Real-World Example</span>
              </div>
              <h2
                id="practical-example-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Practical Example: {article.practicalExample.title}
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                {article.practicalExample.scenario}
              </p>

              <div className="grid grid-cols-1 gap-4">
                {article.practicalExample.inputSample ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {article.practicalExample.inputLabel ?? "Input"}
                    </p>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-slate-100">
                      <code>{article.practicalExample.inputSample}</code>
                    </pre>
                  </div>
                ) : null}

                {article.practicalExample.outputSample ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-950 p-4 text-emerald-50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      {article.practicalExample.outputLabel ?? "Result"}
                    </p>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-emerald-50">
                      <code>{article.practicalExample.outputSample}</code>
                    </pre>
                  </div>
                ) : null}
              </div>

              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                <strong>How it works:</strong>{" "}
                {article.practicalExample.explanation}
              </p>
            </section>

            {/* Section 4: Common Mistakes */}
            <section
              id="common-mistakes"
              aria-labelledby="common-mistakes-heading"
              className="scroll-mt-24 space-y-5 border-t border-slate-200 pt-10"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span>Pitfalls to Avoid</span>
              </div>
              <h2
                id="common-mistakes-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Common Mistakes and How to Avoid Them
              </h2>
              <div className="space-y-4">
                {article.commonMistakes.map((item) => (
                  <div
                    key={item.mistake}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                  >
                    <h3 className="text-base font-bold text-slate-900">
                      {item.mistake}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      <strong>Why it happens:</strong> {item.whyItHappens}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                      <strong>How to fix it:</strong> {item.howToFix}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Troubleshooting Advice */}
            <section
              id="troubleshooting"
              aria-labelledby="troubleshooting-heading"
              className="scroll-mt-24 space-y-5 border-t border-slate-200 pt-10"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Wrench className="h-4 w-4" aria-hidden="true" />
                <span>Diagnostics &amp; Fixes</span>
              </div>
              <h2
                id="troubleshooting-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Troubleshooting Common Issues
              </h2>
              <div className="space-y-4">
                {article.troubleshooting.map((item) => (
                  <div
                    key={item.symptom}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
                  >
                    <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                      Issue: {item.symptom}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      <strong>Solution:</strong> {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Frequently Asked Questions */}
            <section
              id="faqs"
              aria-labelledby="article-faqs-heading"
              className="scroll-mt-24 space-y-5 border-t border-slate-200 pt-10"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                <span>Questions &amp; Answers</span>
              </div>
              <h2
                id="article-faqs-heading"
                className="text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Frequently Asked Questions
              </h2>
              <dl className="space-y-4">
                {article.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                  >
                    <dt className="text-base font-bold text-slate-900">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Section 7: Conclusion & CTA */}
            <section
              id="conclusion"
              aria-labelledby="conclusion-heading"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-8"
            >
              <h2
                id="conclusion-heading"
                className="text-xl font-bold text-white sm:text-2xl"
              >
                {article.conclusion.heading}
              </h2>
              {article.conclusion.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
              {primaryTool ? (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/tools/${primaryTool.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  >
                    <span>{article.conclusion.ctaLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-white sm:text-sm"
                  >
                    <span>Browse More Tutorials</span>
                  </Link>
                </div>
              ) : null}
            </section>
          </article>

          {/* Sticky Right Sidebar: Table of Contents + Matching Tool Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents */}
              <nav
                aria-label="Table of Contents"
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-900">
                  <BookOpen
                    className="h-4 w-4 text-indigo-600"
                    aria-hidden="true"
                  />
                  <span>In This Tutorial</span>
                </div>
                <ol className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>
                    <a
                      href="#problem-solved"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      1. {article.problemSolved.heading}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#step-by-step"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      2. Step-by-Step Instructions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#practical-example"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      3. Practical Worked Example
                    </a>
                  </li>
                  <li>
                    <a
                      href="#common-mistakes"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      4. Common Mistakes to Avoid
                    </a>
                  </li>
                  <li>
                    <a
                      href="#troubleshooting"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      5. Troubleshooting Common Issues
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faqs"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      6. Frequently Asked Questions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#conclusion"
                      className="block rounded-lg px-2 py-1 transition-colors hover:bg-white hover:text-indigo-600"
                    >
                      7. Summary &amp; Next Steps
                    </a>
                  </li>
                </ol>
              </nav>

              {/* Matching Tool Card */}
              {primaryTool ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Matching Online Utility
                  </p>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900">
                    {primaryTool.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {primaryTool.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-800">
                    <ShieldCheck
                      className="h-4 w-4 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span>Runs locally in your browser — no signup</span>
                  </div>
                  <Link
                    href={`/tools/${primaryTool.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
                  >
                    <span>Open {primaryTool.name}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        {/* 4. Related Tutorials Section */}
        <section
          aria-labelledby="related-tutorials-heading"
          className="mt-16 border-t border-slate-200 pt-14"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Continue Learning
              </p>
              <h2
                id="related-tutorials-heading"
                className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Related Tutorials in the Learning Center
              </h2>
            </div>
            <Link
              href="/learn"
              className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View All Tutorials &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedArticles.map((relArticle) => (
              <ArticleCard key={relArticle.slug} article={relArticle} />
            ))}
          </div>
        </section>

        {/* 5. Related Tools Section */}
        <section
          aria-labelledby="article-related-tools-heading"
          className="mt-16 border-t border-slate-200 pt-14"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Free Browser Utilities
              </p>
              <h2
                id="article-related-tools-heading"
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
            {relatedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
