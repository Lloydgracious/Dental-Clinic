"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialLoading) {
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/");
      }
    }
  }, [isAuthenticated, isInitialLoading, pathname, router]);

  if (isInitialLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-light">
        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated and not on login page, don't render children to avoid flash of content
  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
};
