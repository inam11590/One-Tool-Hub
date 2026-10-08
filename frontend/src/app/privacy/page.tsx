import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy — Local Browser Processing & Data Handling",
  description:
    "Read how OneToolHub processes tool inputs locally in your browser, handles optional localStorage invoice drafts, and manages standard web hosting logs.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="primary">Transparency &amp; Data Handling</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            This Privacy Policy describes how OneToolHub handles information in
            its current release. This document is provided for operational
            transparency and does not constitute formal legal advice or claim
            regulatory certification without review by qualified counsel.
          </p>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10 text-sm leading-relaxed text-slate-600 sm:text-base">
            <section aria-labelledby="current-data-heading">
              <h2
                id="current-data-heading"
                className="text-lg font-bold text-slate-900"
              >
                1. Local Browser Processing Across All 8 Tools
              </h2>
              <p className="mt-2">
                All eight tools currently available on OneToolHub (JSON
                Formatter &amp; Validator, Image Compressor, QR Code Generator,
                Word Counter, YouTube Timestamp Formatter, GPA Calculator,
                Professional Invoice Generator, and PDF Merge &amp; Split)
                process your inputs locally inside your web browser. Your JSON
                payloads, uploaded images, QR text, essays, chapter timestamps,
                course grades, invoice details, and PDF files are processed in
                browser memory and are not uploaded to OneToolHub application
                servers.
              </p>
            </section>

            <section aria-labelledby="local-storage-heading">
              <h2
                id="local-storage-heading"
                className="text-lg font-bold text-slate-900"
              >
                2. Optional Local Browser Storage (Invoice Generator)
              </h2>
              <p className="mt-2">
                By default, OneToolHub does not persist your tool inputs after
                you close or refresh a browser tab. In the Professional Invoice
                Generator, you may optionally check the explicit consent box to
                save your draft invoice in your own browser&apos;s{" "}
                <code>localStorage</code>. That data remains on your device and
                is immediately deleted from <code>localStorage</code> if you
                uncheck the consent option.
              </p>
            </section>

            <section aria-labelledby="hosting-logs-heading">
              <h2
                id="hosting-logs-heading"
                className="text-lg font-bold text-slate-900"
              >
                3. Standard Web Server &amp; Hosting Logs
              </h2>
              <p className="mt-2">
                When you visit any web page on OneToolHub, the underlying web
                hosting infrastructure automatically receives standard HTTP
                request metadata—such as your IP address, browser user-agent,
                requested URL path, referrer header, and timestamp—necessary to
                deliver static assets and maintain network security.
              </p>
            </section>

            <section aria-labelledby="third-parties-heading">
              <h2
                id="third-parties-heading"
                className="text-lg font-bold text-slate-900"
              >
                4. Accounts, Payments, and Third-Party Analytics
              </h2>
              <p className="mt-2">
                OneToolHub does not currently include user account registration,
                payment processing, advertising networks, or third-party
                behavioral tracking scripts. If optional backend services or
                analytics are introduced in a future version, this Privacy
                Policy must be updated prior to enabling those features.
              </p>
            </section>

            <section aria-labelledby="operator-placeholder-heading">
              <h2
                id="operator-placeholder-heading"
                className="text-lg font-bold text-slate-900"
              >
                5. Data Controller &amp; Privacy Contact Placeholders
              </h2>
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950 sm:text-sm">
                <p className="font-semibold text-amber-900">
                  Owner Action Required Before Public Launch:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
                  <li>
                    Site Operator / Data Controller:{" "}
                    <span>[OWNER PLACEHOLDER: Insert legal name or entity]</span>
                  </li>
                  <li>
                    Privacy Contact Email:{" "}
                    <span>[OWNER PLACEHOLDER: Insert privacy contact email]</span>
                  </li>
                  <li>
                    Effective Date:{" "}
                    <span>[OWNER PLACEHOLDER: Insert production launch date]</span>
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
