import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Switch, TextInput, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getUser, getToken, clearAuth, AuthUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { getGuestProfile, saveGuestProfile, GuestProfile, DEFAULT_GUEST } from "@/lib/storage";

const INFO_ITEMS = [
  { key: "bloodType", label: "Blood Type", icon: "water-outline" },
  { key: "allergies", label: "Allergies", icon: "warning-outline" },
  { key: "conditions", label: "Conditions", icon: "pulse-outline" },
  { key: "medications", label: "Medications", icon: "medkit-outline" },
];

export default function ProfileScreen() {
  const { colors, isDark, setMode } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [guestData, setGuestData] = useState<GuestProfile>(DEFAULT_GUEST);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const u = await getUser();
    const t = await getToken();
    if (!u || !t) { router.replace("/(auth)"); return; }
    setUser(u);

    if (u.role === "GUEST") {
      const g = await getGuestProfile();
      setGuestData(g);
    } else {
      try {
        const res = await apiRequest("/api/profile", { token: t });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await clearAuth(); router.replace("/(auth)"); } },
    ]);
  };

  const pickImage = async () => {
    if (!editing) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setGuestData({ ...guestData, image: result.assets[0].uri });
    }
  };

  const handleSaveGuest = async () => {
    setSaving(true);
    await saveGuestProfile(guestData);
    setSaving(false);
    setEditing(false);
    Alert.alert("✅ Saved", "Your guest profile has been updated locally.");
  };

  const getRoleLabel = (role: string) => {
    if (role === "GUEST") return "Guest Explorer";
    return role.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const s = makeStyles(colors);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  const isGuest = user?.role === "GUEST";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>My Profile</Text>
          <View style={s.headerRight}>
            {isGuest && (
              <TouchableOpacity
                onPress={() => editing ? handleSaveGuest() : setEditing(true)}
                style={[s.editBtn, editing && { backgroundColor: colors.successLight, borderColor: colors.success }]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.success} />
                ) : (
                  <Ionicons name={editing ? "checkmark" : "create-outline"} size={18} color={editing ? colors.success : colors.accent} />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSignOut} style={s.signOutBtn}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar & Name */}
        <View style={s.avatarCard}>
          <TouchableOpacity onPress={pickImage} activeOpacity={editing ? 0.7 : 1} style={s.avatarWrapper}>
            {isGuest && guestData.image ? (
              <Image source={{ uri: guestData.image }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarCircle}>
                <Text style={s.avatarLetter}>{(isGuest ? guestData.name : user?.name)?.charAt(0) || "?"}</Text>
              </View>
            )}
            {editing && (
              <View style={s.cameraIcon}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {editing ? (
            <TextInput
              style={s.nameInput}
              value={guestData.name}
              onChangeText={(v) => setGuestData({ ...guestData, name: v })}
              placeholder="Your Name"
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <Text style={s.userName}>{isGuest ? guestData.name : user?.name}</Text>
          )}

          {!isGuest && <Text style={s.userEmail}>{user?.email}</Text>}

          <View style={[s.roleBadge, user?.isVerified ? { backgroundColor: colors.successLight, borderColor: colors.success + "40" } : { backgroundColor: colors.warningLight, borderColor: colors.warning + "40" }]}>
            <Ionicons name={user?.isVerified ? "shield-checkmark" : "shield-outline"} size={13} color={user?.isVerified ? colors.success : colors.warning} />
            <Text style={[s.roleText, { color: user?.isVerified ? colors.success : colors.warning }]}>
              {user?.isVerified ? `Verified ${getRoleLabel(user.role)}` : user?.role === "GUEST" ? "Guest Access" : "Unverified"}
            </Text>
          </View>
        </View>

        {/* Theme toggle */}
        <View style={s.themeCard}>
          <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.accent} />
          <Text style={s.themeLabel}>{isDark ? "Dark Mode" : "Light Mode"}</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setMode(val ? "dark" : "light")}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        {/* ST-ID Card */}
        {!isGuest && (
          <View style={s.idCard}>
            <Text style={s.idLabel}>Clinical ST-ID</Text>
            <Text style={s.idValue}>{user?.publicId}</Text>
          </View>
        )}

        {/* Clinical Info */}
        {(profile || isGuest) && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{isGuest ? "My Health Info (Local)" : "Clinical Info"}</Text>
              {isGuest && <Ionicons name="cloud-offline-outline" size={14} color={colors.textMuted} />}
            </View>
            <View style={s.infoGrid}>
              {INFO_ITEMS.map((item) => (
                <View key={item.key} style={s.infoCard}>
                  <Ionicons name={item.icon as any} size={18} color={colors.accent} />
                  <Text style={s.infoLabel}>{item.label}</Text>
                  {editing ? (
                    <TextInput
                      style={s.infoInput}
                      value={(guestData as any)[item.key]}
                      onChangeText={(v) => setGuestData({ ...guestData, [item.key]: v })}
                      placeholder="..."
                      placeholderTextColor={colors.textMuted}
                    />
                  ) : (
                    <Text style={s.infoValue}>{(isGuest ? (guestData as any)[item.key] : profile?.[item.key]) || "—"}</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Emergency Contact Info (Guest only) */}
        {isGuest && (
          <>
            <Text style={s.sectionTitle}>Emergency Contact</Text>
            <View style={s.guestEmergencyRow}>
              <View style={s.infoCardHalf}>
                <Text style={s.infoLabel}>Contact Name</Text>
                {editing ? (
                  <TextInput
                    style={s.infoInput}
                    value={guestData.emergencyContact}
                    onChangeText={(v) => setGuestData({ ...guestData, emergencyContact: v })}
                    placeholder="Name"
                  />
                ) : (
                  <Text style={s.infoValue}>{guestData.emergencyContact || "—"}</Text>
                )}
              </View>
              <View style={s.infoCardHalf}>
                <Text style={s.infoLabel}>Phone</Text>
                {editing ? (
                  <TextInput
                    style={s.infoInput}
                    value={guestData.emergencyPhone}
                    onChangeText={(v) => setGuestData({ ...guestData, emergencyPhone: v })}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={s.infoValue}>{guestData.emergencyPhone || "—"}</Text>
                )}
              </View>
            </View>
          </>
        )}

        {/* Register callout */}
        {isGuest && !editing && (
          <View style={s.guestCard}>
            <Ionicons name="person-add-outline" size={24} color={colors.accent} />
            <Text style={s.guestTitle}>Create Your Full Account</Text>
            <Text style={s.guestText}>
              Register at symptax.vercel.app to get your unique Clinical ID, connect with doctors, and save your medical history.
            </Text>
          </View>
        )}

        <Text style={s.version}>SympTax Mobile v1.0.0 · symptax.vercel.app</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: { fontSize: 24, fontWeight: "900", color: colors.text },
    editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentLight, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: colors.accent + "40" },
    signOutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.dangerLight, justifyContent: "center", alignItems: "center" },
    avatarCard: { alignItems: "center", backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 24, padding: 28, marginBottom: 16, shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
    avatarWrapper: { marginBottom: 14, position: "relative" },
    avatarCircle: { width: 80, height: 80, borderRadius: 28, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center", shadowColor: colors.accent, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
    avatarImage: { width: 80, height: 80, borderRadius: 28 },
    avatarLetter: { fontSize: 36, fontWeight: "900", color: "#fff" },
    cameraIcon: { position: "absolute", bottom: -4, right: -4, backgroundColor: colors.accent, width: 28, height: 28, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: colors.card },
    userName: { fontSize: 22, fontWeight: "900", color: colors.text },
    nameInput: { fontSize: 20, fontWeight: "800", color: colors.text, borderBottomWidth: 2, borderBottomColor: colors.accent, paddingHorizontal: 12, paddingVertical: 4, width: "80%", textAlign: "center" },
    userEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontWeight: "600" },
    roleBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 14 },
    roleText: { fontSize: 12, fontWeight: "800" },
    themeCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#0f172a", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    themeLabel: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
    idCard: { backgroundColor: colors.accent, marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6 },
    idLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 30, fontWeight: "900", color: "#fff", marginTop: 4, letterSpacing: -1 },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
    infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginHorizontal: 20, marginBottom: 24 },
    infoCard: { width: "47%", backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: "center", gap: 6, shadowColor: "#0f172a", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    infoCardHalf: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, gap: 6, shadowColor: "#0f172a", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    infoLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "700", textTransform: "uppercase" },
    infoValue: { fontSize: 16, fontWeight: "800", color: colors.text, textAlign: "center" },
    infoInput: { fontSize: 14, fontWeight: "700", color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 4, width: "100%", textAlign: "center" },
    guestEmergencyRow: { flexDirection: "row", gap: 12, marginHorizontal: 20, marginBottom: 24 },
    guestCard: { backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 20, padding: 24, alignItems: "center", gap: 12, shadowColor: colors.accent, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: colors.accent + "30", marginBottom: 24 },
    guestTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    guestText: { fontSize: 13, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
    version: { textAlign: "center", color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  });
}

