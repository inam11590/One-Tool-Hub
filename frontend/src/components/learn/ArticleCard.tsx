import Link from "next/link";
import { ArrowRight, Clock, Wrench } from "lucide-react";
import type { LearnArticleSummary } from "@/types/learn";
import { getToolBySlug } from "@/lib/tools";
import { Badge } from "@/components/ui/Badge";
import { ToolIcon } from "@/components/ui/ToolIcon";

interface ArticleCardProps {
  article: LearnArticleSummary;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const matchingTool = getToolBySlug(article.primaryToolSlug);

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Top Row: Icon + Category Badge + Reading Time */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <ToolIcon
                name={article.icon}
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>
            <Badge variant="primary">{article.categoryLabel}</Badge>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{article.readingTimeMinutes} min read</span>
          </span>
        </div>

        {/* Title & Excerpt */}
        <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600">
          <Link
            href={`/learn/${article.slug}`}
            className="rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {article.title}
          </Link>
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
          {article.excerpt}
        </p>
      </div>

      {/* Footer Links: Tutorial Link + Companion Tool Link */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Link
          href={`/learn/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span>Read Step-by-Step Guide</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        {matchingTool ? (
          <Link
            href={`/tools/${matchingTool.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/70 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Wrench className="h-3 w-3 text-indigo-600" aria-hidden="true" />
            <span>Try {matchingTool.name}</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
