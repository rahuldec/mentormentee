import { unstable_cache } from "next/cache";
import type { StudentProfile } from "./types";

const ENTITY_ID = process.env.ERP_ENTITY_ID;
const API_TOKEN = process.env.ERP_API_TOKEN;
const API_URL = "https://others-api.odpay.in/api/list/student";

// First-year courses/streams covering all three source streams (Commerce, BSc+BCA, BA).
// Scoped to Sem 1 for now — this mirrors the "First Year 2026-27" mentor roster.
const FIRST_YEAR_COURSES = [
  "Bachelor of Commerce (General)",
  "Bachelor of Commerce (Self Finance)",
  "Bachelor of Vocation in Banking and Financial Services",
  "Bachelor of Business Administration",
  "Bachelor of Arts",
  "Bachelor of Science (Non Medical) (Self Finance)",
  "Bachelor of Science (Non Medical) (General)",
  "Bachelor of Science (Medical)",
  "Bachelor of Science (Electronics)",
  "Bachelor of Science (Computer Science)",
  "Bachelor of Computer Application",
];

type ErpStudent = {
  regNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  course: string;
  stream: string;
  section: string;
  batch: string;
  dob: string | null;
  address: string;
  photo: string | null;
};

function toProfile(s: ErpStudent): StudentProfile {
  return {
    regNo: s.regNo,
    name: s.name,
    fatherName: s.fatherName,
    motherName: s.motherName,
    phone: s.phone,
    email: s.email,
    course: s.course,
    stream: s.stream,
    section: s.section,
    batch: s.batch,
    dob: s.dob,
    address: s.address,
    photo: s.photo ?? null,
  };
}

async function fetchAllStudentsUncached(): Promise<StudentProfile[]> {
  if (!ENTITY_ID || !API_TOKEN) {
    throw new Error("ERP_ENTITY_ID or ERP_API_TOKEN is not set");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      entity: ENTITY_ID,
      session: "2026-27 Odd",
      course: FIRST_YEAR_COURSES,
      stream: FIRST_YEAR_COURSES,
      section: ["all"],
      batch: ["Sem 1"],
      pageNumber: 1,
      pageSize: 2000,
      doaStartDate: null,
      doaEndDate: null,
    }),
    // Raw ERP payload is several MB (well over Next's 2MB fetch-cache limit),
    // so caching happens below on the trimmed StudentProfile[] instead.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`ERP student list request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data: ErpStudent[]; count: number };
  return json.data.map(toProfile);
}

const fetchAllStudents = unstable_cache(fetchAllStudentsUncached, ["erp-students"], {
  revalidate: 900,
  tags: ["erp-students"],
});

export async function getStudentByRollNo(rollNo: string): Promise<StudentProfile | null> {
  const students = await fetchAllStudents();
  return students.find((s) => s.regNo === rollNo) ?? null;
}
