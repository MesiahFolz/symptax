import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  REMINDER_SETTINGS: "symptax_reminders",
  EMERGENCY_CARD: "symptax_emergency_card",
  GUEST_PROFILE: "symptax_guest_profile",
};

export interface ReminderSettings {
  medication: { enabled: boolean; times: string[] };
  hydration: { enabled: boolean };
  stretch: { enabled: boolean };
  bedtime: { enabled: boolean; time: string };
}

export interface EmergencyCard {
  name: string;
  bloodType: string;
  conditions: string;
  medications: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  doctorName: string;
  doctorPhone: string;
}

export interface GuestProfile {
  name: string;
  image: string | null;
  bloodType: string;
  conditions: string;
  medications: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export const DEFAULT_REMINDERS: ReminderSettings = {
  medication: { enabled: false, times: ["08:00", "20:00"] },
  hydration: { enabled: false },
  stretch: { enabled: false },
  bedtime: { enabled: false, time: "22:00" },
};

export const DEFAULT_EMERGENCY: EmergencyCard = {
  name: "",
  bloodType: "",
  conditions: "",
  medications: "",
  allergies: "",
  emergencyContact: "",
  emergencyPhone: "",
  doctorName: "",
  doctorPhone: "",
};

export const DEFAULT_GUEST: GuestProfile = {
  name: "Guest",
  image: null,
  bloodType: "",
  conditions: "",
  medications: "",
  allergies: "",
  emergencyContact: "",
  emergencyPhone: "",
};

export async function getReminderSettings(): Promise<ReminderSettings> {
  const raw = await AsyncStorage.getItem(KEYS.REMINDER_SETTINGS);
  if (!raw) return DEFAULT_REMINDERS;
  try { return { ...DEFAULT_REMINDERS, ...JSON.parse(raw) }; } catch { return DEFAULT_REMINDERS; }
}

export async function saveReminderSettings(s: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDER_SETTINGS, JSON.stringify(s));
}

export async function getEmergencyCard(): Promise<EmergencyCard> {
  const raw = await AsyncStorage.getItem(KEYS.EMERGENCY_CARD);
  if (!raw) return DEFAULT_EMERGENCY;
  try { return { ...DEFAULT_EMERGENCY, ...JSON.parse(raw) }; } catch { return DEFAULT_EMERGENCY; }
}

export async function saveEmergencyCard(card: EmergencyCard): Promise<void> {
  await AsyncStorage.setItem(KEYS.EMERGENCY_CARD, JSON.stringify(card));
}

export async function getGuestProfile(): Promise<GuestProfile> {
  const raw = await AsyncStorage.getItem(KEYS.GUEST_PROFILE);
  if (!raw) return DEFAULT_GUEST;
  try { return { ...DEFAULT_GUEST, ...JSON.parse(raw) }; } catch { return DEFAULT_GUEST; }
}

export async function saveGuestProfile(profile: GuestProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.GUEST_PROFILE, JSON.stringify(profile));
}
