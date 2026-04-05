"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock, ShieldCheck, AlertCircle, KeyRound } from "lucide-react";

import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    const success = await login(password);
    setIsLoading(false);

    if (!success) {
      setError(true);
      // Reset error after animation
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-light flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic 3D Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-orange/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-300/5 rounded-full blur-[100px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white p-10 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative">
          
          {/* Lock Icon Animation */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ repeat: Infinity, repeatType: "mirror", duration: 2 }}
              className="w-20 h-20 bg-gradient-to-tr from-accent-charcoal to-gray-800 rounded-3xl flex items-center justify-center shadow-2xl relative"
            >
              <KeyRound className="w-10 h-10 text-accent-orange" />
              <div className="absolute -top-2 -right-2 bg-accent-orange w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-accent-charcoal tracking-tight">Clinic Secure Access</h1>
            <p className="text-gray-500 mt-2 font-medium">Please enter the master password to unlock the Lumiere Management System.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="relative group">
                <Input
                  type="password"
                  placeholder="Master Password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className={`h-16 text-xl tracking-[0.5em] text-center font-black rounded-2xl border-2 transition-all ${
                    error ? "border-red-500 bg-red-50" : "border-gray-100 group-focus-within:border-accent-orange"
                  }`}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-orange transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 justify-center text-red-500 font-bold text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  Incorrect Master Password
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-16 rounded-2xl bg-gradient-to-r from-accent-orange to-amber-500 hover:scale-[1.02] active:scale-95 transition-all shadow-glow text-white font-black text-lg ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Verifying..." : "Unlock Application"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-10 font-bold uppercase tracking-widest">
            Protected by Lumiere Security Layer
          </p>
        </div>

        {/* Support hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center space-y-4"
        >
          <p className="text-gray-500 text-sm font-medium">
            New staff member?{" "}
            <Link href="/register" className="text-accent-orange font-bold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="text-gray-400 text-xs font-medium">
            Forgot password? Contact your system administrator.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
