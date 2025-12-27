import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const key = (email) => (email || "").trim().toLowerCase();

export async function getUserOnline(email) {
  const emailKey = key(email);
  const ref = doc(db, "users", emailKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function upsertUserOnline(email, data) {
  const emailKey = key(email);
  const ref = doc(db, "users", emailKey);

  await setDoc(
    ref,
    {
      email: emailKey,
      ...data,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}
