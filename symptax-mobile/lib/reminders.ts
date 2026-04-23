import * as Notifications from "expo-notifications";
import { ReminderSettings } from "./storage";

export async function requestLocalNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number);
  return { hour: h, minute: m };
}

export async function scheduleReminders(settings: ReminderSettings): Promise<void> {
  await cancelAllReminders();

  // Medication reminders – daily at chosen times
  if (settings.medication.enabled) {
    for (const time of settings.medication.times) {
      const { hour, minute } = parseTime(time);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Medication Reminder",
          body: "Time to take your medication. Stay on schedule!",
          sound: true,
        },
        trigger: { hour, minute, repeats: true } as any,
      });
    }
  }

  // Hydration nudges – every 2 hours from 8am to 8pm
  if (settings.hydration.enabled) {
    for (const hour of [8, 10, 12, 14, 16, 18, 20]) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Hydration Reminder",
          body: "Drink a glass of water! Staying hydrated is key to good health.",
          sound: true,
        },
        trigger: { hour, minute: 0, repeats: true } as any,
      });
    }
  }

  // Stretch / stand-up reminders – every 2 hours from 9am to 5pm
  if (settings.stretch.enabled) {
    for (const hour of [9, 11, 13, 15, 17]) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧘 Time to Stretch!",
          body: "Stand up, stretch, and take a short walk. Your body will thank you!",
          sound: true,
        },
        trigger: { hour, minute: 0, repeats: true } as any,
      });
    }
  }

  // Bedtime wind-down alert
  if (settings.bedtime.enabled) {
    const { hour, minute } = parseTime(settings.bedtime.time);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌙 Bedtime Wind-Down",
        body: "Time to wind down. Put away devices and relax for restful sleep.",
        sound: true,
      },
      trigger: { hour, minute, repeats: true } as any,
    });
  }
}
