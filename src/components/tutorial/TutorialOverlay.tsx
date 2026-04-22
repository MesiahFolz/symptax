"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "./TutorialContext";
import { TUTORIAL_STEPS } from "@/lib/tutorialConfig";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export const TutorialOverlay = () => {
  const { isActive, role, step, nextStep, exitTutorial } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const requestRef = useRef<number>(null);

  const currentSteps = role ? TUTORIAL_STEPS[role] : [];
  const currentStepData = currentSteps[step];

  // Update target bounding box continuously for smooth tracking
  const updateTarget = () => {
    if (currentStepData?.targetId) {
      const el = document.getElementById(currentStepData.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
    requestRef.current = requestAnimationFrame(updateTarget);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(updateTarget);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, currentStepData]);

  // Handle path transitions
  useEffect(() => {
    if (isActive && currentStepData && currentStepData.path !== pathname) {
      // If we are on the wrong page for this step, we might need to wait for navigation
      // or indicate to the user to click something.
    }
  }, [isActive, currentStepData, pathname]);

  if (!isActive || !currentStepData) return null;

  const handleNext = () => {
    if (step === currentSteps.length - 1) {
      exitTutorial();
    } else {
      const nextData = currentSteps[step + 1];
      if (nextData.path !== pathname) {
        router.push(nextData.path);
      }
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden font-sans">
      {/* Dim backdrop with hole for target */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-500" 
           style={{ 
             clipPath: targetRect 
               ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
               : 'none' 
           }} 
      />

      {/* Guide Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute pointer-events-auto"
          style={{
            left: targetRect ? Math.max(20, Math.min(window.innerWidth - 380, targetRect.left)) : "50%",
            top: targetRect ? Math.min(window.innerHeight - 300, targetRect.bottom + 20) : "50%",
            transform: targetRect ? "none" : "translate(-50%, -50%)",
          }}
        >
          <div className="w-[340px] bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-primary/20 shadow-2xl overflow-hidden p-1">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-[1.8rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <div className="p-1.5 bg-primary/20 rounded-full">
                    <Info className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Tutorial Guide</span>
                </div>
                <button 
                  onClick={exitTutorial}
                  className="p-1 hover:bg-red-500/10 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {currentStepData.title}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4">
                <div className="flex gap-1.5">
                  {currentSteps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'}`} 
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-5 rounded-2xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center gap-2 group"
                >
                  {step === currentSteps.length - 1 ? "FINISH" : "CONTINUE"}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative tail for target element */}
          {targetRect && (
            <div 
              className="absolute -top-3 left-10 w-6 h-6 bg-white dark:bg-slate-900 rotate-45 border-l-2 border-t-2 border-primary/20 -z-10"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pulsing highlight for target */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute border-4 border-primary rounded-2xl pointer-events-none"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 40px oklch(0.45 0.15 180 / 40%)",
          }}
        />
      )}
    </div>
  );
};
