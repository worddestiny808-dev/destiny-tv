const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'destiny_tv.db');
let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
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
      [uuidv4(), 'Sermons', 'sermons', 'Powerful messages from the Word of God', '📖', 1],
      [uuidv4(), 'Worship', 'worship', 'Praise and worship sessions', '🎵', 2],
      [uuidv4(), 'Bible Study', 'bible-study', 'In-depth Bible study sessions', '📚', 3],
      [uuidv4(), 'Events', 'events', 'Church events and conferences', '🎉', 4],
      [uuidv4(), 'Testimonies', 'testimonies', 'Inspiring testimonies', '✨', 5],
      [uuidv4(), 'Prayer', 'prayer', 'Prayer and intercession', '🙏', 6],
    ].forEach(row => insertCat.run(...row));
  }

  // Seed default admin
  const admin = db.prepare('SELECT COUNT(*) as c FROM users WHERE role = ?').get('admin');
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
    console.log('✅ Default admin created: admin@destinytv.com / DestinyTV@Admin2024!');
  }

  console.log('✅ Database initialized');
}

module.exports = { getDB, initDB };
