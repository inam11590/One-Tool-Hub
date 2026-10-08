import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

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
            The route you requested doesn&apos;t exist or may represent a
            utility that is still marked as Coming Soon.
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
              href="/#featured-tools"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Browse Tool Catalog</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
