import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, MessageSquare, Wrench } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { AdSlot } from "@/components/ads";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact & Feedback — Report Issues or Suggest Tools",
  description:
    "Contact information, bug reporting guidelines, and tool feedback details for the OneToolHub online utility platform.",
  pathname: "/contact",
});

export default function ContactPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <Badge variant="primary">Support &amp; Feedback</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Contact &amp; Feedback
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            We welcome tool suggestions, usability feedback, accessibility
            reports, and bug reports for OneToolHub&apos;s eight browser-based
            utilities.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Tool Suggestions &amp; Bug Reports
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Found a formatting edge case or have a suggestion for an
                existing calculator, formatter, or PDF utility? When reporting
                an issue, please include your browser version, device type, and
                steps to reproduce (without sharing sensitive personal files).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                No Server-Side Contact Form Collection
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                OneToolHub currently operates without a backend database or
                server-side form submission endpoint. No personal messages or
                contact form entries are collected or stored on this page.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm leading-relaxed text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <AlertCircle
                className="h-4 w-4 shrink-0 text-indigo-600"
                aria-hidden="true"
              />
              <h2 className="text-base">Direct Contact Information</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed sm:text-sm text-slate-600">
              For tool suggestions, bug reports, partnership inquiries, or general support, you can reach the OneToolHub team directly:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs sm:text-sm text-slate-800">
              <li>
                <strong>Support &amp; Inquiries:</strong>{" "}
                <a
                  href="mailto:contact@onetoolhub.com"
                  className="font-semibold text-indigo-600 underline hover:text-indigo-700"
                >
                  contact@onetoolhub.com
                </a>
              </li>
              <li>
                <strong>Platform Operator:</strong> OneToolHub
              </li>
              <li>
                <strong>Response Time:</strong> We strive to respond to verified inquiries within 24–48 business hours.
              </li>
            </ul>
          </div>

          {/* Optional Informational Page Bottom Ad Placement */}
          <AdSlot slotId="informational_page_bottom" format="horizontal" />

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Return to Homepage
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Browse All 8 Tools
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
