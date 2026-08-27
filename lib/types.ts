export type MenteeRow = {
  mentorName: string;
  subject: string;
  srNo: number;
  rollNo: string;
};

export type Remark = {
  date: string | null;
  remark: string;
  remarkType: string;
  fileUrl: string | null;
};

export type StudentProfile = {
  regNo: string;
  applicationNumber: string | null;
  name: string;
  gender: string | null;
  dob: string | null;
  category: string | null;
  religion: string | null;
  nationality: string | null;
  socialCategory: string | null;

  fatherName: string;
  motherName: string;
  fatherAnnualIncome: string | null;

  phone: string;
  email: string;
  address: string;
  state: string | null;
  country: string | null;
  pinCode: string | null;

  course: string;
  admissionCourse: string | null;
  stream: string;
  batch: string;
  section: string;
  term: string | null;
  doa: string | null;
  session: string | null;
  status: boolean | null;

  photo: string | null;
  photoThumbnail: string | null;

  lastLoginAt: string | null;
  lastActiveAt: string | null;

  education10: {
    school: string | null;
    board: string | null;
    rollNo: string | null;
    maxMarks: string | null;
    obtainedMarks: string | null;
    passingYear: string | null;
    result: string | null;
  };
  education12: {
    stream: string | null;
    maxMarks: string | null;
    obtainedMarks: string | null;
    passingYear: string | null;
    rollNo: string | null;
    board: string | null;
  };

  remarks: Remark[];
};
