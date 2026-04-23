"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SessionProvider>
        {children}
        <Toaster 
          richColors 
          position="top-right" 
          closeButton
          toastOptions={{
            style: {
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-raised)',
              color: 'var(--foreground)',
              borderRadius: '1rem',
              boxShadow: 'var(--shadow-overlay)',
            },
            className: "font-sans font-medium",
          }}
        />
      </SessionProvider>
    </ThemeProvider>
  );
}
