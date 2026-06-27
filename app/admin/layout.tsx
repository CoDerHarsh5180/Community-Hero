import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/authHelper";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch the session directly on the server
  const user = await getSessionUser();

  // 2. THE BOUNCER: Kick them out if not authorized
  if (!user || (user.role !== "ADMIN" && user.role !== "AUTHORITY")) {
    redirect("/dashboard/feed"); 
  }

  // 3. Render the interactive client shell
  return <AdminShell user={user}>{children}</AdminShell>;
}