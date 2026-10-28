import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pirozhok.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL UNIQUE,username TEXT NOT NULL UNIQUE COLLATE NOCASE,display_name TEXT NOT NULL,password_hash TEXT NOT NULL,avatar_url TEXT,role TEXT NOT NULL DEFAULT 'user',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,user_id INTEGER NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',video_url TEXT NOT NULL,thumbnail_url TEXT NOT NULL DEFAULT '',kind TEXT NOT NULL,duration_seconds INTEGER,category_id INTEGER,author_id INTEGER NOT NULL,views INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS subscriptions (subscriber_id INTEGER NOT NULL,author_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(subscriber_id,author_id));
CREATE TABLE IF NOT EXISTS reactions (user_id INTEGER NOT NULL,video_id INTEGER NOT NULL,value INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,video_id));
CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,video_id INTEGER NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS friend_requests (id INTEGER PRIMARY KEY AUTOINCREMENT,sender_id INTEGER NOT NULL,receiver_id INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(sender_id,receiver_id));
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT,sender_id INTEGER NOT NULL,receiver_id INTEGER NOT NULL,body TEXT NOT NULL DEFAULT '',video_id INTEGER,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS saved_folders (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,name TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(user_id,name));
CREATE TABLE IF NOT EXISTS saved_videos (folder_id INTEGER NOT NULL,video_id INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(folder_id,video_id));
`);
const n = db.prepare('SELECT COUNT(*) n FROM categories').get().n;
if (!n) for (let i=1;i<=5;i++) db.prepare('INSERT INTO categories(name) VALUES (?)').run(`Category ${i}`);

function hashPassword(password){ const salt=crypto.randomBytes(16).toString('hex'); const hash=crypto.scryptSync(password,salt,64).toString('hex'); return `${salt}:${hash}`; }
const email = process.env.ADMIN_EMAIL || 'admin@pirozhok.local';
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'change-me-now';
let user = db.prepare('SELECT * FROM users WHERE email=? OR username=?').get(email, username);
if (!user) {
  db.prepare("INSERT INTO users(email,username,display_name,password_hash,role) VALUES (?,?,?,?, 'admin')").run(email, username, 'Pirozhok Admin', hashPassword(password));
  console.log(`Created admin: ${email} / ${password}`);
} else {
  db.prepare("UPDATE users SET role='admin' WHERE id=?").run(user.id);
  console.log(`Admin already exists: ${user.email}`);
}
const adminId = db.prepare("SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1").get().id;
const folder = db.prepare("SELECT id FROM saved_folders WHERE user_id=? AND name='Saved'").get(adminId);
if (!folder) db.prepare("INSERT INTO saved_folders(user_id,name) VALUES (?, 'Saved')").run(adminId);
console.log(`Database ready at ${dbPath}`);
