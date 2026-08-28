import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminEntry() {
  const session = await getSession();
  if (session?.isAdmin) redirect("/");

  redirect("/api/admin-enter");
}
