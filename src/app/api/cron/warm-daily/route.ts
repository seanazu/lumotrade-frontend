import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/warm-daily
 *
 * Intended to be called by a scheduler (e.g. Vercel Cron / Cloud Scheduler)
 * shortly after pre-market opens.
 *
 * This warms DB-cached endpoints so the UI reads from our DB all day.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret") || "";

  if (cronSecret && provided !== cronSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const origin = request.nextUrl.origin;

  const targets = [
    {
      name: "trading-opportunities",
      url: `${origin}/api/trading/opportunities?refresh=1`,
    },
  ];

  const results: Array<{
    name: string;
    ok: boolean;
    status: number;
    ms: number;
  }> = [];

  for (const t of targets) {
    const start = Date.now();
    try {
      const res = await fetch(t.url, { cache: "no-store" });
      results.push({
        name: t.name,
        ok: res.ok,
        status: res.status,
        ms: Date.now() - start,
      });
    } catch {
      results.push({
        name: t.name,
        ok: false,
        status: 0,
        ms: Date.now() - start,
      });
    }
  }

  const ok = results.every((r) => r.ok);

  return NextResponse.json(
    {
      success: ok,
      warmedAt: new Date().toISOString(),
      results,
    },
    { status: ok ? 200 : 207 }
  );
}

