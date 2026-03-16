import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

  if (email === "admin@globaltrustbank.org" && password === "admin123") {
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_token", "secureAdminToken", {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ success: false });
}