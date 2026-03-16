import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return NextResponse.next();
  }

  if (!token && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};