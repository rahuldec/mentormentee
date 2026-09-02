import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getRoster } from "@/lib/sheets";
import { addNote } from "@/lib/notes";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rollNo = typeof body?.rollNo === "string" ? body.rollNo.trim() : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!rollNo || !text) {
    return NextResponse.json({ error: "rollNo and text are required" }, { status: 400 });
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "Note is too long (max 1000 characters)" }, { status: 400 });
  }

  if (!session.isAdmin) {
    const roster = await getRoster().catch(() => []);
    const menteeRow = roster.find((r) => r.rollNo === rollNo);
    if (!menteeRow || menteeRow.mentorName !== session.mentorName) {
      return NextResponse.json({ error: "This mentee isn't assigned to you" }, { status: 403 });
    }
  }

  const note = await addNote(rollNo, session.mentorName, text);
  return NextResponse.json({ note });
}
