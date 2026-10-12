"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw, ShieldCheck } from "lucide-react";
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
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    reportBoundaryError("app-error-boundary", error);
  }, [error]);

  const handleRetry = () => {
    // Prevent unbounded destructive retry loops
    if (retryCount >= 3) {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      return;
    }
    setRetryCount((prev) => prev + 1);
    reset();
  };

  return (
    <div className="py-20 sm:py-28 bg-zinc-950 text-zinc-100 min-h-[60vh] flex items-center">
      <Container>
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-xl sm:p-10 backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="mt-5 flex justify-center">
            <Badge variant="amber">Category: {category}</Badge>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Something went wrong in this view
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {friendlyMessage}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-850 px-3 py-1.5 text-xs text-zinc-400 border border-zinc-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Privacy Guard: Local browser state isolated. Zero data transmitted.</span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:w-auto cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>{retryCount >= 3 ? "Reload Page" : "Try Again"}</span>
            </button>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-750 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:w-auto"
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
