"use client";

import { useMemo, useState } from "react";
import { filterTools, TOOLS_REGISTRY } from "@/lib/tools";
import type { ToolCategoryId } from "@/types/tools";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedTools } from "@/components/home/FeaturedTools";

export function HomeClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategoryId | "all"
  >("all");

  const filteredTools = useMemo(
    () => filterTools(TOOLS_REGISTRY, searchQuery, selectedCategory),
    [searchQuery, selectedCategory]
  );

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <>
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalToolsCount={TOOLS_REGISTRY.length}
        filteredToolsCount={filteredTools.length}
      />
      <CategoryGrid
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <FeaturedTools
        tools={filteredTools}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onResetFilters={handleResetFilters}
      />
    </>
  );
}
