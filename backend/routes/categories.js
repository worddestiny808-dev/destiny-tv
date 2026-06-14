const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
  const db = getDB();
  const cats = db.prepare(`SELECT c.*, COUNT(v.id) as video_count FROM categories c 
    LEFT JOIN videos v ON v.category_id = c.id AND v.status = 'published' 
    GROUP BY c.id ORDER BY c.sort_order`).all();
  res.json({ categories: cats });
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  const { name, slug, description, icon, sort_order } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, slug, description, icon, sort_order || 0);
  res.json({ message: 'Category created', category: db.prepare('SELECT * FROM categories WHERE id = ?').get(id) });
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  const { name, description, icon, sort_order } = req.body;
  db.prepare('UPDATE categories SET name=?, description=?, icon=?, sort_order=? WHERE id=?').run(name, description, icon, sort_order, req.params.id);
  res.json({ message: 'Category updated' });
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
