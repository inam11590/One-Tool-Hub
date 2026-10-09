"use client";

import React from "react";
import { useAds } from "./AdProvider";
import { AdDisclosure } from "./AdDisclosure";

interface AdContainerProps {
  children: React.ReactNode;
  className?: string;
  showDisclosure?: boolean;
}

/**
 * Visual wrapper for advertising slots.
 * CRITICAL RULE: If advertising is disabled or consent is not granted,
 * this component returns null, ensuring zero empty containers, zero layout shift,
 * and zero user interface pollution.
 */
export function AdContainer({
  children,
  className = "",
  showDisclosure = true,
}: AdContainerProps) {
  const { canRenderAds } = useAds();

  if (!canRenderAds) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-center transition-all ${className}`}
    >
      {showDisclosure ? <AdDisclosure /> : null}
      <div className="flex items-center justify-center min-h-[90px]">
        {children}
      </div>
    </aside>
  );
}
