import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensureNotifSetup() {
  const perm = await Notifications.getPermissionsAsync();
  if (perm.status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") {
      throw new Error("Notification permission denied");
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("habits", {
      name: "Habits Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleHabitEveryHours({ habitId, title, hours }) {
  await ensureNotifSetup();

  const seconds = Math.max(60, Number(hours) * 3600); // 4 ساعات = 14400 ثانية
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: `Time for: ${title}`,
      data: { habitId },
      sound: true,
    },
    trigger: {
      type: "timeInterval",
      seconds,
      repeats: true,
    },
  });

  return notificationId;
}

export async function cancelScheduled(id) {
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}
