import "server-only";
import { getMentors } from "./sheets";

const ADMIN_MOBILES = (process.env.ADMIN_MOBILES ?? "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}

export async function resolveMentorFromMobile(
  mobile: string
): Promise<{ mentorName: string; isAdmin: boolean } | null> {
  const normalized = normalizeMobile(mobile);
  if (!normalized) return null;

  const isAdmin = ADMIN_MOBILES.some((m) => normalizeMobile(m) === normalized);

  const mentors = await getMentors();
  const match = mentors.find((m) => normalizeMobile(m.mobile) === normalized);

  if (!match && !isAdmin) return null;

  return { mentorName: match?.name ?? "Admin", isAdmin };
}
