"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ONBOARDING_STEPS, DASHBOARD_STEPS, TutorialPhase, TutorialStep } from "@/lib/tutorialConfig";

export type TutorialRole = "PATIENT" | "DOCTOR" | "MASTER_ADMIN" | null;

interface TutorialContextType {
  isActive: boolean;
  role: TutorialRole;
  step: number;
  phase: TutorialPhase;
  canAdvance: boolean;
  startTutorial: (role: TutorialRole) => void;
  startDashboardTour: (role: TutorialRole) => void;
  nextStep: () => void;
  setCanAdvance: (value: boolean) => void;
  reportTaskComplete: () => void;
  exitTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState<TutorialRole>(null);
  const [phase, setPhase] = useState<TutorialPhase>("ONBOARDING");
  const [step, setStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentSteps: TutorialStep[] = phase === "ONBOARDING" 
    ? ONBOARDING_STEPS 
    : (role ? DASHBOARD_STEPS[role] : []);
    
  const currentStepData = currentSteps[step];

  // Load state from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem("symptax_tutorial");
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsActive(parsed.isActive);
      setRole(parsed.role);
      setStep(parsed.step);
      setPhase(parsed.phase || "ONBOARDING");
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (isActive) {
      localStorage.setItem("symptax_tutorial", JSON.stringify({ isActive, role, step, phase }));
    } else {
      localStorage.removeItem("symptax_tutorial");
    }
  }, [isActive, role, step, phase]);

  // Task Gating & Auto-Catchup Logic
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Check if we are already at a future step (Auto-Catchup)
    const futureStepIndex = currentSteps.findIndex((s, i) => i > step && s.path === pathname && s.requirement?.type === "path");
    if (futureStepIndex !== -1) {
      setStep(futureStepIndex);
      return;
    }

    // Reset advancement on step change if it has a requirement
    if (currentStepData.requirement) {
      // Auto-unlock if requirement is just path and we are there
      if (currentStepData.requirement.type === "path") {
        if (pathname === currentStepData.requirement.value) {
          setCanAdvance(true);
        } else {
          setCanAdvance(false);
        }
      } else {
        setCanAdvance(false);
      }
    } else {
      // No requirement means we can always advance
      setCanAdvance(true);
    }
  }, [isActive, step, role, phase, pathname, currentStepData, currentSteps]);

  const startTutorial = (chosenRole: TutorialRole) => {
    setRole(chosenRole);
    setPhase("ONBOARDING");
    setStep(0);
    setIsActive(true);
    setCanAdvance(false);
    router.push("/");
  };

  const startDashboardTour = (chosenRole: TutorialRole) => {
    setRole(chosenRole);
    setPhase("DASHBOARD");
    setStep(0);
    setIsActive(true);
    setCanAdvance(true); // Usually dashboard steps are guidance, not blockers
    router.push("/dashboard");
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const reportTaskComplete = () => {
    setCanAdvance(true);
  };

  const exitTutorial = () => {
    setIsActive(false);
    setRole(null);
    setStep(0);
    setCanAdvance(false);
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        role,
        step,
        phase,
        canAdvance,
        startTutorial,
        startDashboardTour,
        nextStep,
        setCanAdvance,
        reportTaskComplete,
        exitTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
