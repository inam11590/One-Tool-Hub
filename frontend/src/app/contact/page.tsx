import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact information and feedback status for the OneToolHub platform.",
};

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
            We welcome tool suggestions, usability feedback, and bug reports as
            OneToolHub grows.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Tool Requests &amp; Ideas
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Have a specific calculator, converter, or formatter that would
                help your study, freelance, creator, or developer workflow?
                Feedback channels are being prepared for the upcoming public
                release.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-bold text-slate-900">
                Current Contact Availability
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                During Step 1 of platform setup, interactive contact forms and
                automated support ticketing are not yet connected to a backend
                service. No form inputs are collected or stored on this page.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-600">
            <h3 className="font-semibold text-slate-900">
              Note on Project Setup
            </h3>
            <p className="mt-1.5">
              This page provides transparent starter content without placeholder
              phone numbers, invented physical office addresses, or unmonitored
              email inboxes. Official contact endpoints will be configured when
              backend services are enabled.
            </p>
          </div>

          <div className="mt-8">
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
