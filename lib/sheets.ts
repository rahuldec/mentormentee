import type { MenteeRow, MentorContact } from "./types";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ROSTER_GID = process.env.GOOGLE_SHEET_ROSTER_GID ?? "0";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

// Different colleges' roster sheets don't share a column layout (some have
// no Subject column at all, or a different order), so columns are matched
// by header name rather than fixed position.
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const HEADER_ALIASES = {
  mentor: ["nameofmentor", "mentorname", "mentor"],
  subject: ["subject"],
  srNo: ["srno", "sno"],
  rollNo: ["collegerollno", "studentrollno", "rollno", "rollnumber"],
  mobile: ["mobilenumber", "loginmobile", "mentormobile", "mobile"],
};

function findColumnIndex(headerRow: string[], aliases: string[]): number {
  const normalized = headerRow.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

function toRosterRows(csvRows: string[][]): MenteeRow[] {
  const [headerRow, ...dataRows] = csvRows;
  if (!headerRow) return [];

  const col = {
    mentor: findColumnIndex(headerRow, HEADER_ALIASES.mentor),
    subject: findColumnIndex(headerRow, HEADER_ALIASES.subject),
    srNo: findColumnIndex(headerRow, HEADER_ALIASES.srNo),
    rollNo: findColumnIndex(headerRow, HEADER_ALIASES.rollNo),
    mobile: findColumnIndex(headerRow, HEADER_ALIASES.mobile),
  };

  if (col.mentor === -1 || col.rollNo === -1) {
    throw new Error(
      "Roster sheet is missing a mentor-name or roll-number column (checked common header names)"
    );
  }

  const result: MenteeRow[] = [];
  let currentMentor = "";
  let currentSubject = "";
  let currentMentorMobile = "";

  for (const cells of dataRows) {
    const mentorCell = cells[col.mentor];
    const subjectCell = col.subject !== -1 ? cells[col.subject] : undefined;
    const srNoCell = col.srNo !== -1 ? cells[col.srNo] : undefined;
    const rollNoCell = cells[col.rollNo];
    const mobileCell = col.mobile !== -1 ? cells[col.mobile] : undefined;

    if (mentorCell?.trim()) {
      currentMentor = mentorCell.trim();
      currentMentorMobile = ""; // a new mentor block starts fresh, even if their mobile cell is blank
    }
    if (subjectCell?.trim()) currentSubject = subjectCell.trim();
    if (mobileCell?.trim()) currentMentorMobile = mobileCell.trim();

    const rollNo = rollNoCell?.trim() ?? "";
    if (!rollNo || !currentMentor) continue;

    result.push({
      mentorName: currentMentor,
      subject: currentSubject,
      srNo: Number(srNoCell) || 0,
      rollNo,
      mentorMobile: currentMentorMobile || undefined,
    });
  }

  return result;
}

export async function getRoster(): Promise<MenteeRow[]> {
  if (!SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID is not set");
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${ROSTER_GID}`;
  const res = await fetch(url, {
    next: { revalidate: 300, tags: ["roster"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch roster sheet: ${res.status} ${res.statusText}`);
  }

  const csvText = await res.text();
  return toRosterRows(parseCsv(csvText));
}

export async function getMentors(): Promise<MentorContact[]> {
  const rows = await getRoster();
  const byName = new Map<string, string>();
  for (const r of rows) {
    if (r.mentorMobile && !byName.has(r.mentorName)) {
      byName.set(r.mentorName, r.mentorMobile);
    }
  }
  return Array.from(byName, ([name, mobile]) => ({ name, mobile }));
}
