import Link from "next/link";
import { getRoster } from "@/lib/sheets";
import { getStudentByRollNo } from "@/lib/erp";
import { ContactCard } from "@/components/ContactCard";

export default async function MenteePage({
  params,
}: {
  params: Promise<{ rollNo: string }>;
}) {
  const { rollNo } = await params;

  const [roster, profile] = await Promise.all([
    getRoster().catch(() => []),
    getStudentByRollNo(rollNo).catch(() => null),
  ]);

  const menteeRow = roster.find((r) => r.rollNo === rollNo);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to roster
      </Link>

      {!menteeRow && !profile ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No record found for roll number {rollNo}.
        </div>
      ) : (
        <ContactCard rollNo={rollNo} mentorName={menteeRow?.mentorName} profile={profile} />
      )}
    </div>
  );
}
