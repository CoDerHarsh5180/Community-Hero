import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/authHelper";

export default async function RootPage() {
  // 1. Fetch the session directly on the server when they hit '/'
  const user = await getSessionUser();

  // 2. If the user is not logged in at all, send them to the landing/login screen
  if (!user) {
    redirect("/signin");
  }

  // 3. THE TRAFFIC CONTROLLER: Route them instantly based on their explicit role
  switch (user.role) {
    case "ADMIN":
      redirect("/admin/issues");
      break;
      
    case "AUTHORITY":
      redirect("/authority/feed");
      break;
      
    case "CITIZEN":
    default:
      redirect("/dashboard/feed");
      break;
  }

  // This fallback return statement keeps TypeScript happy, 
  // but next/navigation's redirect() terminates the request before reaching here.
  return null;
}