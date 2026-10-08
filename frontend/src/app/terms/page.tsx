import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use — Platform Guidelines & Disclaimers",
  description:
    "Read the Terms of Use, acceptable use guidelines, and tool output verification disclaimers for OneToolHub's online utilities.",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="primary">Platform Guidelines</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            These Terms of Use govern access to OneToolHub and its eight
            browser-based online utilities. This template provides transparent
            operational terms and should be reviewed by qualified legal counsel
            prior to commercial or public launch.
          </p>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10 text-sm leading-relaxed text-slate-600 sm:text-base">
            <section aria-labelledby="scope-heading">
              <h2
                id="scope-heading"
                className="text-lg font-bold text-slate-900"
              >
                1. Scope of Services
              </h2>
              <p className="mt-2">
                OneToolHub provides client-side browser utilities for formatting
                JSON, compressing images, generating QR codes, counting words,
                formatting YouTube timestamps, calculating academic GPA,
                generating client invoice PDFs, and merging or splitting PDF
                documents. All tools are currently provided free of charge
                without requiring account registration.
              </p>
            </section>

            <section aria-labelledby="as-is-heading">
              <h2
                id="as-is-heading"
                className="text-lg font-bold text-slate-900"
              >
                2. &ldquo;As-Is&rdquo; Provision &amp; User Verification Responsibility
              </h2>
              <p className="mt-2">
                OneToolHub and all tool outputs are provided on an
                &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis without
                warranties of any kind. Users are solely responsible for
                verifying the accuracy and suitability of generated outputs:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-slate-600">
                <li>
                  <strong>GPA Calculator:</strong> Universities use varying
                  grading scales and transcript rounding policies. Official
                  institutional calculations may differ.
                </li>
                <li>
                  <strong>Invoice Generator:</strong> Users are solely
                  responsible for complying with local tax, VAT/GST, invoicing,
                  and accounting regulations.
                </li>
                <li>
                  <strong>PDF &amp; Image Utilities:</strong> Always retain
                  backups of original files before compressing images or merging
                  and splitting PDFs, as digital signatures or complex form
                  fields may not be preserved.
                </li>
              </ul>
            </section>

            <section aria-labelledby="acceptable-use-heading">
              <h2
                id="acceptable-use-heading"
                className="text-lg font-bold text-slate-900"
              >
                3. Acceptable Use
              </h2>
              <p className="mt-2">
                You agree not to misuse the platform, attempt to disrupt service
                availability, or use OneToolHub to generate deceptive, unlawful,
                or malicious content (such as phishing QR codes or fraudulent
                invoices).
              </p>
            </section>

            <section aria-labelledby="legal-placeholders-heading">
              <h2
                id="legal-placeholders-heading"
                className="text-lg font-bold text-slate-900"
              >
                4. Operator &amp; Governing Law Placeholders
              </h2>
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm">
                <p className="font-semibold text-amber-900">
                  Owner Action Required Before Public Launch:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
                  <li>
                    Operator / Legal Entity:{" "}
                    <span>[OWNER PLACEHOLDER: Insert operator or company name]</span>
                  </li>
                  <li>
                    Governing Law / Jurisdiction:{" "}
                    <span>[OWNER PLACEHOLDER: Insert governing country/state]</span>
                  </li>
                  <li>
                    Contact for Legal Notices:{" "}
                    <span>[OWNER PLACEHOLDER: Insert legal contact email/address]</span>
                  </li>
                </ul>
              </div>
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
