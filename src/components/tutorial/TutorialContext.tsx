"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type TutorialRole = "PATIENT" | "DOCTOR" | "MASTER_ADMIN" | null;

interface TutorialContextType {
  isActive: boolean;
  role: TutorialRole;
  step: number;
  startTutorial: (role: TutorialRole) => void;
  nextStep: () => void;
  exitTutorial: () => void;
  autoFillData: any;
  setAutoFillData: (data: any) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState<TutorialRole>(null);
  const [step, setStep] = useState(0);
  const [autoFillData, setAutoFillData] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load state from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem("symptax_tutorial");
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsActive(parsed.isActive);
      setRole(parsed.role);
      setStep(parsed.step);
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (isActive) {
      localStorage.setItem("symptax_tutorial", JSON.stringify({ isActive, role, step }));
    } else {
      localStorage.removeItem("symptax_tutorial");
    }
  }, [isActive, role, step]);

  const startTutorial = (chosenRole: TutorialRole) => {
    setRole(chosenRole);
    setStep(0);
    setIsActive(true);
    router.push("/"); // Start at landing
  };

  const nextStep = () => setStep((prev) => prev + 1);

  const exitTutorial = () => {
    setIsActive(false);
    setRole(null);
    setStep(0);
    setAutoFillData(null);
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        role,
        step,
        startTutorial,
        nextStep,
        exitTutorial,
        autoFillData,
        setAutoFillData,
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
