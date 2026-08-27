import type { StudentProfile } from "@/lib/types";

export function ContactCard({
  rollNo,
  mentorName,
  profile,
}: {
  rollNo: string;
  mentorName?: string;
  profile: StudentProfile | null;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6">
      <div className="flex items-center gap-4">
        {profile?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo}
            alt={profile.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            ?
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {profile?.name ?? "Unknown student"}
          </h1>
          <p className="font-mono text-sm text-zinc-500">{rollNo}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <Field label="Mentor" value={mentorName} />
        {profile && (
          <>
            <Field label="Course" value={profile.course} />
            <Field label="Section" value={profile.section} />
            <Field label="Phone" value={profile.phone} />
            <Field label="Email" value={profile.email} />
            <Field label="Father's Name" value={profile.fatherName} />
            <Field label="Mother's Name" value={profile.motherName} />
            <Field label="Address" value={profile.address} className="sm:col-span-2" />
          </>
        )}
      </dl>

      {!profile && (
        <p className="text-sm text-zinc-400">
          No ERP record found for this roll number — showing roster data only.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="text-zinc-800">{value}</dd>
    </div>
  );
}
