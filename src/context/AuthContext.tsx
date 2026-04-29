"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  updatePassword,
  User
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  isInitialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@lumiere.com"; // Fixed admin email for master password flow
const AUTH_HINT_KEY = "clinic_auth_hint";
const AUTH_HINT_MAX_AGE = 60 * 60 * 24 * 30;

const persistAuthHint = (hint: "authenticated" | "signed_out") => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_HINT_KEY, hint);
  document.cookie = `${AUTH_HINT_KEY}=${hint}; path=/; max-age=${AUTH_HINT_MAX_AGE}; SameSite=Lax`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const markSignedOut = () => {
      persistAuthHint("signed_out");
      setUser(null);
      setIsAuthenticated(false);
      setIsInitialLoading(false);
    };

    const savedHint = window.localStorage.getItem(AUTH_HINT_KEY);
    if (savedHint === "signed_out") {
      markSignedOut();
    }

    let didResolveAuth = false;
    const authTimeout = window.setTimeout(() => {
      if (didResolveAuth) return;

      console.warn("Firebase auth state check timed out. Continuing as signed out.");
      markSignedOut();
    }, 5000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        didResolveAuth = true;
        window.clearTimeout(authTimeout);
        setUser(firebaseUser);
        setIsAuthenticated(!!firebaseUser);
        setIsInitialLoading(false);

        if (firebaseUser) {
          persistAuthHint("authenticated");
        } else {
          persistAuthHint("signed_out");
        }
      },
      (error) => {
        didResolveAuth = true;
        window.clearTimeout(authTimeout);
        console.error("Auth state listener failed:", error);
        markSignedOut();
      }
    );

    return () => {
      didResolveAuth = true;
      window.clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const login = async (password: string) => {
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      persistAuthHint("authenticated");
      return true;
    } catch (error) {
      persistAuthHint("signed_out");
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      persistAuthHint("signed_out");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    try {
      if (!user) return { success: false, message: "Not authenticated" };
      
      // Re-authenticate
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, oldPass);
      
      await updatePassword(user, newPass);
      return { success: true, message: "Cloud password updated successfully" };
    } catch (error: any) {
      console.error("Password change failed:", error);
      return { success: false, message: error.message || "Failed to update password" };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, changePassword, isInitialLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
