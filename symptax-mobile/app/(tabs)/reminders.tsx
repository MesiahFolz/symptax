import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";
import {
  getReminderSettings, saveReminderSettings,
  ReminderSettings, DEFAULT_REMINDERS,
} from "@/lib/storage";
import {
  scheduleReminders, cancelAllReminders,
  requestLocalNotificationPermission,
} from "@/lib/reminders";

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "12:00",
  "14:00", "16:00", "18:00", "20:00", "21:00", "22:00",
];

const BEDTIME_OPTIONS = ["20:00", "21:00", "21:30", "22:00", "22:30", "23:00"];

export default function RemindersScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMedTimes, setShowMedTimes] = useState(false);

  useEffect(() => {
    getReminderSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const save = useCallback(async (s: ReminderSettings) => {
    setSaving(true);
    const granted = await requestLocalNotificationPermission();
    if (!granted) {
      Alert.alert("Permission Required", "Please allow notifications in your device settings to use Smart Reminders.");
      setSaving(false);
      return;
    }
    await saveReminderSettings(s);
    await scheduleReminders(s);
    setSaving(false);
    Alert.alert("✅ Saved", "Your reminders have been updated!");
  }, []);

  const toggle = (key: keyof ReminderSettings, val: boolean) => {
    const next = { ...settings, [key]: { ...(settings[key] as any), enabled: val } };
    setSettings(next);
  };

  const toggleMedTime = (time: string) => {
    const curr = settings.medication.times;
    const next = curr.includes(time) ? curr.filter((t) => t !== time) : [...curr, time];
    setSettings({ ...settings, medication: { ...settings.medication, times: next } });
  };

  const setBedtime = (time: string) => {
    setSettings({ ...settings, bedtime: { ...settings.bedtime, time } });
  };

  const clearAll = async () => {
    Alert.alert("Clear All Reminders", "This will cancel all scheduled reminders.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All", style: "destructive", onPress: async () => {
          const reset = DEFAULT_REMINDERS;
          await saveReminderSettings(reset);
          await cancelAllReminders();
          setSettings(reset);
        }
      },
    ]);
  };

  const s = makeStyles(colors);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  const REMINDERS = [
    {
      key: "medication" as const,
      icon: "medkit" as const,
      color: "#6366f1",
      title: "Medication Alerts",
      desc: "Daily reminders to take your medicine on time",
    },
    {
      key: "hydration" as const,
      icon: "water" as const,
      color: "#0ea5e9",
      title: "Hydration Nudges",
      desc: "Reminders to drink water every 2 hours",
    },
    {
      key: "stretch" as const,
      icon: "body" as const,
      color: "#10b981",
      title: "Stretch & Move",
      desc: "Stand up and stretch every 2 hours",
    },
    {
      key: "bedtime" as const,
      icon: "moon" as const,
      color: "#8b5cf6",
      title: "Bedtime Wind-Down",
      desc: "Evening alert to start relaxing for sleep",
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Smart Reminders</Text>
            <Text style={s.subtitle}>All reminders work offline — no internet needed</Text>
          </View>
          <TouchableOpacity onPress={clearAll} style={s.clearBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Reminder cards */}
        {REMINDERS.map((r) => {
          const enabled = (settings[r.key] as any).enabled;
          return (
            <View key={r.key} style={s.card}>
              <View style={s.cardTop}>
                <View style={[s.iconBox, { backgroundColor: r.color + "20" }]}>
                  <Ionicons name={r.icon} size={22} color={r.color} />
                </View>
                <View style={s.cardText}>
                  <Text style={s.cardTitle}>{r.title}</Text>
                  <Text style={s.cardDesc}>{r.desc}</Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={(v) => toggle(r.key, v)}
                  trackColor={{ false: colors.border, true: r.color }}
                  thumbColor="#fff"
                />
              </View>

              {/* Medication time picker */}
              {r.key === "medication" && enabled && (
                <View style={s.subSection}>
                  <TouchableOpacity
                    onPress={() => setShowMedTimes(!showMedTimes)}
                    style={s.subToggle}
                  >
                    <Text style={[s.subLabel, { color: r.color }]}>
                      {settings.medication.times.length > 0
                        ? `Times: ${settings.medication.times.join(", ")}`
                        : "Tap to set times"}
                    </Text>
                    <Ionicons name={showMedTimes ? "chevron-up" : "chevron-down"} size={14} color={r.color} />
                  </TouchableOpacity>
                  {showMedTimes && (
                    <View style={s.timeGrid}>
                      {TIME_OPTIONS.map((t) => {
                        const sel = settings.medication.times.includes(t);
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[s.timeChip, sel && { backgroundColor: r.color }]}
                            onPress={() => toggleMedTime(t)}
                          >
                            <Text style={[s.timeChipText, sel && { color: "#fff" }]}>{t}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* Bedtime time picker */}
              {r.key === "bedtime" && enabled && (
                <View style={s.subSection}>
                  <Text style={s.subLabel}>Wind-down time:</Text>
                  <View style={s.timeGrid}>
                    {BEDTIME_OPTIONS.map((t) => {
                      const sel = settings.bedtime.time === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[s.timeChip, sel && { backgroundColor: r.color }]}
                          onPress={() => setBedtime(t)}
                        >
                          <Text style={[s.timeChipText, sel && { color: "#fff" }]}>{t}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Info box */}
        <View style={s.infoBox}>
          <Ionicons name="wifi-outline" size={16} color={colors.accent} />
          <Text style={s.infoText}>
            Smart Reminders use local notifications — they work even with no internet connection.
          </Text>
        </View>

        {/* Save button */}
        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={() => save(settings)} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save & Activate Reminders</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    scroll: { padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
    title: { fontSize: 24, fontWeight: "900", color: colors.text },
    subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: "600" },
    clearBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.dangerLight, justifyContent: "center", alignItems: "center" },
    card: { backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: "#0f172a", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    cardText: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: "800", color: colors.text },
    cardDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    subSection: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
    subToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    subLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 10 },
    timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    timeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.cardAlt },
    timeChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
    infoBox: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: colors.accentLight, borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.accent + "30" },
    infoText: { fontSize: 12, color: colors.accent, flex: 1, lineHeight: 18, fontWeight: "600" },
    saveBtn: { backgroundColor: colors.accent, borderRadius: 16, height: 54, justifyContent: "center", alignItems: "center", shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  });
}
