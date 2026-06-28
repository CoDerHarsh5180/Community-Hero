"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ShieldAlert, LayoutDashboard, ListTodo, LogOut, ShieldCheck, Menu, X, Sun, Moon, Eye } from "lucide-react";

export default function AdminShell({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: any;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
        setMounted(true);
      }, []);
      const {setTheme, theme} = useTheme()
      if(!mounted){
        return <div></div>
      }
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* --- COMMAND CENTER SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button & Header */}
        <div className="flex items-center justify-between mb-10 px-2 mt-4 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-emerald-500 font-black text-xl tracking-tighter leading-none">
                CMD CENTER
              </h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                Admin Override
              </p>
            </div>
          </div>
          
          <button 
            onClick={closeMenu}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin/issues" 
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <ListTodo className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            Triage Table
          </Link>
          
          <Link 
            href="/admin/dashboard" 
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            Impact Insights
          </Link>

          <Link 
            href="/admin/authorities" 
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            Authorize Users
          </Link>
        </nav>

        {/* Admin Profile Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-500 border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Admin Official</p>
              <p className="text-xs text-emerald-400/80 font-mono truncate uppercase tracking-wider">
                {user?.department || "CENTRAL"}
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
            SYSTEM LOGOUT
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 relative flex flex-col h-full">
        
        {/* 🚀 NEW MOBILE HEADER WITH HAMBURGER BUTTON */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-slate-300 bg-slate-800 rounded-lg hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
              <h1 className="text-emerald-500 font-black text-lg tracking-tighter">CMD CENTER</h1>
            </div>
          </div>
          <p className="text-xs text-emerald-400/80 font-mono uppercase">
             {user?.department || "CENTRAL"}
          </p>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}