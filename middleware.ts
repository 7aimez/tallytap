import { NextRequest, NextResponse } from "next/server";
import { authCookie, verifyJwt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(authCookie.name)?.value;
  const payload = token ? await verifyJwt(token) : null;

  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/businesses");

  if (!payload) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/businesses/:path*"],
};
