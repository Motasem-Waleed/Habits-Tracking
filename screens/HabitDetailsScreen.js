import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import ProgressBar from "../components/ProgressBar";
import { todayStr } from "../utils/dateUtils";
import { getProgressForDateLocal, upsertProgressLocal, getStreakLocal } from "../services/progressService";
import { getFirst } from "../utils/storage";

export default function HabitDetailsScreen({ route, navigation }) {
  const email = route?.params?.email || "";
  const userId = route?.params?.userId || email || "guest";
  const habitId = route?.params?.habitId;
  const passedHabit = route?.params?.habit || null;

  const [habit, setHabit] = useState(passedHabit);
  const [value, setValue] = useState(0);
  const [note, setNote] = useState("");
  const [photoURI, setPhotoURI] = useState(null);
  const [streak, setStreak] = useState(0);

  const dateStr = todayStr();

  const loadHabitIfNeeded = async () => {
    if (habit) return;
    if (!habitId) return;

    const h = await getFirst(
      `SELECT * FROM habits WHERE userId=? AND habitId=? AND deleted=0 LIMIT 1`,
      [userId, habitId]
    );
    setHabit(h);
  };

  const loadTodayProgress = async (h) => {
    if (!h?.habitId) return;

    const p = await getProgressForDateLocal({ userId, habitId: h.habitId, dateStr });
    setValue(p?.value ?? 0);
    setNote(p?.note ?? "");
    setPhotoURI(p?.photoURI ?? null);

    const s = await getStreakLocal({ userId, habitId: h.habitId });
    setStreak(s);
  };

  useEffect(() => {
    (async () => {
      await loadHabitIfNeeded();
    })();
  }, []);

  useEffect(() => {
    if (habit) loadTodayProgress(habit);
  }, [habitId, habit?.habitId]);

  const changeValue = (delta) => {
    const next = Math.max(0, (Number.isFinite(value) ? value : 0) + delta);
    setValue(next);
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission", "Gallery permission is required.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotoURI(res.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const save = async () => {
    if (!habit?.habitId) return;

    await upsertProgressLocal({
      userId,
      habitId: habit.habitId,
      dateStr,
      value,
      note,
      photoURI,
      target: habit.target,
    });

    const s = await getStreakLocal({ userId, habitId: habit.habitId });
    setStreak(s);

    Alert.alert("Saved", "Today progress saved ✅");
  };

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {habit.icon ? `${habit.icon} ` : ""}{habit.title}
        </Text>

        <Text style={styles.meta}>
          {dateStr} • target: {habit.target || 0}
        </Text>

        <ProgressBar value={value} target={habit.target || 0} />

        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={() => changeValue(-1)}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.valueText}>{value}</Text>

          <TouchableOpacity style={styles.btn} onPress={() => changeValue(1)}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.streak}>Streak: {streak} day(s)</Text>

        <TextInput
          style={styles.input}
          placeholder="Note (optional)"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text style={styles.imageBtnText}>Pick Image (optional)</Text>
        </TouchableOpacity>

        {photoURI ? (
          <Image source={{ uri: photoURI }} style={styles.image} />
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={save}>
            <Text style={styles.saveText}>Save Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate("AddEditHabit", { email, userId, habit })}
          >
            <Text style={styles.editText}>Edit Habit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16 },
  title: { fontSize: 20, fontWeight: "900", color: "#111" },
  meta: { marginTop: 6, color: "#666" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 14 },
  btn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  valueText: { fontSize: 22, fontWeight: "900", color: "#111" },
  streak: { marginTop: 10, fontWeight: "800", color: "#111" },
  input: { marginTop: 12, backgroundColor: "#F3F4F6", borderRadius: 12, padding: 12, minHeight: 70 },
  imageBtn: { marginTop: 12, backgroundColor: "#E0E7FF", padding: 12, borderRadius: 12, alignItems: "center" },
  imageBtnText: { color: "#3730A3", fontWeight: "900" },
  image: { marginTop: 12, width: "100%", height: 200, borderRadius: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  saveBtn: { backgroundColor: "#16A34A" },
  saveText: { color: "#fff", fontWeight: "900" },
  editBtn: { backgroundColor: "#E5E7EB" },
  editText: { color: "#111", fontWeight: "900" },
});
