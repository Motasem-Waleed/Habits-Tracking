import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { getHabitsLocal } from "../services/habitService";
import { getFirst, run } from "../utils/storage";
import { fetchHabitsOnline, upsertHabitOnline } from "../services/onlineHabitService";
import { syncNow } from "../services/syncService";
import { getPendingTasks } from "../utils/syncQueue";

const Home = ({ route, navigation }) => {
  const email = route?.params?.email || "";
  const userId = email || "guest";

  const [photoURL, setPhotoURL] = useState(null);
  const [name, setName] = useState("Guest");
  const [habits, setHabits] = useState([]);

  const manualSync = async () => {
    try {
      const pendingBefore = await getPendingTasks(userId);
      console.log("PENDING BEFORE:", pendingBefore.length);

      await syncNow(userId);

      const pendingAfter = await getPendingTasks(userId);
      console.log("PENDING AFTER:", pendingAfter.length);

      Alert.alert(
        "Sync",
        `Pending before: ${pendingBefore.length}\nPending after: ${pendingAfter.length}`
      );
    } catch (e) {
      console.log("Manual sync error:", e);
      Alert.alert("Sync Error", String(e?.message || e));
    }
  };

  // ✅ Backup local habits to Firestore (simple manual backup)
  const backupHabits = async () => {
    if (!email) {
      Alert.alert("Backup", "No email found. Please login again.");
      return;
    }
    try {
      if (!habits?.length) {
        Alert.alert("Backup", "No habits to backup.");
        return;
      }
      for (const h of habits) {
        await upsertHabitOnline(email, h);
      }
      Alert.alert("Backup", "Done ✅");
    } catch (e) {
      console.log("Backup error:", e);
      Alert.alert("Backup", "Failed. Check internet and try again.");
    }
  };

  // ✅ Restore habits from Firestore into SQLite (simple restore)
  const restoreHabits = async () => {
    if (!email) {
      Alert.alert("Restore", "No email found. Please login again.");
      return;
    }
    try {
      const emailKey = email.trim().toLowerCase();
      const cloudHabits = await fetchHabitsOnline(emailKey);

      if (!cloudHabits?.length) {
        Alert.alert("Restore", "No habits found in cloud.");
        return;
      }

      const now = Date.now();
      for (const h of cloudHabits) {
        if (!h?.habitId) continue;
        if (h.deleted === 1) continue;

        await run(
          `INSERT OR REPLACE INTO habits
           (habitId, userId, title, icon, frequency, target, reminderTime, reminderIntervalHours, notificationId, createdAt, updatedAt, deleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            h.habitId,
            emailKey,
            h.title ?? "",
            h.icon ?? "",
            h.frequency ?? "daily",
            Number.isFinite(h.target) ? h.target : 0,
            h.reminderTime ?? null,
            Number.isFinite(h.reminderIntervalHours) ? h.reminderIntervalHours : 0,
            h.notificationId ?? null,
            h.createdAt ?? now,
            h.updatedAt ?? now,
          ]
        );
      }

      await loadHabits();
      Alert.alert("Restore", "Done ✅");
    } catch (e) {
      console.log("Restore error:", e);
      Alert.alert("Restore", "Failed. Check internet and try again.");
    }
  };

  const loadUserInfo = async () => {
    try {
      const paramName = route?.params?.name;
      if (paramName && String(paramName).trim()) {
        setName(String(paramName).trim());
      }

      if (email) {
        const user = await getFirst("SELECT name, photoURL FROM users WHERE email = ?;", [
          email.trim().toLowerCase(),
        ]);

        if (user?.name) setName(user.name);
        setPhotoURL(user?.photoURL || null);
      } else {
        setName("Guest");
        setPhotoURL(null);
      }
    } catch (e) {
      setName(email ? email.split("@")[0] : "Guest");
      setPhotoURL(null);
    }
  };

  const loadHabits = async () => {
    try {
      const rows = await getHabitsLocal(userId);
      setHabits(rows);
    } catch (e) {
      console.log("Load habits error:", e);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", async () => {
      await syncNow(userId);
      await loadUserInfo();
      await loadHabits();
    });

    loadUserInfo();
    loadHabits();

    return unsub;
  }, [navigation, userId, email]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.welcome}>Welcome 👋</Text>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>How are you today? 🤍</Text>
          </View>

          <Image
            style={styles.avatar}
            source={{
              uri:
                photoURL ||
                "https://images.icon-icons.com/2643/PNG/512/avatar_female_woman_person_people_white_tone_icon_159360.png",
            }}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn]}
            onPress={() => navigation.navigate("AddEditHabit", { email, userId })}
          >
            <Text style={styles.btnText}>+ Add Habit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.secondaryBtn]}
            onPress={() => navigation.navigate("Statistics Screen", { email, userId })}
          >
            <Text style={styles.secondaryText}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Habits section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={backupHabits}>
            <Text>Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={restoreHabits}>
            <Text>Restore</Text>
          </TouchableOpacity>

          {/* اختياري: زر فحص الـ Sync */}
          <TouchableOpacity onPress={manualSync}>
            <Text>Sync Now</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your Habits</Text>
        </View>

        {habits.length === 0 ? (
          <Text style={styles.empty}>No habits yet. Add one!</Text>
        ) : (
          habits.map((h) => (
            <TouchableOpacity
              key={h.habitId}
              style={styles.habitItem}
              onPress={() =>
                navigation.navigate("HabitDetails", {
                  email,
                  userId,
                  habitId: h.habitId,
                  habit: h,
                })
              }
            >
              <Text style={styles.habitText}>
                {h.icon ? `${h.icon} ` : ""}{h.title}
              </Text>
              <Text style={styles.habitMeta}>
                {h.frequency} • target: {h.target || 0}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: { flex: 1 },
  welcome: { color: "#444", fontSize: 16, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "900", marginTop: 4, color: "#222" },
  subtitle: { marginTop: 6, color: "#666", fontSize: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginLeft: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtn: { backgroundColor: "#4F46E5" },
  btnText: { color: "#fff", fontWeight: "800" },
  secondaryBtn: { backgroundColor: "#E0E7FF" },
  secondaryText: { color: "#3730A3", fontWeight: "800" },
  section: {
    width: "100%",
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
  },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  empty: { marginTop: 10, color: "#666" },
  habitItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  habitText: { fontSize: 16, fontWeight: "700", color: "#222" },
  habitMeta: { marginTop: 4, color: "#666", fontSize: 13 },
});
