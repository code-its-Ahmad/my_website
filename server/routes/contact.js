import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/contact - Public contact submission
router.post('/', (req, res) => {
  try {
    const { name, email, phone, subject, message, project_type, estimated_budget, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const stmt = db.prepare(`
      INSERT INTO contact_messages (
        name, email, phone, subject, message,
        project_type, estimated_budget, source, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread')
    `);

    const result = stmt.run(
      name.trim(),
      email.trim(),
      phone ? phone.trim() : '',
      subject ? subject.trim() : 'Project Inquiry',
      message.trim(),
      project_type || 'General Inquiry',
      estimated_budget || 'Not specified',
      source || 'contact_form'
    );

    // Also log analytics event
    db.prepare(`
      INSERT INTO analytics_events (event_type, path, metadata)
      VALUES ('contact_submit', '/contact', ?)
    `).run(JSON.stringify({ name, email, project_type }));

    res.status(201).json({
      message: 'Thank you for reaching out! Muhammad Ahmad has received your message and will respond promptly.',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again or reach out via WhatsApp/Email.' });
  }
});

// GET /api/contact/messages - Admin inbox listing
router.get('/messages', authenticateToken, (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM contact_messages';
    const params = [];
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR message LIKE ? OR subject LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const messages = db.prepare(query).all(...params);
    const unreadCount = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'").get().count;
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM contact_messages').get().count;

    res.json({
      messages,
      unreadCount,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// PATCH /api/contact/messages/:id/status - Update message status
router.patch('/messages/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'starred', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid message status.' });
    }

    const info = db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Message not found.' });

    res.json({ message: `Message marked as ${status}.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message status.' });
  }
});

// DELETE /api/contact/messages/:id - Delete message
router.delete('/messages/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Message not found.' });
    res.json({ message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

export default router;
