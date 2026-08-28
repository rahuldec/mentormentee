import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminEntry(props: PageProps<"/admin">) {
  const session = await getSession();
  if (session?.isAdmin) redirect("/");

  const params = await props.searchParams;
  const mobile = typeof params.mobile === "string" ? params.mobile : undefined;
  const denied = params.denied === "1";

  if (mobile && !denied) {
    redirect(`/api/admin-enter?mobile=${encodeURIComponent(mobile)}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="text-lg font-semibold text-foreground">Admin Access</h1>
      <p className="mt-2 text-sm text-muted">
        {denied
          ? "That mobile number isn't set up for admin access."
          : "Open this link with your mobile number to sign in as admin, e.g. /admin?mobile=9999999999."}
      </p>
    </div>
  );
}
