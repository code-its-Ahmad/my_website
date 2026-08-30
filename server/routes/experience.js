import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

function safeParse(val, fallback) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// GET /api/experience
router.get('/', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM experiences ORDER BY order_index ASC, id ASC').all();
    const experiences = raw.map((e) => ({
      ...e,
      achievements: safeParse(e.achievements, []),
      technologies: safeParse(e.technologies, [])
    }));
    res.json({ experiences });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences.' });
  }
});

// POST /api/experience (Admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { type, title, company_or_school, location, period, description, achievements, technologies, icon, order_index } = req.body;
    if (!title || !company_or_school || !period || !description) {
      return res.status(400).json({ error: 'Title, company/school, period, and description are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO experiences (type, title, company_or_school, location, period, description, achievements, technologies, icon, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      type || 'work',
      title.trim(),
      company_or_school.trim(),
      location || '',
      period.trim(),
      description.trim(),
      Array.isArray(achievements) ? JSON.stringify(achievements) : (achievements || '[]'),
      Array.isArray(technologies) ? JSON.stringify(technologies) : (technologies || '[]'),
      icon || (type === 'education' ? '🎓' : '💻'),
      order_index || 0
    );

    const newExp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Experience added successfully.',
      experience: {
        ...newExp,
        achievements: safeParse(newExp.achievements, []),
        technologies: safeParse(newExp.technologies, [])
      }
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience.' });
  }
});

// PUT /api/experience/:id (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { type, title, company_or_school, location, period, description, achievements, technologies, icon, order_index } = req.body;

    const stmt = db.prepare(`
      UPDATE experiences SET
        type = ?,
        title = ?,
        company_or_school = ?,
        location = ?,
        period = ?,
        description = ?,
        achievements = ?,
        technologies = ?,
        icon = ?,
        order_index = ?
      WHERE id = ?
    `);

    stmt.run(
      type || 'work',
      title,
      company_or_school,
      location || '',
      period,
      description,
      Array.isArray(achievements) ? JSON.stringify(achievements) : (achievements || '[]'),
      Array.isArray(technologies) ? JSON.stringify(technologies) : (technologies || '[]'),
      icon,
      order_index || 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Experience item not found.' });

    res.json({
      message: 'Experience updated successfully.',
      experience: {
        ...updated,
        achievements: safeParse(updated.achievements, []),
        technologies: safeParse(updated.technologies, [])
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience.' });
  }
});

// DELETE /api/experience/:id (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Experience item not found.' });
    res.json({ message: 'Experience deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience.' });
  }
});

export default router;
