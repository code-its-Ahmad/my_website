import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'portfolio.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // 1. Admin Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'superadmin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Profile & Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      titles TEXT NOT NULL, -- JSON array of roles
      tagline TEXT,
      bio TEXT,
      about_story TEXT,
      about_philosophy TEXT,
      location TEXT,
      email TEXT,
      phone TEXT,
      whatsapp TEXT,
      github TEXT,
      linkedin TEXT,
      twitter TEXT,
      discord TEXT,
      resume_url TEXT,
      avatar_url TEXT DEFAULT '/assets/profile.png',
      available_for_hire INTEGER DEFAULT 1,
      years_experience TEXT DEFAULT '3+',
      happy_clients TEXT DEFAULT '100+',
      projects_completed TEXT DEFAULT '50+',
      satisfaction_rate TEXT DEFAULT '99%',
      meta_title TEXT,
      meta_description TEXT,
      meta_keywords TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      image TEXT NOT NULL,
      gallery_images TEXT, -- JSON array
      technologies TEXT NOT NULL, -- JSON array
      challenges TEXT,
      solutions TEXT,
      outcomes TEXT,
      live_url TEXT,
      github_url TEXT,
      featured INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Skills Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL, -- Frontend, Backend, AI/ML, Mobile, DevOps, Databases, Tools
      level TEXT NOT NULL, -- Beginner, Intermediate, Advanced, Expert
      percentage INTEGER NOT NULL,
      icon TEXT,
      color TEXT DEFAULT 'from-blue-400 to-blue-600',
      featured INTEGER DEFAULT 1,
      years_experience TEXT DEFAULT '2+ yrs',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Experience Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT DEFAULT 'work', -- 'work' or 'education'
      title TEXT NOT NULL,
      company_or_school TEXT NOT NULL,
      location TEXT,
      period TEXT NOT NULL,
      description TEXT NOT NULL,
      achievements TEXT, -- JSON array
      technologies TEXT, -- JSON array
      icon TEXT DEFAULT '💻',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Services Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL, -- JSON array
      starting_price TEXT,
      timeline_estimate TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Certificates Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      year TEXT NOT NULL,
      description TEXT NOT NULL,
      credential_url TEXT,
      credential_id TEXT,
      image TEXT,
      color TEXT DEFAULT 'from-blue-400 to-purple-600',
      dark_color TEXT DEFAULT 'from-blue-500 to-purple-700',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Testimonials Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      avatar TEXT,
      rating INTEGER DEFAULT 5,
      text TEXT NOT NULL,
      project_name TEXT,
      status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
      is_featured INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Contact Inquiries & Chatbot Leads Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      project_type TEXT,
      estimated_budget TEXT,
      source TEXT DEFAULT 'contact_form', -- 'contact_form', 'chatbot', 'estimator'
      status TEXT DEFAULT 'unread', -- 'unread', 'read', 'starred', 'replied', 'archived'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. AI Chatbot Knowledge Base Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chatbot_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      trigger_keywords TEXT NOT NULL, -- JSON array or comma separated
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Visitor Analytics Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL, -- 'pageview', 'project_view', 'project_like', 'cv_download', 'contact_submit', 'chatbot_interaction'
      path TEXT,
      referrer TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      device_type TEXT,
      metadata TEXT, -- JSON string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure migrations for existing DBs
  try {
    db.exec(`ALTER TABLE profile ADD COLUMN avatar_url TEXT DEFAULT '/assets/profile.png';`);
  } catch {
    // Column already exists
  }

  seedDatabase();
}

function seedDatabase() {
  // Check if admin user exists
  const checkAdmin = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  if (checkAdmin.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('AdminPassword123!', salt);

    const insertAdmin = db.prepare(`
      INSERT INTO admin_users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `);
    insertAdmin.run('admin@muhammadahmad.com', passwordHash, 'Muhammad Ahmad', 'superadmin');
    console.log('Seeded master admin user (admin@muhammadahmad.com / AdminPassword123!)');
  }

  // Check if profile exists
  const checkProfile = db.prepare('SELECT COUNT(*) as count FROM profile WHERE id = 1').get();
  if (checkProfile.count === 0) {
    const insertProfile = db.prepare(`
      INSERT INTO profile (
        id, name, titles, tagline, bio, about_story, about_philosophy,
        location, email, phone, whatsapp, github, linkedin, twitter, discord,
        resume_url, available_for_hire, years_experience, happy_clients,
        projects_completed, satisfaction_rate, meta_title, meta_description, meta_keywords
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    insertProfile.run(
      'Muhammad Ahmad',
      JSON.stringify([
        'Full Stack Developer',
        'AI/ML Engineer',
        'Mobile App Architect',
        'Cloud & DevOps Engineer',
        'UI/UX Designer'
      ]),
      'Crafting high-performance digital ecosystems with modern web technologies, AI/ML architectures, and world-class UI/UX design.',
      'A passionate Full Stack Engineer and AI Specialist dedicated to building high-performance, intelligent, and scalable digital solutions. With expertise spanning React, Node.js, Python, TensorFlow, Flutter, and Cloud Infrastructure, I bridge the gap between complex engineering and seamless human experiences.',
      'My journey in tech began with a deep curiosity about how software shapes the world. Over the past 3+ years, I have architected and deployed enterprise-grade web applications, machine learning pipelines, and cross-platform mobile apps for startups and high-growth companies across the globe. I thrive on tackling challenging problems and delivering scalable, clean, and maintainable software.',
      'I believe in clean architecture, performance-first engineering, and aesthetic visual design. Every line of code should have purpose, every interface should delight the user, and every machine learning model should deliver tangible, actionable value.',
      'Lahore, Pakistan',
      'Ahmadrajpootr1@gmail.com',
      '+92 331 4815161',
      'https://wa.me/923314815161?text=Hi%20Muhammad%20Ahmad,%20I%20have%20a%20project%20or%20hiring%20opportunity%20to%20discuss!',
      'https://github.com/code-its-Ahmad',
      'https://www.linkedin.com/in/muhammad-ahmad-565206291/',
      'https://twitter.com',
      'https://discord.com',
      'https://drive.google.com/file/d/1LEb7Scv_BQzuClhKMqYnNDqrOdwfnJI0/view?usp=sharing',
      1,
      '3+',
      '100+',
      '50+',
      '99%',
      'Muhammad Ahmad | Full Stack Developer & AI/ML Engineer',
      'Official portfolio of Muhammad Ahmad - Senior Full Stack Developer, AI/ML Specialist, and Mobile App Architect.',
      'Muhammad Ahmad, Full Stack Developer, AI Engineer, Machine Learning, React, Node.js, Python, Flutter, Portfolio'
    );
    console.log('Seeded profile information');
  }

  // Seed Projects if empty
  const checkProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (checkProjects.count === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (
        title, category, short_description, full_description, image,
        gallery_images, technologies, challenges, solutions, outcomes,
        live_url, github_url, featured, likes, views, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialProjects = [
      {
        title: 'GreenGuardian AI - Smart Plant Care & Disease Detection',
        category: 'AI & Mobile',
        short_description: 'AI-powered platform for smart plant care, featuring deep learning disease detection, health monitoring, and personalized care schedules.',
        full_description: 'GreenGuardian AI is a comprehensive agronomy and botany intelligence platform. Leveraging transfer learning with TensorFlow and PyTorch, it analyzes real-time smartphone photos to diagnose 40+ common crop and plant diseases with 95%+ accuracy. The mobile client is engineered in Flutter with offline model caching, and the scalable cloud backend is powered by Node.js and MongoDB with automated task schedulers.',
        image: '/assets/project1.png',
        gallery_images: JSON.stringify([
          '/assets/project1.png',
          'https://images.unsplash.com/photo-1516321310762-479d72a370a7?w=1000&h=600&fit=crop',
          'https://images.unsplash.com/photo-1536147116438-62679a5e7161?w=1000&h=600&fit=crop'
        ]),
        technologies: JSON.stringify(['Flutter', 'Python', 'TensorFlow', 'FastAPI', 'MongoDB', 'Docker']),
        challenges: 'Optimizing high-precision computer vision models to run with sub-second latency on edge mobile devices without losing accuracy across low-light environmental conditions.',
        solutions: 'Applied model quantization, MobileNetV3 transfer learning, and client-side image normalization before dispatching to edge inference.',
        outcomes: 'Achieved 95.4% diagnosis accuracy, reduced inference latency to 180ms, and scaled to over 15,000 active test users.',
        live_url: 'https://greenguardian-demo.com',
        github_url: 'https://github.com/code-its-Ahmad/greenguardian-ai',
        featured: 1,
        likes: 124,
        views: 890,
        order_index: 1
      },
      {
        title: 'NovaPay - Next-Gen Fintech & Mobile Banking Suite',
        category: 'Mobile & Web',
        short_description: 'Secure mobile banking application featuring biometric authentication, instant peer-to-peer transfers, and ML spending insights.',
        full_description: 'NovaPay is a high-security fintech ecosystem combining a Flutter-driven iOS/Android mobile client with a microservices Node.js/PostgreSQL backend. It features multi-factor biometric authentication, real-time ledger synchronization via WebSockets, automated currency conversions, and an integrated budget forecaster powered by Scikit-learn predictive regression models.',
        image: '/assets/project2.png',
        gallery_images: JSON.stringify([
          '/assets/project2.png',
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&h=600&fit=crop',
          'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&h=600&fit=crop'
        ]),
        technologies: JSON.stringify(['Flutter', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API', 'Docker']),
        challenges: 'Ensuring strict PCI-DSS compliance, zero-downtime financial ledger consistency, and sub-second push notifications across millions of active transactions.',
        solutions: 'Implemented two-phase commit transaction workflows, Redis-based distributed locking, and end-to-end payload encryption with AES-256-GCM.',
        outcomes: 'Handled over 50,000 simulated concurrent transactions with 99.99% reliability and zero balance race conditions.',
        live_url: 'https://novapay-demo.com',
        github_url: 'https://github.com/code-its-Ahmad/novapay-mobile-banking',
        featured: 1,
        likes: 98,
        views: 654,
        order_index: 2
      },
      {
        title: 'Nexlify DataVision - Real-Time Learning Analytics Hub',
        category: 'AI/ML & Web',
        short_description: 'Advanced data intelligence platform with predictive learning analytics, D3.js interactive visual dashboards, and student retention models.',
        full_description: 'Nexlify DataVision empowers educational institutions and enterprise learning platforms with actionable analytics. Built with Django, Python, and React, it ingests multi-stream user engagement telemetries, visualizes complex data distributions using D3.js and WebGL, and executes machine learning retention scoring algorithms to flag at-risk students before dropouts occur.',
        image: '/assets/project3.png',
        gallery_images: JSON.stringify([
          '/assets/project3.png',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&h=600&fit=crop',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&h=600&fit=crop'
        ]),
        technologies: JSON.stringify(['React', 'Python', 'Django', 'D3.js', 'PostgreSQL', 'TensorFlow']),
        challenges: 'Aggregating and rendering millions of time-series datapoints smoothly in the browser without freezing the UI thread.',
        solutions: 'Built canvas-accelerated chart renderers with Web Workers for client data aggregation, coupled with server-side materialized views.',
        outcomes: 'Accelerated complex dashboard queries by 72% and enabled proactive intervention for over 8,000 learners.',
        live_url: 'https://datavision-demo.com',
        github_url: 'https://github.com/code-its-Ahmad/nexlify-datavision',
        featured: 1,
        likes: 85,
        views: 520,
        order_index: 3
      },
      {
        title: 'OmniStream - Enterprise Real-Time Chat & Video Mesh',
        category: 'Full Stack Web',
        short_description: 'Scalable messaging and video collaboration platform with end-to-end encryption, file streaming, and comprehensive team management.',
        full_description: 'OmniStream is an ultra-fast real-time communication platform designed for modern teams. Built with React, TypeScript, Node.js, and WebRTC mesh technology, it supports crisp HD multi-party video conferencing, low-latency text channels via Socket.io clusters, rich markdown document collaboration, and granular administrative role controls.',
        image: '/assets/project4.png',
        gallery_images: JSON.stringify([
          '/assets/project4.png',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&h=600&fit=crop'
        ]),
        technologies: JSON.stringify(['React', 'Node.js', 'Socket.io', 'WebRTC', 'MongoDB', 'Redis']),
        challenges: 'Minimizing peer-to-peer connection latency and handling dynamic ICE/STUN/TURN fallback under strict corporate firewalls.',
        solutions: 'Configured automated adaptive bitrate streaming and globally distributed TURN relay nodes with automated reconnect recovery.',
        outcomes: 'Delivered crystal-clear 1080p video calls with under 65ms audio latency across international participants.',
        live_url: 'https://omnistream-chat.com',
        github_url: 'https://github.com/code-its-Ahmad/omnistream-chat',
        featured: 0,
        likes: 67,
        views: 410,
        order_index: 4
      },
      {
        title: 'SkillMatrix AI - Career Roadmap & Skill Diagnostics',
        category: 'AI/ML & Web',
        short_description: 'AI career advisor that conducts dynamic technical assessments, identifies skill gaps, and generates personalized 90-day learning curricula.',
        full_description: 'SkillMatrix AI transforms career development through generative AI and knowledge graphs. It generates adaptive technical questionnaires tailored to specific job market requirements, evaluates response depth using LLM reasoning pipelines, and constructs personalized 90-day learning roadmaps complete with verifiable milestones and curated study materials.',
        image: '/assets/project5.png',
        gallery_images: JSON.stringify([
          '/assets/project5.png',
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000&h=600&fit=crop'
        ]),
        technologies: JSON.stringify(['React', 'FastAPI', 'LangChain', 'OpenAI API', 'MongoDB', 'TailwindCSS']),
        challenges: 'Preventing hallucinated assessment scores and generating highly specific, non-generic career progression plans.',
        solutions: 'Designed structured JSON output validation schemas with LangChain and integrated real-time GitHub/StackOverflow job demand benchmarks.',
        outcomes: 'Generated over 2,500 verified skill roadmaps with an 88% user career goal completion rate.',
        live_url: 'https://skillmatrix-ai.com',
        github_url: 'https://github.com/code-its-Ahmad/skillmatrix-ai',
        featured: 1,
        likes: 112,
        views: 730,
        order_index: 5
      },
      {
        title: 'AuraCloud - Serverless Microservice Orchestrator & Monitoring',
        category: 'Cloud & DevOps',
        short_description: 'Cloud native management dashboard providing real-time container metrics, log aggregation, and automated CI/CD deployment pipelines.',
        full_description: 'AuraCloud is a developer platform designed to monitor and manage Kubernetes clusters and serverless functions effortlessly. Built with Next.js, Go, and Prometheus, it provides real-time health heatmaps, automated container anomaly detection, and one-click blue/green deployments.',
        image: '/assets/project7.png',
        gallery_images: JSON.stringify([
          '/assets/project7.png',
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&h=600&fit=crop'
        ]),
        technologies: JSON.stringify(['Next.js', 'Go', 'Docker', 'Kubernetes', 'Prometheus', 'GraphQL']),
        challenges: 'Streaming high-frequency container metrics without high server overhead.',
        solutions: 'Employed gRPC streams and lightweight eBPF probes for zero-overhead system observation.',
        outcomes: 'Reduced mean-time-to-detection (MTTD) by 65% for production microservice incidents.',
        live_url: 'https://auracloud-demo.com',
        github_url: 'https://github.com/code-its-Ahmad/auracloud-devops',
        featured: 0,
        likes: 54,
        views: 380,
        order_index: 6
      }
    ];

    for (const p of initialProjects) {
      insertProject.run(
        p.title,
        p.category,
        p.short_description,
        p.full_description,
        p.image,
        p.gallery_images,
        p.technologies,
        p.challenges,
        p.solutions,
        p.outcomes,
        p.live_url,
        p.github_url,
        p.featured,
        p.likes,
        p.views,
        p.order_index
      );
    }
    console.log('Seeded projects');
  }

  // Seed Skills if empty
  const checkSkills = db.prepare('SELECT COUNT(*) as count FROM skills').get();
  if (checkSkills.count === 0) {
    const insertSkill = db.prepare(`
      INSERT INTO skills (name, category, level, percentage, icon, color, featured, years_experience, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialSkills = [
      // Frontend
      { name: 'React / Next.js', category: 'Frontend', level: 'Expert', percentage: 96, icon: '⚛️', color: 'from-blue-400 to-cyan-500', featured: 1, years: '3+ yrs', order: 1 },
      { name: 'TypeScript', category: 'Frontend', level: 'Advanced', percentage: 92, icon: '📘', color: 'from-blue-500 to-indigo-600', featured: 1, years: '3+ yrs', order: 2 },
      { name: 'Tailwind CSS / UI Design', category: 'Frontend', level: 'Expert', percentage: 95, icon: '🎨', color: 'from-cyan-400 to-teal-500', featured: 1, years: '3+ yrs', order: 3 },
      { name: 'Three.js / WebGL / Canvas', category: 'Frontend', level: 'Advanced', percentage: 85, icon: '🌐', color: 'from-purple-400 to-pink-600', featured: 1, years: '2+ yrs', order: 4 },
      { name: 'Framer Motion & Animations', category: 'Frontend', level: 'Expert', percentage: 94, icon: '✨', color: 'from-pink-400 to-rose-600', featured: 1, years: '3+ yrs', order: 5 },

      // Backend
      { name: 'Node.js & Express', category: 'Backend', level: 'Expert', percentage: 94, icon: '🟢', color: 'from-emerald-400 to-green-600', featured: 1, years: '3+ yrs', order: 6 },
      { name: 'Python & FastAPI / Django', category: 'Backend', level: 'Advanced', percentage: 90, icon: '🐍', color: 'from-yellow-400 to-amber-600', featured: 1, years: '3+ yrs', order: 7 },
      { name: 'Laravel & PHP', category: 'Backend', level: 'Advanced', percentage: 86, icon: '🚀', color: 'from-red-400 to-rose-600', featured: 1, years: '2+ yrs', order: 8 },
      { name: 'REST & GraphQL APIs', category: 'Backend', level: 'Expert', percentage: 95, icon: '⚡', color: 'from-purple-400 to-indigo-600', featured: 1, years: '3+ yrs', order: 9 },

      // AI/ML
      { name: 'TensorFlow & PyTorch', category: 'AI/ML', level: 'Advanced', percentage: 88, icon: '🤖', color: 'from-amber-400 to-orange-600', featured: 1, years: '2+ yrs', order: 10 },
      { name: 'LangChain & LLM Agents', category: 'AI/ML', level: 'Advanced', percentage: 89, icon: '🧠', color: 'from-violet-400 to-purple-600', featured: 1, years: '2+ yrs', order: 11 },
      { name: 'Computer Vision (OpenCV)', category: 'AI/ML', level: 'Advanced', percentage: 84, icon: '👁️', color: 'from-blue-400 to-cyan-600', featured: 1, years: '2+ yrs', order: 12 },
      { name: 'Hugging Face Transformers', category: 'AI/ML', level: 'Advanced', percentage: 86, icon: '🤗', color: 'from-yellow-400 to-yellow-600', featured: 1, years: '2+ yrs', order: 13 },

      // Mobile
      { name: 'Flutter & Dart', category: 'Mobile', level: 'Expert', percentage: 92, icon: '💙', color: 'from-sky-400 to-blue-600', featured: 1, years: '3+ yrs', order: 14 },
      { name: 'Kotlin & Android', category: 'Mobile', level: 'Intermediate', percentage: 78, icon: '📱', color: 'from-orange-400 to-red-500', featured: 0, years: '2+ yrs', order: 15 },
      { name: 'Cross-Platform UI/UX', category: 'Mobile', level: 'Expert', percentage: 94, icon: '📲', color: 'from-teal-400 to-emerald-600', featured: 1, years: '3+ yrs', order: 16 },

      // Databases & Cloud
      { name: 'PostgreSQL & MySQL', category: 'Databases', level: 'Expert', percentage: 92, icon: '🐘', color: 'from-blue-500 to-indigo-700', featured: 1, years: '3+ yrs', order: 17 },
      { name: 'MongoDB & NoSQL', category: 'Databases', level: 'Advanced', percentage: 90, icon: '🍃', color: 'from-green-400 to-emerald-600', featured: 1, years: '3+ yrs', order: 18 },
      { name: 'Firebase Suite', category: 'Databases', level: 'Expert', percentage: 94, icon: '🔥', color: 'from-amber-400 to-orange-600', featured: 1, years: '3+ yrs', order: 19 },
      { name: 'Docker & Containerization', category: 'DevOps', level: 'Advanced', percentage: 86, icon: '🐳', color: 'from-cyan-400 to-blue-600', featured: 1, years: '2+ yrs', order: 20 },
      { name: 'AWS Cloud Services', category: 'DevOps', level: 'Advanced', percentage: 85, icon: '☁️', color: 'from-yellow-500 to-amber-700', featured: 1, years: '2+ yrs', order: 21 },
      { name: 'Git & CI/CD Pipelines', category: 'DevOps', level: 'Expert', percentage: 95, icon: '🔄', color: 'from-orange-400 to-red-600', featured: 1, years: '3+ yrs', order: 22 }
    ];

    for (const s of initialSkills) {
      insertSkill.run(s.name, s.category, s.level, s.percentage, s.icon, s.color, s.featured, s.years, s.order);
    }
    console.log('Seeded skills');
  }

  // Seed Experiences if empty
  const checkExperiences = db.prepare('SELECT COUNT(*) as count FROM experiences').get();
  if (checkExperiences.count === 0) {
    const insertExperience = db.prepare(`
      INSERT INTO experiences (type, title, company_or_school, location, period, description, achievements, technologies, icon, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialExperiences = [
      {
        type: 'work',
        title: 'Full Stack & AI Engineer',
        company_or_school: 'Allzone Technologies',
        location: 'Lahore, Pakistan',
        period: '2025 - Present',
        description: 'Leading the development of enterprise web applications and scalable AI/ML pipelines. Architecting full-stack systems using React, Node.js, Python, and cloud infrastructure.',
        achievements: JSON.stringify([
          'Boosted overall application performance by 40% through code splitting, Redis caching, and database query optimization',
          'Successfully engineered and deployed 3 high-impact client projects ahead of projected milestones',
          'Spearheaded the integration of transformer-based NLP and computer vision models into production services'
        ]),
        technologies: JSON.stringify(['React', 'Node.js', 'Python', 'TensorFlow', 'FastAPI', 'Docker', 'PostgreSQL']),
        icon: '💻',
        order_index: 1
      },
      {
        type: 'work',
        title: 'Machine Learning & Computer Vision Engineer',
        company_or_school: 'Allzone Technologies',
        location: 'Lahore, Pakistan',
        period: '2024 - 2025',
        description: 'Designed and trained deep learning models for natural language processing, automated document extraction, and computer vision classification.',
        achievements: JSON.stringify([
          'Delivered state-of-the-art text classification and entity extraction models with 95.8% precision',
          'Reduced computer vision inference latency by 32% via model pruning and TensorRT optimization',
          'Implemented end-to-end automated MLOps pipelines on AWS with Docker'
        ]),
        technologies: JSON.stringify(['Python', 'PyTorch', 'TensorFlow', 'OpenCV', 'Hugging Face', 'AWS']),
        icon: '🤖',
        order_index: 2
      },
      {
        type: 'work',
        title: 'Mobile Application Developer',
        company_or_school: 'Arfa Karim Software Technology Park',
        location: 'Lahore, Pakistan',
        period: '2022 - 2024',
        description: 'Developed intuitive, responsive cross-platform mobile apps for Android and iOS using Flutter and native Kotlin modules.',
        achievements: JSON.stringify([
          'Successfully launched 4 mobile apps on Google Play and Apple App Store with over 20,000 combined downloads',
          'Engineered real-time socket communication features, offline data synchronization, and biometric authentication',
          'Decreased app launch time by 45% through asset pre-caching and render-tree optimizations'
        ]),
        technologies: JSON.stringify(['Flutter', 'Dart', 'Kotlin', 'Firebase', 'RESTful APIs', 'SQLite']),
        icon: '📱',
        order_index: 3
      },
      {
        type: 'education',
        title: 'Bachelor of Science in Computer Science',
        company_or_school: 'Leading University of Information Technology',
        location: 'Lahore, Pakistan',
        period: 'Graduated with Honors',
        description: 'Comprehensive curriculum focused on Software Engineering, Data Structures & Algorithms, Artificial Intelligence, Distributed Systems, and Database Management.',
        achievements: JSON.stringify([
          'Graduated in the Top 5% of the class with Academic Distinction',
          'Completed Capstone Project on Deep Learning-Driven Autonomous Crop Health Diagnostics'
        ]),
        technologies: JSON.stringify(['Data Structures', 'Algorithms', 'AI/ML', 'Computer Networks', 'Database Systems']),
        icon: '🎓',
        order_index: 4
      }
    ];

    for (const exp of initialExperiences) {
      insertExperience.run(
        exp.type,
        exp.title,
        exp.company_or_school,
        exp.location,
        exp.period,
        exp.description,
        exp.achievements,
        exp.technologies,
        exp.icon,
        exp.order_index
      );
    }
    console.log('Seeded experiences');
  }

  // Seed Services if empty
  const checkServices = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (checkServices.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (title, icon, description, features, starting_price, timeline_estimate, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const initialServices = [
      {
        title: 'Full Stack Web Development',
        icon: 'Code',
        description: 'End-to-end web applications with modern architectures: React/Next.js frontends, Node/Python backends, high-security APIs, and robust databases.',
        features: JSON.stringify([
          'Custom Responsive UI with Tailwind CSS & Framer Motion',
          'Scalable REST / GraphQL API Architecture',
          'Secure Authentication & Role-Based Access Control',
          'Database Design (PostgreSQL, MongoDB, SQLite)',
          'Automated Testing & CI/CD Deployment'
        ]),
        starting_price: '$999',
        timeline_estimate: '2-4 weeks',
        order_index: 1
      },
      {
        title: 'AI & Machine Learning Solutions',
        icon: 'Brain',
        description: 'Custom AI models, predictive analytics, intelligent chatbot agents, computer vision, and LLM automation pipelines tailored to business goals.',
        features: JSON.stringify([
          'Custom Machine Learning & Deep Learning Model Training',
          'RAG Knowledge Base & LLM Agent Integration',
          'Computer Vision & Real-Time Object/Disease Detection',
          'Predictive Data Analytics & Forecasting Dashboards',
          'High-Speed Edge Model Inference & Deployment'
        ]),
        starting_price: '$1,499',
        timeline_estimate: '3-6 weeks',
        order_index: 2
      },
      {
        title: 'Cross-Platform Mobile Development',
        icon: 'Smartphone',
        description: 'Fluid, high-performance mobile applications for iOS and Android with Flutter, featuring offline sync, biometrics, and push notifications.',
        features: JSON.stringify([
          'Single Codebase for High-Performance iOS & Android Apps',
          'Pixel-Perfect Native UI/UX Animations',
          'Biometric Authentication & In-App Purchases / Stripe',
          'Offline-First Local Storage & Sync',
          'App Store & Google Play Publishing Support'
        ]),
        starting_price: '$1,199',
        timeline_estimate: '2-5 weeks',
        order_index: 3
      },
      {
        title: 'Cloud Architecture & DevOps',
        icon: 'Database',
        description: 'Resilient cloud infrastructure setup, containerization with Docker, Kubernetes orchestration, database tuning, and automated deployment pipelines.',
        features: JSON.stringify([
          'Docker Containerization & Microservice Decomposition',
          'AWS / GCP / DigitalOcean Cloud Architecture',
          'CI/CD Pipeline Setup (GitHub Actions)',
          'Redis Caching & Database Performance Tuning',
          '24/7 Monitoring, Logging & Alerting Setup'
        ]),
        starting_price: '$799',
        timeline_estimate: '1-3 weeks',
        order_index: 4
      },
      {
        title: 'UI/UX Design & 3D Web Experiences',
        icon: 'Globe',
        description: 'Next-generation web interfaces with interactive Three.js 3D scenes, micro-interactions, glassmorphism dark/light themes, and conversion-focused layouts.',
        features: JSON.stringify([
          'Interactive Three.js & WebGL 3D Canvas Visuals',
          'Framer Motion Smooth Physics Animations',
          'Mobile-First Responsive Layout Design',
          'High-Contrast Accessibility & Dark Mode',
          'Design System & Component Library Creation'
        ]),
        starting_price: '$699',
        timeline_estimate: '1-2 weeks',
        order_index: 5
      },
      {
        title: 'API Engineering & System Optimization',
        icon: 'Zap',
        description: 'Comprehensive code audits, database index optimization, legacy system refactoring, and high-throughput microservice engineering.',
        features: JSON.stringify([
          'Codebase Speed & Memory Profiling',
          'Database Query & Index Tuning',
          'Third-Party API & Payment Gateway Integrations',
          'Security Vulnerability & Penetration Audits',
          'Real-Time WebSocket & Message Queue Integration'
        ]),
        starting_price: '$599',
        timeline_estimate: '1-2 weeks',
        order_index: 6
      }
    ];

    for (const serv of initialServices) {
      insertService.run(
        serv.title,
        serv.icon,
        serv.description,
        serv.features,
        serv.starting_price,
        serv.timeline_estimate,
        serv.order_index
      );
    }
    console.log('Seeded services');
  }

  // Seed Certificates if empty
  const checkCertificates = db.prepare('SELECT COUNT(*) as count FROM certificates').get();
  if (checkCertificates.count === 0) {
    const insertCert = db.prepare(`
      INSERT INTO certificates (title, issuer, year, description, credential_url, credential_id, image, color, dark_color, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialCerts = [
      {
        title: 'Full Stack Web Development Professional',
        issuer: 'Meta (Coursera)',
        year: '2024',
        description: 'Comprehensive mastery of React, Node.js, relational and non-relational database design, version control, and production security.',
        credential_url: 'https://coursera.org/verify/certificate-meta-fullstack',
        credential_id: 'META-FS-849201',
        image: 'https://images.unsplash.com/photo-1516321310762-479d72a370a7?w=600&h=400&fit=crop',
        color: 'from-blue-400 to-purple-600',
        dark_color: 'from-blue-500 to-purple-700',
        order_index: 1
      },
      {
        title: 'Machine Learning Specialization',
        issuer: 'Stanford University & DeepLearning.AI',
        year: '2024',
        description: 'Advanced supervised learning, neural networks, deep learning architectures, decision trees, and reinforcement learning principles.',
        credential_url: 'https://coursera.org/verify/certificate-stanford-ml',
        credential_id: 'STANFORD-ML-49281',
        image: 'https://images.unsplash.com/photo-1536147116438-62679a5e7161?w=600&h=400&fit=crop',
        color: 'from-amber-400 to-red-600',
        dark_color: 'from-amber-500 to-red-700',
        order_index: 2
      },
      {
        title: 'Google Cloud Certified Associate Cloud Engineer',
        issuer: 'Google Cloud',
        year: '2023',
        description: 'Deploying enterprise applications, monitoring operations, managing storage and compute infrastructure on Google Cloud Platform.',
        credential_url: 'https://google.com/verify/gcp-associate-cloud-engineer',
        credential_id: 'GCP-ACE-99482',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop',
        color: 'from-green-400 to-blue-600',
        dark_color: 'from-green-500 to-blue-700',
        order_index: 3
      },
      {
        title: 'Flutter & Dart Mobile App Specialist',
        issuer: 'Google Developers',
        year: '2023',
        description: 'Engineering cross-platform mobile architectures, state management with Bloc/Provider, and native device API integrations.',
        credential_url: 'https://developers.google.com/verify/flutter-dart-specialist',
        credential_id: 'GD-FLUTTER-77219',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
        color: 'from-sky-400 to-indigo-600',
        dark_color: 'from-sky-500 to-indigo-700',
        order_index: 4
      },
      {
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services (AWS)',
        year: '2023',
        description: 'Comprehensive understanding of AWS cloud security, architecture principles, high availability, and cloud financial management.',
        credential_url: 'https://aws.amazon.com/verification/aws-cloud-practitioner',
        credential_id: 'AWS-CCP-102948',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
        color: 'from-yellow-400 to-orange-600',
        dark_color: 'from-yellow-500 to-orange-700',
        order_index: 5
      },
      {
        title: 'Advanced TypeScript & Modern Architecture',
        issuer: 'Microsoft Learn',
        year: '2022',
        description: 'Advanced generic type systems, asynchronous event patterns, clean design patterns, and enterprise micro-frontend structures.',
        credential_url: 'https://learn.microsoft.com/verify/advanced-typescript',
        credential_id: 'MSFT-TS-394821',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
        color: 'from-purple-400 to-pink-600',
        dark_color: 'from-purple-500 to-pink-700',
        order_index: 6
      }
    ];

    for (const cert of initialCerts) {
      insertCert.run(
        cert.title,
        cert.issuer,
        cert.year,
        cert.description,
        cert.credential_url,
        cert.credential_id,
        cert.image,
        cert.color,
        cert.dark_color,
        cert.order_index
      );
    }
    console.log('Seeded certificates');
  }

  // Seed Testimonials if empty
  const checkTestimonials = db.prepare('SELECT COUNT(*) as count FROM testimonials').get();
  if (checkTestimonials.count === 0) {
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (name, role, company, avatar, rating, text, project_name, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialTestimonials = [
      {
        name: 'David Harrison',
        role: 'Chief Technology Officer',
        company: 'Apex HealthTech Labs',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        rating: 5,
        text: 'Muhammad Ahmad is one of the most versatile and brilliant engineers I have ever collaborated with. He transformed our complex machine learning models into an ultra-fast production application with an intuitive UI. His attention to detail, speed, and communication are unmatched.',
        project_name: 'AI Diagnostics Platform',
        status: 'approved',
        is_featured: 1
      },
      {
        name: 'Sarah Lin',
        role: 'VP of Product',
        company: 'Vanguard FinSystems',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        rating: 5,
        text: 'Working with Ahmad was a game changer for our mobile fintech launch. He delivered an exceptionally polished Flutter app with zero security flaws and seamless Stripe payment integration. Our users constantly praise the fluid animations and responsiveness.',
        project_name: 'Mobile Banking Suite',
        status: 'approved',
        is_featured: 1
      },
      {
        name: 'Marcus Vance',
        role: 'Founder & CEO',
        company: 'NeuroScale Intelligence',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        rating: 5,
        text: 'Ahmad has a rare dual-strength: deep technical mastery of full-stack backend systems combined with world-class frontend visual design aesthetics. He architected our analytics platform from scratch and delivered it ahead of schedule.',
        project_name: 'DataVision Learning Hub',
        status: 'approved',
        is_featured: 1
      },
      {
        name: 'Elena Rostova',
        role: 'Head of Engineering',
        company: 'AgriTech Global',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
        rating: 5,
        text: 'The GreenGuardian AI model and mobile app developed by Muhammad exceeded all our performance expectations. 95% accuracy in crop disease detection with immediate edge inference on standard phones is truly exceptional work.',
        project_name: 'GreenGuardian AI',
        status: 'approved',
        is_featured: 1
      }
    ];

    for (const test of initialTestimonials) {
      insertTestimonial.run(
        test.name,
        test.role,
        test.company,
        test.avatar,
        test.rating,
        test.text,
        test.project_name,
        test.status,
        test.is_featured
      );
    }
    console.log('Seeded testimonials');
  }

  // Seed Chatbot Knowledge Base if empty
  const checkKB = db.prepare('SELECT COUNT(*) as count FROM chatbot_knowledge').get();
  if (checkKB.count === 0) {
    const insertKB = db.prepare(`
      INSERT INTO chatbot_knowledge (category, trigger_keywords, question, answer, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);

    const initialKB = [
      {
        category: 'about',
        trigger_keywords: 'who are you, about, background, bio, experience, introduction, tell me about muhammad',
        question: 'Who is Muhammad Ahmad?',
        answer: 'Muhammad Ahmad is a professional Full Stack Developer, AI/ML Engineer, and Mobile Architect with over 3 years of hands-on experience building enterprise web systems, deep learning models, and cross-platform apps.',
        order_index: 1
      },
      {
        category: 'skills',
        trigger_keywords: 'skills, stack, technologies, tech, languages, framework, react, node, python, flutter',
        question: 'What are Muhammad Ahmad\'s primary skills and tech stack?',
        answer: 'Muhammad specializes in:\n• Frontend: React, Next.js, TypeScript, Tailwind CSS, Three.js, Framer Motion\n• Backend: Node.js, Express, Python (FastAPI/Django), Laravel, PostgreSQL, MongoDB, Redis\n• AI/ML: TensorFlow, PyTorch, LangChain, Hugging Face, OpenCV\n• Mobile: Flutter & Dart cross-platform development\n• Cloud & DevOps: Docker, AWS, Firebase, CI/CD pipelines',
        order_index: 2
      },
      {
        category: 'services',
        trigger_keywords: 'services, hire, pricing, cost, rates, hourly, quote, what can you do, estimate',
        question: 'What services does Muhammad offer and what are the rates?',
        answer: 'Muhammad offers:\n1. Full Stack Web Development (Starting from $999)\n2. Custom AI & Machine Learning Solutions (Starting from $1,499)\n3. Cross-Platform Mobile Apps with Flutter (Starting from $1,199)\n4. Cloud Architecture & DevOps (Starting from $799)\n5. UI/UX Design & 3D Interactive Web Experiences (Starting from $699)\n\nCustom fixed-price milestones and flexible hourly retainers are available.',
        order_index: 3
      },
      {
        category: 'contact',
        trigger_keywords: 'contact, email, phone, whatsapp, reach, hire, meeting, schedule, message',
        question: 'How can I contact or hire Muhammad Ahmad?',
        answer: 'You can reach Muhammad directly via:\n• WhatsApp: +92 331 4815161\n• Email: Ahmadrajpootr1@gmail.com\n• LinkedIn: linkedin.com/in/muhammad-ahmad-565206291/\n• Or send a direct message through the Contact Form or Project Estimator on this site!',
        order_index: 4
      },
      {
        category: 'availability',
        trigger_keywords: 'availability, available, freelance, full-time, contract, remote, start',
        question: 'Is Muhammad Ahmad available for new projects or full-time roles?',
        answer: 'Yes! Muhammad is currently open to high-impact freelance projects, long-term contracts, and full-time remote opportunities worldwide.',
        order_index: 5
      },
      {
        category: 'cv',
        trigger_keywords: 'cv, resume, download, pdf, experience document',
        question: 'Where can I download Muhammad\'s Resume / CV?',
        answer: 'You can download Muhammad Ahmad\'s latest resume by clicking the "Download CV" button in the Hero section, or using the Ctrl+K Command Palette, or visiting his Google Drive direct link.',
        order_index: 6
      }
    ];

    for (const kb of initialKB) {
      insertKB.run(kb.category, kb.trigger_keywords, kb.question, kb.answer, kb.order_index);
    }
    console.log('Seeded chatbot knowledge base');
  }

  // Seed sample contact message
  const checkMessages = db.prepare('SELECT COUNT(*) as count FROM contact_messages').get();
  if (checkMessages.count === 0) {
    const insertMsg = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message, project_type, estimated_budget, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMsg.run(
      'Sophia Alexander',
      'sophia.alexander@lumina-ai.com',
      '+1 (415) 890-2194',
      'AI & Web Application Partnership Opportunity',
      'Hi Muhammad! We came across your impressive work on GreenGuardian AI and DataVision. We are developing an enterprise AI analytics dashboard and would love to discuss having you lead our frontend and ML integration engineering. Are you available for a discovery call this week?',
      'AI & Full Stack Web',
      '$5,000 - $10,000',
      'contact_form',
      'unread'
    );
    console.log('Seeded sample contact message');
  }
}

export default db;
