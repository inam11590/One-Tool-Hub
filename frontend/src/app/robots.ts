import type { MetadataRoute } from "next";
import { getSiteOrigin, isPreviewDeployment } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/growth"],
    },
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
