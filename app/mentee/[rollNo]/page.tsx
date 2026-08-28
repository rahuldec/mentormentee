import Link from "next/link";
import { redirect } from "next/navigation";
import { getRoster } from "@/lib/sheets";
import { getStudentByRollNo, getExaminationsForStudent, getAttendanceForStudent } from "@/lib/erp";
import { getSession } from "@/lib/session";
import { ContactCard } from "@/components/ContactCard";

export default async function MenteePage({
  params,
}: {
  params: Promise<{ rollNo: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { rollNo } = await params;

  const roster = await getRoster().catch(() => []);
  const menteeRow = roster.find((r) => r.rollNo === rollNo);

  const isMyMentee = session.isAdmin || menteeRow?.mentorName === session.mentorName;

  const [profile, examinations, attendance] = isMyMentee
    ? await Promise.all([
        getStudentByRollNo(rollNo).catch(() => null),
        getExaminationsForStudent(rollNo).catch(() => []),
        getAttendanceForStudent(rollNo).catch(() => null),
      ])
    : [null, [], null];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to roster
      </Link>

      {!isMyMentee ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          This mentee isn&apos;t assigned to you.
        </div>
      ) : !menteeRow && !profile ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No record found for roll number {rollNo}.
        </div>
      ) : (
        <ContactCard
          rollNo={rollNo}
          mentorName={menteeRow?.mentorName}
          profile={profile}
          examinations={examinations}
          attendance={attendance}
        />
      )}
    </div>
  );
}
