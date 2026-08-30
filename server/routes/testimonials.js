import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/testimonials - Public approved testimonials
router.get('/', (req, res) => {
  try {
    const raw = db.prepare("SELECT * FROM testimonials WHERE status = 'approved' ORDER BY id DESC").all();
    const testimonials = raw.map((t) => ({ ...t, is_featured: Boolean(t.is_featured) }));
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials.' });
  }
});

// GET /api/testimonials/all - Admin list (all statuses)
router.get('/all', authenticateToken, (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM testimonials ORDER BY id DESC').all();
    const testimonials = raw.map((t) => ({ ...t, is_featured: Boolean(t.is_featured) }));
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all testimonials.' });
  }
});

// POST /api/testimonials - Submit testimonial (Public with pending status or Admin with chosen status)
router.post('/', (req, res) => {
  try {
    const { name, role, company, avatar, rating, text, project_name, status, is_featured } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required.' });
    }

    // If authenticated admin, allow direct status specification; else default to pending
    const authHeader = req.headers['authorization'];
    const isAdmin = Boolean(authHeader);
    const initialStatus = isAdmin && status ? status : 'pending';

    const stmt = db.prepare(`
      INSERT INTO testimonials (name, role, company, avatar, rating, text, project_name, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      role ? role.trim() : 'Client',
      company ? company.trim() : '',
      avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      Math.min(5, Math.max(1, Number(rating) || 5)),
      text.trim(),
      project_name || '',
      initialStatus,
      is_featured ? 1 : 0
    );

    const newTestimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: isAdmin ? 'Testimonial created.' : 'Thank you! Your testimonial has been submitted for review.',
      testimonial: { ...newTestimonial, is_featured: Boolean(newTestimonial.is_featured) }
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ error: 'Failed to submit testimonial.' });
  }
});

// PATCH /api/testimonials/:id/status - Moderate testimonial status (Admin only)
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
    }

    const info = db.prepare('UPDATE testimonials SET status = ? WHERE id = ?').run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Testimonial not found.' });

    res.json({ message: `Testimonial status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial status.' });
  }
});

// DELETE /api/testimonials/:id (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json({ message: 'Testimonial deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial.' });
  }
});

export default router;
