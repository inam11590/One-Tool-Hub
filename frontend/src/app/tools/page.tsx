import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";

export const metadata: Metadata = buildPageMetadata({
  title: "All Online Tools Directory — 31 Free Browser Utilities",
  description:
    "Browse and filter all 31 browser-based utilities on OneToolHub for students, freelancers, YouTubers, and developers, including image editing, PDF tools, JSON Formatter, Invoice Generator, and GPA Calculator.",
  pathname: "/tools",
});

export default function AllToolsPage() {
  return <ToolsDirectoryClient />;
}
