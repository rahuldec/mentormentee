import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

async function hasValidSession(token?: string): Promise<boolean> {
  if (!token || !encodedKey) return false;
  try {
    await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const isLoggedIn = await hasValidSession(request.cookies.get("session")?.value);
  const isSelfServeEntry =
    request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/admin";

  // "/" and "/admin" handle their own auto-login (and their own "no access"
  // state when there's no mobile param either) — never redirect away from
  // them, or a plain visit with no session would redirect to itself in a loop.
  if (!isLoggedIn && !isSelfServeEntry) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|logo-.*\\.png).*)"],
};
