import { getSessionUser } from "@/lib/authHelper";
import { connectDB } from "@/lib/db";
import AuthorityAccess from "@/models/AuthorityAccess";
import { UserCircle, ShieldCheck, Mail, Building2, Layers } from "lucide-react";
import User from "@/models/User";
export default async function AuthorityProfilePage() {
  const user = await getSessionUser();
  await connectDB();
  
  // Fetch their specific access record instantly on the server
  const accessRecord = await AuthorityAccess.findOne({ userId: user?.id });
  const categories = accessRecord?.assignedCategories || [];
  const authority = await User.findById(user?.id)
  if(!authority){
    return <>Some Error Occurred!!</>
  }
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full -z-10" />
        
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-md flex items-center justify-center text-slate-400 shrink-0">
          <UserCircle className="w-12 h-12" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{authority.name}</h1>
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">@{authority.username}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-slate-400" />
              {authority.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-slate-400" />
              {user?.department || "Municipal Official"}
            </div>
          </div>
        </div>
      </div>

      {/* Jurisdiction / Access Control View */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Jurisdiction</h2>
            <p className="text-xs text-slate-500">Categories you are authorized to manage.</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-medium text-center">
            No specific categories assigned. Please contact the system administrator.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((category: string) => (
              <span 
                key={category} 
                className="px-4 py-2 bg-slate-50 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}