import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { ToastProvider } from "@/lib/Toast";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isDark } = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
    const sub = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ToastProvider>
      </GestureHandlerRootView>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
