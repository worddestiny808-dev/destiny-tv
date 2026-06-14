const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'destiny_tv.db');

// Ensure parent directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let db;

function getDB() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      status TEXT NOT NULL DEFAULT 'pending',
      invite_code TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category_id TEXT REFERENCES categories(id),
      thumbnail_url TEXT,
      video_url TEXT,
      video_type TEXT DEFAULT 'upload',
      duration TEXT,
      speaker TEXT,
      series TEXT,
      tags TEXT,
      featured INTEGER DEFAULT 0,
      live INTEGER DEFAULT 0,
      live_url TEXT,
      views INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      uploaded_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invite_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      created_by TEXT REFERENCES users(id),
      used_by TEXT REFERENCES users(id),
      used_at TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      video_id TEXT REFERENCES videos(id),
      watched_at TEXT DEFAULT (datetime('now')),
      progress INTEGER DEFAULT 0
    );
  `);

  // Seed default categories
  const cats = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (cats.c === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    [
      [uuidv4(), 'Sermons', 'sermons', 'Powerful messages from the Word of God', '\uD83D\uDCD6', 1],
      [uuidv4(), 'Worship', 'worship', 'Praise and worship sessions', '\uD83C\uDFB5', 2],
      [uuidv4(), 'Bible Study', 'bible-study', 'In-depth Bible study sessions', '\uD83D\uDCDA', 3],
      [uuidv4(), 'Events', 'events', 'Church events and conferences', '\uD83C\uDF89', 4],
      [uuidv4(), 'Testimonies', 'testimonies', 'Inspiring testimonies', '\u2728', 5],
      [uuidv4(), 'Prayer', 'prayer', 'Prayer and intercession', '\uD83D\uDE4F', 6],
    ].forEach(row => insertCat.run(...row));
  }

  // Seed default admin
  const admin = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get();
  if (admin.c === 0) {
    const hashedPwd = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'DestinyTV@Admin2024!', 10);
    db.prepare('INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)').run(
      uuidv4(),
      'Destiny Admin',
      process.env.ADMIN_EMAIL || 'admin@destinytv.com',
      hashedPwd,
      'admin',
      'active'
    );
    console.log('Default admin created');
  }

  console.log('Database initialized at', DB_PATH);
}

module.exports = { getDB, initDB };
