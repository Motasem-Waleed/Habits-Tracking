import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// users/{email}/progress/{habitId}/days/{date}
export async function upsertProgressOnline(email, habitId, date, progressDoc) {
  const emailKey = email.trim().toLowerCase();
  const ref = doc(db, "users", emailKey, "progress", habitId, "days", date);

  // conflict بسيط: لو الموجود بالكلود أحدث، نتجاهل المحلي
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const remote = snap.data();
    if ((remote?.updatedAt ?? 0) > (progressDoc?.updatedAt ?? 0)) {
      return { skipped: true };
    }
  }

  await setDoc(ref, { ...progressDoc, userId: emailKey, habitId, date }, { merge: true });
  return { skipped: false };
}
