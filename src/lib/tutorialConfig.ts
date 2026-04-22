export interface TutorialStep {
  targetId?: string;
  title: string;
  description: string;
  path: string;
  action?: "click" | "type" | "none";
  autoFill?: any;
}

export const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  PATIENT: [
    {
      title: "Welcome to SympTax",
      description: "We help you keep your health records safe. Let's start by making you an account.",
      path: "/",
      targetId: "hero-register-btn",
    },
    {
      title: "Tell us who you are",
      description: "Usually you would type your details here, but we've filled it in for you to make it fast!",
      path: "/register",
      autoFill: {
        name: "Jane Doe",
        email: "jane.doe@gmail.com",
        password: "Password123!",
        role: "PATIENT",
      },
    },
    {
      title: "Sign In",
      description: "Now, let's log in to see your personal health page.",
      path: "/login",
      targetId: "login-submit-btn",
      autoFill: {
        email: "jane.doe@gmail.com",
        password: "Password123!",
      },
    },
    {
      title: "Your Health Overview",
      description: "This is your main page. It shows you everything important about your health at a glance.",
      path: "/dashboard",
    },
    {
      title: "Your Medical History",
      description: "Click here to see all the notes and records your doctors have given you.",
      path: "/dashboard",
      targetId: "card-history",
    },
    {
      title: "Meet Symmetry Bot",
      description: "Have a question about a symptom? You can chat with our AI helper anytime.",
      path: "/dashboard",
      targetId: "card-ai",
    },
    {
      title: "Notification Bell",
      description: "When a doctor sends you a message or a prescription, this bell will light up.",
      path: "/dashboard",
      targetId: "notifications-bell-btn",
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
      description: "Welcome, Doctor. Let's show you how to manage your patients easily.",
      path: "/",
      targetId: "hero-register-btn",
    },
    {
      title: "Clinical Registration",
      description: "We've auto-filled your credentials for this tutorial.",
      path: "/register",
      autoFill: {
        name: "Dr. Smith",
        email: "dr.smith@email.com",
        password: "DoctorPassword123!",
        role: "DOCTOR",
      },
    },
    {
      title: "Doctor Dashboard",
      description: "This is your control center. You can see your practice's volume here.",
      path: "/dashboard",
    },
    {
      title: "Patient Directory",
      description: "Access and manage all your patient records from this single directory.",
      path: "/dashboard",
      targetId: "card-patients",
    },
    {
      title: "Switching to Dark Mode",
      description: "Working late at the clinic? Use this button to make the screen easier on your eyes.",
      path: "/dashboard",
      targetId: "theme-toggle-btn",
    },
  ],
  MASTER_ADMIN: [
    {
      title: "Enterprise Setup",
      description: "Welcome Admin. SympTax helps you manage entire hospitals or branches.",
      path: "/",
      targetId: "hero-register-btn",
    },
    {
      title: "Institution Details",
      description: "As an Admin, you also provide details about your medical branch.",
      path: "/register",
      autoFill: {
        name: "Hospital Admin",
        email: "admin@symptax.com",
        password: "AdminPassword123!",
        role: "MASTER_ADMIN",
        hospitalName: "City General",
        branchName: "East Wing",
        branchAddress: "123 Health St",
      },
    },
    {
      title: "Admin Portal",
      description: "From here, you approve new doctors and ensure the branch is running smoothly.",
      path: "/dashboard",
      targetId: "card-admin",
    },
  ],
};
