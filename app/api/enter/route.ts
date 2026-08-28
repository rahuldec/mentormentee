import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveMentorFromMobile } from "@/lib/auth";
import { createSession } from "@/lib/session";

// Cookies can only be set from a Route Handler or Server Action, not from a
// page's render — this route exists purely so app/page.tsx can redirect here
// to legally set the session cookie, then bounce back to a clean "/".
export async function GET(request: NextRequest) {
  const mobile = request.nextUrl.searchParams.get("mobile");

  if (mobile) {
    const resolved = await resolveMentorFromMobile(mobile).catch(() => null);
    if (resolved) {
      await createSession(resolved);
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
