const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.startsWith('video/') ? 'uploads/videos' : 'uploads/thumbnails';
    const fs = require('fs');
    fs.mkdirSync(path.join(__dirname, '..', dir), { recursive: true });
    cb(null, path.join(__dirname, '..', dir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Invalid video format'));
    } else if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Invalid image format'));
    } else {
      cb(null, true);
    }
  }
});

// Get all published videos (authenticated users)
router.get('/', authenticate, (req, res) => {
  const db = getDB();
  const { category, search, featured, live, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT v.*, c.name as category_name, c.slug as category_slug, u.name as uploader_name 
               FROM videos v 
               LEFT JOIN categories c ON v.category_id = c.id 
               LEFT JOIN users u ON v.uploaded_by = u.id
               WHERE v.status = 'published'`;
  const params = [];

  if (category) { query += ' AND c.slug = ?'; params.push(category); }
  if (featured === '1') { query += ' AND v.featured = 1'; }
  if (live === '1') { query += ' AND v.live = 1'; }
  if (search) {
    query += ' AND (v.title LIKE ? OR v.description LIKE ? OR v.speaker LIKE ? OR v.series LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const videos = db.prepare(query).all(...params);
  const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY.*$/, '');
  
  res.json({ videos, page: parseInt(page), limit: parseInt(limit) });
});

// Get single video
router.get('/:id', authenticate, (req, res) => {
  const db = getDB();
  const video = db.prepare(`SELECT v.*, c.name as category_name, c.slug as category_slug, u.name as uploader_name 
    FROM videos v 
    LEFT JOIN categories c ON v.category_id = c.id 
    LEFT JOIN users u ON v.uploaded_by = u.id
    WHERE v.id = ? AND v.status = 'published'`).get(req.params.id);
  
  if (!video) return res.status(404).json({ error: 'Video not found' });

  // Increment views
  db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').run(req.params.id);

  // Track watch history
  db.prepare(`INSERT INTO watch_history (id, user_id, video_id) VALUES (?, ?, ?) 
    `).run(uuidv4(), req.user.id, req.params.id);

  // Get related videos
  const related = db.prepare(`SELECT id, title, thumbnail_url, duration, views, created_at, speaker
    FROM videos WHERE category_id = ? AND id != ? AND status = 'published' 
    ORDER BY views DESC LIMIT 6`).all(video.category_id, req.params.id);

  res.json({ video, related });
});

// Upload video (admin only)
router.post('/', authenticate, requireAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  try {
    const db = getDB();
    const { title, description, category_id, speaker, series, tags, featured, live, live_url, video_url, video_type } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const id = uuidv4();
    const finalVideoUrl = req.files?.video?.[0] ? `/uploads/videos/${req.files.video[0].filename}` : video_url;
    const thumbnailUrl = req.files?.thumbnail?.[0] ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}` : req.body.thumbnail_url;
    const type = req.files?.video?.[0] ? 'upload' : (video_type || 'embed');

    db.prepare(`INSERT INTO videos (id, title, description, category_id, thumbnail_url, video_url, video_type, speaker, series, tags, featured, live, live_url, uploaded_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`).run(
      id, title, description, category_id, thumbnailUrl, finalVideoUrl, type, speaker, series, tags,
      featured === '1' ? 1 : 0, live === '1' ? 1 : 0, live_url, req.user.id
    );

    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    res.json({ message: 'Video uploaded successfully', video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update video (admin only)
router.put('/:id', authenticate, requireAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  const db = getDB();
  const { title, description, category_id, speaker, series, tags, featured, live, live_url, video_url, status } = req.body;
  const thumbnailUrl = req.files?.thumbnail?.[0] ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}` : req.body.thumbnail_url;

  db.prepare(`UPDATE videos SET title=?, description=?, category_id=?, thumbnail_url=?, video_url=COALESCE(?, video_url), speaker=?, series=?, tags=?, featured=?, live=?, live_url=?, status=?, updated_at=datetime('now') WHERE id=?`)
    .run(title, description, category_id, thumbnailUrl, video_url, speaker, series, tags, featured === '1' ? 1 : 0, live === '1' ? 1 : 0, live_url, status || 'published', req.params.id);

  res.json({ message: 'Video updated', video: db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id) });
});

// Delete video (admin only)
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  db.prepare('UPDATE videos SET status = ? WHERE id = ?').run('deleted', req.params.id);
  res.json({ message: 'Video removed' });
});

module.exports = router;
