import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminMobile } from "@/lib/auth";
import { createSession } from "@/lib/session";

// Cookies can only be set from a Route Handler/Server Action, not a page's
// render — this exists so app/admin/page.tsx can redirect here to legally
// set the session, then bounce back to the roster.
export async function GET(request: NextRequest) {
  const mobile = request.nextUrl.searchParams.get("mobile");

  if (mobile && isAdminMobile(mobile)) {
    await createSession({ mentorName: "Admin", isAdmin: true });
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL("/admin?denied=1", request.url));
}
