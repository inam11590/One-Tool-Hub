import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/tools";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";

export const metadata: Metadata = {
  title: "All Online Tools Directory",
  description:
    "Browse all available and upcoming online utilities on OneToolHub for students, freelancers, YouTubers, and developers.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools`,
  },
  openGraph: {
    title: `All Online Tools Directory | ${SITE_CONFIG.name}`,
    description:
      "Browse all available and upcoming online utilities on OneToolHub for students, freelancers, YouTubers, and developers.",
    url: `${SITE_CONFIG.url}/tools`,
  },
};

export default function AllToolsPage() {
  return <ToolsDirectoryClient />;
}
