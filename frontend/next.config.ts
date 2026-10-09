import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Production security headers for OneToolHub.
 * - Allows 'self', data:, and blob: for images/media created locally via Canvas, QRCode, and PDF Blob URLs.
 * - Allows https://www.googletagmanager.com and https://*.google-analytics.com ONLY for optional, consent-gated GA4 when configured.
 * - Uses 'unsafe-inline' for script-src/style-src to support Next.js static App Router RSC hydration payloads and JSON-LD scripts without requiring dynamic per-request middleware rendering.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com https://tpc.googlesyndication.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://*.google.com https://*.doubleclick.net",
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.doubleclick.net",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://www.google.com",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const isVercelPreview =
  (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? "")
    .trim()
    .toLowerCase() === "preview";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  ...(isVercelPreview
    ? [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
