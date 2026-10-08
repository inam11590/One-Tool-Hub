"use client";

import { useEffect } from "react";
import { reportBoundaryError } from "@/lib/error-monitoring";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportBoundaryError("global-error-boundary", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 font-sans text-slate-900 antialiased">
        <main className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900">
            Application Error
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            An unexpected application error occurred. Your local browser files
            and inputs remain private on your device.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Reload View
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Go to Homepage
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
