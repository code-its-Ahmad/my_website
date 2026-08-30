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

// GET /api/services
router.get('/', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM services ORDER BY order_index ASC, id ASC').all();
    const services = raw.map((s) => ({
      ...s,
      features: safeParse(s.features, [])
    }));
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// POST /api/services (Admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, icon, description, features, starting_price, timeline_estimate, order_index } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO services (title, icon, description, features, starting_price, timeline_estimate, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      icon || 'Code',
      description.trim(),
      Array.isArray(features) ? JSON.stringify(features) : (features || '[]'),
      starting_price || '',
      timeline_estimate || '',
      order_index || 0
    );

    const newService = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Service added successfully.',
      service: {
        ...newService,
        features: safeParse(newService.features, [])
      }
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Failed to add service.' });
  }
});

// PUT /api/services/:id (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { title, icon, description, features, starting_price, timeline_estimate, order_index } = req.body;

    const stmt = db.prepare(`
      UPDATE services SET
        title = ?,
        icon = ?,
        description = ?,
        features = ?,
        starting_price = ?,
        timeline_estimate = ?,
        order_index = ?
      WHERE id = ?
    `);

    stmt.run(
      title,
      icon,
      description,
      Array.isArray(features) ? JSON.stringify(features) : (features || '[]'),
      starting_price || '',
      timeline_estimate || '',
      order_index || 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Service not found.' });

    res.json({
      message: 'Service updated successfully.',
      service: {
        ...updated,
        features: safeParse(updated.features, [])
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Service not found.' });
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

export default router;
