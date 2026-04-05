"use client";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export function Header() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login" || !isAuthenticated) return null;

  return (
    <header className="print:hidden h-20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent-orange transition-colors" />
          <input 
            type="text" 
            placeholder="Search patients, appointments..." 
            className="w-full bg-gray-50 dark:bg-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-surface-dark border border-transparent focus:border-accent-orange outline-none rounded-2xl py-2.5 pl-10 pr-4 text-sm transition-all focus:ring-4 focus:ring-accent-orange/10"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-800 h-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-primary to-blue-400 shadow-md flex items-center justify-center text-white font-semibold uppercase">
             AD
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-accent-charcoal dark:text-white leading-none">Admin / Doctor</p>
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mt-1">Specialist</p>
          </div>
        </div>
      </div>
    </header>
  );
}
