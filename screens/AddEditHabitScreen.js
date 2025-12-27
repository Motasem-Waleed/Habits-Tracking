// screens/AddEditHabitScreen.js
import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { addHabitLocal, updateHabitLocal, deleteHabitLocal } from "../services/habitService";
import { scheduleHabitEveryHours, cancelScheduled } from "../services/notificationService";

export default function AddEditHabitScreen({ route, navigation }) {
  const userId = route?.params?.userId || route?.params?.email || "user@gmail.com";

  const habitToEdit = route?.params?.habit || null;
  const habitId = route?.params?.habitId || habitToEdit?.habitId || null;
  const isEdit = !!habitId;

  const [title, setTitle] = useState(habitToEdit?.title ?? "");
  const [icon, setIcon] = useState(habitToEdit?.icon ?? "✅");
  const [frequency, setFrequency] = useState(habitToEdit?.frequency ?? "daily");
  const [target, setTarget] = useState(String(habitToEdit?.target ?? 1));

  // reminder every X hours (مثال 4 ساعات)
  const [reminderHours, setReminderHours] = useState(
    String(habitToEdit?.reminderIntervalHours ?? 4)
  );

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title ?? "");
      setIcon(habitToEdit.icon ?? "✅");
      setFrequency(habitToEdit.frequency ?? "daily");
      setTarget(String(habitToEdit.target ?? 1));
      setReminderHours(String(habitToEdit.reminderIntervalHours ?? 4));
    } else if (!isEdit) {
      setTitle("");
      setIcon("✅");
      setFrequency("daily");
      setTarget("1");
      setReminderHours("4");
    }
  }, [habitToEdit, habitId, isEdit]);

  const normalizeFrequency = (val) => {
    const f = (val || "daily").trim().toLowerCase();
    if (f !== "daily" && f !== "weekly") return "daily";
    return f;
  };

  const toHoursOrZero = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(n);
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter habit title.");
      return;
    }

    const hours = toHoursOrZero(reminderHours);

    const baseData = {
      title: title.trim(),
      icon: icon.trim() || "✅",
      frequency: normalizeFrequency(frequency),
      target: Number(target) || 0,
      reminderIntervalHours: hours,
    };

    try {
      if (isEdit) {
        // cancel old notification to avoid duplicates
        await cancelScheduled(habitToEdit?.notificationId);

        // schedule new if hours > 0
        let notifId = null;
        if (hours > 0) {
          notifId = await scheduleHabitEveryHours({
            habitId,
            title: baseData.title,
            hours,
          });
        }

        await updateHabitLocal(userId, habitId, {
          ...baseData,
          notificationId: notifId,
        });

        Alert.alert("Done", "Habit updated.");
      } else {
        // 1) add habit first to get habitId
        const newHabitId = await addHabitLocal(userId, {
          ...baseData,
          notificationId: null,
        });

        // 2) schedule notification and save id
        let notifId = null;
        if (hours > 0) {
          notifId = await scheduleHabitEveryHours({
            habitId: newHabitId,
            title: baseData.title,
            hours,
          });
        }

        // 3) update habit with notificationId
        await updateHabitLocal(userId, newHabitId, {
          ...baseData,
          notificationId: notifId,
        });

        Alert.alert("Done", "Habit added.");
      }

      // ✅ أبسط حل: رجوع للشاشة السابقة بدون مشاكل navigation
      navigation.goBack();
    } catch (e) {
      console.log("Save habit error:", e);
      Alert.alert("Error", String(e?.message || e));
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete", "Are you sure you want to delete this habit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: del },
    ]);
  };

  const del = async () => {
    try {
      // cancel scheduled notification if exists
      await cancelScheduled(habitToEdit?.notificationId);

      await deleteHabitLocal(userId, habitId);
      Alert.alert("Done", "Habit deleted.");

      // ✅ أبسط حل: رجوع للشاشة السابقة
      navigation.goBack();
    } catch (e) {
      console.log("Delete habit error:", e);
      Alert.alert("Error", String(e?.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEdit ? "Edit Habit" : "Add Habit"}</Text>

      <TextInput
        placeholder="Title (Drink water...)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Icon / Emoji (💧 ✅ 🏃‍♂️)"
        value={icon}
        onChangeText={setIcon}
        style={styles.input}
      />

      <TextInput
        placeholder="Frequency (daily / weekly)"
        value={frequency}
        onChangeText={setFrequency}
        style={styles.input}
      />

      <TextInput
        placeholder="Target (number)"
        value={target}
        onChangeText={setTarget}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Reminder every (hours) e.g. 4"
        value={reminderHours}
        onChangeText={setReminderHours}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>{isEdit ? "Update" : "Save"}</Text>
      </TouchableOpacity>

      {isEdit ? (
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#3F51B5",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D6D6F5",
  },
  saveBtn: {
    backgroundColor: "#5E60CE",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
