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

type ErpRemark = {
  date?: string;
  remark?: string;
  remarkType?: string;
  fileUrl?: string;
};

// The ERP returns dozens of fields per student; only the ones we surface are
// typed here. Anything else (internal ids, sync metadata, fee bookkeeping) is
// intentionally left out of the mapped profile.
type ErpStudent = {
  regNo: string;
  applicationNumber?: string;
  name: string;
  gender?: string;
  dob: string | null;
  category?: string;
  religion?: string;
  nationality?: string;
  socialCategory?: string;

  fatherName: string;
  motherName: string;
  fatherAnnualIncome?: string;

  phone: string;
  email: string;
  address: string;
  state?: string;
  country?: string;
  pinCode?: string;

  course: string;
  admissionCourse?: string;
  stream: string;
  batch: string;
  section: string;
  termGroup?: { name?: string };
  doa?: string;
  session?: string;
  status?: boolean;

  photo: string | null;
  photoThumbnail?: string;

  lastLoginAt?: string;
  lastActiveAt?: string;

  educationDetails1School?: string;
  educationDetails1University?: string;
  educationDetails1RollNo?: string;
  educationDetails1MaxMarks?: string;
  educationDetails1ObtainedMarks?: string;
  educationDetails1PassingYear?: string;
  educationDetails1Result?: string;

  educationDetails2Class?: string;
  educationDetails2MaxMarks?: string;
  educationDetails2ObtainedMarks?: string;
  educationDetails2PassingYear?: string;
  educationDetails2RollNo?: string;
  educationDetails2University?: string;

  remarkList?: ErpRemark[];
};

function clean(v?: string | null): string | null {
  const trimmed = v?.trim();
  return trimmed ? trimmed : null;
}

function toProfile(s: ErpStudent): StudentProfile {
  return {
    regNo: s.regNo,
    applicationNumber: clean(s.applicationNumber),
    name: s.name,
    gender: clean(s.gender),
    dob: s.dob,
    category: clean(s.category),
    religion: clean(s.religion),
    nationality: clean(s.nationality),
    socialCategory: clean(s.socialCategory),

    fatherName: s.fatherName,
    motherName: s.motherName,
    fatherAnnualIncome: clean(s.fatherAnnualIncome),

    phone: s.phone,
    email: s.email,
    address: s.address,
    state: clean(s.state),
    country: clean(s.country),
    pinCode: clean(s.pinCode),

    course: s.course,
    admissionCourse: clean(s.admissionCourse),
    stream: s.stream,
    batch: s.batch,
    section: s.section,
    term: clean(s.termGroup?.name),
    doa: s.doa ?? null,
    session: clean(s.session),
    status: s.status ?? null,

    photo: s.photo ?? null,
    photoThumbnail: clean(s.photoThumbnail),

    lastLoginAt: s.lastLoginAt ?? null,
    lastActiveAt: s.lastActiveAt ?? null,

    education10: {
      school: clean(s.educationDetails1School),
      board: clean(s.educationDetails1University),
      rollNo: clean(s.educationDetails1RollNo),
      maxMarks: clean(s.educationDetails1MaxMarks),
      obtainedMarks: clean(s.educationDetails1ObtainedMarks),
      passingYear: clean(s.educationDetails1PassingYear),
      result: clean(s.educationDetails1Result),
    },
    education12: {
      stream: clean(s.educationDetails2Class),
      maxMarks: clean(s.educationDetails2MaxMarks),
      obtainedMarks: clean(s.educationDetails2ObtainedMarks),
      passingYear: clean(s.educationDetails2PassingYear),
      rollNo: clean(s.educationDetails2RollNo),
      board: clean(s.educationDetails2University),
    },

    remarks: (s.remarkList ?? []).map((r) => ({
      date: r.date ?? null,
      remark: clean(r.remark) ?? "",
      remarkType: clean(r.remarkType) ?? "",
      fileUrl: clean(r.fileUrl),
    })),
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

const fetchAllStudents = unstable_cache(fetchAllStudentsUncached, ["erp-students-v2"], {
  revalidate: 900,
  tags: ["erp-students-v2"],
});

export async function getStudentByRollNo(rollNo: string): Promise<StudentProfile | null> {
  const students = await fetchAllStudents();
  return students.find((s) => s.regNo === rollNo) ?? null;
}
