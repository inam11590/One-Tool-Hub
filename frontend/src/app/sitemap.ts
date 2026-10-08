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

  const articleRoutes = LEARN_ARTICLES.map(
    (article) => `/learn/${article.slug}`
  );

  const allRoutes = [...staticRoutes, ...availableToolRoutes, ...articleRoutes];
  const lastModified = new Date("2026-10-08T00:00:00.000Z");

  return allRoutes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified,
    changeFrequency:
      route === "/" ||
      route === "/tools" ||
      route === "/learn" ||
      route.startsWith("/tools/")
        ? "weekly"
        : "monthly",
    priority:
      route === "/"
        ? 1.0
        : route.startsWith("/tools/") || route === "/learn"
          ? 0.9
          : route.startsWith("/learn/")
            ? 0.85
            : 0.8,
  }));
}
