"use client";

import { useEffect, useState } from "react";
import { reportBoundaryError } from "@/lib/error-monitoring";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    reportBoundaryError("global-error-boundary", error);
  }, [error]);

  const handleReload = () => {
    if (retryCount >= 2) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      return;
    }
    setRetryCount((prev) => prev + 1);
    reset();
  };

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 font-sans text-zinc-100 antialiased">
        <main className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20">
            <span className="text-xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">
            Application Error
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            An unexpected error interrupted the application. Your local browser files
            and inputs remain completely private on your device.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleReload}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 cursor-pointer transition-colors"
            >
              {retryCount >= 2 ? "Go to Homepage" : "Reload View"}
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-750 hover:text-white transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
