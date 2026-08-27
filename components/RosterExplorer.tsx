"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MenteeRow } from "@/lib/types";

export function RosterExplorer({ rows }: { rows: MenteeRow[] }) {
  const [query, setQuery] = useState("");
  const [mentor, setMentor] = useState("all");

  const mentors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.mentorName))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesMentor = mentor === "all" || r.mentorName === mentor;
      const matchesQuery = !q || r.rollNo.toLowerCase().includes(q);
      return matchesMentor && matchesQuery;
    });
  }, [rows, query, mentor]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by roll no."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 sm:max-w-xs"
        />
        <select
          value={mentor}
          onChange={(e) => setMentor(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 sm:max-w-xs"
        >
          <option value="all">All mentors</option>
          {mentors.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="text-sm text-zinc-500">
          {filtered.length} of {rows.length} mentees
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-3 py-2 font-medium">Roll No.</th>
              <th className="px-3 py-2 font-medium">Mentor</th>
              <th className="px-3 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Sr No.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((r) => (
              <tr key={r.rollNo}>
                <td className="px-3 py-2 font-mono">
                  <Link href={`/mentee/${r.rollNo}`} className="text-blue-600 hover:underline">
                    {r.rollNo}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.mentorName}</td>
                <td className="px-3 py-2">{r.subject}</td>
                <td className="px-3 py-2">{r.srNo}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-400">
                  No mentees match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
