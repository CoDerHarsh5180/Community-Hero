"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, XCircle, Loader2, Mail, Building2, UserCircle } from "lucide-react";

export default function AuthoritiesApprovalPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      // Ensure this endpoint matches your GET route
      const res = await fetch("/api/admin/authorities");
      if (!res.ok) throw new Error("Failed to fetch pending authorities");
      const data = await res.json();
      setPendingUsers(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    setUpdatingId(userId);
    try {
      // 🚀 Hits your dynamic [id] route
      const res = await fetch(`/api/admin/authorities/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Instantly remove from UI after success
      setPendingUsers((prev) => prev.filter(user => user._id !== userId));
      alert(data.message);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Scanning security queue...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-500" />
          Access Control
        </h1>
        <p className="text-sm text-slate-500">Approve or reject municipal officials requesting authority access.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Official Detail</th>
                <th className="p-4">Department</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-medium italic">No pending access requests found.</td>
                </tr>
              ) : (
                pendingUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {user.department || "General Administration"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-medium">
                      {user.email}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        disabled={updatingId === user._id}
                        onClick={() => handleAction(user._id, 'REJECT')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {updatingId === user._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                      <button 
                        disabled={updatingId === user._id}
                        onClick={() => handleAction(user._id, 'APPROVE')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {updatingId === user._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        Approve
                      </button>
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