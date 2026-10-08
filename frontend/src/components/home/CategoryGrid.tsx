import { ArrowDownRight } from "lucide-react";
import { TOOL_CATEGORIES, TOOLS_REGISTRY } from "@/lib/tools";
import type { ToolCategoryId } from "@/types/tools";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryIcon } from "@/components/ui/ToolIcon";

interface CategoryGridProps {
  selectedCategory: ToolCategoryId | "all";
  onSelectCategory: (categoryId: ToolCategoryId | "all") => void;
}

export function CategoryGrid({
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-20 py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Organized by Workflow"
            title="Four Dedicated Tool Suites"
            description="Browse utilities tailored to your daily academic, freelance, creative, or software engineering tasks."
          />
          {selectedCategory !== "all" ? (
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className="self-start rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:self-auto"
            >
              Show All Categories
            </button>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TOOL_CATEGORIES.map((category) => {
            const count = TOOLS_REGISTRY.filter(
              (tool) => tool.categoryId === category.id
            ).length;
            const isSelected = selectedCategory === category.id;

            return (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white shadow-2xs hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
                      <CategoryIcon
                        name={category.icon}
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {count} {count === 1 ? "tool" : "tools"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-indigo-600">
                    {category.audience}
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                    {category.description}
                  </p>

                  <ul
                    aria-label={`${category.name} example use cases`}
                    className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-600"
                  >
                    {category.exampleUseCases.map((example) => (
                      <li key={example} className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                          aria-hidden="true"
                        />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextCategory = isSelected ? "all" : category.id;
                      onSelectCategory(nextCategory);
                      const featuredEl =
                        document.getElementById("featured-tools");
                      featuredEl?.scrollIntoView({ behavior: "smooth" });
                    }}
                    aria-pressed={isSelected}
                    className={`inline-flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      isSelected
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-100 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    <span>
                      {isSelected
                        ? "Filtering by Category (Click to Reset)"
                        : `Filter ${category.name}`}
                    </span>
                    <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
