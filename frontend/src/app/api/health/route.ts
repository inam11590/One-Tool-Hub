import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Lightweight production health check endpoint.
 *
 * Requirements:
 * - Return minimal public status (status: "ok", timestamp, uptime seconds, platform version).
 * - Avoid exposing environment variables, database credentials, or secret keys.
 * - Return HTTP 200 with appropriate Cache-Control headers (no-cache, no-store).
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "onetoolhub-web",
      version: "0.1.0",
      region: process.env.VERCEL_REGION || "edge",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/json",
      },
    }
  );
}
