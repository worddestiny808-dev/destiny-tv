const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');
const { authenticate, generateToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const db = getDB();

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Validate invite code if provided
    let status = 'pending';
    if (inviteCode) {
      const invite = db.prepare(`SELECT * FROM invite_codes WHERE code = ? AND used_by IS NULL AND (expires_at IS NULL OR expires_at > datetime('now'))`).get(inviteCode.toUpperCase());
      if (!invite) return res.status(400).json({ error: 'Invalid or expired invite code' });
      status = 'active';
      // Mark invite as used
      const userId = uuidv4();
      const hashedPwd = bcrypt.hashSync(password, 10);
      db.prepare('INSERT INTO users (id, name, email, password, role, status, invite_code) VALUES (?, ?, ?, ?, ?, ?, ?)').run(userId, name, email, hashedPwd, 'viewer', status, inviteCode);
      db.prepare('UPDATE invite_codes SET used_by = ?, used_at = datetime(\'now\') WHERE code = ?').run(userId, inviteCode.toUpperCase());
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      const token = generateToken(user);
      return res.json({ token, user: sanitizeUser(user), message: 'Welcome to Destiny TV!' });
    }

    const hashedPwd = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    db.prepare('INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)').run(userId, name, email, hashedPwd, 'viewer', status);

    res.json({ message: 'Registration successful. Your account is pending approval by the administrator.', pending: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.status === 'pending') return res.status(403).json({ error: 'Your account is pending approval. Please contact the administrator.' });
    if (user.status === 'suspended') return res.status(403).json({ error: 'Your account has been suspended. Please contact the administrator.' });

    db.prepare('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?').run(user.id);

    const token = generateToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// Change password
router.put('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);
  res.json({ message: 'Password updated successfully' });
});

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = router;
