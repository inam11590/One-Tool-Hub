import { canSendAnalyticsEvents } from "./analytics.ts";

export type MetricName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";

export interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Standard Google Web Vitals Rating Thresholds.
 */
export function rateWebVital(name: MetricName, value: number): "good" | "needs-improvement" | "poor" {
  switch (name) {
    case "LCP":
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "INP":
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    case "CLS":
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "FCP":
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "TTFB":
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    default:
      return "good";
  }
}

/**
 * Privacy-safe reporter for Next.js Web Vitals.
 * Gated by user analytics consent. Strips user input, query parameters, and private URLs.
 */
export function reportWebVitalMetric(metric: WebVitalMetric) {
  if (typeof window === "undefined") return;

  // Strict consent check
  if (!canSendAnalyticsEvents()) return;

  // Construct anonymous, aggregated event payload
  const payload = {
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 100) / 100,
    metric_rating: metric.rating,
    metric_id: metric.id,
  };

  // Dispatch via window.gtag if GA4 is loaded
  if (typeof window.gtag === "function") {
    window.gtag("event", "web_vitals_measurement", payload);
  }
}
