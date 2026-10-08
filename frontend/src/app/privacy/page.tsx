import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "Transparent starter privacy notice explaining how OneToolHub currently operates.",
};

export default function PrivacyPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="primary">Transparency &amp; Data Handling</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Notice (Starter)
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            This notice explains accurately how OneToolHub handles information
            in its current foundational version, without making false legal
            claims or unverifiable guarantees.
          </p>

          <div className="mt-10 space-y-8 border-t border-slate-200 pt-10 text-sm leading-relaxed text-slate-600 sm:text-base">
            <section aria-labelledby="current-data-heading">
              <h2
                id="current-data-heading"
                className="text-lg font-bold text-slate-900"
              >
                1. Local Browser Processing (Current Tools)
              </h2>
              <p className="mt-2">
                All currently available tools on OneToolHub (JSON Formatter,
                Image Compressor, QR Code Generator, Word Counter, and YouTube
                Timestamp Formatter) execute locally in your web browser. Your
                JSON text, uploaded images, QR inputs, essays, and timestamps
                are processed in browser memory and are not uploaded to or
                stored on OneToolHub servers. User accounts, payment processing,
                and database storage are not yet active.
              </p>
            </section>

            <section aria-labelledby="hosting-logs-heading">
              <h2
                id="hosting-logs-heading"
                className="text-lg font-bold text-slate-900"
              >
                2. Standard Web Server &amp; Hosting Logs
              </h2>
              <p className="mt-2">
                When you access any website, the hosting provider or web server
                typically processes standard technical request metadata—such as
                IP address, browser user-agent, requested page path, and
                timestamp—to deliver web pages and maintain service reliability.
              </p>
            </section>

            <section aria-labelledby="future-tools-heading">
              <h2
                id="future-tools-heading"
                className="text-lg font-bold text-slate-900"
              >
                3. Future Interactive Tools &amp; Backend Services
              </h2>
              <p className="mt-2">
                As individual tools and optional backend features (such as
                FastAPI document processing or PostgreSQL account storage) are
                introduced in future phases, this Privacy Notice will be updated
                before launch to specify clearly which tools execute entirely in
                the browser and which tools transmit data to a server for
                processing.
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
