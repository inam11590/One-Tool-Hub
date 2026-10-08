import type { MetadataRoute } from "next";
import { getSiteOrigin, getSiteUrlConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrlConfig = getSiteUrlConfig();
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV?.trim();
  const isStagingDeployment =
    vercelEnv === "preview" ||
    siteUrlConfig.origin.includes(".vercel.app") ||
    siteUrlConfig.origin.includes("://staging.");

  if (isStagingDeployment) {
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
      disallow: ["/api/"],
    },
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
