import { Router } from 'express';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/chatbot/ask - Intelligent context-aware portfolio chatbot
router.post('/ask', (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const query = message.trim().toLowerCase();

    // Fetch dynamic portfolio context from DB
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get() || {};
    const projects = db.prepare('SELECT title, category, short_description, technologies, live_url FROM projects LIMIT 6').all();
    const skills = db.prepare('SELECT name, category, percentage FROM skills WHERE featured = 1').all();
    const services = db.prepare('SELECT title, starting_price, timeline_estimate, description FROM services').all();
    const knowledgeBase = db.prepare('SELECT * FROM chatbot_knowledge ORDER BY order_index ASC').all();

    // 1. Direct Knowledge Base Keyword Matcher
    let bestMatch = null;
    let highestScore = 0;

    for (const kb of knowledgeBase) {
      const keywords = (kb.trigger_keywords || '').toLowerCase().split(',').map((k) => k.trim());
      let score = 0;
      for (const kw of keywords) {
        if (kw && query.includes(kw)) {
          score += kw.length; // weight longer specific phrases higher
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = kb;
      }
    }

    if (bestMatch && highestScore >= 3) {
      return res.json({
        reply: bestMatch.answer,
        category: bestMatch.category,
        suggestions: getFollowUpSuggestions(bestMatch.category)
      });
    }

    // 2. Intelligent Intent Analyzer
    // GREETINGS
    if (/^(hi|hello|hey|greetings|hola|assalam|salaam|good morning|good afternoon|good evening)/i.test(query)) {
      return res.json({
        reply: `Hello there! 👋 I am Muhammad Ahmad's AI Assistant. I can tell you about his full-stack projects, AI/ML expertise, availability, pricing, or help you start a project inquiry. How can I help you today?`,
        category: 'greeting',
        suggestions: [
          'What projects have you built?',
          'Tell me about your AI/ML skills',
          'What are your rates & services?',
          'How can I hire Muhammad?'
        ]
      });
    }

    // PROJECTS INQUIRY
    if (/project|portfolio|work|built|apps|case study|green|guardian|novapay|datavision|chat/i.test(query)) {
      const projectList = projects.map((p) => `• **${p.title}** (${p.category}): ${p.short_description}`).join('\n\n');
      return res.json({
        reply: `Muhammad Ahmad has engineered several high-impact production applications:\n\n${projectList}\n\nYou can explore interactive 3D demos and in-depth case studies directly in the Projects section above!`,
        category: 'projects',
        suggestions: [
          'What is GreenGuardian AI?',
          'Tell me about your tech stack',
          'Can we schedule a project call?',
          'Download CV'
        ]
      });
    }

    // SKILLS & TECH STACK
    if (/skill|tech|stack|language|framework|react|node|python|flutter|ml|ai|database|cloud|aws/i.test(query)) {
      const topSkills = skills.slice(0, 8).map((s) => `${s.name} (${s.percentage}%)`).join(', ');
      return res.json({
        reply: `Muhammad's core engineering stack encompasses:\n\n• **Frontend**: React 19, Next.js, TypeScript, Tailwind CSS, Three.js, Framer Motion\n• **Backend**: Node.js, Express, Python (FastAPI/Django), Laravel, PostgreSQL, MongoDB, Redis\n• **AI / Machine Learning**: TensorFlow, PyTorch, LangChain, Hugging Face, Computer Vision (OpenCV)\n• **Mobile**: Flutter & Dart (iOS / Android cross-platform)\n• **DevOps & Cloud**: Docker, Kubernetes, AWS, Firebase, CI/CD\n\nTop proficiencies: ${topSkills}.`,
        category: 'skills',
        suggestions: [
          'What AI solutions do you build?',
          'Do you build mobile apps?',
          'Get a project quote',
          'Contact Muhammad directly'
        ]
      });
    }

    // PRICING & SERVICES
    if (/price|cost|rate|pricing|fee|charge|quote|estimate|package|service|hire/i.test(query)) {
      const serviceList = services.map((s) => `• **${s.title}** (${s.timeline_estimate}): Starting around ${s.starting_price}`).join('\n');
      return res.json({
        reply: `Muhammad offers tailored engineering services with transparent milestones:\n\n${serviceList}\n\nYou can also use the **Interactive Project Cost Estimator** in the Services section to get an instant scope breakdown!`,
        category: 'services',
        suggestions: [
          'Estimate a custom project',
          'Are you available for full-time work?',
          'Contact via WhatsApp',
          'Send an email inquiry'
        ]
      });
    }

    // CONTACT & HIRING
    if (/contact|email|phone|whatsapp|reach|call|meeting|interview|hire|talk/i.test(query)) {
      return res.json({
        reply: `You can reach Muhammad directly:\n\n📱 **WhatsApp**: +92 331 4815161\n✉️ **Email**: Ahmadrajpootr1@gmail.com\n💼 **LinkedIn**: linkedin.com/in/muhammad-ahmad-565206291/\n📍 **Location**: Lahore, Pakistan (Available for Worldwide Remote)\n\nFeel free to drop a message in the Contact Form below, or leave your details here and I will log an immediate inquiry for Muhammad!`,
        category: 'contact',
        suggestions: [
          'Open WhatsApp chat',
          'Download Muhammad\'s CV',
          'Explore Featured Projects',
          'Estimate project budget'
        ]
      });
    }

    // RESUME / CV
    if (/cv|resume|pdf|download|experience document/i.test(query)) {
      return res.json({
        reply: `You can view and download Muhammad Ahmad's up-to-date Resume / CV directly:\n\n📄 [Click here to download Muhammad Ahmad's CV](${profile.resume_url || 'https://drive.google.com/file/d/1LEb7Scv_BQzuClhKMqYnNDqrOdwfnJI0/view?usp=sharing'})\n\nIt covers complete work experience, key achievements, certifications, and technical stack.`,
        category: 'cv',
        suggestions: [
          'Tell me about work experience',
          'View certificates',
          'Contact Muhammad'
        ]
      });
    }

    // EXPERIENCE
    if (/experience|background|history|career|companies|where have you worked/i.test(query)) {
      return res.json({
        reply: `Muhammad Ahmad has 3+ years of professional engineering experience:\n\n• **Full Stack & AI Engineer** at *Allzone Technologies* (2025 - Present) — Architecting enterprise platforms and deep learning systems.\n• **ML & Computer Vision Engineer** at *Allzone Technologies* (2024 - 2025) — Deploying NLP models and sub-second vision pipelines.\n• **Mobile Developer** at *Arfa Karim Software Technology Park* (2022 - 2024) — Cross-platform Flutter apps with 20K+ downloads.`,
        category: 'experience',
        suggestions: [
          'View projects',
          'View skills',
          'Hire Muhammad'
        ]
      });
    }

    // DEFAULT REFINED FALLBACK
    return res.json({
      reply: `I understand you are asking about "${message.trim()}". As Muhammad Ahmad's AI Assistant, I can provide details on his Full Stack Development projects, AI/ML solutions, Flutter mobile apps, pricing packages, or connect you directly with him for a project. What would you like to explore?`,
      category: 'general',
      suggestions: [
        'Explore Projects',
        'View Technical Skills',
        'Check Services & Pricing',
        'Contact Muhammad'
      ]
    });
  } catch (error) {
    console.error('Error in chatbot endpoint:', error);
    res.status(500).json({
      reply: "I'm experiencing a brief connection hiccup, but you can contact Muhammad directly at Ahmadrajpootr1@gmail.com or WhatsApp +92 331 4815161!",
      category: 'error'
    });
  }
});

function getFollowUpSuggestions(category) {
  switch (category) {
    case 'about':
      return ['What are your key projects?', 'What technologies do you use?', 'Are you available for hire?'];
    case 'skills':
      return ['Show me AI projects', 'What is your backend experience?', 'Get a project quote'];
    case 'services':
      return ['Estimate my project', 'How do we get started?', 'Schedule a call'];
    case 'contact':
      return ['Open WhatsApp', 'Download CV', 'Send email'];
    default:
      return ['Tell me about your projects', 'What are your rates?', 'How can I hire you?'];
  }
}

// POST /api/chatbot/lead - Capture qualified lead from chatbot
router.post('/lead', (req, res) => {
  try {
    const { name, email, phone, projectType, budget, timeline, requirements } = req.body;
    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and email or phone are required.' });
    }

    const messageContent = `[ChatBot Lead Capture]\nClient: ${name}\nContact: ${email || 'N/A'} | ${phone || 'N/A'}\nProject Type: ${projectType || 'Custom Project'}\nBudget: ${budget || 'Flexible'}\nTimeline: ${timeline || 'Flexible'}\nRequirements: ${requirements || 'Discuss on call'}`;

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message, project_type, estimated_budget, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'chatbot', 'unread')
    `);

    const result = stmt.run(
      name.trim(),
      email ? email.trim() : 'chatbot-lead@portfolio.local',
      phone || '',
      `ChatBot Lead: ${projectType || 'Project Inquiry'}`,
      messageContent,
      projectType || 'Custom Project',
      budget || 'Flexible'
    );

    res.status(201).json({
      message: 'Your inquiry has been registered directly in Muhammad Ahmad\'s priority inbox!',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({ error: 'Failed to capture lead.' });
  }
});

// GET /api/chatbot/knowledge - List knowledge base (Admin only)
router.get('/knowledge', authenticateToken, (req, res) => {
  try {
    const knowledge = db.prepare('SELECT * FROM chatbot_knowledge ORDER BY order_index ASC, id ASC').all();
    res.json({ knowledge });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch knowledge base.' });
  }
});

// POST /api/chatbot/knowledge (Admin only)
router.post('/knowledge', authenticateToken, (req, res) => {
  try {
    const { category, trigger_keywords, question, answer, order_index } = req.body;
    if (!category || !trigger_keywords || !question || !answer) {
      return res.status(400).json({ error: 'Category, trigger keywords, question, and answer are required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO chatbot_knowledge (category, trigger_keywords, question, answer, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      category.trim(),
      trigger_keywords.trim(),
      question.trim(),
      answer.trim(),
      order_index || 0
    );

    const newKB = db.prepare('SELECT * FROM chatbot_knowledge WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Knowledge item created.', knowledge: newKB });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create knowledge item.' });
  }
});

// PUT /api/chatbot/knowledge/:id (Admin only)
router.put('/knowledge/:id', authenticateToken, (req, res) => {
  try {
    const { category, trigger_keywords, question, answer, order_index } = req.body;

    const stmt = db.prepare(`
      UPDATE chatbot_knowledge SET
        category = ?,
        trigger_keywords = ?,
        question = ?,
        answer = ?,
        order_index = ?
      WHERE id = ?
    `);

    stmt.run(
      category,
      trigger_keywords,
      question,
      answer,
      order_index || 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM chatbot_knowledge WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Knowledge item not found.' });

    res.json({ message: 'Knowledge item updated.', knowledge: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update knowledge item.' });
  }
});

// DELETE /api/chatbot/knowledge/:id (Admin only)
router.delete('/knowledge/:id', authenticateToken, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM chatbot_knowledge WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Knowledge item not found.' });
    res.json({ message: 'Knowledge item deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete knowledge item.' });
  }
});

export default router;
