"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle, Play, AlertTriangle, Loader2, MapPin } from "lucide-react";

export default function AuthorityFeedPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJurisdictionIssues();
  }, []);

  const fetchJurisdictionIssues = async () => {
    setIsLoading(true);
    try {
      // 🚀 The backend automatically filters this based on their assignedCategories!
      const res = await fetch("/api/issue");
      const data = await res.json();
      
      let rawIssues = Array.isArray(data) ? data : data.issues || [];
      // Sort by severity (highest first) so officials see critical threats immediately
      rawIssues.sort((a: any, b: any) => (Number(b.aiSeverity) || 0) - (Number(a.aiSeverity) || 0));
      
      setIssues(rawIssues);
    } catch (error) {
      console.error("Failed to load official feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    setUpdatingId(issueId);
    try {
      const res = await fetch(`/api/issue/${issueId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setIssues((prev) => 
        prev.map((issue) => 
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Scanning jurisdiction grid...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active Jurisdiction Feed</h1>
        <p className="text-sm text-slate-500">Respond to community reports routed to your department.</p>
      </div>

      <div className="grid gap-4">
        {issues.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grid is Clear</h3>
            <p className="text-sm text-slate-500 mt-1">No active incidents reported in your assigned categories.</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div key={issue._id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-5 flex flex-col sm:flex-row gap-5">
              
              {/* Image Thumbnail */}
              <div className="w-full sm:w-40 h-32 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 relative">
                {issue.mediaUrl && issue.mediaUrl.length > 0 ? (
                  <img src={issue.mediaUrl[0]} alt="Issue" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                {Number(issue.aiSeverity) >= 4 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                    CRITICAL
                  </div>
                )}
              </div>

              {/* Details & Actions */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{issue.category}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {issue.addressText}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                    issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    issue.status === 'VERIFIED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-400'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 flex-1">
                  {issue.description}
                </p>

                {/* Status Action Buttons */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap gap-2">
                  {issue.status === 'REPORTED' && (
                    <button 
                      disabled={updatingId === issue._id}
                      onClick={() => handleStatusUpdate(issue._id, 'VERIFIED')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {updatingId === issue._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                      Verify Issue
                    </button>
                  )}
                  {issue.status === 'VERIFIED' && (
                    <button 
                      disabled={updatingId === issue._id}
                      onClick={() => handleStatusUpdate(issue._id, 'IN_PROGRESS')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {updatingId === issue._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Start Work
                    </button>
                  )}
                  {issue.status === 'IN_PROGRESS' && (
                    <button 
                      disabled={updatingId === issue._id}
                      onClick={() => handleStatusUpdate(issue._id, 'RESOLVED')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {updatingId === issue._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Mark Resolved
                    </button>
                  )}
                  {issue.status === 'RESOLVED' && (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 px-2 py-2">
                      <CheckCircle className="w-4 h-4" /> Incident Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}