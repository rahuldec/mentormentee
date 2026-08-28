import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  revalidateTag("roster", { expire: 0 });
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
