import { Search, Sparkles, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalToolsCount: number;
  filteredToolsCount: number;
}

const QUICK_FILTER_SUGGESTIONS = [
  "YouTube",
  "JSON",
  "PDF",
  "GPA",
  "Invoice",
  "QR Code",
] as const;

export function Hero({
  searchQuery,
  onSearchChange,
  totalToolsCount,
  filteredToolsCount,
}: HeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/60 via-white to-white py-16 sm:py-24"
    >
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" className="mb-5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>8 Live Browser Tools &bull; No Signup Required</span>
          </Badge>

          <h1
            id="hero-heading"
            className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            Every Tool You Need.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              One Powerful Platform.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Free, fast, and easy online tools for students, freelancers,
            creators, and developers.
          </p>

          {/* Search Input for Filtering Local Catalog */}
          <div className="mx-auto mt-8 max-w-xl">
            <form
              role="search"
              aria-label="Filter tool catalog"
              onSubmit={(event) => {
                event.preventDefault();
                const featuredSection =
                  document.getElementById("featured-tools");
                featuredSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative"
            >
              <label htmlFor="tool-catalog-search" className="sr-only">
                Search tools by name, category, or keyword
              </label>
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="tool-catalog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search tools (e.g., JSON Formatter, GPA Calculator, PDF, YouTube)..."
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600 sm:text-base"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search query"
                    className="absolute right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </form>

            {/* Quick filter tags & live count */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-500">Quick filter:</span>
              {QUICK_FILTER_SUGGESTIONS.map((term) => {
                const isSelected =
                  searchQuery.trim().toLowerCase() === term.toLowerCase();
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() =>
                      onSearchChange(isSelected ? "" : term)
                    }
                    className={`rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>

            {searchQuery.trim() ? (
              <p
                aria-live="polite"
                className="mt-3 text-xs font-medium text-indigo-700"
              >
                Showing {filteredToolsCount} of {totalToolsCount} tools
                matching &ldquo;{searchQuery.trim()}&rdquo;
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
