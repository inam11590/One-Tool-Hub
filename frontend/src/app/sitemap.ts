import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";
import { LEARN_ARTICLES } from "@/lib/learn";
import { TOOLS_REGISTRY } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/tools",
    "/learn",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];
  const availableToolRoutes = TOOLS_REGISTRY.filter(
    (tool) => tool.status === "available" && tool.href
  ).map((tool) => tool.href!);


  const defaultDate = new Date("2026-10-12T00:00:00.000Z");

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified: defaultDate,
    changeFrequency: route === "/" || route === "/tools" || route === "/learn" ? "weekly" : "monthly",
    priority: route === "/" ? 1.0 : route === "/tools" || route === "/learn" ? 0.9 : 0.8,
  }));

  const toolEntries: MetadataRoute.Sitemap = availableToolRoutes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified: defaultDate,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const articleEntries: MetadataRoute.Sitemap = LEARN_ARTICLES.map((article) => {
    let articleDate = defaultDate;
    try {
      if (article.updatedAt) {
        articleDate = new Date(`${article.updatedAt}T00:00:00.000Z`);
      }
    } catch {
      articleDate = defaultDate;
    }

    return {
      url: getAbsoluteUrl(`/learn/${article.slug}`),
      lastModified: articleDate,
      changeFrequency: "monthly",
      priority: 0.85,
    };
  });

  return [...staticEntries, ...toolEntries, ...articleEntries];
}
