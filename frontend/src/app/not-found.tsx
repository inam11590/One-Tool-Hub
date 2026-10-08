import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description:
    "The page or utility route you requested could not be found on OneToolHub.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <Badge variant="amber">404 &bull; Page Not Found</Badge>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            The URL you requested does not exist or may have moved. Use the
            links below to return to the homepage or browse all 8 online tools.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Homepage</span>
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Browse All Tools Directory</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
