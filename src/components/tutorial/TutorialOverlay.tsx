"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "./TutorialContext";
import { ONBOARDING_STEPS, DASHBOARD_STEPS, TutorialStep } from "@/lib/tutorialConfig";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Info, CheckCircle2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export const TutorialOverlay = () => {
  const { isActive, role, step, phase, nextStep, exitTutorial, canAdvance } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const requestRef = useRef<number>(null);

  const currentSteps: TutorialStep[] = phase === "ONBOARDING" 
    ? ONBOARDING_STEPS 
    : (role ? DASHBOARD_STEPS[role] : []);
    
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
      if (requestRef.current && typeof window !== "undefined") {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData) return null;

  const handleNext = () => {
    if (!canAdvance) return;

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

  // Tooltip Positioning Logic
  const getTooltipStyle = () => {
    if (!targetRect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    // Try to place to the right if there's space, else below
    const padding = 24;
    const spaceOnRight = window.innerWidth - targetRect.right;
    
    if (spaceOnRight > 380) {
      return {
        left: targetRect.right + padding,
        top: targetRect.top + (targetRect.height / 2),
        transform: "translateY(-50%)",
        arrow: "left",
      };
    } else {
      return {
        left: targetRect.left + (targetRect.width / 2),
        top: targetRect.bottom + padding,
        transform: "translateX(-50%)",
        arrow: "top",
      };
    }
  };

  const style = getTooltipStyle();

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-visible font-sans text-slate-900">
      {/* No more backdrop - users can see the whole page */}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${phase}`}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute pointer-events-auto"
          style={{
            left: style.left,
            top: style.top,
            transform: style.transform,
          }}
        >
          {/* Directional Arrow */}
          {targetRect && (
            <div 
              className={`absolute w-4 h-4 bg-white dark:bg-slate-900 rotate-45 border-primary/20 -z-10
                ${style.arrow === "left" ? "-left-2 top-1/2 -translate-y-1/2 border-l-2 border-b-2" : ""}
                ${style.arrow === "top" ? "-top-2 left-1/2 -translate-x-1/2 border-l-2 border-t-2" : ""}
              `}
            />
          )}

          <div className="w-[320px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.5rem] border-2 border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden p-1">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-[1.3rem] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <div className="p-1 bg-primary/20 rounded-full">
                    {canAdvance ? <CheckCircle2 className="h-3 w-3" /> : <Info className="h-3 w-3" />}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                    {phase === "ONBOARDING" ? "Guide" : "Account Tip"}
                  </span>
                </div>
                <button 
                  onClick={exitTutorial}
                  className="p-1 hover:bg-red-500/10 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {currentStepData.title}
                </h3>
                <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-snug">
                  {currentStepData.description}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between gap-4">
                <div className="flex gap-1">
                  {currentSteps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-4 bg-primary' : 'w-1 bg-primary/20'}`} 
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={handleNext}
                  disabled={!canAdvance}
                  size="sm"
                  className={`font-black px-4 py-4 rounded-xl transition-all flex items-center gap-1.5 group shadow-md text-xs ${
                    canAdvance 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:scale-105' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  {step === currentSteps.length - 1 ? "FINISH" : "NEXT"}
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Target Highlight Ring (No backdrop, just a subtle glow) */}
      {targetRect && (
        <motion.div
          key={`ring-${step}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute border-[3px] border-primary rounded-xl pointer-events-none z-[9998]"
          style={{
            left: targetRect.left - 6,
            top: targetRect.top - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: "0 0 30px oklch(0.45 0.15 180 / 30%)",
          }}
        />
      )}
    </div>
  );
};
