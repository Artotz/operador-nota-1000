import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createSession, hasValidCredentials, sessionCookieOptions } from "@/app/lib/auth";

export async function POST(request: Request) {
  let credentials: { login?: unknown; password?: unknown };

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ message: "Dados de acesso inválidos." }, { status: 400 });
  }

  if (
    typeof credentials.login !== "string" ||
    typeof credentials.password !== "string" ||
    credentials.login.length > 200 ||
    credentials.password.length > 200
  ) {
    return NextResponse.json({ message: "Dados de acesso inválidos." }, { status: 400 });
  }

  if (!(await hasValidCredentials(credentials.login, credentials.password))) {
    return NextResponse.json({ message: "Login ou senha inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, await createSession(), sessionCookieOptions());
  return response;
}
