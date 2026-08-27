export type MenteeRow = {
  mentorName: string;
  subject: string;
  srNo: number;
  rollNo: string;
};

export type StudentProfile = {
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
