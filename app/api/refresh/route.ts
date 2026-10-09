import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();

  const tags = [
    "roster",
    "erp-students-v2",
    "subject-course-map",
    "exam-topics",
    "exam-marks",
    "attendance",
  ];
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}
