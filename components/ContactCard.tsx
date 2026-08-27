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
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-4 border-b border-border bg-slate-50 px-6 py-5">
        {profile?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo}
            alt={profile.name}
            className="h-16 w-16 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">
            {(profile?.name ?? "?").slice(0, 1)}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {profile?.name ?? "Unknown student"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span className="font-mono">{rollNo}</span>
            {profile?.course && (
              <>
                <span aria-hidden>·</span>
                <span>{profile.course}</span>
              </>
            )}
            {profile?.section && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                Section {profile.section}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-6 py-5 text-sm sm:grid-cols-2">
        <Field label="Mentor" value={mentorName} />
        {profile && (
          <>
            <Field label="Phone" value={profile.phone} href={`tel:${profile.phone}`} />
            <Field label="Email" value={profile.email} href={`mailto:${profile.email}`} />
            <Field label="Father's Name" value={profile.fatherName} />
            <Field label="Mother's Name" value={profile.motherName} />
            <Field label="Address" value={profile.address} className="sm:col-span-2" />
          </>
        )}
      </div>

      {!profile && (
        <p className="border-t border-border px-6 py-4 text-sm text-muted">
          No ERP record found for this roll number — showing roster data only.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  href,
  className,
}: {
  label: string;
  value?: string | null;
  href?: string;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-foreground">
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
