const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Multer - memory storage for thumbnails only (small files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB thumbnails only
});

// Get all published videos
router.get('/', authenticate, (req, res) => {
  const db = getDB();
  const { category, search, featured, live, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = "WHERE v.status = 'published'";
  const params = [];

  if (category) { where += ' AND c.slug = ?'; params.push(category); }
  if (featured === '1') { where += ' AND v.featured = 1'; }
  if (live === '1') { where += ' AND v.live = 1'; }
  if (search) {
    where += ' AND (v.title LIKE ? OR v.description LIKE ? OR v.speaker LIKE ? OR v.series LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const query = `SELECT v.*, c.name as category_name, c.slug as category_slug, u.name as uploader_name 
    FROM videos v 
    LEFT JOIN categories c ON v.category_id = c.id 
    LEFT JOIN users u ON v.uploaded_by = u.id
    ${where}
    ORDER BY v.created_at DESC LIMIT ? OFFSET ?`;

  params.push(parseInt(limit), offset);
  const videos = db.prepare(query).all(...params);
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

  db.prepare('UPDATE videos SET views = views + 1 WHERE id = ?').run(req.params.id);

  const related = db.prepare(`SELECT id, title, thumbnail_url, duration, views, created_at, speaker
    FROM videos WHERE category_id = ? AND id != ? AND status = 'published' 
    ORDER BY views DESC LIMIT 6`).all(video.category_id, req.params.id);

  res.json({ video, related });
});

// Create video record (URLs come from Cloudinary direct upload or manual embed)
router.post('/', authenticate, requireAdmin, express.json({ limit: '1mb' }), (req, res) => {
  try {
    const db = getDB();
    const {
      title, description, category_id, speaker, series, tags,
      featured, live, live_url, video_url, video_type,
      thumbnail_url, duration
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!video_url) return res.status(400).json({ error: 'Video URL is required' });

    const id = uuidv4();
    db.prepare(`INSERT INTO videos 
      (id, title, description, category_id, thumbnail_url, video_url, video_type, duration, speaker, series, tags, featured, live, live_url, uploaded_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`).run(
      id, title, description || null, category_id || null,
      thumbnail_url || null, video_url, video_type || 'embed',
      duration || null, speaker || null, series || null, tags || null,
      featured ? 1 : 0, live ? 1 : 0, live_url || null, req.user.id
    );

    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    res.json({ message: 'Video saved successfully', video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update video
router.put('/:id', authenticate, requireAdmin, express.json({ limit: '1mb' }), (req, res) => {
  const db = getDB();
  const { title, description, category_id, speaker, series, tags, featured, live, live_url, video_url, thumbnail_url, status, duration } = req.body;
  db.prepare(`UPDATE videos SET title=?, description=?, category_id=?, thumbnail_url=COALESCE(?,thumbnail_url), video_url=COALESCE(?,video_url), speaker=?, series=?, tags=?, featured=?, live=?, live_url=?, status=?, duration=COALESCE(?,duration), updated_at=datetime('now') WHERE id=?`)
    .run(title, description, category_id, thumbnail_url, video_url, speaker, series, tags, featured ? 1 : 0, live ? 1 : 0, live_url, status || 'published', duration, req.params.id);
  res.json({ message: 'Video updated', video: db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id) });
});

// Delete video
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  db.prepare("UPDATE videos SET status = 'deleted' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Video removed' });
});

// Get Cloudinary signature for direct upload
router.post('/cloudinary-signature', authenticate, requireAdmin, (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiSecret || !apiKey) {
    return res.status(400).json({ error: 'Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to environment variables.' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'destiny-tv/videos';
  const params = { folder, timestamp };

  const crypto = require('crypto');
  const paramStr = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  const signature = crypto.createHash('sha256').update(paramStr + apiSecret).digest('hex');

  res.json({ signature, timestamp, apiKey, cloudName, folder });
});

// Get Cloudinary signature for thumbnail upload
router.post('/cloudinary-thumbnail-signature', authenticate, requireAdmin, (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiSecret || !apiKey) {
    return res.status(400).json({ error: 'Cloudinary not configured' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'destiny-tv/thumbnails';
  const params = { folder, timestamp };

  const crypto = require('crypto');
  const paramStr = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  const signature = crypto.createHash('sha256').update(paramStr + apiSecret).digest('hex');

  res.json({ signature, timestamp, apiKey, cloudName, folder });
});

module.exports = router;
