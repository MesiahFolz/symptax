"use client";

import React from "react";
import { useTutorial, TutorialRole } from "./TutorialContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, User, Stethoscope, ShieldCheck, HeartPulse } from "lucide-react";

export const TutorialGate = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { startTutorial } = useTutorial();

  const handleStart = (role: TutorialRole) => {
    startTutorial(role);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 sm:p-10 font-sans">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-primary/20 shadow-2xl overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] -z-10" />

        <div className="p-8 md:p-16 text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary tracking-widest uppercase mb-4">
              <HeartPulse className="h-4 w-4" />
              Interactive Experience
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              Who are you <span className="text-primary italic">Symmetrying</span> as?
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Choose an identity to begin your guided tour. We'll show you exactly how SympTax works for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Patient */}
            <button 
              onClick={() => handleStart("PATIENT")}
              className="group relative flex flex-col items-center p-8 bg-surface-subtle dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-primary/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            >
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2">Patient</h3>
              <p className="text-sm text-slate-500 font-medium">Manage your personal records and talk to doctors.</p>
              <div className="mt-6 font-black text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Select Role</div>
            </button>

            {/* Doctor */}
            <button 
              onClick={() => handleStart("DOCTOR")}
              className="group relative flex flex-col items-center p-8 bg-surface-subtle dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="bg-blue-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <Stethoscope className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black mb-2">Doctor</h3>
              <p className="text-sm text-slate-500 font-medium">Manage your clinical practice and see patient history.</p>
              <div className="mt-6 font-black text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Select Role</div>
            </button>

            {/* Master Admin */}
            <button 
              onClick={() => handleStart("MASTER_ADMIN")}
              className="group relative flex flex-col items-center p-8 bg-surface-subtle dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="bg-emerald-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-2">Master Admin</h3>
              <p className="text-sm text-slate-500 font-medium">Govern hospitals, verify users, and manage branches.</p>
              <div className="mt-6 font-black text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Select Role</div>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
