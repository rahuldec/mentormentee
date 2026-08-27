import { unstable_cache } from "next/cache";
import type { AttendanceSummary, ExaminationResult, StudentProfile } from "./types";

const ENTITY_ID = process.env.ERP_ENTITY_ID;
const API_TOKEN = process.env.ERP_API_TOKEN;
const API_URL = "https://others-api.odpay.in/api/list/student";
const ACADEMIC_API_URL = "https://academic-api.odpay.in/api";
const SESSION = "2026-27 Odd";
const SESSION_START = "2026-07-01T00:00:00.000Z";

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

export async function getAllStudents(): Promise<StudentProfile[]> {
  return fetchAllStudents();
}

export async function getStudentByRollNo(rollNo: string): Promise<StudentProfile | null> {
  const students = await fetchAllStudents();
  return students.find((s) => s.regNo === rollNo) ?? null;
}

// --- Examinations (class tests) ---
//
// There's no single "get a student's marks" endpoint. The real UI drives
// three calls in sequence: a course->subjects map, a per-subject list of
// tests, then per-test student marks (unfiltered by declaration status —
// obtainedMarks is present on the record as soon as it's entered).

type RawSubject = {
  mode?: string;
  sendHomeWorkReport?: boolean;
  _id: string;
  subjectType?: string;
  name: string;
  code: string;
  assessmentModel?: string;
  employees?: unknown[];
  displayName?: string;
  sequenceNo?: number;
};

type CourseSubjectMapEntry = {
  course: string;
  stream: string;
  batch: string;
  section: string;
  subjects: RawSubject[];
};

type RawExamTopic = {
  topicName: string;
  studentCount: number;
  testDate: string | null;
  totalMarks: number;
  resultDeclared: boolean;
};

type RawStudentMarkRow = {
  studentRegNo: string;
  obtainedMarks?: number;
  attendance?: string;
};

function decodeTokenEmployeeId(token: string): string {
  const payload = token.split(".")[1];
  const json = Buffer.from(payload, "base64").toString("utf-8");
  return JSON.parse(json).employee;
}

async function fetchSubjectCourseMapUncached(): Promise<CourseSubjectMapEntry[]> {
  if (!ENTITY_ID || !API_TOKEN) {
    throw new Error("ERP_ENTITY_ID or ERP_API_TOKEN is not set");
  }

  const url = new URL(`${ACADEMIC_API_URL}/getCoursesByTeacher/subjectCourseMapping`);
  url.searchParams.set("entity", ENTITY_ID);
  url.searchParams.set("session", SESSION);
  url.searchParams.set("teacher", decodeTokenEmployeeId(API_TOKEN));
  url.searchParams.set("isAdmin", "true");
  url.searchParams.set("attendanceType", "lectureWise");

  const res = await fetch(url.toString(), {
    headers: { Authorization: API_TOKEN },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Subject map request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

const fetchSubjectCourseMap = unstable_cache(
  fetchSubjectCourseMapUncached,
  ["subject-course-map"],
  { revalidate: 3600, tags: ["subject-course-map"] }
);

async function fetchExamTopicsUncached(
  course: string,
  stream: string,
  batch: string,
  section: string,
  subject: RawSubject
): Promise<RawExamTopic[]> {
  const res = await fetch(`${ACADEMIC_API_URL}/getTopics/classTest`, {
    method: "POST",
    headers: { Authorization: API_TOKEN!, "Content-Type": "application/json" },
    body: JSON.stringify({ entity: ENTITY_ID, session: SESSION, course, stream, batch, section, subject }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Exam topics request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

const fetchExamTopics = unstable_cache(fetchExamTopicsUncached, ["exam-topics"], {
  revalidate: 900,
  tags: ["exam-topics"],
});

async function fetchExamMarksUncached(
  course: string,
  stream: string,
  batch: string,
  section: string,
  subject: RawSubject,
  topicName: string
): Promise<RawStudentMarkRow[]> {
  const res = await fetch(`${ACADEMIC_API_URL}/getStudents/classTest`, {
    method: "POST",
    headers: { Authorization: API_TOKEN!, "Content-Type": "application/json" },
    body: JSON.stringify({
      entity: ENTITY_ID,
      session: SESSION,
      course,
      stream,
      batch,
      section,
      subject,
      topicName,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Exam marks request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

const fetchExamMarks = unstable_cache(fetchExamMarksUncached, ["exam-marks"], {
  revalidate: 900,
  tags: ["exam-marks"],
});

export async function getExaminationsForStudent(rollNo: string): Promise<ExaminationResult[]> {
  const student = await getStudentByRollNo(rollNo);
  if (!student) return [];

  const map = await fetchSubjectCourseMap();
  const entry = map.find(
    (e) =>
      e.course === student.course &&
      e.stream === student.stream &&
      e.batch === student.batch &&
      e.section === student.section
  );
  if (!entry) return [];

  const perSubject = await Promise.all(
    entry.subjects.map(async (subject) => {
      const topics = await fetchExamTopics(
        entry.course,
        entry.stream,
        entry.batch,
        entry.section,
        subject
      ).catch(() => []);

      const perTopic = await Promise.all(
        topics.map(async (topic) => {
          const rows = await fetchExamMarks(
            entry.course,
            entry.stream,
            entry.batch,
            entry.section,
            subject,
            topic.topicName
          ).catch(() => []);

          const mine = rows.find((r) => r.studentRegNo === rollNo);
          if (!mine || mine.obtainedMarks === undefined) return null;

          const result: ExaminationResult = {
            subjectName: subject.name,
            topicName: topic.topicName,
            testDate: topic.testDate,
            totalMarks: topic.totalMarks,
            obtainedMarks: mine.obtainedMarks,
            attendance: mine.attendance ?? null,
            resultDeclared: topic.resultDeclared,
          };
          return result;
        })
      );

      return perTopic.filter((r): r is ExaminationResult => r !== null);
    })
  );

  return perSubject.flat();
}

// --- Attendance ---
//
// Unlike marks, this is a single call per class/section covering all
// subjects and a date range -- no per-test iteration needed.

type RawAttendanceRow = {
  regNo: string;
  subjectWise: {
    subjectName: string;
    subjectCode: string;
    lecture: number;
    present: number;
    absent: number;
    leave: number;
  }[];
  overAll: {
    totalLecture: number;
    totalPresent: number;
    totalAbsent: number;
    totalLeave: number;
    percentage: number;
  };
};

async function fetchAttendanceUncached(
  course: string,
  stream: string,
  batch: string,
  section: string,
  subjectCodes: string[]
): Promise<RawAttendanceRow[]> {
  const res = await fetch(`${ACADEMIC_API_URL}/studentWiseNotMarkedReport/studentAttendanceV3`, {
    method: "POST",
    headers: { Authorization: API_TOKEN!, "Content-Type": "application/json" },
    body: JSON.stringify({
      entity: ENTITY_ID,
      session: SESSION,
      course,
      stream,
      batch,
      section,
      subjects: subjectCodes,
      startDate: SESSION_START,
      endDate: new Date().toISOString(),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Attendance request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

const fetchAttendance = unstable_cache(fetchAttendanceUncached, ["attendance"], {
  revalidate: 900,
  tags: ["attendance"],
});

export async function getAttendanceForStudent(rollNo: string): Promise<AttendanceSummary | null> {
  const student = await getStudentByRollNo(rollNo);
  if (!student) return null;

  const map = await fetchSubjectCourseMap();
  const entry = map.find(
    (e) =>
      e.course === student.course &&
      e.stream === student.stream &&
      e.batch === student.batch &&
      e.section === student.section
  );
  if (!entry) return null;

  const subjectCodes = entry.subjects.map((s) => s.code);
  if (subjectCodes.length === 0) return null;

  const rows = await fetchAttendance(entry.course, entry.stream, entry.batch, entry.section, subjectCodes);
  const mine = rows.find((r) => r.regNo === rollNo);
  if (!mine) return null;

  return {
    subjects: mine.subjectWise.map((s) => ({
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      lecture: s.lecture,
      present: s.present,
      absent: s.absent,
      leave: s.leave,
    })),
    totalLecture: mine.overAll.totalLecture,
    totalPresent: mine.overAll.totalPresent,
    totalAbsent: mine.overAll.totalAbsent,
    totalLeave: mine.overAll.totalLeave,
    percentage: mine.overAll.percentage,
  };
}
