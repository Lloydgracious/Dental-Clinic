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
      <aside className="print:hidden w-64 bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 flex flex-col h-full shrink-0 hidden md:flex transition-colors">
        <div className="p-6">
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
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "relative py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors cursor-pointer",
                  isActive 
                    ? "text-accent-primary font-bold" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50",
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-bg"
                      className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20 rounded-2xl"
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
            className="w-full py-3 px-4 rounded-2xl flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all font-bold"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
