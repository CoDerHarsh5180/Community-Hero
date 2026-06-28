"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Map, List, PlusCircle, Trophy, User as UserIcon, 
  Coins, Moon, Sun, ShieldAlert, ShieldCheck 
} from "lucide-react"; // 🚀 Added Shield Icons here
import { useLocationStore } from "@/app/store/useLocationStore";
import { useTheme } from "next-themes";
import { useUserStore } from "@/app/store/useUserStore";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLocation = useLocationStore((state) => state.fetchLocation);
  const fetchUser = useUserStore(state => state.fetchUser);
  
  useEffect(() => {
    fetchLocation();
    fetchUser();
  }, [fetchLocation, fetchUser]);
  
  const { user } = useUserStore();
  const { setTheme, theme } = useTheme();
  
  if (!mounted) {
    return <div></div>;
  }

  const navItems = [
    { name: "Map", href: "/dashboard/map", icon: Map },
    { name: "Feed", href: "/dashboard/feed", icon: List },
    { name: "Rank", href: "/dashboard/rank", icon: Trophy },
    { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Community Hero
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <div 
            className="w-8 h-8 p-1 rounded-md bg-amber-600 flex items-center justify-center cursor-pointer" 
            onClick={() => setTheme((prev) => prev === 'light' ? 'dark' : 'light')}
          >
            <span className="text-white font-bold text-lg">
              {theme === 'light' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm text-amber-700 dark:text-amber-400">
              {user?.communityPoints} 
            </span>
          </div>
        </div>
      </header>

      {/* 🚀 CIVILIAN MODE BANNER (Only visible to Admins & Authorities) */}
      {user?.role === 'ADMIN' && (
        <div className="bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2.5 border-b border-emerald-200 dark:border-emerald-800/50 flex justify-between items-center z-40">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Civilian View Active</span>
          <Link 
            href="/admin/issues" 
            className="flex items-center gap-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin Hub
          </Link>
        </div>
      )}

      {user?.role === 'AUTHORITY' && (
        <div className="bg-blue-100 dark:bg-blue-900/40 px-4 py-2.5 border-b border-blue-200 dark:border-blue-800/50 flex justify-between items-center z-40">
          <span className="text-xs font-bold text-blue-800 dark:text-blue-400">Civilian View Active</span>
          <Link 
            href="/authority/feed" 
            className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Hub
          </Link>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2 relative">
          
          <NavItem item={navItems[0]} currentPath={pathname} />
          <NavItem item={navItems[1]} currentPath={pathname} />

          {/* Center Floating Report Button */}
          <div className="relative -top-5 flex justify-center w-1/5">
            <Link href="/dashboard/report">
              <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-md transform transition duration-200 hover:scale-105 active:scale-95 ${
                pathname === "/dashboard/report" 
                  ? "bg-emerald-700 ring-4 ring-emerald-100 dark:ring-emerald-900/30" 
                  : "bg-emerald-600"
              }`}>
                <PlusCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </Link>
          </div>

          <NavItem item={navItems[2]} currentPath={pathname} />
          <NavItem item={navItems[3]} currentPath={pathname} />
          
        </div>
      </nav>
    </div>
  );
}

function NavItem({ item, currentPath }: { item: any, currentPath: string }) {
  const isActive = currentPath === item.href;
  const Icon = item.icon;

  return (
    <Link href={item.href} className="w-1/5 flex flex-col items-center justify-center gap-0.5 group">
      <div className={`p-1.5 rounded-xl transition-all duration-200 ${
        isActive ? "bg-emerald-100 dark:bg-emerald-900/30" : "group-hover:bg-slate-100 dark:group-hover:bg-zinc-800"
      }`}>
        <Icon 
          className={`w-5 h-5 transition-colors duration-200 ${
            isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
          }`} 
        />
      </div>
      <span className={`text-[10px] font-bold transition-colors duration-200 ${
        isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
      }`}>
        {item.name}
      </span>
    </Link>
  );
}