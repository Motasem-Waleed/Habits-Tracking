import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

// Local DB
import { getHabitsLocal } from "../services/habitService";
import { run } from "../utils/storage";

// Online (Firestore)
import {
  fetchHabitsOnline,
  upsertHabitOnline,
} from "../services/onlineHabitService";


const HabitsContext = createContext(null);


export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHabits = async (userId) => {
    try {
      setLoading(true);
      const rows = await getHabitsLocal(userId);
      setHabits(rows || []);
    } catch (e) {
      console.log("Load habits error:", e);
    } finally {
      setLoading(false);
    }
  };


  const backupHabits = async (email) => {
    if (!email) {
      Alert.alert("Backup", "No email found. Please login again.");
      return;
    }

    try {
      if (!habits.length) {
        Alert.alert("Backup", "No habits to backup.");
        return;
      }

      for (const habit of habits) {
        await upsertHabitOnline(email, habit);
      }

      Alert.alert("Backup", "Done ✅");
    } catch (e) {
      console.log("Backup error:", e);
      Alert.alert("Backup", "Failed. Check internet and try again.");
    }
  };

 
  const restoreHabits = async (email) => {
    if (!email) {
      Alert.alert("Restore", "No email found. Please login again.");
      return;
    }

    try {
      const emailKey = email.trim().toLowerCase();
      const cloudHabits = await fetchHabitsOnline(emailKey);

      if (!cloudHabits || !cloudHabits.length) {
        Alert.alert("Restore", "No habits found in cloud.");
        return;
      }

      const now = Date.now();

      for (const h of cloudHabits) {
        if (!h?.habitId) continue;
        if (h.deleted === 1) continue;

        await run(
          `INSERT OR REPLACE INTO habits
          (habitId, userId, title, icon, frequency, target,
           reminderTime, reminderIntervalHours, notificationId,
           createdAt, updatedAt, deleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            h.habitId,
            emailKey,
            h.title ?? "",
            h.icon ?? "",
            h.frequency ?? "daily",
            Number.isFinite(h.target) ? h.target : 0,
            h.reminderTime ?? null,
            Number.isFinite(h.reminderIntervalHours)
              ? h.reminderIntervalHours
              : 0,
            h.notificationId ?? null,
            h.createdAt ?? now,
            h.updatedAt ?? now,
          ]
        );
      }

      await loadHabits(emailKey);
      Alert.alert("Restore", "Done ✅");
    } catch (e) {
      console.log("Restore error:", e);
      Alert.alert("Restore", "Failed. Check internet and try again.");
    }
  };


  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        loadHabits,
        backupHabits,
        restoreHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};


export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used inside HabitsProvider");
  }
  return context;
};




