// services/habitService.js
import { run, getAll } from "../utils/storage";
import * as Crypto from "expo-crypto";

export async function addHabitLocal(userId, habit) {
  const habitId = Crypto.randomUUID();
  const now = Date.now();

  await run(
    `INSERT INTO habits
     (habitId, userId, title, icon, frequency, target, reminderTime, createdAt, updatedAt, deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      habitId,
      userId,
      habit.title,
      habit.icon ?? "",
      habit.frequency ?? "daily",
      habit.target ?? 0,
      habit.reminderTime ?? null,
      now,
      now,
    ]
  );

  return habitId;
}

export async function getHabitsLocal(userId) {
  return getAll(
    `SELECT * FROM habits WHERE userId=? AND deleted=0 ORDER BY createdAt DESC`,
    [userId]
  );
}

export async function updateHabitLocal(userId, habitId, updates) {
  const now = Date.now();

  await run(
    `UPDATE habits
     SET title=?, icon=?, frequency=?, target=?, reminderTime=?, updatedAt=?
     WHERE habitId=? AND userId=? AND deleted=0`,
    [
      updates.title,
      updates.icon ?? "",
      updates.frequency ?? "daily",
      updates.target ?? 0,
      updates.reminderTime ?? null,
      now,
      habitId,
      userId,
    ]
  );
}

export async function deleteHabitLocal(userId, habitId) {
  const now = Date.now();

  await run(
    `UPDATE habits SET deleted=1, updatedAt=? WHERE habitId=? AND userId=?`,
    [now, habitId, userId]
  );
}
