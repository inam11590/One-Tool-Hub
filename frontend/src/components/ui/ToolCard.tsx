import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { ToolItem } from "@/types/tools";
import { Badge } from "@/components/ui/Badge";
import { ToolIcon } from "@/components/ui/ToolIcon";

interface ToolCardProps {
  tool: ToolItem;
}

export function ToolCard({ tool }: ToolCardProps) {
  const isAvailable = tool.status === "available" && Boolean(tool.href);

  return (
    <article
      aria-label={`${tool.name} (${tool.categoryLabel}) - ${
        isAvailable ? "Available" : "Coming Soon"
      }`}
      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
            <ToolIcon
              name={tool.icon}
              className="h-5 w-5"
              aria-hidden="true"
            />
          </span>

          {isAvailable ? (
            <Badge variant="emerald">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              <span>Available</span>
            </Badge>
          ) : (
            <Badge variant="amber">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span>Coming Soon</span>
            </Badge>
          )}
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold text-indigo-600">
            {tool.categoryLabel}
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">
            {isAvailable && tool.href ? (
              <Link
                href={tool.href}
                className="rounded-xs transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {tool.name}
              </Link>
            ) : (
              tool.name
            )}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        {isAvailable && tool.href ? (
          <Link
            href={tool.href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span>Open Tool</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <div
            role="status"
            aria-label={`${tool.name} is coming soon and not yet interactive`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-500 select-none"
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <span>Coming Soon &bull; In Development</span>
          </div>
        )}
      </div>
    </article>
  );
}
