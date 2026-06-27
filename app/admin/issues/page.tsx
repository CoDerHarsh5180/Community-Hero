"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2, Play } from "lucide-react";

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      // Assuming your standard GET route returns all issues when no GPS coordinates are provided
      const res = await fetch("/api/issue");
      const data = await res.json();
      
      let rawIssues = Array.isArray(data) ? data : data.issues || [];
      
      // 🚀 CRITICAL: Sort by AI Severity (Highest first) so admins see critical threats immediately
      rawIssues.sort((a: any, b: any) => (b.aiSeverity || 0) - (a.aiSeverity || 0));
      
      setIssues(rawIssues);
    } catch (error) {
      console.error("Failed to load admin issues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- THE GAMIFICATION TRIGGER ---
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

      // Optimistically update the UI so the admin doesn't have to refresh
      setIssues((prev) => 
        prev.map((issue) => 
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        )
      );

      // Show the admin how many points they just awarded the citizen!
      alert(`Success! ${data.message}`);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper for visual severity
  const getSeverityBadge = (severity: number) => {
    if (severity >= 4) return <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-xs font-black">LVL {severity} CRITICAL</span>;
    if (severity === 3) return <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md text-xs font-bold">LVL 3 MEDIUM</span>;
    return <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md text-xs font-bold">LVL {severity || 1} LOW</span>;
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Connecting to Grid Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active Infrastructure Triage</h1>
        <p className="text-sm text-slate-500">Sorted by AI-determined severity. Verify reports to dispatch teams and award citizen points.</p>
      </div>

      {/* The High-Density Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Visual</th>
                <th className="p-4">AI Classification</th>
                <th className="p-4">Location / Reporter</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No active issues in the grid.</td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    
                    {/* Thumbnail */}
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden border border-slate-200 dark:border-zinc-700">
                        {issue.mediaUrl && issue.mediaUrl.length > 0 ? (
                          <img src={issue.mediaUrl[0]} alt="Issue" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* AI Data */}
                    <td className="p-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{issue.aiCategory || issue.category}</span>
                        {getSeverityBadge(issue.aiSeverity)}
                      </div>
                      <p className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-zinc-800 inline-block px-2 py-0.5 rounded-md">
                        DEP: {issue.aiDepartment || "UNASSIGNED"}
                      </p>
                    </td>

                    {/* Context */}
                    <td className="p-4 space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[200px]">
                        {issue.addressText}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        BY: @{issue.user?.username || "anonymous"}
                      </p>
                    </td>

                    {/* Current Status */}
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                        issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        issue.status === 'VERIFIED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-400'
                      }`}>
                        {issue.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4">
                      {issue.status === 'REPORTED' && (
                        <button 
                          disabled={updatingId === issue._id}
                          onClick={() => handleStatusUpdate(issue._id, 'VERIFIED')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updatingId === issue._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          Verify
                        </button>
                      )}

                      {issue.status === 'VERIFIED' && (
                        <button 
                          disabled={updatingId === issue._id}
                          onClick={() => handleStatusUpdate(issue._id, 'IN_PROGRESS')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updatingId === issue._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          Start Work
                        </button>
                      )}

                      {issue.status === 'IN_PROGRESS' && (
                        <button 
                          disabled={updatingId === issue._id}
                          onClick={() => handleStatusUpdate(issue._id, 'RESOLVED')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updatingId === issue._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Resolve (+50 Pts) {/* 🚀 Text updated to match your backend */}
                        </button>
                      )}

                      {issue.status === 'RESOLVED' && (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Closed
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}