import { NextResponse } from "next/server";
import {
  getConfiguredAdSenseClientId,
  buildAdsTxtRecord,
} from "@/lib/ads";

export const dynamic = "force-dynamic";

/**
 * Serves the official Authorized Digital Sellers (ads.txt) file at /ads.txt.
 *
 * Strict Guarantees:
 * 1. NEVER publishes a placeholder, fake, or invented publisher ID.
 * 2. If NEXT_PUBLIC_ADSENSE_CLIENT_ID is unset or invalid, returns a 404 with clear status,
 *    preventing ad verification scrapers from flagging fake seller records.
 * 3. Once configured by the publisher with an authentic ca-pub-XXXXXXXXXXXXXXXX ID,
 *    dynamically serves the standard Google AdSense authorized seller record:
 *    google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 */
export async function GET() {
  const clientId = getConfiguredAdSenseClientId();
  const record = buildAdsTxtRecord(clientId);

  if (!record) {
    return new NextResponse(
      `# OneToolHub Authorized Digital Sellers (ads.txt)
# Status: Unconfigured (Pending Google AdSense Approval)
#
# Notice: No active Google AdSense publisher ID is currently configured for this domain.
# To activate ads.txt, configure NEXT_PUBLIC_ADSENSE_CLIENT_ID with your verified AdSense account ID.
# Learn more: https://support.google.com/adsense/answer/7532444
`,
      {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const content = `# OneToolHub Authorized Digital Sellers (ads.txt)
# Domain: onetoolhub-sooty.vercel.app
${record}
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
