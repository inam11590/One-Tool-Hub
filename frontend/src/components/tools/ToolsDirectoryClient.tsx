"use client";

import { useMemo, useState } from "react";
import { Search, RotateCcw, X } from "lucide-react";
import { filterTools, TOOL_CATEGORIES, TOOLS_REGISTRY } from "@/lib/tools";
import type { ToolCategoryId } from "@/types/tools";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ToolCard } from "@/components/ui/ToolCard";

export function ToolsDirectoryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategoryId | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "coming-soon"
  >("all");

  const filteredTools = useMemo(
    () =>
      filterTools(
        TOOLS_REGISTRY,
        searchQuery,
        selectedCategory,
        statusFilter
      ),
    [searchQuery, selectedCategory, statusFilter]
  );

  const availableCount = TOOLS_REGISTRY.filter(
    (t) => t.status === "available"
  ).length;
  const comingSoonCount = TOOLS_REGISTRY.filter(
    (t) => t.status === "coming-soon"
  ).length;

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setStatusFilter("all");
  };

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="max-w-3xl">
          <Badge variant="primary">Complete Catalog</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            All Tools Directory
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Browse and search all utilities on OneToolHub. Filter by workflow
            category or availability status to jump straight into a tool.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
            {/* Search Input */}
            <div className="lg:col-span-6">
              <label htmlFor="directory-search" className="sr-only">
                Search tools in directory
              </label>
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="directory-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tool name, category, or keyword..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear directory search"
                    className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Status Filter */}
            <div
              role="group"
              aria-label="Filter by availability status"
              className="flex flex-wrap items-center gap-2 lg:col-span-6 lg:justify-end"
            >
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                aria-pressed={statusFilter === "all"}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                All ({TOOLS_REGISTRY.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("available")}
                aria-pressed={statusFilter === "available"}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  statusFilter === "available"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Available ({availableCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("coming-soon")}
                aria-pressed={statusFilter === "coming-soon"}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  statusFilter === "coming-soon"
                    ? "bg-amber-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Coming Soon ({comingSoonCount})
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            role="group"
            aria-label="Filter by tool category"
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
              All Categories
            </button>
            {TOOL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isSelected ? "all" : cat.id)
                  }
                  aria-pressed={isSelected}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Grid */}
        {filteredTools.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-base font-bold text-slate-900">
              No tools match your current filter
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Try clearing your search query or switching the category and
              status filters.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
