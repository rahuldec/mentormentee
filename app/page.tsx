import { redirect } from "next/navigation";
import { getRoster } from "@/lib/sheets";
import { getAllStudents } from "@/lib/erp";
import { getSession } from "@/lib/session";
import { RosterExplorer } from "@/components/RosterExplorer";
import { RefreshButton } from "@/components/RefreshButton";
import { StatCard } from "@/components/StatCard";
import type { MenteeRow } from "@/lib/types";

export default async function Home(props: PageProps<"/">) {
  const session = await getSession();

  if (!session) {
    const params = await props.searchParams;
    const mobile = typeof params.mobile === "string" ? params.mobile : undefined;

    // Cookies can only be set from a Route Handler/Server Action, not a
    // page's render, so hand off to one that does the lookup + sets the
    // session, then bounces back here.
    if (mobile) {
      redirect(`/api/enter?mobile=${encodeURIComponent(mobile)}`);
    }

    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <h1 className="text-lg font-semibold text-foreground">Access unavailable</h1>
        <p className="mt-2 text-sm text-muted">
          Open this from the Okie Dokie app to see your mentees. If you got here another way,
          the link may be missing your mobile number, or you may not be set up as a mentor yet —
          contact the admin.
        </p>
      </div>
    );
  }

  let rows: MenteeRow[] = [];
  let error: string | null = null;

  try {
    rows = await getRoster();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load roster";
  }

  if (!session.isAdmin) {
    rows = rows.filter((r) => r.mentorName === session.mentorName);
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {session.isAdmin ? "Roster" : "My Mentees"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Search mentees by name or roll number{session.isAdmin ? ", filter by mentor." : "."}
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
