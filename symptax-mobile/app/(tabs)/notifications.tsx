import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getToken, getUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/lib/theme";

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  recordId: string | null;
  createdAt: string;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const load = useCallback(async () => {
    const user = await getUser();
    if (user?.role === "GUEST") { setIsGuest(true); setLoading(false); return; }
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    try {
      const res = await apiRequest("/api/notifications", { token });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const markAllRead = async () => {
    const token = await getToken();
    if (!token) return;
    await apiRequest("/api/notifications", { method: "PATCH", token });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const s = makeStyles(colors);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  if (isGuest) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}><Text style={s.title}>Notifications</Text></View>
        <View style={s.emptyWrap}>
          <Ionicons name="lock-closed-outline" size={56} color={colors.textMuted} />
          <Text style={s.emptyTitle}>Guests Can't Receive Notifications</Text>
          <Text style={s.emptyText}>Register on symptax.vercel.app to receive alerts from your doctor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Notifications</Text>
          {unread > 0 && <Text style={s.unreadBadge}>{unread} unread</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead} style={s.markAllBtn}>
            <Text style={s.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} />
            <Text style={s.emptyTitle}>All Clear!</Text>
            <Text style={s.emptyText}>You have no notifications yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[s.card, !item.isRead && s.unreadCard]}>
            <View style={[s.dot, item.isRead ? s.dotRead : s.dotUnread]} />
            <View style={s.cardContent}>
              <Text style={s.msgText}>{item.message}</Text>
              <Text style={s.dateText}>
                {new Date(item.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
            {!item.isRead && <View style={s.unreadPill}><Text style={s.unreadPillText}>New</Text></View>}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: "900", color: colors.text },
    unreadBadge: { fontSize: 12, color: colors.accent, fontWeight: "700", marginTop: 2 },
    markAllBtn: { backgroundColor: colors.accentLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    markAllText: { fontSize: 12, color: colors.accent, fontWeight: "800" },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "flex-start", gap: 12, shadowColor: "#0f172a", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    unreadCard: { borderWidth: 1.5, borderColor: colors.accent + "40" },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
    dotRead: { backgroundColor: colors.border },
    dotUnread: { backgroundColor: colors.accent },
    cardContent: { flex: 1 },
    msgText: { fontSize: 14, color: colors.text, fontWeight: "600", lineHeight: 20 },
    dateText: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: "600" },
    unreadPill: { backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    unreadPillText: { fontSize: 10, color: "#fff", fontWeight: "800" },
    emptyWrap: { alignItems: "center", paddingVertical: 80, gap: 12, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.text, textAlign: "center" },
    emptyText: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  });
}
