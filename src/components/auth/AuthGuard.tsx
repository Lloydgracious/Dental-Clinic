"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const shouldBlockForAuthCheck = isInitialLoading && !isLoginPage;
  const needsLoginRedirect = !isInitialLoading && !isAuthenticated && !isLoginPage;
  const needsHomeRedirect = !isInitialLoading && isAuthenticated && isLoginPage;

  useEffect(() => {
    if (needsLoginRedirect) {
      router.replace("/login");
    } else if (needsHomeRedirect) {
      router.replace("/");
    }
  }, [needsHomeRedirect, needsLoginRedirect, router]);

  if (shouldBlockForAuthCheck || needsLoginRedirect || needsHomeRedirect) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-accent-primary border-t-transparent animate-spin"></div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-primary">
              {shouldBlockForAuthCheck ? "Checking access" : "Redirecting"}
            </p>
            <p className="text-sm text-muted">
              {shouldBlockForAuthCheck
                ? "Loading your secure clinic workspace."
                : "Taking you to the right page."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
