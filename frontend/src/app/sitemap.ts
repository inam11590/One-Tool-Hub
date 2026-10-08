import type { MetadataRoute } from "next";
import { SITE_CONFIG, TOOLS_REGISTRY } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tools", "/about", "/contact", "/privacy", "/terms"];
  const availableToolRoutes = TOOLS_REGISTRY.filter(
    (tool) => tool.status === "available" && tool.href
  ).map((tool) => tool.href!);

  const allRoutes = [...staticRoutes, ...availableToolRoutes];
  const lastModified = new Date();

  return allRoutes.map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified,
    changeFrequency: route === "" || route.startsWith("/tools") ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route.startsWith("/tools/") ? 0.9 : 0.8,
  }));
}
