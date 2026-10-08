import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";
import { TOOLS_REGISTRY } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/tools", "/about", "/contact", "/privacy", "/terms"];
  const availableToolRoutes = TOOLS_REGISTRY.filter(
    (tool) => tool.status === "available" && tool.href
  ).map((tool) => tool.href!);

  const allRoutes = [...staticRoutes, ...availableToolRoutes];
  const lastModified = new Date("2025-03-01T00:00:00.000Z");

  return allRoutes.map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified,
    changeFrequency:
      route === "/" || route.startsWith("/tools") ? "weekly" : "monthly",
    priority: route === "/" ? 1.0 : route.startsWith("/tools/") ? 0.9 : 0.8,
  }));
}
