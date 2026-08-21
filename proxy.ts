import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, hasValidSession } from "@/app/lib/auth";

export async function proxy(request: NextRequest) {
  const isLoggedIn = await hasValidSession(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const { pathname, search } = request.nextUrl;

  if (pathname === "/login") {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (isLoggedIn) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
