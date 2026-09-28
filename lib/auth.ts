import "server-only";
import { getMentors, getAdminMobiles } from "./sheets";

const ENV_ADMIN_MOBILES = (process.env.ADMIN_MOBILES ?? "")
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

  const [mentors, sheetAdminMobiles] = await Promise.all([getMentors(), getAdminMobiles()]);

  const isAdmin =
    ENV_ADMIN_MOBILES.some((m) => normalizeMobile(m) === normalized) ||
    sheetAdminMobiles.some((m) => normalizeMobile(m) === normalized);

  const match = mentors.find((m) => normalizeMobile(m.mobile) === normalized);

  if (!match && !isAdmin) return null;

  return { mentorName: match?.name ?? "Admin", isAdmin };
}
