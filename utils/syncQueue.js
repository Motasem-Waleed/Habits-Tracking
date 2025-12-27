import * as Crypto from "expo-crypto";
import { run, getAll } from "./storage";

export async function enqueueTask({ userId, operation, entity, docId, data }) {
  const taskId = Crypto.randomUUID();
  const timestamp = Date.now();
  const payload = data ? JSON.stringify(data) : null;

  await run(
    `INSERT INTO sync_queue (taskId, userId, operation, entity, docId, data, timestamp, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
    [taskId, userId, operation, entity, docId, payload, timestamp]
  );

  return taskId;
}

export async function getPendingTasks(userId) {
  return getAll(
    `SELECT * FROM sync_queue
     WHERE userId=? AND status='PENDING'
     ORDER BY timestamp ASC`,
    [userId]
  );
}

export async function markTaskDone(taskId) {
  await run(`UPDATE sync_queue SET status='DONE' WHERE taskId=?`, [taskId]);
}

export async function markTaskSkipped(taskId) {
  await run(`UPDATE sync_queue SET status='SKIPPED' WHERE taskId=?`, [taskId]);
}
