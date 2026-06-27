"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Map, List, PlusCircle, Trophy, User as UserIcon, Coins, Moon, Sun } from "lucide-react";
import { useLocationStore } from "@/app/store/useLocationStore";
import { useTheme } from "next-themes";
import { useUserStore } from "@/app/store/useUserStore";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // 1. Create a mounted state
  const [mounted, setMounted] = useState(false);

  // 2. Set it to true the moment the component hits the browser
  useEffect(() => {
    setMounted(true);
  }, []);
  // Trigger global location tracking on app load
  const fetchLocation = useLocationStore((state) => state.fetchLocation);
  const fetchUser = useUserStore(state=>state.fetchUser)
  useEffect(() => {
    fetchLocation();
    fetchUser()
  }, [fetchLocation, fetchUser]);
  const {user} = useUserStore()
  const {setTheme, theme} = useTheme()
  if(!mounted){
    return <div></div>
  }
  // 1. UPDATED PATHS: Prefixing everything with /dashboard
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
        <div className="w-8 h-8 p-1 rounded-md bg-amber-600 flex items-center justify-center" onClick={(e)=>{setTheme((prev)=>{
          if(prev==='light') return 'dark'
          else return 'light'
        })}}>
            <span className="text-white font-bold text-lg">{theme==='light'? (<Sun/>): (<Moon />)}</span>
          </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
          <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="font-bold text-sm text-amber-700 dark:text-amber-400">
            {user?.communityPoints} 
          </span>
        </div>
        </div>
      </header>

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