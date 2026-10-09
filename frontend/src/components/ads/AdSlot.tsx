"use client";

import React, { useEffect, useRef } from "react";
import type { AdSlotConfig } from "@/types/ads";
import { useAds } from "./AdProvider";
import { AdContainer } from "./AdContainer";
import { isAllowedAdSlot } from "@/lib/ads";

interface AdSlotProps extends AdSlotConfig {
  showDisclosure?: boolean;
}

/**
 * Responsive Google AdSense placement slot.
 *
 * Safety Guarantees:
 * 1. Returns null if advertising is not active, not configured, or not consented.
 * 2. Never generates fake ads or mock sponsor banners.
 * 3. Never loads over tool action buttons, inputs, or download controls.
 * 4. Pushes to window.adsbygoogle safely after mounting.
 */
export function AdSlot({
  slotId,
  adUnitId,
  format = "auto",
  responsive = true,
  className = "",
  showDisclosure = true,
}: AdSlotProps) {
  const { canRenderAds, clientId } = useAds();
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!canRenderAds || !clientId || pushedRef.current) {
      return;
    }

    try {
      if (typeof window !== "undefined" && adRef.current) {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Failed to push AdSense ad unit:", err);
      }
    }
  }, [canRenderAds, clientId]);

  // Reject unauthorized slots or unconsented/disabled states completely
  if (!canRenderAds || !clientId || !isAllowedAdSlot(slotId)) {
    return null;
  }

  return (
    <AdContainer className={className} showDisclosure={showDisclosure}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={adUnitId || undefined}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        data-ad-test={process.env.NODE_ENV !== "production" ? "on" : undefined}
      />
    </AdContainer>
  );
}
