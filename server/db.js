import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const db = createClient({
  url: process.env.TURSO_DB_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export async function initDB() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      organization TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      price REAL DEFAULT 0,
      qty_bulk REAL DEFAULT 0,
      amount_per_sachet REAL DEFAULT 0,
      supplier TEXT DEFAULT '',
      organization TEXT NOT NULL,
      created_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS formulations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      price REAL DEFAULT 0,
      qty_bulk REAL DEFAULT 0,
      amount_per_sachet REAL DEFAULT 0,
      supplier TEXT DEFAULT '',
      organization TEXT NOT NULL,
      created_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      organization TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_name TEXT NOT NULL,
      material_code TEXT DEFAULT '',
      quantity REAL DEFAULT 0,
      unit TEXT DEFAULT 'kg',
      reason TEXT DEFAULT '',
      requested_by TEXT NOT NULL,
      requestor_dept TEXT NOT NULL,
      organization TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS pr_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pr_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      changed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pr_id) REFERENCES purchase_requests(id)
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      department TEXT NOT NULL,
      username TEXT NOT NULL,
      organization TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now'))
    )`,
  ]);
  console.log('[DB] Tables initialized');
}

export default db;
