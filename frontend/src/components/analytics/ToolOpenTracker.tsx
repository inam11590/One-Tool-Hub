"use client";

import { useEffect } from "react";
import {
  ANALYTICS_CONSENT_EVENT_NAME,
  trackToolEvent,
  type ValidToolSlug,
} from "@/lib/analytics";
import type { ToolCategoryId } from "@/types/tools";

interface ToolOpenTrackerProps {
  toolSlug: ValidToolSlug;
  toolCategory: ToolCategoryId;
}

export function ToolOpenTracker({
  toolSlug,
  toolCategory,
}: ToolOpenTrackerProps) {
  useEffect(() => {
    const fireOpen = () => {
      trackToolEvent("tool_open", {
        tool_slug: toolSlug,
        tool_category: toolCategory,
        operation_type: "view_workspace",
      });
    };

    fireOpen();
    window.addEventListener(ANALYTICS_CONSENT_EVENT_NAME, fireOpen);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT_NAME, fireOpen);
    };
  }, [toolSlug, toolCategory]);

  return null;
}
