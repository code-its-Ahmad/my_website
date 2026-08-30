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

// GET /api/projects - List all projects
router.get('/', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM projects ORDER BY order_index ASC, id ASC').all();
    const projects = raw.map((p) => ({
      ...p,
      gallery_images: safeParse(p.gallery_images, []),
      technologies: safeParse(p.technologies, []),
      featured: Boolean(p.featured)
    }));
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', (req, res) => {
  try {
    const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found.' });

    res.json({
      project: {
        ...p,
        gallery_images: safeParse(p.gallery_images, []),
        technologies: safeParse(p.technologies, []),
        featured: Boolean(p.featured)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// POST /api/projects/:id/like - Increment like count
router.post('/:id/like', (req, res) => {
  try {
    db.prepare('UPDATE projects SET likes = likes + 1 WHERE id = ?').run(req.params.id);
    const updated = db.prepare('SELECT likes FROM projects WHERE id = ?').get(req.params.id);
    res.json({ likes: updated ? updated.likes : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like project.' });
  }
});

// POST /api/projects/:id/view - Increment view count
router.post('/:id/view', (req, res) => {
  try {
    db.prepare('UPDATE projects SET views = views + 1 WHERE id = ?').run(req.params.id);
    const updated = db.prepare('SELECT views FROM projects WHERE id = ?').get(req.params.id);
    res.json({ views: updated ? updated.views : 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track view.' });
  }
});

// POST /api/projects - Create project (Admin only)
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      title,
      category,
      short_description,
      full_description,
      image,
      gallery_images,
      technologies,
      challenges,
      solutions,
      outcomes,
      live_url,
      github_url,
      featured,
      order_index
    } = req.body;

    if (!title || !category || !short_description) {
      return res.status(400).json({ error: 'Title, category, and short description are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO projects (
        title, category, short_description, full_description, image,
        gallery_images, technologies, challenges, solutions, outcomes,
        live_url, github_url, featured, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      category,
      short_description,
      full_description || short_description,
      image || '/assets/project1.png',
      Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : '[]',
      Array.isArray(technologies) ? JSON.stringify(technologies) : (technologies || '[]'),
      challenges || '',
      solutions || '',
      outcomes || '',
      live_url || '',
      github_url || '',
      featured ? 1 : 0,
      order_index || 0
    );

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Project created successfully.',
      project: {
        ...newProject,
        gallery_images: safeParse(newProject.gallery_images, []),
        technologies: safeParse(newProject.technologies, []),
        featured: Boolean(newProject.featured)
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

// PUT /api/projects/:id - Update project (Admin only)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const {
      title,
      category,
      short_description,
      full_description,
      image,
      gallery_images,
      technologies,
      challenges,
      solutions,
      outcomes,
      live_url,
      github_url,
      featured,
      likes,
      views,
      order_index
    } = req.body;

    const stmt = db.prepare(`
      UPDATE projects SET
        title = ?,
        category = ?,
        short_description = ?,
        full_description = ?,
        image = ?,
        gallery_images = ?,
        technologies = ?,
        challenges = ?,
        solutions = ?,
        outcomes = ?,
        live_url = ?,
        github_url = ?,
        featured = ?,
        likes = COALESCE(?, likes),
        views = COALESCE(?, views),
        order_index = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title,
      category,
      short_description,
      full_description,
      image,
      Array.isArray(gallery_images) ? JSON.stringify(gallery_images) : (gallery_images || '[]'),
      Array.isArray(technologies) ? JSON.stringify(technologies) : (technologies || '[]'),
      challenges || '',
      solutions || '',
      outcomes || '',
      live_url || '',
      github_url || '',
      featured ? 1 : 0,
      likes !== undefined ? likes : null,
      views !== undefined ? views : null,
      order_index || 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Project not found.' });

    res.json({
      message: 'Project updated successfully.',
      project: {
        ...updated,
        gallery_images: safeParse(updated.gallery_images, []),
        technologies: safeParse(updated.technologies, []),
        featured: Boolean(updated.featured)
      }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// DELETE /api/projects/:id - Delete project (Admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

export default router;
