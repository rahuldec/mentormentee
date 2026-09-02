"use client";

import { useState } from "react";
import type { MenteeNote } from "@/lib/types";

const COLORS = [
  "bg-yellow-100 border-yellow-200",
  "bg-pink-100 border-pink-200",
  "bg-sky-100 border-sky-200",
  "bg-green-100 border-green-200",
  "bg-purple-100 border-purple-200",
];

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function NotesSection({ rollNo, initialNotes }: { rollNo: string; initialNotes: MenteeNote[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, text: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save the note.");
        return;
      }
      setNotes((prev) => [data.note, ...prev]);
      setText("");
    } catch {
      setError("Couldn't save the note. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-b-2 border-accent bg-accent-soft px-6 py-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent">
        <span className="h-2 w-2 rounded-full bg-accent" />
        Notes &amp; Sessions
      </h2>

      <div className="mb-4 flex flex-col gap-2 rounded-md bg-surface p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a quick note about this session…"
          rows={2}
          maxLength={1000}
          className="w-full resize-none rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="flex items-center justify-between">
          {error ? (
            <span className="text-xs text-red-600">{error}</span>
          ) : (
            <span className="text-xs text-muted">{text.length}/1000</span>
          )}
          <button
            onClick={handleAdd}
            disabled={saving || !text.trim()}
            className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add Note"}
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted">No notes yet — add the first one above.</p>
      ) : (
        <div className="flex flex-wrap gap-4 pb-1 pt-2">
          {notes.map((note, i) => (
            <div
              key={note.id}
              className={`w-full max-w-[220px] rounded-sm border px-4 py-3 shadow-sm transition-transform hover:rotate-0 hover:scale-105 sm:w-56 ${COLORS[i % COLORS.length]} ${ROTATIONS[i % ROTATIONS.length]}`}
            >
              <p className="whitespace-pre-wrap break-words text-sm text-zinc-800">{note.text}</p>
              <div className="mt-3 text-xs text-zinc-500">
                <div className="font-medium">{note.mentorName}</div>
                <div>{formatDate(note.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
