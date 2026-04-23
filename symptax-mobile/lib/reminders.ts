import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ReminderSettings } from "./storage";

// Configure how notifications should be handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestLocalNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366f1",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === "granted";
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error("Failed to cancel notifications", e);
  }
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
}

export async function scheduleReminders(settings: ReminderSettings): Promise<void> {
  try {
    // 1. Clear everything first
    await cancelAllReminders();

    // 2. Schedule Medication Reminders
    if (settings.medication.enabled && settings.medication.times.length > 0) {
      for (const time of settings.medication.times) {
        const { hour, minute } = parseTime(time);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💊 Medication Reminder",
            body: `It's ${time}. Time for your scheduled medication.`,
            sound: "default",
          },
          trigger: { hour, minute, repeats: true, channelId: "default" },
        });
      }
    }

    // 3. Schedule Hydration (Every 2 hours, 8am-8pm)
    if (settings.hydration.enabled) {
      for (const hour of [8, 10, 12, 14, 16, 18, 20]) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💧 Hydration Reminder",
            body: "Time for a glass of water. Stay hydrated!",
            sound: "default",
          },
          trigger: { hour, minute: 0, repeats: true, channelId: "default" },
        });
      }
    }

    // 4. Schedule Stretch (Every 2 hours, 9am-5pm)
    if (settings.stretch.enabled) {
      for (const hour of [9, 11, 13, 15, 17]) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🧘 Stretch Reminder",
            body: "Take 5 minutes to stretch and move around.",
            sound: "default",
          },
          trigger: { hour, minute: 0, repeats: true, channelId: "default" },
        });
      }
    }

    // 5. Bedtime
    if (settings.bedtime.enabled) {
      const { hour, minute } = parseTime(settings.bedtime.time);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 Bedtime Wind-down",
          body: "Time to relax and prepare for sleep.",
          sound: "default",
        },
        trigger: { hour, minute, repeats: true, channelId: "default" },
      });
    }
  } catch (error) {
    console.error("Critical error in scheduleReminders:", error);
    throw error; // Let the UI handle the failure
  }
}
