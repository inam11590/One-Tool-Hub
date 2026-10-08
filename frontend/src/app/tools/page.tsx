import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";

export const metadata: Metadata = buildPageMetadata({
  title: "All Online Tools Directory — 8 Free Browser Utilities",
  description:
    "Browse and filter all 8 browser-based utilities on OneToolHub for students, freelancers, YouTubers, and developers, including JSON Formatter, PDF Merge & Split, Invoice Generator, and GPA Calculator.",
  pathname: "/tools",
});

export default function AllToolsPage() {
  return <ToolsDirectoryClient />;
}
