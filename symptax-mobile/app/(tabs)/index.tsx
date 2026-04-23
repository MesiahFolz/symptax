import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getUser, getToken, clearAuth, AuthUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { registerForPushNotifications } from "@/lib/notifications";
import { useTheme } from "@/lib/theme";
import { getGuestProfile } from "@/lib/storage";

export default function HomeScreen() {
  const { colors } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [guestName, setGuestName] = useState("Guest");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const u = await getUser();
      const t = await getToken();
      if (!u || !t) { router.replace("/(auth)"); return; }
      setUser(u);

      if (u.role === "GUEST") {
        const guestData = await getGuestProfile();
        setGuestName(guestData.name || "Guest");
      } else {
        registerForPushNotifications(t).catch(() => {});
        const res = await apiRequest("/api/records", { token: t });
        if (res.ok) {
          const data = await res.json();
          setRecords((data.records || []).slice(0, 3));
        }
      }
    } catch (e) {
      console.error("Home load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const handleSignOut = async () => { await clearAuth(); router.replace("/(auth)"); };

  const getRoleLabel = (role: string) => {
    if (role === "GUEST") return "Guest Explorer";
    return role.toLowerCase().split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const s = makeStyles(colors);

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  const QUICK_ACTIONS = [
    { label: "Medicine Library", icon: "medkit", route: "/(tabs)/medicines", color: colors.accent },
    { label: "Health Bot", icon: "chatbubble-ellipses", route: "/(tabs)/chat", color: "#8b5cf6" },
    { label: "Smart Reminders", icon: "alarm", route: "/(tabs)/reminders", color: "#10b981" },
    { label: "Emergency Card", icon: "alert-circle", route: "/(tabs)/emergency-card", color: "#ef4444" },
    { label: "My Profile", icon: "person-circle", route: "/(tabs)/profile", color: "#0ea5e9" },
    { label: "Notifications", icon: "notifications", route: "/(tabs)/notifications", color: colors.warning },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Good day,</Text>
            <Text style={s.name}>{user?.role === "GUEST" ? guestName : user?.name}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        <View style={[s.statusBadge, user?.isVerified
          ? { backgroundColor: colors.successLight, borderColor: colors.success + "40" }
          : { backgroundColor: colors.warningLight, borderColor: colors.warning + "40" }
        ]}>
          <Ionicons
            name={user?.isVerified ? "shield-checkmark" : "shield-outline"}
            size={14}
            color={user?.isVerified ? colors.success : colors.warning}
          />
          <Text style={[s.statusText, { color: user?.isVerified ? colors.success : colors.warning }]}>
            {user?.isVerified
              ? `Verified ${getRoleLabel(user.role)}`
              : user?.role === "GUEST"
              ? "Guest Access — Register for full access"
              : "Unverified — Upload ID in profile"}
          </Text>
        </View>

        {/* Offline features banner for guests */}
        {user?.role === "GUEST" && (
          <View style={s.offlineBanner}>
            <Ionicons name="wifi-outline" size={16} color="#10b981" />
            <Text style={s.offlineBannerText}>
              Reminders &amp; Emergency Card work fully offline — no account needed!
            </Text>
          </View>
        )}

        {/* ID Card */}
        {user?.role !== "GUEST" && (
          <View style={s.idCard}>
            <Text style={s.idLabel}>Clinical ST-ID</Text>
            <Text style={s.idValue}>{user?.publicId}</Text>
            <Text style={s.idSub}>Use this ID to connect with doctors</Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Access</Text>
        <View style={s.quickGrid}>
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.quickCard}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[s.quickIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={s.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Records */}
        {records.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Recent Records</Text>
            {records.map((rec: any) => (
              <View key={rec.id} style={s.recordCard}>
                <View style={s.recordLeft}>
                  <View style={[s.recordDot, { backgroundColor: colors.accent }]} />
                  <View>
                    <Text style={s.recordTitle}>{rec.title}</Text>
                    <Text style={s.recordType}>{rec.type}</Text>
                  </View>
                </View>
                <Text style={s.recordDate}>{new Date(rec.createdAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1, paddingHorizontal: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 20, marginBottom: 16 },
    greeting: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
    name: { fontSize: 24, fontWeight: "900", color: colors.text },
    signOutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.dangerLight, justifyContent: "center", alignItems: "center" },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    statusText: { fontSize: 12, fontWeight: "700", flex: 1 },
    offlineBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#bbf7d0" },
    offlineBannerText: { fontSize: 12, color: "#059669", fontWeight: "700", flex: 1 },
    idCard: { backgroundColor: colors.accent, borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 },
    idLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 4, letterSpacing: -1 },
    idSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 8 },
    sectionTitle: { fontSize: 13, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
    quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    quickCard: { width: "47%", backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: "center", shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    quickIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 10 },
    quickLabel: { fontSize: 12, fontWeight: "700", color: colors.text, textAlign: "center" },
    recordCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, shadowColor: "#0f172a", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    recordLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    recordDot: { width: 8, height: 8, borderRadius: 4 },
    recordTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    recordType: { fontSize: 11, color: colors.textMuted, marginTop: 2, textTransform: "uppercase", fontWeight: "600" },
    recordDate: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  });
}
