const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getDB } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const db = getDB();
  const stats = {
    totalVideos: db.prepare("SELECT COUNT(*) as c FROM videos WHERE status = 'published'").get().c,
    totalUsers: db.prepare("SELECT COUNT(*) as c FROM users").get().c,
    activeUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get().c,
    pendingUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'pending'").get().c,
    totalViews: db.prepare("SELECT COALESCE(SUM(views),0) as c FROM videos").get().c,
    recentVideos: db.prepare("SELECT id, title, views, created_at FROM videos WHERE status='published' ORDER BY created_at DESC LIMIT 5").all(),
    recentUsers: db.prepare("SELECT id, name, email, status, created_at FROM users ORDER BY created_at DESC LIMIT 5").all(),
    videosByCategory: db.prepare(`SELECT c.name, COUNT(v.id) as count FROM categories c LEFT JOIN videos v ON v.category_id = c.id AND v.status='published' GROUP BY c.id ORDER BY c.sort_order`).all(),
  };
  res.json(stats);
});

// Users management
router.get('/users', (req, res) => {
  const db = getDB();
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let query = 'SELECT id, name, email, role, status, invite_code, created_at, last_login FROM users';
  const params = [];
  if (status) { query += ' WHERE status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  res.json({ users: db.prepare(query).all(...params) });
});

router.put('/users/:id/approve', (req, res) => {
  const db = getDB();
  db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(req.params.id);
  res.json({ message: 'User approved' });
});

router.put('/users/:id/suspend', (req, res) => {
  const db = getDB();
  db.prepare("UPDATE users SET status = 'suspended' WHERE id = ?").run(req.params.id);
  res.json({ message: 'User suspended' });
});

router.put('/users/:id/role', (req, res) => {
  const db = getDB();
  const { role } = req.body;
  if (!['viewer', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Role updated' });
});

router.delete('/users/:id', (req, res) => {
  const db = getDB();
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// Create user directly
router.post('/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already exists' });
  const hashed = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, hashed, role || 'viewer', 'active');
  res.json({ message: 'User created', user: db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(id) });
});

// Invite codes
router.get('/invites', (req, res) => {
  const db = getDB();
  const invites = db.prepare(`SELECT i.*, u1.name as created_by_name, u2.name as used_by_name 
    FROM invite_codes i 
    LEFT JOIN users u1 ON i.created_by = u1.id 
    LEFT JOIN users u2 ON i.used_by = u2.id 
    ORDER BY i.created_at DESC`).all();
  res.json({ invites });
});

router.post('/invites', (req, res) => {
  const db = getDB();
  const { count = 1, expiresAt } = req.body;
  const created = [];
  for (let i = 0; i < Math.min(count, 50); i++) {
    const code = generateInviteCode();
    const id = uuidv4();
    db.prepare('INSERT INTO invite_codes (id, code, created_by, expires_at) VALUES (?, ?, ?, ?)').run(id, code, req.user.id, expiresAt || null);
    created.push({ id, code });
  }
  res.json({ message: `${created.length} invite code(s) created`, invites: created });
});

router.delete('/invites/:id', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM invite_codes WHERE id = ? AND used_by IS NULL').run(req.params.id);
  res.json({ message: 'Invite code deleted' });
});

// All videos (admin)
router.get('/videos', (req, res) => {
  const db = getDB();
  const videos = db.prepare(`SELECT v.*, c.name as category_name, u.name as uploader_name 
    FROM videos v LEFT JOIN categories c ON v.category_id = c.id LEFT JOIN users u ON v.uploaded_by = u.id
    WHERE v.status != 'deleted' ORDER BY v.created_at DESC`).all();
  res.json({ videos });
});

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DESTV-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

module.exports = router;
