import NetInfo from "@react-native-community/netinfo";
import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

import { getPendingTasks, markTaskDone, markTaskSkipped } from "../utils/syncQueue";
import { upsertHabitOnline, deleteHabitOnline } from "./onlineHabitService";
import { upsertProgressOnline } from "./onlineProgressService";

export async function syncNow(userIdEmail) {
  const emailKey = (userIdEmail || "").trim().toLowerCase();
  if (!emailKey) return;

  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  const tasks = await getPendingTasks(emailKey);
  if (!tasks.length) return;

  for (const t of tasks) {
    try {
      const data = t.data ? JSON.parse(t.data) : null;

      // HABITS
      if (t.entity === "HABIT") {
        if (t.operation === "UPSERT") {
          // conflict بسيط: لو remote.updatedAt أحدث نتجاهل
          const ref = doc(db, "users", emailKey, "habits", t.docId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const remote = snap.data();
            if ((remote?.updatedAt ?? 0) > (data?.updatedAt ?? 0)) {
              await markTaskSkipped(t.taskId);
              continue;
            }
          }

          await upsertHabitOnline(emailKey, data);
          await markTaskDone(t.taskId);
          continue;
        }

        if (t.operation === "DELETE") {
          await deleteHabitOnline(emailKey, t.docId);
          await markTaskDone(t.taskId);
          continue;
        }
      }

      // PROGRESS
      if (t.entity === "PROGRESS") {
        if (t.operation === "UPSERT") {
          const { habitId, date, ...rest } = data || {};
          if (!habitId || !date) {
            await markTaskSkipped(t.taskId);
            continue;
          }

          const res = await upsertProgressOnline(emailKey, habitId, date, rest);
          if (res?.skipped) await markTaskSkipped(t.taskId);
          else await markTaskDone(t.taskId);

          continue;
        }
      }

      // أي شيء غير معروف
      await markTaskSkipped(t.taskId);
    } catch (e) {
      console.log("Sync task failed:", t, e);
      // لا نغيّر status حتى يعيد المحاولة لاحقاً
    }
  }
}
