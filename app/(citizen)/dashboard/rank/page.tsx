import { Leaderboard } from "@/components/leaderboard";

export default function RankingsPage() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Leaderboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            The top contributors maintaining the infrastructure grid.
          </p>
        </div>
        
        <Leaderboard />
      </div>
    </div>
  );
}