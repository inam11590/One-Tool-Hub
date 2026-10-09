import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/tools";
import { getGoogleSiteVerificationToken } from "@/lib/seo";
import { AnalyticsAndConsentManager } from "@/components/analytics/AnalyticsAndConsentManager";
import { AdProvider } from "@/components/ads";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

const googleSiteVerification = getGoogleSiteVerificationToken();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
  },
  other: {
    "google-adsense-account": "ca-pub-7928844199781621",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-white text-slate-900 antialiased selection:bg-indigo-600 selection:text-white`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold text-white shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <AdProvider>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <Suspense fallback={null}>
            <AnalyticsAndConsentManager />
          </Suspense>
        </AdProvider>
      </body>
    </html>
  );
}

