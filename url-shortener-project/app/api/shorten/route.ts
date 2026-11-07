import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isOwnServiceUrl, makeShortCode, parseHttpUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "올바른 JSON 요청이 아닙니다." }, { status: 400 });
  }

  const originalValue =
    body && typeof body === "object" && "originalUrl" in body
      ? (body as { originalUrl?: unknown }).originalUrl
      : undefined;

  if (typeof originalValue !== "string" || originalValue.trim() === "") {
    return NextResponse.json({ error: "MISSING_URL", code: "MISSING_URL", message: "originalUrl이 필요합니다." }, { status: 400 });
  }

  const parsed = parseHttpUrl(originalValue);
  if (!parsed) {
    return NextResponse.json({ error: "INVALID_URL", code: "INVALID_URL", message: "올바른 HTTP 또는 HTTPS URL을 입력해 주세요." }, { status: 400 });
  }

  if (isOwnServiceUrl(parsed, request.nextUrl.origin)) {
    return NextResponse.json({ error: "OWN_SERVICE_URL", code: "OWN_SERVICE_URL", message: "자기 서비스의 URL은 단축할 수 없습니다." }, { status: 400 });
  }

  const originalUrl = originalValue.trim();

  try {
    await ensureSchema();

    const existing = await sql`
      SELECT short_code FROM urls WHERE original_url = ${originalUrl} LIMIT 1
    ` as Array<{ short_code: string }>;

    if (existing.length > 0) {
      const shortCode = existing[0].short_code;
      const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || request.nextUrl.origin;
      return NextResponse.json({ shortCode, shortUrl: `${base}/${shortCode}`, originalUrl }, { status: 200 });
    }

    // shortCode 충돌 가능성에 대비해 제한적으로 재시도합니다.
    for (let attempt = 0; attempt < 5; attempt++) {
      const shortCode = makeShortCode(6);
      const inserted = await sql`
        INSERT INTO urls (short_code, original_url)
        VALUES (${shortCode}, ${originalUrl})
        ON CONFLICT (original_url) DO NOTHING
        RETURNING short_code
      ` as Array<{ short_code: string }>;

      if (inserted.length > 0) {
        const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || request.nextUrl.origin;
        return NextResponse.json({ shortCode, shortUrl: `${base}/${shortCode}`, originalUrl }, { status: 201 });
      }

      // 동시에 같은 URL을 요청한 경우 다른 요청이 먼저 저장했을 수 있습니다.
      const duplicate = await sql`
        SELECT short_code FROM urls WHERE original_url = ${originalUrl} LIMIT 1
      ` as Array<{ short_code: string }>;
      if (duplicate.length > 0) {
        const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || request.nextUrl.origin;
        return NextResponse.json({ shortCode: duplicate[0].short_code, shortUrl: `${base}/${duplicate[0].short_code}`, originalUrl }, { status: 200 });
      }
    }

    return NextResponse.json({ error: "CODE_GENERATION_FAILED" }, { status: 500 });
  } catch (error) {
    console.error("URL shorten error:", error);
    return NextResponse.json({ error: "SERVER_ERROR", message: "서버 내부 오류가 발생했습니다." }, { status: 500 });
  }
}
