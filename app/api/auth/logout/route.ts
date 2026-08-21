import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, sessionCookieOptions } from "@/app/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
