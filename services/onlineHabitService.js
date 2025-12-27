// services/onlineHabitService.js
import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, deleteDoc } from "firebase/firestore";

export async function upsertHabitOnline(email, habit) {
  const emailKey = email.trim().toLowerCase();
  const habitId = habit.habitId;

  const ref = doc(db, "users", emailKey, "habits", habitId);
  await setDoc(ref, { ...habit, userId: emailKey }, { merge: true });
}

export async function deleteHabitOnline(email, habitId) {
  const emailKey = email.trim().toLowerCase();
  const ref = doc(db, "users", emailKey, "habits", habitId);
  await deleteDoc(ref);
}

export async function fetchHabitsOnline(email) {
  const emailKey = email.trim().toLowerCase();
  const col = collection(db, "users", emailKey, "habits");
  const snap = await getDocs(col);
  return snap.docs.map((d) => d.data());
}
