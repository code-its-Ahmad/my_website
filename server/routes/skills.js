import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/skills
router.get('/', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM skills ORDER BY order_index ASC, id ASC').all();
    const skills = raw.map((s) => ({
      ...s,
      featured: Boolean(s.featured)
    }));
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// POST /api/skills (Admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, category, level, percentage, icon, color, featured, years_experience, order_index } = req.body;
    if (!name || !category || percentage === undefined) {
      return res.status(400).json({ error: 'Name, category, and percentage are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO skills (name, category, level, percentage, icon, color, featured, years_experience, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      category.trim(),
      level || 'Advanced',
      Number(percentage) || 80,
      icon || '⚡',
      color || 'from-blue-400 to-blue-600',
      featured ? 1 : 0,
      years_experience || '2+ yrs',
      order_index || 0
    );

    const newSkill = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Skill added successfully.',
      skill: { ...newSkill, featured: Boolean(newSkill.featured) }
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Failed to add skill.' });
  }
});

// PUT /api/skills/:id (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, category, level, percentage, icon, color, featured, years_experience, order_index } = req.body;

    const stmt = db.prepare(`
      UPDATE skills SET
        name = ?,
        category = ?,
        level = ?,
        percentage = ?,
        icon = ?,
        color = ?,
        featured = ?,
        years_experience = ?,
        order_index = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      category,
      level,
      Number(percentage),
      icon,
      color,
      featured ? 1 : 0,
      years_experience,
      order_index || 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Skill not found.' });

    res.json({
      message: 'Skill updated successfully.',
      skill: { ...updated, featured: Boolean(updated.featured) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update skill.' });
  }
});

// DELETE /api/skills/:id (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Skill not found.' });
    res.json({ message: 'Skill deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
});

export default router;
