export interface TutorialStep {
  targetId?: string;
  title: string;
  description: string;
  path: string;
  requirement?: {
    type: "input" | "click" | "choice" | "path" | "submit";
    targetId?: string;
    value?: string;
  };
}

export type TutorialPhase = "ONBOARDING" | "DASHBOARD";

export const ONBOARDING_STEPS: TutorialStep[] = [
  {
    title: "Welcome to SympTax",
    description: "To start your journey, please click 'Create Free Account' below.",
    path: "/",
    targetId: "hero-register-btn",
    requirement: { type: "click", targetId: "hero-register-btn" }
  },
  {
    title: "Registration",
    description: "Please type your Legal Full Name in the box highlighted.",
    path: "/register",
    targetId: "name",
    requirement: { type: "input", targetId: "name" }
  },
  {
    title: "Your Email",
    description: "Enter your email address to continue.",
    path: "/register",
    targetId: "email",
    requirement: { type: "input", targetId: "email" }
  },
  {
    title: "Submit Registration",
    description: "Click 'Submit for Verification' to finish your registration.",
    path: "/register",
    targetId: "register-submit-btn",
    requirement: { type: "click", targetId: "register-submit-btn" }
  },
  {
    title: "Let's Sign In",
    description: "Your account is ready. Please enter your email to log in.",
    path: "/login",
    targetId: "email",
    requirement: { type: "input", targetId: "email" }
  },
  {
    title: "Access Dashboard",
    description: "Click 'Sign in' to enter your health portal. The onboarding tour will finish here.",
    path: "/login",
    targetId: "login-submit-btn",
    requirement: { type: "click", targetId: "login-submit-btn" }
  },
];

export const DASHBOARD_STEPS: Record<string, TutorialStep[]> = {
  PATIENT: [
    {
      title: "Dashboard Overview",
      description: "Welcome to your health command center. Here you can see your recent activity.",
      path: "/dashboard",
    },
    {
      title: "Medical History",
      description: "Click here to see all your past records and doctor notes.",
      path: "/dashboard",
      targetId: "nav-medical-history",
    },
    {
      title: "AI Health Bot",
      description: "Need quick answers? Our AI assistant can help you understand your records.",
      path: "/dashboard",
      targetId: "nav-ai-chat",
    },
    {
      title: "Settings & Profile",
      description: "Manage your identity and privacy settings from here.",
      path: "/dashboard",
      targetId: "nav-profile",
    },
  ],
  DOCTOR: [
    {
      title: "Clinic Control",
      description: "Welcome, Doctor. This is your patient management dashboard.",
      path: "/dashboard",
    },
    {
      title: "Patient List",
      description: "Quickly access your assigned patients and their histories.",
      path: "/dashboard",
      targetId: "nav-patients",
    },
    {
      title: "Networking",
      description: "Connect with other doctors and clinics in the SympTax network.",
      path: "/dashboard",
      targetId: "nav-network",
    },
  ],
  MASTER_ADMIN: [
    {
      title: "Institution Admin",
      description: "As a Master Admin, you govern this branch's operations.",
      path: "/dashboard",
    },
    {
      title: "Branch Management",
      description: "Approve doctors and set up branch-specific guidelines here.",
      path: "/dashboard",
      targetId: "nav-master",
    },
  ],
};
