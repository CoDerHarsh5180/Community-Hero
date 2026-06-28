import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/authHelper";
export default async function DashboardIndexPage() {
  // Instantly bounces anyone who visits /dashboard to the map
  const user = await getSessionUser()
  if(!user) redirect('/signin')
  redirect("/dashboard/map");
}