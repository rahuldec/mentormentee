import type { ExaminationResult, StudentProfile } from "@/lib/types";

const IST = "Asia/Kolkata";

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: IST,
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return (
    d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: IST,
    }) + " IST"
  );
}

export function ContactCard({
  rollNo,
  mentorName,
  profile,
  examinations = [],
}: {
  rollNo: string;
  mentorName?: string;
  profile: StudentProfile | null;
  examinations?: ExaminationResult[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 border-b border-border bg-accent-soft px-6 py-6 sm:flex-row sm:items-center">
          {profile?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo}
              alt={profile.name}
              className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-accent text-2xl font-semibold text-white shadow-sm">
              {(profile?.name ?? "?").slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {profile?.name ?? "Unknown student"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted">
              <span className="font-mono">{rollNo}</span>
              {profile?.course && (
                <>
                  <span aria-hidden>·</span>
                  <span>{profile.course}</span>
                </>
              )}
              {profile?.section && <Badge>Section {profile.section}</Badge>}
              {profile?.status !== null && profile?.status !== undefined && (
                <Badge tone={profile.status ? "success" : "neutral"}>
                  {profile.status ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
            {mentorName && (
              <div className="mt-2 text-sm text-foreground">
                <span className="text-muted">Mentor: </span>
                {mentorName}
              </div>
            )}
          </div>
        </div>

        {!profile && (
          <p className="px-6 py-4 text-sm text-muted">
            No ERP record found for this roll number — showing roster data only.
          </p>
        )}

        {profile && (
          <>
            {examinations.length > 0 && (
              <div className="border-b-2 border-accent bg-accent-soft px-6 py-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Examinations
                </h2>
                <div className="overflow-x-auto rounded-md bg-surface">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">Subject</th>
                        <th className="px-3 py-2 font-medium">Examination</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Marks</th>
                        <th className="px-3 py-2 font-medium">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {examinations.map((e, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-foreground">{e.subjectName}</td>
                          <td className="px-3 py-2 text-foreground">{e.topicName}</td>
                          <td className="px-3 py-2 text-muted">{formatDate(e.testDate) ?? "—"}</td>
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {e.obtainedMarks} / {e.totalMarks}
                            {!e.resultDeclared && (
                              <span className="ml-2 align-middle">
                                <Badge tone="neutral">Pending declaration</Badge>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 capitalize text-muted">
                            {e.attendance ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Section title="Contact">
              <Field label="Phone" value={profile.phone} href={`tel:${profile.phone}`} />
              <Field label="Email" value={profile.email} href={`mailto:${profile.email}`} />
              <Field label="Address" value={profile.address} span />
              <Field label="Pin Code" value={profile.pinCode} />
            </Section>

            <Section title="Personal">
              <Field label="Gender" value={profile.gender} />
              <Field label="Date of Birth" value={formatDate(profile.dob)} />
              <Field label="Category" value={profile.category} />
              <Field label="Social Category" value={profile.socialCategory} />
              <Field label="Religion" value={profile.religion} />
              <Field label="Nationality" value={profile.nationality} />
            </Section>

            <Section title="Family">
              <Field label="Father's Name" value={profile.fatherName} />
              <Field label="Mother's Name" value={profile.motherName} />
              <Field label="Father's Annual Income" value={profile.fatherAnnualIncome} />
            </Section>

            <Section title="Academic">
              <Field label="Course" value={profile.course} />
              <Field label="Admission Course" value={profile.admissionCourse} />
              <Field label="Stream" value={profile.stream} />
              <Field label="Batch" value={profile.batch} />
              <Field label="Section" value={profile.section} />
              <Field label="Term" value={profile.term} />
              <Field label="Session" value={profile.session} />
              <Field label="Application No." value={profile.applicationNumber} />
              <Field label="Date of Admission" value={formatDate(profile.doa)} />
            </Section>

            {(profile.education10.school || profile.education10.obtainedMarks) && (
              <Section title="Class X">
                <Field label="School" value={profile.education10.school} span />
                <Field label="Board" value={profile.education10.board} />
                <Field label="Roll No." value={profile.education10.rollNo} />
                <Field
                  label="Marks"
                  value={
                    profile.education10.obtainedMarks && profile.education10.maxMarks
                      ? `${profile.education10.obtainedMarks} / ${profile.education10.maxMarks}`
                      : null
                  }
                />
                <Field label="Passing Year" value={profile.education10.passingYear} />
                <Field label="Result" value={profile.education10.result} />
              </Section>
            )}

            {(profile.education12.stream || profile.education12.obtainedMarks) && (
              <Section title="Class XII">
                <Field label="Stream" value={profile.education12.stream} />
                <Field label="Board" value={profile.education12.board} />
                <Field label="Roll No." value={profile.education12.rollNo} />
                <Field
                  label="Marks"
                  value={
                    profile.education12.obtainedMarks && profile.education12.maxMarks
                      ? `${profile.education12.obtainedMarks} / ${profile.education12.maxMarks}`
                      : null
                  }
                />
                <Field label="Passing Year" value={profile.education12.passingYear} />
              </Section>
            )}

            {profile.remarks.length > 0 && (
              <Section title="Remarks">
                <div className="col-span-full flex flex-col gap-2">
                  {profile.remarks.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium capitalize text-foreground">
                          {r.remarkType || "Remark"}
                        </span>
                        {r.remark && <span className="text-muted"> — {r.remark}</span>}
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
                        {formatDate(r.date)}
                        {r.fileUrl && (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(profile.lastLoginAt || profile.lastActiveAt) && (
              <Section title="App Activity">
                <Field label="Last Login" value={formatDateTime(profile.lastLoginAt)} />
                <Field label="Last Active" value={formatDateTime(profile.lastActiveAt)} />
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border px-6 py-5 last:border-b-0">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">{title}</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">{children}</dl>
    </div>
  );
}

function Badge({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "success" | "neutral";
}) {
  const toneClass =
    tone === "success"
      ? "bg-green-100 text-green-800"
      : tone === "neutral"
        ? "bg-slate-200 text-slate-700"
        : "bg-white text-accent";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  href,
  span,
}: {
  label: string;
  value?: string | null;
  href?: string;
  span?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={span ? "sm:col-span-3" : undefined}>
      <dt className="text-xs uppercase tracking-wide text-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">
        {href ? (
          <a href={href} className="text-accent hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
