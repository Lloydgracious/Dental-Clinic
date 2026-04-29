"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Monitor, LogOut, X, Settings as SettingsIcon, Shield, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { logout, changePassword } = useAuth();
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    
    setError("");
    setSuccess("");

    if (newPass !== confirmPass) {
      setError("New passwords do not match");
      return;
    }

    setIsUpdating(true);
    const result = await changePassword(oldPass, newPass);
    setIsUpdating(false);

    if (result.success) {
      setSuccess(result.message);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setSuccess("");
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-accent-charcoal/20 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-surface-light w-full max-w-md rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden relative border border-border"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-surface-muted flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-foreground" />
                 </div>
                 <h2 className="text-2xl font-black text-foreground">Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-surface-muted transition-colors text-muted"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 pt-2 space-y-8">
              {/* Theme Selection */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-4 block">Appearance (အပြင်အဆင်)</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "system", name: "Light / Default", icon: Sun },
                    { id: "dark", name: "Dark Mode", icon: Moon },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                        ${(theme === t.id || (t.id === 'system' && theme === 'light')) 
                          ? "border-accent-primary bg-surface-muted text-accent-primary" 
                          : "border-border hover:border-accent-primary/30 text-muted"
                        }
                      `}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-sm font-bold">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & Access */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted mb-4 block">Security & Access (လုံခြုံရေး)</label>
                <div className="bg-surface-muted p-4 rounded-3xl border border-border space-y-4">
                    {!showPasswordForm ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent-primary/12 flex items-center justify-center text-accent-primary">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">Master Password</p>
                                <p className="text-xs text-muted font-medium">Protect clinic data</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => setShowPasswordForm(true)}
                          className="px-4 py-2 bg-surface-light border border-border rounded-xl text-xs font-bold text-foreground hover:bg-surface-strong transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordChange} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <input 
                          type="password" 
                          placeholder="Current Password" 
                          value={oldPass}
                          onChange={(e) => setOldPass(e.target.value)}
                          className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent-primary text-foreground"
                          required
                        />
                        <input 
                          type="password" 
                          placeholder="New Password" 
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent-primary text-foreground"
                          required
                        />
                        <input 
                          type="password" 
                          placeholder="Confirm New Password" 
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          className="w-full bg-surface-light border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent-primary text-foreground"
                          required
                        />
                        {error && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
                        {success && <p className="text-xs text-green-500 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {success}</p>}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 py-3 text-xs font-bold text-muted hover:bg-surface-strong rounded-xl transition-colors">Cancel</button>
                          <button 
                            type="submit" 
                            disabled={isUpdating}
                            className={`flex-1 py-3 bg-accent-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-primary/20 hover:bg-accent-strong transition-colors ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            {isUpdating ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="h-px bg-border" />

                    <button 
                      onClick={() => { logout(); onClose(); }}
                      className="w-full h-14 bg-red-50 dark:bg-red-950/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-red-500 font-black rounded-2xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Logout from Clinic
                    </button>
                </div>
              </div>

              {/* Version Info */}
              <div className="text-center pb-2">
                 <p className="text-[10px] font-black text-muted uppercase tracking-widest">Lumiere v1.0.4 - Premium Dental UI</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
