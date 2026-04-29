"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Calendar, Users, LayoutDashboard, Settings, Stethoscope } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { SettingsModal } from "./SettingsModal";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Invoices", href: "/invoices", icon: Copy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Don't show sidebar on login page or if not authenticated
  if (pathname === "/login" || !isAuthenticated) return null;

  return (
    <>
      <aside className="print:hidden w-64 bg-surface-light border-r border-border flex flex-col h-full shrink-0 hidden md:flex transition-colors">
        <div className="p-6 border-b border-border">
          <Link href="/">
             <div className="flex items-center gap-3 group cursor-pointer">
               <img 
                 src="/logo.png" 
                 alt="One Dental" 
                 className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
               />
             </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "relative py-3 px-4 rounded-md flex items-center gap-3 transition-colors cursor-pointer border border-transparent",
                  isActive 
                    ? "text-accent-primary font-bold" 
                    : "text-muted hover:text-foreground hover:bg-surface-muted",
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-bg"
                      className="absolute inset-0 bg-surface-muted rounded-md border border-accent-primary/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 z-10 relative" />
                  <span className="z-10 relative leading-none">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full py-3 px-4 rounded-md flex items-center gap-3 text-muted hover:text-foreground hover:bg-surface-muted transition-all font-bold"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <nav className="print:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface-light px-2 py-2 md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold transition-colors",
                  isActive ? "bg-surface-muted text-accent-primary" : "text-muted"
                )}>
                  <Icon className="h-4 w-4" />
                  <span className="leading-none">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
