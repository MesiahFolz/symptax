"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TutorialProvider } from "@/components/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SessionProvider>
        <TutorialProvider>
          {children}
          <TutorialOverlay />
        </TutorialProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
