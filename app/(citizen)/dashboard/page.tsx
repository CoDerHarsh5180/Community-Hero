import { redirect } from "next/navigation";

export default function DashboardIndexPage() {
  // Instantly bounces anyone who visits /dashboard to the map
  redirect("/dashboard/map");
}