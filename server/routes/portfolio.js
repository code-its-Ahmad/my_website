import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Helper to parse JSON fields safely
function safeParse(val, fallback) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// GET /api/portfolio/all - Single aggregated fast load
router.get('/all', (req, res) => {
  try {
    const rawProfile = db.prepare('SELECT * FROM profile WHERE id = 1').get() || {};
    const profile = {
      ...rawProfile,
      titles: safeParse(rawProfile.titles, ['Full Stack Developer', 'AI/ML Engineer']),
      available_for_hire: Boolean(rawProfile.available_for_hire)
    };

    const rawProjects = db.prepare('SELECT * FROM projects ORDER BY order_index ASC, id ASC').all();
    const projects = rawProjects.map((p) => ({
      ...p,
      gallery_images: safeParse(p.gallery_images, []),
      technologies: safeParse(p.technologies, []),
      featured: Boolean(p.featured)
    }));

    const rawSkills = db.prepare('SELECT * FROM skills ORDER BY order_index ASC, id ASC').all();
    const skills = rawSkills.map((s) => ({
      ...s,
      featured: Boolean(s.featured)
    }));

    const rawExperiences = db.prepare('SELECT * FROM experiences ORDER BY order_index ASC, id ASC').all();
    const experiences = rawExperiences.map((e) => ({
      ...e,
      achievements: safeParse(e.achievements, []),
      technologies: safeParse(e.technologies, [])
    }));

    const rawServices = db.prepare('SELECT * FROM services ORDER BY order_index ASC, id ASC').all();
    const services = rawServices.map((s) => ({
      ...s,
      features: safeParse(s.features, [])
    }));

    const certificates = db.prepare('SELECT * FROM certificates ORDER BY order_index ASC, id ASC').all();

    const testimonials = db.prepare("SELECT * FROM testimonials WHERE status = 'approved' ORDER BY id DESC").all().map((t) => ({
      ...t,
      is_featured: Boolean(t.is_featured)
    }));

    res.json({
      profile,
      projects,
      skills,
      experiences,
      services,
      certificates,
      testimonials
    });
  } catch (error) {
    console.error('Error fetching aggregated portfolio data:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data.' });
  }
});

// GET /api/portfolio/profile
router.get('/profile', (req, res) => {
  try {
    const rawProfile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    if (!rawProfile) return res.status(404).json({ error: 'Profile not found.' });

    const profile = {
      ...rawProfile,
      titles: safeParse(rawProfile.titles, []),
      available_for_hire: Boolean(rawProfile.available_for_hire)
    };
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/portfolio/profile (Admin only)
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const {
      name,
      titles,
      tagline,
      bio,
      about_story,
      about_philosophy,
      location,
      email,
      phone,
      whatsapp,
      github,
      linkedin,
      twitter,
      discord,
      resume_url,
      avatar_url,
      available_for_hire,
      years_experience,
      happy_clients,
      projects_completed,
      satisfaction_rate,
      meta_title,
      meta_description,
      meta_keywords
    } = req.body;

    const stmt = db.prepare(`
      UPDATE profile SET
        name = ?,
        titles = ?,
        tagline = ?,
        bio = ?,
        about_story = ?,
        about_philosophy = ?,
        location = ?,
        email = ?,
        phone = ?,
        whatsapp = ?,
        github = ?,
        linkedin = ?,
        twitter = ?,
        discord = ?,
        resume_url = ?,
        avatar_url = COALESCE(?, avatar_url),
        available_for_hire = ?,
        years_experience = ?,
        happy_clients = ?,
        projects_completed = ?,
        satisfaction_rate = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    stmt.run(
      name || '',
      Array.isArray(titles) ? JSON.stringify(titles) : (titles || '[]'),
      tagline || '',
      bio || '',
      about_story || '',
      about_philosophy || '',
      location || '',
      email || '',
      phone || '',
      whatsapp || '',
      github || '',
      linkedin || '',
      twitter || '',
      discord || '',
      resume_url || '',
      avatar_url || null,
      available_for_hire ? 1 : 0,
      years_experience || '3+',
      happy_clients || '100+',
      projects_completed || '50+',
      satisfaction_rate || '99%',
      meta_title || '',
      meta_description || '',
      meta_keywords || ''
    );

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
