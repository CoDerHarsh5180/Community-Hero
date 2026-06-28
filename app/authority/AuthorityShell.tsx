"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Radio, UserCircle, LogOut, ShieldCheck, Sun, Moon, Eye } from "lucide-react";
import { useTheme } from "next-themes";
export default function AuthorityShell({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);
  const [mounted, setMounted] = useState(false)
  const {theme, setTheme} = useTheme()
  useEffect(()=>{setMounted(true)}, [])

  if(!mounted) return <></>
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* --- AUTHORITY SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-10 px-2 mt-4 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-blue-500 font-black text-xl tracking-tighter leading-none">
                OFFICIAL
              </h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                Access Granted
              </p>
            </div>
          </div>
          
          <button onClick={closeMenu} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <Link 
            href="/authority/feed" 
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <Radio className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            Active Feed
          </Link>
          
          <Link 
            href="/authority/profile" 
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <UserCircle className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            My Jurisdiction
          </Link>
        </nav>

        {/* Profile Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || "Official"}</p>
              <p className="text-xs text-blue-400/80 font-mono truncate uppercase tracking-wider">
                {user?.department || "Govt"}
              </p>
            </div>
          </div>
           <div className="w-8 h-8 p-1 rounded-md bg-amber-600 flex items-center justify-center" onClick={(e)=>{setTheme((prev)=>{
                      if(prev==='light') return 'dark'
                      else return 'light'
                    })}}>
                        <span className="text-white font-bold text-lg">{theme==='light'? (<Sun/>): (<Moon />)}</span>
                      </div>
          <Link 
            href="/dashboard/feed" 
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 bg-slate-800/50 hover:bg-slate-800 hover:text-white border border-slate-700/50 transition-all"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            Enter Civilian Mode
          </Link>
          <Link 
            href="/signin"
            className="mt-2 flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 relative flex flex-col h-full">
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 text-slate-300 bg-slate-800 rounded-lg hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
           
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h1 className="text-blue-500 font-black text-lg tracking-tighter">OFFICIAL</h1>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}