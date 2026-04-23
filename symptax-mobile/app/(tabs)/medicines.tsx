import { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";

const MEDICINES = [
  { id: "1", name: "Biogesic (Paracetamol)", category: "Analgesic & Antipyretic", symptoms: ["Headache", "Fever", "Body Pain"], dosage: "500mg", interval: "Every 4–6 hours", max: "Max 8 tablets/day", advice: "Safe on empty stomach.", color: "#10b981" },
  { id: "2", name: "Advil / Medicol (Ibuprofen)", category: "Anti-inflammatory", symptoms: ["Muscle Pain", "Inflammation", "Dysmenorrhea"], dosage: "200–400mg", interval: "Every 4–6 hours", max: "Max 1200mg/day OTC", advice: "Take with food or milk.", color: "#3b82f6" },
  { id: "3", name: "Gaviscon / Kremil-S", category: "Antacid", symptoms: ["Stomachache", "Heartburn", "Bloating"], dosage: "1–2 tablets or 10ml", interval: "After meals & bedtime", max: "Max 8 tablets/day", advice: "Chew thoroughly. Avoid other meds within 2hrs.", color: "#f59e0b" },
  { id: "4", name: "Loperamide (Imodium)", category: "Anti-diarrheal", symptoms: ["Diarrhea", "Loose Stools"], dosage: "2mg (2 caps initially)", interval: "After each loose stool", max: "Max 16mg/day", advice: "Stay hydrated with electrolytes.", color: "#f97316" },
  { id: "5", name: "Neozep / Decolgen", category: "Decongestant", symptoms: ["Runny Nose", "Colds", "Sneezing"], dosage: "1 tablet", interval: "Every 6 hours", max: "Max 4 tablets/day", advice: "May cause drowsiness. Avoid driving.", color: "#0ea5e9" },
  { id: "6", name: "Amoxicillin", category: "Antibiotic", symptoms: ["Bacterial Infection", "Sore Throat", "UTI"], dosage: "250–500mg", interval: "Every 8 hours", max: "Per prescription", advice: "Finish the ENTIRE course.", color: "#8b5cf6" },
  { id: "7", name: "Solmux / Carbocisteine", category: "Mucolytic", symptoms: ["Cough with Phlegm", "Chest Congestion"], dosage: "500mg", interval: "Three times a day", max: "Per label", advice: "Drink more fluids.", color: "#14b8a6" },
  { id: "8", name: "Ascorbic Acid (Vitamin C)", category: "Vitamin", symptoms: ["Immunity Boost", "Weakness"], dosage: "500–1000mg", interval: "Once daily", max: "Max 2000mg/day", advice: "Best after breakfast.", color: "#ef4444" },
  { id: "9", name: "Buscopan (Hyoscine)", category: "Antispasmodic", symptoms: ["Stomach Cramps", "Menstrual Cramps"], dosage: "10–20mg", interval: "3–5 times a day", max: "Max 100mg/day", advice: "Take 30–60 min before meals.", color: "#6366f1" },
  { id: "10", name: "Cetirizine (Virlix)", category: "Antihistamine", symptoms: ["Allergy", "Itchiness", "Hives"], dosage: "10mg", interval: "Once daily", max: "Max 10mg/day", advice: "Take at night if drowsy.", color: "#7c3aed" },
];

export default function MedicinesScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MEDICINES.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Medicine Library</Text>
        <Text style={s.subtitle}>Search by name or symptom</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Headache, Biogesic, Fever..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="medkit-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyText}>No medicines found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOpen = expanded === item.id;
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => setExpanded(isOpen ? null : item.id)}
              activeOpacity={0.8}
            >
              <View style={[s.accent, { backgroundColor: item.color }]} />
              <View style={s.cardInner}>
                <View style={s.cardTop}>
                  <View style={[s.iconBg, { backgroundColor: item.color + "18" }]}>
                    <Ionicons name="medkit" size={18} color={item.color} />
                  </View>
                  <View style={s.cardTitle}>
                    <Text style={s.medName}>{item.name}</Text>
                    <Text style={s.medCategory}>{item.category}</Text>
                  </View>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tagsScroll}>
                  {item.symptoms.map((sym) => (
                    <View key={sym} style={[s.tag, { backgroundColor: item.color + "15", borderColor: item.color + "30" }]}>
                      <Text style={[s.tagText, { color: item.color }]}>{sym}</Text>
                    </View>
                  ))}
                </ScrollView>
                {isOpen && (
                  <View style={s.details}>
                    <View style={s.detailRow}>
                      <Ionicons name="flask-outline" size={14} color={colors.accent} />
                      <Text style={s.detailLabel}>Dosage</Text>
                      <Text style={s.detailValue}>{item.dosage}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Ionicons name="time-outline" size={14} color={colors.accent} />
                      <Text style={s.detailLabel}>Interval</Text>
                      <Text style={s.detailValue}>{item.interval}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Ionicons name="warning-outline" size={14} color={colors.warning} />
                      <Text style={s.detailLabel}>Max Dose</Text>
                      <Text style={[s.detailValue, { color: colors.warning }]}>{item.max}</Text>
                    </View>
                    <View style={[s.adviceBox, { backgroundColor: item.color + "10" }]}>
                      <Ionicons name="information-circle-outline" size={14} color={item.color} />
                      <Text style={[s.adviceText, { color: item.color }]}>{item.advice}</Text>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={s.disclaimer}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.warning} />
        <Text style={s.disclaimerText}>For reference only. Always consult your doctor.</Text>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/lib/theme").useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 12 },
    title: { fontSize: 24, fontWeight: "900", color: colors.text },
    subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 16, backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: colors.border },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: colors.text },
    card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 10, overflow: "hidden", flexDirection: "row", shadowColor: "#0f172a", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    accent: { width: 4, borderRadius: 4 },
    cardInner: { flex: 1, padding: 14 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    cardTitle: { flex: 1 },
    medName: { fontSize: 14, fontWeight: "800", color: colors.text, lineHeight: 18 },
    medCategory: { fontSize: 11, color: colors.textMuted, fontWeight: "600", marginTop: 1 },
    tagsScroll: { marginTop: 10 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginRight: 6 },
    tagText: { fontSize: 11, fontWeight: "700" },
    details: { marginTop: 14, gap: 8 },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    detailLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "700", width: 64 },
    detailValue: { fontSize: 12, color: colors.text, fontWeight: "600", flex: 1 },
    adviceBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", padding: 10, borderRadius: 10, marginTop: 4 },
    adviceText: { fontSize: 12, fontWeight: "600", flex: 1, lineHeight: 18 },
    empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
    emptyText: { color: colors.textMuted, fontSize: 15, fontWeight: "600" },
    disclaimer: { flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
    disclaimerText: { fontSize: 11, color: colors.warning, fontWeight: "600", flex: 1 },
  });
}
