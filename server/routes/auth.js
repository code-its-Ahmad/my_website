import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = Router();

// The single master administrator account allowed to sign in.
// No other account can ever access the admin suite, regardless of
// credentials stored in the DB — this makes the CMS exclusively "owner only".
const MASTER_ADMIN_EMAIL = 'admin@muhammadahmad.com';

function isMasterAdmin(user) {
  return Boolean(
    user && user.email && user.email.toLowerCase() === MASTER_ADMIN_EMAIL && user.role === 'superadmin'
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const submittedEmail = email.trim().toLowerCase();
    if (submittedEmail !== MASTER_ADMIN_EMAIL) {
      // Return a generic error so we don't leak which accounts exist.
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(MASTER_ADMIN_EMAIL);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Enforce ownership even if a token was somehow issued for another account.
    if (user.email.toLowerCase() !== MASTER_ADMIN_EMAIL || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Access restricted to the site owner only.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, created_at FROM admin_users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!isMasterAdmin(user)) {
      return res.status(403).json({ error: 'Access restricted to the site owner only.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user session.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!isMasterAdmin(user)) {
      return res.status(403).json({ error: 'Access restricted to the site owner only.' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    db.prepare('UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, req.user.id);

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!isMasterAdmin(user)) {
      return res.status(403).json({ error: 'Access restricted to the site owner only.' });
    }
    if (email.trim().toLowerCase() !== MASTER_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'The admin email cannot be changed.' });
    }

    db.prepare('UPDATE admin_users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      name.trim(),
      email.trim().toLowerCase(),
      req.user.id
    );

    res.json({ message: 'Admin profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admin profile.' });
  }
});

export default router;
