import React from "react";

interface AdDisclosureProps {
  className?: string;
}

/**
 * Standard, policy-compliant ad label required by Google AdSense policies.
 * Clearly identifies commercial placement without misleading visitors.
 */
export function AdDisclosure({ className = "" }: AdDisclosureProps) {
  return (
    <div
      className={`text-center font-mono text-[10px] uppercase tracking-wider text-slate-400 select-none pb-1 ${className}`}
      aria-hidden="true"
    >
      Advertisement
    </div>
  );
}
