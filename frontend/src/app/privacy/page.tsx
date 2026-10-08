import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { CookieSettingsButton } from "@/components/analytics/CookieSettingsButton";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy — Local Browser Processing, Consent & Data Handling",
  description:
    "Read how OneToolHub processes tool inputs locally in your browser, handles optional localStorage drafts, and manages optional consent-gated Google Analytics 4.",
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
            regulatory certification without review by qualified legal counsel
            in your target jurisdictions (including GDPR, UK GDPR, ePrivacy, and
            CCPA/CPRA).
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
                browser memory and are never uploaded to OneToolHub application
                servers.
              </p>
            </section>

            <section aria-labelledby="local-storage-heading">
              <h2
                id="local-storage-heading"
                className="text-lg font-bold text-slate-900"
              >
                2. Local Browser Storage (Invoice Drafts, Tool Feedback &amp;
                Consent Preferences)
              </h2>
              <p className="mt-2">
                By default, OneToolHub does not persist your tool inputs after
                you close or refresh a browser tab. Specific features use your
                browser&apos;s <code>localStorage</code> on your own device:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>
                  <strong>Optional Invoice Drafts:</strong> In the Professional
                  Invoice Generator, you may optionally check the explicit
                  consent box to save your draft invoice in{" "}
                  <code>localStorage</code> (
                  <code>onetoolhub_invoice_draft_v1</code>). Unchecking the box
                  immediately deletes the saved draft from your browser.
                </li>
                <li>
                  <strong>Local Tool Feedback Drafts:</strong> When you rate a
                  tool (&ldquo;Was this tool helpful?&rdquo;) or write an
                  optional suggestion, your feedback is saved locally in your
                  browser&apos;s <code>localStorage</code> (
                  <code>onetoolhub_tool_feedback_drafts_v1</code>) as a local
                  draft until a remote feedback API is connected. You can clear
                  local feedback drafts at any time directly inside the feedback
                  card.
                </li>
                <li>
                  <strong>Analytics Consent Record:</strong> Your choice to
                  accept or reject optional analytics is stored in{" "}
                  <code>localStorage</code> (
                  <code>onetoolhub_analytics_consent_v1</code>) so we remember
                  your preference across page loads.
                </li>
              </ul>
            </section>

            <section aria-labelledby="analytics-consent-heading">
              <h2
                id="analytics-consent-heading"
                className="text-lg font-bold text-slate-900"
              >
                3. Optional Google Analytics 4 &amp; Cookie Consent Controls
              </h2>
              <p className="mt-2">
                When configured by the site operator via{" "}
                <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code>, OneToolHub supports
                optional Google Analytics 4 (GA4) measurement to understand
                aggregate pageviews and anonymous tool usage events (such as{" "}
                <code>tool_open</code>, <code>tool_process_success</code>,{" "}
                <code>tool_process_error</code>, <code>tool_download</code>,{" "}
                <code>tool_copy</code>, and <code>tool_reset</code>).
              </p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>
                  <strong>Consent-Gated Loading:</strong> Google Analytics
                  scripts are <strong>not loaded</strong> before you explicitly
                  click <strong>&ldquo;Accept Optional Analytics&rdquo;</strong>{" "}
                  in the privacy consent banner or settings dialog.
                </li>
                <li>
                  <strong>Strict Privacy Sanitization:</strong> Anonymous tool
                  events only include safe metadata (<code>tool_slug</code>,{" "}
                  <code>tool_category</code>, <code>operation_type</code>, and
                  generic <code>error_category</code>). Filenames, JSON payloads,
                  invoice contents, PDF files, text inputs, and QR contents are
                  never transmitted to Google Analytics.
                </li>
                <li>
                  <strong>Withdrawing or Changing Consent:</strong> You can
                  change or withdraw your analytics consent at any time using
                  the button below or the{" "}
                  <strong>&ldquo;Privacy &amp; Cookie Settings&rdquo;</strong>{" "}
                  button in the website footer. Withdrawing consent sets the{" "}
                  <code>ga-disable-*</code> window flag, updates Google Consent
                  Mode to <code>denied</code>, and clears first-party{" "}
                  <code>_ga</code> cookies.
                </li>
              </ul>
              <div className="mt-4">
                <CookieSettingsButton className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" />
              </div>
            </section>

            <section aria-labelledby="hosting-logs-heading">
              <h2
                id="hosting-logs-heading"
                className="text-lg font-bold text-slate-900"
              >
                4. Standard Web Server &amp; Hosting Logs
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
                5. Accounts, Payments, and Advertising
              </h2>
              <p className="mt-2">
                OneToolHub does not currently include user account registration,
                paid subscriptions, payment processing, or advertising networks.
              </p>
            </section>

            <section aria-labelledby="operator-placeholder-heading">
              <h2
                id="operator-placeholder-heading"
                className="text-lg font-bold text-slate-900"
              >
                6. Data Controller &amp; Privacy Contact Placeholders
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
