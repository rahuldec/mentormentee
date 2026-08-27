import { getRoster } from "@/lib/sheets";
import { getAllStudents } from "@/lib/erp";
import { RosterExplorer } from "@/components/RosterExplorer";
import { RefreshButton } from "@/components/RefreshButton";
import { StatCard } from "@/components/StatCard";
import type { MenteeRow } from "@/lib/types";

export default async function Home() {
  let rows: MenteeRow[] = [];
  let error: string | null = null;

  try {
    rows = await getRoster();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load roster";
  }

  // Student names live in the ERP, not the roster sheet. Join them in by
  // roll number; if the ERP call fails, the roster still renders without names.
  const students = await getAllStudents().catch(() => []);
  const namesByRollNo = new Map(students.map((s) => [s.regNo, s.name]));
  rows = rows.map((r) => ({ ...r, studentName: namesByRollNo.get(r.rollNo) }));

  const mentorCount = new Set(rows.map((r) => r.mentorName)).size;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Roster</h1>
          <p className="mt-1 text-sm text-muted">
            Search mentees by name or roll number, filter by mentor.
          </p>
        </div>
        <RefreshButton />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load the roster: {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Mentees" value={rows.length} />
            <StatCard label="Mentors" value={mentorCount} />
            <StatCard
              label="Avg. per mentor"
              value={mentorCount ? Math.round(rows.length / mentorCount) : 0}
            />
          </div>
          <RosterExplorer rows={rows} />
        </>
      )}
    </div>
  );
}
