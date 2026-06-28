import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/authHelper";
import { connectDB } from "@/lib/db";
import AuthorityAccess from "@/models/AuthorityAccess";
import AuthorityShell from "./AuthorityShell";
import { Clock, ShieldAlert } from "lucide-react";

export default async function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  // 1. Must be logged in and hold the Authority role
  if (!user || user.role !== "AUTHORITY") {
    redirect("/signin"); 
  }

  await connectDB();
  
  // 2. Fetch their specific access record
  const accessRecord = await AuthorityAccess.findOne({ userId: user.id });

  // 3. The "Pending/Rejected" Lock Screen
  if (!accessRecord || accessRecord.approvalStatus !== "APPROVED") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Access Pending</h1>
          <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
            Your official account is currently awaiting verification from a system administrator. You will be granted access to the municipal grid once your credentials are confirmed.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 py-3 rounded-xl">
            <ShieldAlert className="w-4 h-4" />
            STATUS: {accessRecord?.approvalStatus || "NOT APPLICABLE"}
          </div>
        </div>
      </div>
    );
  }

  // 4. If approved, render the interactive shell
  return <AuthorityShell user={user}>{children}</AuthorityShell>;
}