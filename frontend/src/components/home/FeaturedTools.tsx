import { RotateCcw } from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/tools";
import type { ToolCategoryId, ToolItem } from "@/types/tools";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToolCard } from "@/components/ui/ToolCard";

interface FeaturedToolsProps {
  tools: readonly ToolItem[];
  searchQuery: string;
  selectedCategory: ToolCategoryId | "all";
  onSelectCategory: (category: ToolCategoryId | "all") => void;
  onResetFilters: () => void;
}

export function FeaturedTools({
  tools,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  onResetFilters,
}: FeaturedToolsProps) {
  const hasActiveFilter =
    searchQuery.trim().length > 0 || selectedCategory !== "all";

  return (
    <section
      id="featured-tools"
      aria-labelledby="featured-tools-heading"
      className="scroll-mt-20 border-t border-slate-200/80 bg-slate-50/70 py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Featured Tool Catalog"
            title="Core Utilities Directory"
            description="Launch all 8 live browser-based utilities immediately—no account registration required."
          />

          {/* Category Filter Pills */}
          <div
            role="group"
            aria-label="Filter tools by category"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              aria-pressed={selectedCategory === "all"}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              All ({8})
            </button>
            {TOOL_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    onSelectCategory(isSelected ? "all" : category.id)
                  }
                  aria-pressed={isSelected}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter bar */}
        {hasActiveFilter ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-xs text-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">
                Active filters:
              </span>
              {selectedCategory !== "all" ? (
                <Badge variant="primary">
                  Category:{" "}
                  {
                    TOOL_CATEGORIES.find((cat) => cat.id === selectedCategory)
                      ?.name
                  }
                </Badge>
              ) : null}
              {searchQuery.trim() ? (
                <Badge variant="primary">
                  Search: &ldquo;{searchQuery.trim()}&rdquo;
                </Badge>
              ) : null}
              <span className="text-slate-600">
                ({tools.length} {tools.length === 1 ? "result" : "results"})
              </span>
            </div>

            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs ring-1 ring-inset ring-indigo-200 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          </div>
        ) : null}

        {/* Tools Grid */}
        {tools.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No matching tools found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              We couldn&apos;t find any tools matching your current search or
              category filter. Try clearing the filter to view all 8 utilities.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Show All Tools</span>
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
