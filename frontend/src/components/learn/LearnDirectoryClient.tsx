"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { filterArticles, LEARN_CATEGORIES } from "@/lib/learn";
import { TOOLS_REGISTRY } from "@/lib/tools";
import type { LearnArticleSummary, LearnCategoryId } from "@/types/learn";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ArticleCard } from "@/components/learn/ArticleCard";
import { ToolCard } from "@/components/ui/ToolCard";

interface LearnDirectoryClientProps {
  articles: readonly LearnArticleSummary[];
}

export function LearnDirectoryClient({ articles }: LearnDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    LearnCategoryId | "all"
  >("all");

  const filteredArticles = useMemo(
    () => filterArticles(articles, searchQuery, selectedCategory),
    [articles, searchQuery, selectedCategory]
  );

  const featuredArticles = useMemo(
    () => articles.filter((article) => article.featured),
    [articles]
  );

  const isFiltered = searchQuery.trim() !== "" || selectedCategory !== "all";

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <div className="py-10 sm:py-14">
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
            <li aria-current="page" className="font-semibold text-slate-900">
              Learning Center
            </li>
          </ol>
        </nav>

        {/* 2. Hero Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Learning Center</Badge>
              <Badge variant="emerald">
                {articles.length} Practical Tutorials
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              OneToolHub Learning Center — Practical Guides &amp; Tutorials
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              Step-by-step tutorials, real-world worked examples, and
              troubleshooting guides for students, freelancers, YouTubers, and
              developers. Every guide pairs directly with a free browser utility
              on OneToolHub.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm"
            >
              Browse All 8 Online Tools &rarr;
            </Link>
          </div>
        </div>

        {/* 3. Featured Tutorials Section (shown when not actively filtering) */}
        {!isFiltered && featuredArticles.length > 0 ? (
          <section
            aria-labelledby="featured-tutorials-heading"
            className="mt-10"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Essential Workflows</span>
            </div>
            <h2
              id="featured-tutorials-heading"
              className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl"
            >
              Featured Tutorials
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        ) : null}

        {/* 4. Search & Category Filter Bar */}
        <section
          aria-labelledby="all-tutorials-heading"
          className="mt-12 border-t border-slate-200 pt-10"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Searchable Article Directory</span>
              </div>
              <h2
                id="all-tutorials-heading"
                className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl"
              >
                All Guides &amp; Tutorials ({filteredArticles.length})
              </h2>
            </div>
            {isFiltered ? (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-indigo-600 hover:text-indigo-700 sm:self-auto"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            ) : null}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
            <div className="max-w-xl">
              <label htmlFor="learn-search-input" className="sr-only">
                Search tutorials and guides
              </label>
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="learn-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tutorials by topic, tool, or keyword (e.g., JSON, GPA, invoice, PDF)..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear tutorial search"
                    className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div
              role="group"
              aria-label="Filter tutorials by category"
              className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4"
            >
              <span className="mr-1 text-xs font-semibold text-slate-500">
                Category:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                aria-pressed={selectedCategory === "all"}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  selectedCategory === "all"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                All Guides ({articles.length})
              </button>
              {LEARN_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                const count = articles.filter(
                  (a) => a.categoryId === category.id
                ).length;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(isSelected ? "all" : category.id)
                    }
                    aria-pressed={isSelected}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Filtered Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h3 className="text-base font-bold text-slate-900">
                No tutorials match your current search
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Try clearing your search keyword or switching to &ldquo;All
                Guides&rdquo; to view all eight tutorials.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Show All Tutorials</span>
              </button>
            </div>
          )}
        </section>

        {/* 6. Matching Online Tools Section */}
        <section
          aria-labelledby="learn-matching-tools-heading"
          className="mt-16 border-t border-slate-200 pt-14"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Put What You Learned into Practice
              </p>
              <h2
                id="learn-matching-tools-heading"
                className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Matching Browser Utilities on OneToolHub
              </h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View Full Tools Directory &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS_REGISTRY.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
