export const AUTH_COOKIE_NAME = "operador_nota_1000_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
};

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

function sessionSecret() {
  return process.env.AUTH_SECRET;
}

function credentialsAreConfigured() {
  return Boolean(process.env.AUTH_LOGIN && process.env.AUTH_PASSWORD && sessionSecret());
}

async function signingKey() {
  const secret = sessionSecret();
  if (!secret) throw new Error("AUTH_SECRET não está configurada.");

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string) {
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), new TextEncoder().encode(value));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

export async function hasValidCredentials(login: string, password: string) {
  if (!credentialsAreConfigured()) return false;

  const [provided, expected] = await Promise.all([
    digest(`${login}\u0000${password}`),
    digest(`${process.env.AUTH_LOGIN}\u0000${process.env.AUTH_PASSWORD}`),
  ]);
  return safeEqual(provided, expected);
}

export async function createSession() {
  const payload: SessionPayload = { exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${await sign(encodedPayload)}`;
}

export async function hasValidSession(session: string | undefined) {
  if (!session || !sessionSecret()) return false;

  const [encodedPayload, encodedSignature, ...extraParts] = session.split(".");
  if (!encodedPayload || !encodedSignature || extraParts.length > 0) return false;

  try {
    const signature = Uint8Array.from(base64UrlDecode(encodedSignature), (character) => character.charCodeAt(0));
    const isSignatureValid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      signature,
      new TextEncoder().encode(encodedPayload),
    );
    if (!isSignatureValid) return false;

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    return Number.isFinite(payload.exp) && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}
