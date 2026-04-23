import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, TextInput, Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/lib/Toast";
import {
  getReminderSettings, saveReminderSettings,
  ReminderSettings, DEFAULT_REMINDERS,
} from "@/lib/storage";
import {
  scheduleReminders, cancelAllReminders,
  requestLocalNotificationPermission,
} from "@/lib/reminders";

const BEDTIME_OPTIONS = ["20:00", "21:00", "21:30", "22:00", "22:30", "23:00"];

export default function RemindersScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMedTime, setNewMedTime] = useState("");

  useEffect(() => {
    getReminderSettings().then((s) => { setSettings(s); setLoading(false); });
  }, []);

  const save = useCallback(async (s: ReminderSettings) => {
    setSaving(true);
    try {
      const granted = await requestLocalNotificationPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Please allow notifications in your device settings to use Smart Reminders.");
        setSaving(false);
        return;
      }
      await saveReminderSettings(s);
      await scheduleReminders(s);
      showToast("Reminders updated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to schedule", "error");
    } finally {
      setSaving(false);
    }
  }, []);

  const toggle = (key: keyof ReminderSettings, val: boolean) => {
    const next = { ...settings, [key]: { ...(settings[key] as any), enabled: val } };
    setSettings(next);
  };

  const addMedTime = () => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newMedTime)) {
      showToast("Use HH:MM format", "error");
      return;
    }
    if (settings.medication.times.includes(newMedTime)) {
      showToast("Time already exists", "info");
      return;
    }
    const nextTimes = [...settings.medication.times, newMedTime].sort();
    setSettings({ ...settings, medication: { ...settings.medication, times: nextTimes } });
    setNewMedTime("");
    Keyboard.dismiss();
    showToast("Time added!");
  };

  const removeMedTime = (time: string) => {
    const nextTimes = settings.medication.times.filter((t) => t !== time);
    setSettings({ ...settings, medication: { ...settings.medication, times: nextTimes } });
    showToast("Time removed");
  };

  const setBedtime = (time: string) => {
    setSettings({ ...settings, bedtime: { ...settings.bedtime, time } });
  };

  const clearAll = async () => {
    Alert.alert("Clear All Reminders", "This will cancel all scheduled reminders.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All", style: "destructive", onPress: async () => {
          setSaving(true);
          try {
            const reset = DEFAULT_REMINDERS;
            await saveReminderSettings(reset);
            await cancelAllReminders();
            setSettings(reset);
            Alert.alert("Done", "All reminders cleared.");
          } finally {
            setSaving(false);
          }
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
      desc: "Set custom times for your medicines",
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
      desc: "Evening alert to start relaxing",
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Smart Reminders</Text>
            <Text style={s.subtitle}>Works offline — stays on your device</Text>
          </View>
          <TouchableOpacity onPress={clearAll} style={s.clearBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>

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

              {r.key === "medication" && enabled && (
                <View style={s.subSection}>
                  <Text style={s.subLabel}>Scheduled Times:</Text>
                  <View style={s.timeGrid}>
                    {settings.medication.times.map((t: string) => (
                      <View key={t} style={[s.timeChip, { backgroundColor: r.color }]}>
                        <Text style={s.timeChipTextActive}>{t}</Text>
                        <TouchableOpacity onPress={() => removeMedTime(t)} style={s.chipDelete}>
                          <Ionicons name="close-circle" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View style={s.addTimeRow}>
                    <TextInput
                      style={s.addInput}
                      placeholder="HH:MM (e.g. 09:00)"
                      placeholderTextColor={colors.textMuted}
                      value={newMedTime}
                      onChangeText={setNewMedTime}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                    />
                    <TouchableOpacity style={[s.addBtn, { backgroundColor: r.color }]} onPress={addMedTime}>
                      <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {r.key === "bedtime" && enabled && (
                <View style={s.subSection}>
                  <Text style={s.subLabel}>Wind-down time:</Text>
                  <View style={s.timeGrid}>
                    {BEDTIME_OPTIONS.map((t) => {
                      const sel = settings.bedtime.time === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[s.timeChip, sel ? { backgroundColor: r.color } : { borderColor: colors.border, borderWidth: 1 }]}
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

        <View style={s.infoBox}>
          <Ionicons name="notifications-outline" size={16} color={colors.accent} />
          <Text style={s.infoText}>
            Notifications will trigger even if the app is closed or offline.
          </Text>
        </View>

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={() => save(settings)} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Activate All Reminders</Text>}
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
    subLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginBottom: 10 },
    timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 },
    timeChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
    timeChipTextActive: { fontSize: 12, fontWeight: "800", color: "#fff" },
    chipDelete: { padding: 2 },
    addTimeRow: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: 4 },
    addInput: { flex: 1, backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 16, height: 44, color: colors.text, fontWeight: "600", borderWidth: 1, borderColor: colors.border },
    addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    infoBox: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: colors.accentLight, borderRadius: 14, padding: 14, marginBottom: 20 },
    infoText: { fontSize: 12, color: colors.accent, flex: 1, fontWeight: "600" },
    saveBtn: { backgroundColor: colors.accent, borderRadius: 16, height: 54, justifyContent: "center", alignItems: "center", shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  });
}
