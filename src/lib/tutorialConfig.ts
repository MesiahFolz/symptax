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

export const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  PATIENT: [
    {
      title: "Welcome to SympTax",
      description: "We help you keep your health records safe. To start, please click 'Create Free Account' below.",
      path: "/",
      targetId: "hero-register-btn",
      requirement: { type: "click", targetId: "hero-register-btn" }
    },
    {
      title: "Tell us who you are",
      description: "Please type your Legal Full Name in the box highlighted.",
      path: "/register",
      targetId: "name",
      requirement: { type: "input", targetId: "name" }
    },
    {
      title: "Your Email",
      description: "Now, please enter your email address. Remember, Patients usually use @gmail.com.",
      path: "/register",
      targetId: "email",
      requirement: { type: "input", targetId: "email" }
    },
    {
      title: "Submit Registration",
      description: "Great! Now click 'Submit for Verification' to finish your registration.",
      path: "/register",
      targetId: "register-submit-btn",
      requirement: { type: "click", targetId: "register-submit-btn" }
    },
    {
      title: "Let's Sign In",
      description: "Your account is ready for the tour. Please enter your email to log in.",
      path: "/login",
      targetId: "email",
      requirement: { type: "input", targetId: "email" }
    },
    {
      title: "Access Dashboard",
      description: "Click 'Sign in' to enter your personal health portal.",
      path: "/login",
      targetId: "login-submit-btn",
      requirement: { type: "click", targetId: "login-submit-btn" }
    },
    {
      title: "Your Health Overview",
      description: "This is your main page. It shows you everything important about your health at a glance.",
      path: "/dashboard",
      requirement: { type: "path", value: "/dashboard" }
    },
    {
      title: "Your Medical History",
      description: "This card shows all the notes and records your doctors have given you.",
      path: "/dashboard",
      targetId: "card-history",
    },
    {
      title: "Finish",
      description: "You're all set! Enjoy using SympTax to stay healthy.",
      path: "/dashboard",
    },
  ],
  DOCTOR: [
    {
      title: "Doctor Onboarding",
      description: "Welcome, Doctor. Click 'Create Free Account' to register your clinic identity.",
      path: "/",
      targetId: "hero-register-btn",
      requirement: { type: "click", targetId: "hero-register-btn" }
    },
    {
      title: "Registration",
      description: "Please fill out your clinical details to continue.",
      path: "/register",
      targetId: "name",
      requirement: { type: "input", targetId: "name" }
    },
    {
      title: "Doctor Dashboard",
      description: "This is your control center. You can see your practice's volume here.",
      path: "/dashboard",
      requirement: { type: "path", value: "/dashboard" }
    },
  ],
  MASTER_ADMIN: [
    {
      title: "Enterprise Setup",
      description: "Welcome Admin. Click 'Create Free Account' to start registering a new branch.",
      path: "/",
      targetId: "hero-register-btn",
      requirement: { type: "click", targetId: "hero-register-btn" }
    },
    {
      title: "Institution Details",
      description: "Please enter your hospital name and branch details.",
      path: "/register",
      targetId: "name",
      requirement: { type: "input", targetId: "name" }
    },
    {
      title: "Admin Portal",
      description: "From here, you approve new doctors and ensure the branch is running smoothly.",
      path: "/dashboard",
      requirement: { type: "path", value: "/dashboard" }
    },
  ],
};
