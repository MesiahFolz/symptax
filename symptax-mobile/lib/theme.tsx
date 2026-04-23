import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

const THEME_KEY = "symptax_theme";

export type ThemeMode = "light" | "dark" | "system";

export const lightColors = {
  bg: "#f8fafc",
  bgSecondary: "#f1f5f9",
  card: "#ffffff",
  cardAlt: "#f1f5f9",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  accent: "#6366f1",
  accentLight: "#eff0fe",
  success: "#059669",
  successLight: "#f0fdf4",
  warning: "#d97706",
  warningLight: "#fffbeb",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  tabBar: "#ffffff",
  tabBarBorder: "#f1f5f9",
  inputBg: "#f8fafc",
};

export const darkColors = {
  bg: "#0f172a",
  bgSecondary: "#1e293b",
  card: "#1e293b",
  cardAlt: "#0f172a",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#475569",
  border: "#334155",
  accent: "#818cf8",
  accentLight: "#1e1b4b",
  success: "#34d399",
  successLight: "#064e3b",
  warning: "#fbbf24",
  warningLight: "#451a03",
  danger: "#f87171",
  dangerLight: "#450a0a",
  tabBar: "#1e293b",
  tabBarBorder: "#334155",
  inputBg: "#0f172a",
};

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  mode: "system",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await SecureStore.setItemAsync(THEME_KEY, newMode);
  };

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
