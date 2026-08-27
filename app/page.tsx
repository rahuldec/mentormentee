import { getRoster } from "@/lib/sheets";
import { RosterExplorer } from "@/components/RosterExplorer";
import { RefreshButton } from "@/components/RefreshButton";

export default async function Home() {
  let rows;
  let error: string | null = null;

  try {
    rows = await getRoster();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load roster";
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Mentor Mentee</h1>
          <p className="text-sm text-zinc-500">Roster lookup — search mentees by roll number.</p>
        </div>
        <RefreshButton />
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load the roster: {error}
        </div>
      ) : (
        <RosterExplorer rows={rows ?? []} />
      )}
    </div>
  );
}
