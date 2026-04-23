import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Switch,
} from "react-native";
import { router } from "expo-router";
import { saveAuth, getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import SympTaxLogo from "@/lib/SympTaxLogo";
import { getGuestProfile } from "@/lib/storage";

const GUEST_USER = {
  id: "guest-session",
  name: "Guest",
  email: "guest@symptax.app",
  role: "GUEST",
  publicId: "GUEST",
  isVerified: false,
  image: "",
};

export default function LoginScreen() {
  const { colors, isDark, mode, setMode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      if (token) router.replace("/(tabs)");
      else setChecking(false);
    });
  }, []);

  const handleLogin = async (isGuest = false) => {
    if (isGuest) {
      // Fully offline guest — no network call
      const guestData = await getGuestProfile();
      const guestWithLocalData = {
        ...GUEST_USER,
        name: guestData.name || "Guest",
        image: guestData.image || "",
      };
      await saveAuth("guest-token", guestWithLocalData);
      router.replace("/(tabs)");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("/api/mobile/auth", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Sign In Failed", data.message || "Invalid email or password.");
        return;
      }
      const { token, user } = await res.json();
      await saveAuth(token, user);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Could not connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(colors);

  if (checking) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.inner}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <SympTaxLogo width={260} height={130} />
          <Text style={s.tagline}>Digital Health Record Platform</Text>
        </View>

        {/* Theme toggle */}
        <View style={s.themeRow}>
          <Text style={s.themeLabel}>🌙 Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setMode(val ? "dark" : "light")}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Sign in to access your health records</Text>

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[s.btn, (loading || !email || !password) && s.btnDisabled]}
            onPress={() => handleLogin(false)}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.line} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.line} />
          </View>

          <TouchableOpacity
            style={s.guestBtn}
            onPress={() => handleLogin(true)}
            disabled={loading}
          >
            <Text style={s.guestBtnText}>Continue as Guest</Text>
            <Text style={s.guestBtnSub}>No internet required</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          Need an account?{" "}
          <Text style={s.footerLink}>Register at symptax.vercel.app</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    inner: { flex: 1, justifyContent: "center", padding: 24 },
    logoWrap: { alignItems: "center", marginBottom: 8 },
    tagline: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: "600" },
    themeRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
      marginBottom: 16, gap: 10,
    },
    themeLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
    card: {
      backgroundColor: colors.card, borderRadius: 24, padding: 24,
      shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
    },
    title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 24 },
    field: { marginBottom: 16 },
    label: {
      fontSize: 11, fontWeight: "700", color: colors.textSecondary,
      marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8,
    },
    input: {
      height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
      paddingHorizontal: 16, fontSize: 15, color: colors.text, backgroundColor: colors.inputBg,
    },
    btn: {
      height: 52, backgroundColor: colors.accent, borderRadius: 14,
      justifyContent: "center", alignItems: "center", marginTop: 8,
      shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
    },
    btnDisabled: { opacity: 0.4 },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { marginHorizontal: 12, fontSize: 11, fontWeight: "700", color: colors.textMuted },
    guestBtn: {
      height: 56, borderRadius: 14, borderWidth: 1.5, borderColor: colors.accent + "60",
      justifyContent: "center", alignItems: "center", backgroundColor: colors.accentLight,
    },
    guestBtnText: { color: colors.accent, fontSize: 15, fontWeight: "800" },
    guestBtnSub: { color: colors.textMuted, fontSize: 11, fontWeight: "600", marginTop: 2 },
    footer: { textAlign: "center", color: colors.textMuted, fontSize: 12, marginTop: 24 },
    footerLink: { color: colors.accent, fontWeight: "700" },
  });
}
