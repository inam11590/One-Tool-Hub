import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "neutral" | "amber" | "emerald";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary:
    "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
  neutral:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/15",
  amber:
    "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/25",
  emerald:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
