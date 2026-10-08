"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import {
  classifyErrorCategory,
  getFriendlyBoundaryErrorMessage,
  reportBoundaryError,
} from "@/lib/error-monitoring";

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const category = classifyErrorCategory(error, "runtime_boundary_error");
  const friendlyMessage = getFriendlyBoundaryErrorMessage(category);

  useEffect(() => {
    reportBoundaryError("app-error-boundary", error);
  }, [error]);

  return (
    <div className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-600/20">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="mt-4 flex justify-center">
            <Badge variant="neutral">Category: {category}</Badge>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Something went wrong in this view
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {friendlyMessage}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
