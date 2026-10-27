import { NextResponse } from "next/server";

/**
 * Health check endpoint. Also serves as the working example of the
 * route-handler convention described in `app/AGENTS.md`:
 * typed response, no internal error leakage, no business logic.
 *
 * Note: route segment config (`dynamic`, `revalidate`, `fetchCache`) is not
 * allowed here — `next.config.ts` sets `cacheComponents: true`.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
