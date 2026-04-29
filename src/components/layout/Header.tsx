"use client";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  if (pathname === "/login" || !isAuthenticated) return null;

  return (
    <header className="print:hidden min-h-16 bg-surface-light border-b border-border flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-40 transition-colors gap-3">
      <div className="hidden sm:block flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search patients, appointments..." 
            className="w-full bg-surface-muted text-foreground hover:bg-surface-strong focus:bg-surface-light border border-border focus:border-accent-primary outline-none rounded-md py-2.5 pl-10 pr-4 text-sm transition-all focus:ring-4 focus:ring-accent-primary/15"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-3 sm:pl-4 sm:border-l sm:border-border min-h-10">
          <div className="w-10 h-10 rounded-md bg-accent-primary shadow-[var(--shadow-soft)] flex items-center justify-center text-white font-semibold uppercase">
             AD
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-foreground leading-none">Admin / Doctor</p>
            <p className="text-[10px] uppercase tracking-widest font-black text-muted mt-1">Specialist</p>
          </div>
        </div>
      </div>
    </header>
  );
}
