import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiRequest } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(token: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("Push notifications only work on physical devices.");
    return null;
  }

  // SDK 54+: Remote notifications are not supported in Expo Go
  if (Constants.appOwnership === "expo") {
    console.warn("Remote push notifications are not supported in Expo Go (SDK 53+). Please use a Development Build for full testing.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Permission for push notifications not granted.");
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // Register push token with backend
  try {
    await apiRequest("/api/mobile/push-token", {
      method: "POST",
      token,
      body: JSON.stringify({ pushToken: expoPushToken }),
    });
  } catch (err) {
    console.error("Failed to register push token", err);
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366f1",
    });
  }

  return expoPushToken;
}
