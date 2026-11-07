import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT short_code, original_url, click_count, last_clicked_at, created_at
      FROM urls ORDER BY created_at DESC LIMIT 100
    `;
    return NextResponse.json({ urls: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
