import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/certificates
router.get('/', (req, res) => {
  try {
    const certificates = db.prepare('SELECT * FROM certificates ORDER BY order_index ASC, id ASC').all();
    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
});

// POST /api/certificates (Admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, issuer, year, description, credential_url, credential_id, image, color, dark_color, order_index } = req.body;
    if (!title || !issuer || !year) {
      return res.status(400).json({ error: 'Title, issuer, and year are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO certificates (title, issuer, year, description, credential_url, credential_id, image, color, dark_color, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      issuer.trim(),
      year.trim(),
      description || '',
      credential_url || '',
      credential_id || '',
      image || '',
      color || 'from-blue-400 to-purple-600',
      dark_color || 'from-blue-500 to-purple-700',
      order_index || 0
    );

    const newCert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Certificate added successfully.', certificate: newCert });
  } catch (error) {
    console.error('Error adding certificate:', error);
    res.status(500).json({ error: 'Failed to add certificate.' });
  }
});

// PUT /api/certificates/:id (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { title, issuer, year, description, credential_url, credential_id, image, color, dark_color, order_index } = req.body;

    const stmt = db.prepare(`
      UPDATE certificates SET
        title = ?,
        issuer = ?,
        year = ?,
        description = ?,
        credential_url = ?,
        credential_id = ?,
        image = ?,
        color = ?,
        dark_color = ?,
        order_index = ?
      WHERE id = ?
    `);

    stmt.run(
      title,
      issuer,
      year,
      description,
      credential_url,
      credential_id,
      image,
      color,
      dark_color,
      order_index || 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM certificates WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Certificate not found.' });

    res.json({ message: 'Certificate updated successfully.', certificate: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate.' });
  }
});

// DELETE /api/certificates/:id (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM certificates WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Certificate not found.' });
    res.json({ message: 'Certificate deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certificate.' });
  }
});

export default router;
