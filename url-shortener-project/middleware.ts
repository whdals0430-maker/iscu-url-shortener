import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (authorization?.startsWith("Basic ") && username && password) {
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(":");
      const suppliedUser = decoded.slice(0, separator);
      const suppliedPassword = decoded.slice(separator + 1);
      if (separator >= 0 && suppliedUser === username && suppliedPassword === password) {
        return NextResponse.next();
      }
    } catch {}
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="URL Shortener Admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/stats"],
};
