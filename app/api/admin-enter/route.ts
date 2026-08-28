import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSession } from "@/lib/session";

// Cookies can only be set from a Route Handler/Server Action, not a page's
// render — this exists so app/admin/page.tsx can redirect here to legally
// set the session, then bounce back to the roster.
//
// No check here by design: anyone who reaches /admin gets full admin
// visibility across all mentors' mentees, no mobile number required.
export async function GET(request: NextRequest) {
  await createSession({ mentorName: "Admin", isAdmin: true });
  return NextResponse.redirect(new URL("/", request.url));
}
