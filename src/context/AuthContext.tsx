"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthenticated(!!firebaseUser);
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (password: string) => {
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
