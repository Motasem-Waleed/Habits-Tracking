import { run, getFirst, getAll } from "../utils/storage";
import { todayStr, addDaysStr } from "../utils/dateUtils";
import { enqueueTask } from "../utils/syncQueue";

function makeProgressId(habitId, dateStr) {
  return `${habitId}_${dateStr}`;
}

export async function getProgressForDateLocal({ userId, habitId, dateStr }) {
  return getFirst(
    `SELECT * FROM progress WHERE userId=? AND habitId=? AND date=? LIMIT 1`,
    [userId, habitId, dateStr]
  );
}

export async function upsertProgressLocal({ userId, habitId, dateStr, value, note, photoURI, target }) {
  const progressId = makeProgressId(habitId, dateStr);
  const updatedAt = Date.now();

  // completed = وصل للهدف
  const safeTarget = Number.isFinite(target) ? target : 0;
  const safeValue = Number.isFinite(value) ? value : 0;
  const completed = safeTarget > 0 ? (safeValue >= safeTarget ? 1 : 0) : (safeValue > 0 ? 1 : 0);

  await run(
    `INSERT OR REPLACE INTO progress
     (progressId, habitId, userId, date, completed, value, note, photoURI, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      progressId,
      habitId,
      userId,
      dateStr,
      completed,
      safeValue,
      note ?? "",
      photoURI ?? null,
      updatedAt,
    ]
  );

  await enqueueTask({
  userId,
  operation: "UPSERT",
  entity: "PROGRESS",
  docId: progressId,
  data: {
    habitId,
    date: dateStr,
    completed,
    value: safeValue,
    note: note ?? "",
    photoURI: photoURI ?? null,
    updatedAt,
  },
});


  return { completed };
}

export async function getStreakLocal({ userId, habitId }) {
  // اجلب أيام مكتملة (آخر 90 يوم كفاية)
  const rows = await getAll(
    `SELECT date FROM progress
     WHERE userId=? AND habitId=? AND completed=1
     ORDER BY date DESC LIMIT 90`,
    [userId, habitId]
  );

  const doneSet = new Set(rows.map((r) => r.date));
  let streak = 0;
  let d = todayStr();

  while (doneSet.has(d)) {
    streak += 1;
    d = addDaysStr(d, -1);
  }

  return streak;
}
