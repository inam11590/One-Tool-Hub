import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Starter terms of use for browsing and using the OneToolHub platform.",
};

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="primary">Platform Guidelines</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Terms of Use (Starter)
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            These starter terms describe the general conditions for accessing
            the OneToolHub platform during its foundational release.
          </p>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10 text-sm leading-relaxed text-slate-600 sm:text-base">
            <section aria-labelledby="preview-scope-heading">
              <h2
                id="preview-scope-heading"
                className="text-lg font-bold text-slate-900"
              >
                1. Platform Scope &amp; Preview Status
              </h2>
              <p className="mt-2">
                OneToolHub is currently provided as a foundational preview of
                upcoming online utilities. Tools listed in the catalog are
                marked <strong>Coming Soon</strong> while their interactive
                implementations are under active development.
              </p>
            </section>

            <section aria-labelledby="as-is-heading">
              <h2
                id="as-is-heading"
                className="text-lg font-bold text-slate-900"
              >
                2. &ldquo;As-Is&rdquo; Provision &amp; Verification
              </h2>
              <p className="mt-2">
                The site and its informational content are provided on an
                &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. When
                interactive calculators, formatters, and document tools become
                available, users should independently verify critical academic,
                financial, or technical outputs before relying on them for
                formal submissions or production systems.
              </p>
            </section>

            <section aria-labelledby="acceptable-use-heading">
              <h2
                id="acceptable-use-heading"
                className="text-lg font-bold text-slate-900"
              >
                3. Responsible Use
              </h2>
              <p className="mt-2">
                Users agree not to misuse the platform, attempt unauthorized
                access, or interfere with the normal operation and availability
                of the website.
              </p>
            </section>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
