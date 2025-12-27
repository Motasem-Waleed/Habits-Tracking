// utils/storage.js
import * as SQLite from "expo-sqlite";

let db = null;

export async function initDb() {
  db = await SQLite.openDatabaseAsync("habits.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS habits (
      habitId TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      icon TEXT,
      frequency TEXT NOT NULL,
      target INTEGER,
      reminderTime TEXT,
      reminderIntervalHours INTEGER,
      notificationId TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      deleted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS progress (
      progressId TEXT PRIMARY KEY NOT NULL,
      habitId TEXT NOT NULL,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      value INTEGER,
      note TEXT,
      photoURI TEXT,
      updatedAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      taskId TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      operation TEXT NOT NULL,
      entity TEXT NOT NULL,
      docId TEXT NOT NULL,
      data TEXT,
      timestamp INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING'
    );

    CREATE TABLE IF NOT EXISTS users (
      userId TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      createdAt INTEGER,
      updatedAt INTEGER
    );
  `);

  // ✅ add photoURL column if it doesn't exist (migration)
  try {
    await db.execAsync(`ALTER TABLE users ADD COLUMN photoURL TEXT;`);
  } catch (e) {
    // column already exists -> ignore
  }
}

function ensureDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
}

export async function run(sql, params = []) {
  ensureDb();
  return db.runAsync(sql, params);
}

export async function getAll(sql, params = []) {
  ensureDb();
  return db.getAllAsync(sql, params);
}

export async function getFirst(sql, params = []) {
  const rows = await getAll(sql, params);
  return rows[0] ?? null;
}
