"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MenteeRow } from "@/lib/types";

const PAGE_SIZE = 25;

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs)\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function RosterExplorer({ rows }: { rows: MenteeRow[] }) {
  const [query, setQuery] = useState("");
  const [mentor, setMentor] = useState("all");
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateMentor(value: string) {
    setMentor(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by roll no."
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={mentor}
          onChange={(e) => updateMentor(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent sm:max-w-xs"
        >
          <option value="all">All mentors</option>
          {mentors.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted sm:ml-auto">
          {filtered.length} of {rows.length} mentees
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Roll No.</th>
                <th className="px-4 py-2.5 font-medium">Mentor</th>
                <th className="px-4 py-2.5 font-medium">Subject</th>
                <th className="px-4 py-2.5 font-medium">Sr No.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.map((r) => (
                <tr key={r.rollNo} className="hover:bg-background">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/mentee/${r.rollNo}`}
                      className="font-mono text-accent hover:underline"
                    >
                      {r.rollNo}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
                        {initials(r.mentorName)}
                      </span>
                      <span className="text-foreground">{r.mentorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{r.subject}</td>
                  <td className="px-4 py-2.5 text-muted">{r.srNo}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    No mentees match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-sm">
            <span className="text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border px-2.5 py-1 text-foreground hover:bg-background disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border px-2.5 py-1 text-foreground hover:bg-background disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
