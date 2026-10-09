'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { TOOLS_REGISTRY } from "@/lib/tools";
import { searchTools } from "@/lib/search";
import { trackToolEvent } from "@/lib/analytics";

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
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const matchedResults = searchQuery.trim()
    ? searchTools(TOOLS_REGISTRY, searchQuery, { maxResults: 4 })
    : [];

  useEffect(() => {
    setSelectedIndex(0);
    setShowDropdown(searchQuery.trim().length > 0);
  }, [searchQuery]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matchedResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % matchedResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + matchedResults.length) % matchedResults.length
      );
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetTool = matchedResults[selectedIndex]?.tool;
      if (targetTool?.href) {
        trackToolEvent("tool_open", {
          tool_slug: targetTool.slug,
          tool_category: targetTool.categoryId,
          operation_type: "open_from_hero_search",
        });
        router.push(targetTool.href);
      } else {
        const featuredSection = document.getElementById("featured-tools");
        featuredSection?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
            creators, and developers. Runs 100% in your browser.
          </p>

          {/* Search Input with Instant Autocomplete */}
          <div className="mx-auto mt-8 max-w-xl relative" ref={dropdownRef}>
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
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowDropdown(true);
                  }}
                  onChange={(event) => onSearchChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search tools (e.g., JSON Formatter, GPA, PDF, YouTube)..."
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-offset-0 focus:outline-indigo-600 sm:text-base"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange("");
                      setShowDropdown(false);
                    }}
                    aria-label="Clear search query"
                    className="absolute right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </form>

            {/* Instant Suggestions Dropdown */}
            {showDropdown && searchQuery.trim() && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10 border border-slate-200 text-left p-2 animate-in fade-in zoom-in-95 duration-100"
              >
                {matchedResults.length > 0 ? (
                  <div>
                    <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      <span>Instant Suggestions</span>
                      <span className="flex items-center gap-1 font-normal lowercase text-slate-400">
                        <kbd className="px-1 py-0.5 border border-slate-200 rounded text-[9px]">↵</kbd> to open
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {matchedResults.map((result, idx) => {
                        const tool = result.tool;
                        const isSelected = idx === selectedIndex;
                        return (
                          <li
                            key={tool.slug}
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setSelectedIndex(idx)}
                          >
                            <Link
                              href={tool.href || `/tools/${tool.slug}`}
                              onClick={() => {
                                trackToolEvent("tool_open", {
                                  tool_slug: tool.slug,
                                  tool_category: tool.categoryId,
                                  operation_type: "open_from_hero_dropdown",
                                });
                                setShowDropdown(false);
                              }}
                              className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-indigo-50 text-indigo-600"
                                  }`}
                                >
                                  <ToolIcon name={tool.icon} className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className={`text-xs font-bold truncate ${
                                      isSelected ? "text-white" : "text-slate-900"
                                    }`}
                                  >
                                    {tool.name}
                                  </p>
                                  <p
                                    className={`text-[11px] truncate ${
                                      isSelected ? "text-indigo-100" : "text-slate-500"
                                    }`}
                                  >
                                    {tool.shortDescription}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {tool.categoryLabel}
                                </span>
                                <ArrowRight
                                  className={`h-3.5 w-3.5 ${
                                    isSelected ? "text-white" : "text-slate-400"
                                  }`}
                                />
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="py-4 text-center px-3">
                    <p className="text-xs font-semibold text-slate-700">
                      No tools found matching &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Try typing &quot;json&quot;, &quot;image&quot;, &quot;pdf&quot;, or &quot;gpa&quot;.
                    </p>
                  </div>
                )}
              </div>
            )}

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
                    onClick={() => onSearchChange(isSelected ? "" : term)}
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
