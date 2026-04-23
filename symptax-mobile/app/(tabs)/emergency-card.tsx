import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/lib/Toast";
import { getEmergencyCard, saveEmergencyCard, EmergencyCard, DEFAULT_EMERGENCY } from "@/lib/storage";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export default function EmergencyCardScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [card, setCard] = useState<EmergencyCard>(DEFAULT_EMERGENCY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEmergencyCard().then((c) => { setCard(c); setLoading(false); });
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await saveEmergencyCard(card);
    setSaving(false);
    setEditing(false);
    showToast("Medical card saved!");
  }, [card, showToast]);

  const s = makeStyles(colors);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Emergency Card</Text>
            <Text style={s.subtitle}>Viewable offline — no internet needed</Text>
          </View>
          <TouchableOpacity
            style={[s.editBtn, editing && { backgroundColor: colors.successLight, borderColor: colors.success }]}
            onPress={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <Ionicons name={editing ? "checkmark" : "create-outline"} size={18} color={editing ? colors.success : colors.accent} />
            )}
          </TouchableOpacity>
        </View>

        {/* SOS Banner */}
        <View style={s.sosBanner}>
          <Ionicons name="alert-circle" size={20} color="#fff" />
          <Text style={s.sosText}>IN CASE OF EMERGENCY — Show this card to first responders</Text>
        </View>

        {/* Blood Type */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>BLOOD TYPE</Text>
          {editing ? (
            <View style={s.bloodGrid}>
              {BLOOD_TYPES.map((bt) => (
                <TouchableOpacity
                  key={bt}
                  style={[s.bloodChip, card.bloodType === bt && { backgroundColor: "#ef4444", borderColor: "#ef4444" }]}
                  onPress={() => setCard({ ...card, bloodType: bt })}
                >
                  <Text style={[s.bloodChipText, card.bloodType === bt && { color: "#fff" }]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={s.bloodTypeDisplay}>{card.bloodType || "—"}</Text>
          )}
        </View>

        {/* Personal Info */}
        <InfoField
          label="Full Name" icon="person-outline" value={card.name} editing={editing}
          onChange={(v) => setCard({ ...card, name: v })} colors={colors} placeholder="Your full name"
        />
        <InfoField
          label="Known Conditions" icon="pulse-outline" value={card.conditions} editing={editing}
          onChange={(v) => setCard({ ...card, conditions: v })} colors={colors}
          placeholder="e.g. Diabetes, Hypertension" multiline
        />
        <InfoField
          label="Current Medications" icon="medkit-outline" value={card.medications} editing={editing}
          onChange={(v) => setCard({ ...card, medications: v })} colors={colors}
          placeholder="e.g. Metformin 500mg, Losartan 50mg" multiline
        />
        <InfoField
          label="Allergies" icon="warning-outline" value={card.allergies} editing={editing}
          onChange={(v) => setCard({ ...card, allergies: v })} colors={colors}
          placeholder="e.g. Penicillin, Aspirin" iconColor="#ef4444"
        />

        {/* Emergency Contact */}
        <View style={s.divider} />
        <Text style={s.sectionGroup}>EMERGENCY CONTACTS</Text>
        <InfoField
          label="Emergency Contact" icon="call-outline" value={card.emergencyContact} editing={editing}
          onChange={(v) => setCard({ ...card, emergencyContact: v })} colors={colors}
          placeholder="Contact name & relationship"
        />
        <InfoField
          label="Emergency Phone" icon="phone-portrait-outline" value={card.emergencyPhone} editing={editing}
          onChange={(v) => setCard({ ...card, emergencyPhone: v })} colors={colors}
          placeholder="+63 9XX XXX XXXX" keyboardType="phone-pad"
        />
        <InfoField
          label="Doctor's Name" icon="medical-outline" value={card.doctorName} editing={editing}
          onChange={(v) => setCard({ ...card, doctorName: v })} colors={colors}
          placeholder="Dr. Full Name"
        />
        <InfoField
          label="Doctor's Phone" icon="call-outline" value={card.doctorPhone} editing={editing}
          onChange={(v) => setCard({ ...card, doctorPhone: v })} colors={colors}
          placeholder="+63 9XX XXX XXXX" keyboardType="phone-pad"
        />

        {editing && (
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Emergency Card</Text>}
          </TouchableOpacity>
        )}

        <View style={s.offlineNote}>
          <Ionicons name="wifi-outline" size={14} color={colors.textMuted} />
          <Text style={s.offlineText}>This card is stored on your device and viewable without internet.</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  icon: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"];
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
  iconColor?: string;
}

function InfoField({ label, icon, value, editing, onChange, colors, placeholder, multiline, keyboardType, iconColor }: FieldProps) {
  const s = makeStyles(colors);
  return (
    <View style={s.field}>
      <View style={s.fieldLabel}>
        <Ionicons name={icon as any} size={14} color={iconColor || colors.accent} />
        <Text style={s.fieldLabelText}>{label}</Text>
      </View>
      {editing ? (
        <TextInput
          style={[s.input, multiline && s.inputMulti]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          keyboardType={keyboardType || "default"}
        />
      ) : (
        <Text style={s.fieldValue}>{value || <Text style={s.fieldEmpty}>Not set</Text>}</Text>
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
    scroll: { padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    title: { fontSize: 24, fontWeight: "900", color: colors.text },
    subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: "600" },
    editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentLight, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: colors.accent + "40" },
    sosBanner: { backgroundColor: "#ef4444", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
    sosText: { color: "#fff", fontSize: 12, fontWeight: "800", flex: 1, lineHeight: 18 },
    section: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 10 },
    sectionLabel: { fontSize: 10, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    bloodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    bloodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.cardAlt },
    bloodChipText: { fontSize: 13, fontWeight: "800", color: colors.text },
    bloodTypeDisplay: { fontSize: 36, fontWeight: "900", color: "#ef4444", letterSpacing: -1 },
    sectionGroup: { fontSize: 10, fontWeight: "800", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 4 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
    field: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 8 },
    fieldLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
    fieldLabelText: { fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
    fieldValue: { fontSize: 15, fontWeight: "600", color: colors.text, lineHeight: 22 },
    fieldEmpty: { color: colors.textMuted, fontStyle: "italic" },
    input: { fontSize: 15, color: colors.text, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.inputBg },
    inputMulti: { minHeight: 72, textAlignVertical: "top" },
    saveBtn: { backgroundColor: colors.accent, borderRadius: 16, height: 54, justifyContent: "center", alignItems: "center", marginTop: 16, shadowColor: colors.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    offlineNote: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 16, justifyContent: "center" },
    offlineText: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  });
}
