import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { shortCode: string } },
) {
  const shortCode = params.shortCode;
  if (!/^[0-9a-zA-Z]{6}$/.test(shortCode)) {
    return new NextResponse("Not Found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT original_url FROM urls WHERE short_code = ${shortCode} LIMIT 1
    ` as Array<{ original_url: string }>;

    if (rows.length === 0) {
      return new NextResponse("Not Found", { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    await sql`
      UPDATE urls
      SET click_count = click_count + 1, last_clicked_at = NOW()
      WHERE short_code = ${shortCode}
    `;

    return NextResponse.redirect(rows[0].original_url, {
      status: 307,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Redirect error:", error);
    return new NextResponse("Internal Server Error", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
