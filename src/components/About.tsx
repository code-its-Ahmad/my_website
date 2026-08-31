import React, { useState, useRef, memo, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  type Variants,
} from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import {
  User,
  Layers,
  GraduationCap,
  Sparkles,
  Download,
  Code2,
  Cpu,
  Globe,
  CheckCircle,
  Zap,
  Heart,
  BookOpen,
  Award,
  Brain,
  Smartphone,
  Cloud,
  Database,
  Palette,
  Target,
  Clock,
  Star,
  ArrowRight,
  Terminal,
  Shield,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import ComputersCanvas from './3D/Computers';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';
import { useCountUp } from '../hooks/useCountUp';

/* ═══════════════════════════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface TechCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  skills: { name: string; level: number }[];
}

interface PhilosophyCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

interface FunStat {
  end: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════════════════════════════ */

const JOURNEY_TIMELINE: TimelineItem[] = [
  {
    year: '2021',
    title: 'Began Computer Science Degree',
    description: 'Enrolled in BS Computer Science — built strong foundations in data structures, algorithms, and object-oriented architectures.',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    year: '2022',
    title: 'First International Startup Projects',
    description: 'Delivered high-performance dashboards, RESTful APIs, and full-stack web applications for global startups.',
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
  },
  {
    year: '2023',
    title: 'AI/ML & Computer Vision Specialization',
    description: 'Engineered deep learning models with TensorFlow & PyTorch. Developed AI-driven diagnostic vision architectures.',
    icon: Brain,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    year: '2024',
    title: 'Full Stack, Cloud & DevOps Scale',
    description: 'Architected scalable Next.js systems, Docker microservices, AWS cloud pipelines, and cross-platform Flutter applications.',
    icon: Cloud,
    color: 'from-orange-500 to-amber-500',
  },
  {
    year: '2025 - Present',
    title: 'Senior Engineer & AI Solutions Architect',
    description: 'Leading full lifecycle system design, intelligent agent integrations, low-latency microservices, and modern UI/UX ecosystems.',
    icon: Star,
    color: 'from-indigo-500 to-violet-500',
  },
];

const TECH_CATEGORIES: TechCategory[] = [
  {
    name: 'Frontend Engineering',
    icon: Code2,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    skills: [
      { name: 'React 19 / Next.js 15', level: 96 },
      { name: 'TypeScript', level: 94 },
      { name: 'Tailwind CSS & Vanilla CSS', level: 95 },
      { name: 'Three.js / React Three Fiber', level: 88 },
      { name: 'Framer Motion Animations', level: 92 },
    ],
  },
  {
    name: 'Backend & Cloud Systems',
    icon: Database,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-pink-500/20',
    skills: [
      { name: 'Node.js / Express.js', level: 94 },
      { name: 'Python (FastAPI & Django)', level: 90 },
      { name: 'PostgreSQL / MongoDB / Redis', level: 92 },
      { name: 'REST & GraphQL APIs', level: 93 },
      { name: 'Docker / AWS / CI/CD', level: 87 },
    ],
  },
  {
    name: 'AI, ML & Vision',
    icon: Brain,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    skills: [
      { name: 'TensorFlow & PyTorch', level: 88 },
      { name: 'OpenCV & Computer Vision', level: 86 },
      { name: 'LangChain & LLM Agents', level: 90 },
      { name: 'Model Optimization & Inference', level: 85 },
      { name: 'Scikit-Learn Data Pipelines', level: 89 },
    ],
  },
  {
    name: 'Cross-Platform Mobile',
    icon: Smartphone,
    color: 'text-orange-500',
    gradient: 'from-orange-500/20 to-amber-500/20',
    skills: [
      { name: 'Flutter & Dart', level: 90 },
      { name: 'React Native', level: 84 },
      { name: 'State Management (Bloc/Riverpod)', level: 88 },
      { name: 'Native Platform Channels', level: 82 },
      { name: 'Mobile UX & Responsive Layouts', level: 92 },
    ],
  },
];

const PHILOSOPHY_CARDS: PhilosophyCard[] = [
  {
    title: 'Clean Architecture',
    description: 'Every line of code is structured with modularity, SOLID principles, high cohesion, and self-documenting clarity for long-term scalability.',
    icon: Shield,
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    title: 'Performance-First Engineering',
    description: 'Sub-second page loads, memory optimization, asset compression, and GPU-accelerated 60fps animations. Speed is a vital core feature.',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'User Empathy & Delight',
    description: 'Interfaces designed to captivate and inspire — fluid micro-interactions, intuitive hierarchies, accessibility compliance, and polished aesthetics.',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    title: 'Continuous Innovation',
    description: 'Technology advances non-stop. I continuously research next-gen AI models, modern web capabilities, and best engineering paradigms.',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const FUN_STATS: FunStat[] = [
  { end: 50, suffix: '+', label: 'Production Projects', icon: Rocket, color: 'text-blue-500' },
  { end: 3, suffix: '+', label: 'Years Experience', icon: Clock, color: 'text-purple-500' },
  { end: 100, suffix: '+', label: 'Global Clients', icon: Globe, color: 'text-emerald-500' },
  { end: 99, suffix: '%', label: 'Client Satisfaction', icon: Star, color: 'text-amber-500' },
];

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 20 },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS (Memoized)
   ═══════════════════════════════════════════════════════════════════ */

/** Animated stat counter card */
const StatCounter = memo(({ stat }: { stat: FunStat }) => {
  const { ref, displayValue } = useCountUp({
    end: stat.end,
    suffix: stat.suffix,
    duration: 2000,
    delay: 150,
  });

  const Icon = stat.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="group relative p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="relative z-10 text-center space-y-1">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}
        >
          {displayValue}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
});
StatCounter.displayName = 'StatCounter';

/** Animated skill progress bar */
const SkillProgressBar = memo(({ name, level, delay }: { name: string; level: number; delay: number }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(barRef, { once: true, amount: 0.5 });

  return (
    <div ref={barRef} className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{name}</span>
        <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px]">{level}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1, delay: delay * 0.08, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
});
SkillProgressBar.displayName = 'SkillProgressBar';

/** Journey timeline entry */
const TimelineEntry = memo(({ item, index }: { item: TimelineItem; index: number }) => {
  const entryRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(entryRef, { once: true, amount: 0.3 });
  const Icon = item.icon;

  return (
    <motion.div
      ref={entryRef}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 90, damping: 20, delay: index * 0.1 }}
      className="relative pl-6 sm:pl-8 pb-6 last:pb-2 border-l-2 border-blue-500/30 dark:border-blue-500/20 group"
    >
      {/* Node Dot */}
      <div className="absolute -left-[13px] sm:-left-[15px] top-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500 flex items-center justify-center text-blue-500 shadow-md group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm group-hover:shadow-md transition-all space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {item.year}
          </span>
        </div>
        <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
          {item.title}
        </h5>
        <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
});
TimelineEntry.displayName = 'TimelineEntry';

/* ═══════════════════════════════════════════════════════════════════
   MAIN ABOUT COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const About = () => {
  const { profile } = usePortfolio();
  const { playClick, playHover, playWhoosh } = useSound();
  const [activeTab, setActiveTab] = useState<'story' | 'architecture' | 'education' | 'philosophy' | 'toolkit'>('story');
  const [terminalCmd, setTerminalCmd] = useState<string>('whoami');

  // Scroll parallax reference
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothBgY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -60]), {
    stiffness: 60,
    damping: 25,
  });

  const downloadCV = () => {
    playClick();
    window.open(
      profile?.resume_url || 'https://drive.google.com/file/d/1LEb7Scv_BQzuClhKMqYnNDqrOdwfnJI0/view?usp=sharing',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const tabs = useMemo(
    () => [
      { id: 'story' as const, label: 'Story & Journey', icon: User },
      { id: 'architecture' as const, label: 'Tech Architecture', icon: Layers },
      { id: 'education' as const, label: 'Education & Roots', icon: GraduationCap },
      { id: 'philosophy' as const, label: 'Philosophy', icon: Sparkles },
      { id: 'toolkit' as const, label: 'Dev Toolkit & Terminal', icon: Terminal },
    ],
    []
  );

  const terminalOutputs: Record<string, string> = {
    whoami: `Name: Muhammad Ahmad
Role: Senior Full Stack Engineer & AI Specialist
Status: Available for Worldwide Remote Roles & Scalable Architecture Consulting
Specialties: React 19, TypeScript, Next.js, Node.js, Python, TensorFlow, Flutter, Docker, AWS
Location: Lahore, Pakistan (PKT / UTC+5)
Code Health: 100% Type-Safe | 60 FPS WebGL | Zero Latency Mindset`,
    'cat stack.json': `{
  "core_languages": ["TypeScript", "Python", "JavaScript", "Dart", "SQL", "C++"],
  "frontend": ["React 19", "Next.js 15", "Three.js", "Tailwind CSS", "Framer Motion", "Vite"],
  "backend": ["Node.js", "Express", "FastAPI", "PostgreSQL", "MongoDB", "Redis", "GraphQL"],
  "ai_ml": ["PyTorch", "TensorFlow", "OpenCV", "LangChain", "LLM Inference", "Scikit-Learn"],
  "devops_cloud": ["Docker", "AWS (EC2/S3/Lambda)", "CI/CD GitHub Actions", "Nginx", "Linux"]
}`,
    'git status': `On branch production-main
Your branch is up to date with 'origin/master'.

Changes committed:
  - 50+ Production full-stack platforms & mobile apps
  - 10+ Deep learning computer vision & neural agent models
  - 99% Client satisfaction rating across 100+ global deployments

nothing to commit, working tree clean (ready to build your vision)`,
    'model.evaluate()': `[Neural Engine Diagnostics]
> Loading test dataset... 100,000 samples loaded.
> Running inference with PyTorch/TensorFlow...
> Precision: 98.6% | Recall: 97.9% | F1-Score: 98.2%
> Latency per batch: 4.2ms (GPU Accelerated)
> Status: OPTIMIZED & DEPLOYMENT-READY`
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300"
    >
      {/* ═══ ANIMATED BACKGROUND GLOW ORBS ═══ */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ y: smoothBgY }}
      >
        <div className="absolute top-16 left-[5%] w-64 sm:w-80 h-64 sm:h-80 bg-blue-500/8 dark:bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-[45%] right-[5%] w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/8 dark:bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-16 left-[25%] w-60 sm:w-80 h-60 sm:h-80 bg-emerald-500/6 dark:bg-emerald-500/4 rounded-full blur-[100px]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 backdrop-blur-md"
          >
            <User className="w-3.5 h-3.5" />
            <span>Discover My Engineering Journey</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            About Muhammad Ahmad
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            A full-stack engineer and AI specialist bridging algorithmic intelligence with scalable cloud architectures and aesthetic digital experiences.
          </motion.p>
        </div>

        {/* 2-Column Main Layout: Left 3D Card & Live Highlights | Right Interactive Tabbed Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ── Left: Profile + 3D Card ── */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col space-y-4"
          >
            <Tilt
              tiltMaxAngleX={6}
              tiltMaxAngleY={6}
              perspective={1000}
              scale={1.01}
              transitionSpeed={500}
              tiltEnable={typeof window !== 'undefined' ? window.innerWidth > 768 : true}
            >
              <div className="relative rounded-3xl p-5 sm:p-7 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-4 overflow-hidden group">
                {/* 3D Mini Computers Canvas */}
                <div className="h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 relative">
                  <ComputersCanvas />
                </div>

                {/* Profile Overview */}
                <div className="flex items-center space-x-3.5">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 shadow-md shrink-0">
                    <img
                      src={profile?.avatar_url || '/assets/profile.png'}
                      alt={profile?.name || 'Muhammad Ahmad'}
                      className="w-full h-full object-cover rounded-[14px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/profile.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                        Senior Engineer & AI Specialist
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {profile?.years_experience || '3+'} Yrs Exp
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                      {profile?.name || 'Muhammad Ahmad'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {profile?.bio ||
                    'Architecting modern cloud-native systems, computer vision pipelines, and aesthetic web applications with performance and craft.'}
                </p>

                {/* CV & Location Action Row */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <button
                    onClick={downloadCV}
                    onMouseEnter={playHover}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </button>

                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    📍 {profile?.location || 'Lahore, Pakistan'}
                  </span>
                </div>
              </div>
            </Tilt>

            {/* Quick Pillars Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Target, label: 'Pixel-Perfect UI', color: 'text-blue-500' },
                { icon: Zap, label: 'Performance-First', color: 'text-amber-500' },
                { icon: Shield, label: 'Type-Safe Modular Code', color: 'text-emerald-500' },
                { icon: Globe, label: 'Global Remote Ready', color: 'text-purple-500' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur border border-gray-200/60 dark:border-gray-800/60 text-[11px] font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Right: Tabbed Interactive Engineering Details ── */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-4"
          >
            {/* Tab Selectors */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 backdrop-blur-md">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playWhoosh();
                      setActiveTab(tab.id);
                    }}
                    onMouseEnter={playHover}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-gray-700/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl min-h-[360px]">
              <AnimatePresence mode="wait">
                {/* ═══ TAB 1: STORY & JOURNEY ═══ */}
                {activeTab === 'story' && (
                  <motion.div
                    key="story"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-blue-500" />
                        From Passion to Production-Grade Engineering
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-1.5">
                        {profile?.about_story ||
                          'Over the past 3+ years, I have architected, deployed, and scaled full-stack web applications, machine learning pipelines, and cross-platform mobile apps for fast-growing startups and international clients. My journey is driven by an obsession with building software that creates measurable impact.'}
                      </p>
                    </div>

                    {/* Capability Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                      {[
                        'Production Full-Stack Web & Mobile',
                        'Edge & Cloud ML Model Deployment',
                        'High-Throughput API & Microservices',
                        '3D WebGL & Interactive UI Animations',
                        'CI/CD & Docker Infrastructure Automation',
                        'Scalable Database & Caching Architectures',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Career Timeline */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>Key Milestones & Journey</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {JOURNEY_TIMELINE.map((item, index) => (
                          <TimelineEntry key={item.year} item={item} index={index} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ TAB 2: TECHNICAL ARCHITECTURE ═══ */}
                {activeTab === 'architecture' && (
                  <motion.div
                    key="architecture"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-500" />
                        Technical Architecture & Proficiency Stack
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        My engineering workflow focuses on strict type safety, modular component systems, efficient caching, and resilient pipelines.
                      </p>
                    </div>

                    {/* Tech Category Cards with Skill Meters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {TECH_CATEGORIES.map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                          <div
                            key={cat.name}
                            className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800/60 space-y-2.5 shadow-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className={`w-4 h-4 ${cat.color}`} />
                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                {cat.name}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {cat.skills.map((skill, sIdx) => (
                                <SkillProgressBar
                                  key={skill.name}
                                  name={skill.name}
                                  level={skill.level}
                                  delay={i * 2 + sIdx}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ═══ TAB 3: EDUCATION & CERTIFICATIONS ═══ */}
                {activeTab === 'education' && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      Academic Foundations & Certified Accreditations
                    </h4>

                    {/* Degree Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                          Bachelor of Science in Computer Science
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        Top 5% Academic Honors • Capstone Thesis: Deep Learning-Driven Crop Health Diagnostics with Computer Vision & Mobile Edge Inference.
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['Data Structures & Algorithms', 'Operating Systems', 'Machine Learning', 'Database Systems', 'Distributed Computing'].map((subject, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications Grid */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>Professional Certifications</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { issuer: 'Meta', title: 'Full Stack Software Engineer', color: 'from-blue-500 to-indigo-500' },
                          { issuer: 'Stanford University', title: 'Machine Learning Specialization', color: 'from-red-500 to-rose-500' },
                          { issuer: 'Google Cloud', title: 'Cloud Architecture & Pipelines', color: 'from-emerald-500 to-teal-500' },
                          { issuer: 'AWS', title: 'Solutions Architect Fundamentals', color: 'from-orange-500 to-amber-500' },
                        ].map((cert, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60"
                          >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cert.color} flex items-center justify-center text-white shrink-0`}>
                              <Award className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{cert.issuer}</div>
                              <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{cert.title}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ TAB 4: ENGINEERING PHILOSOPHY ═══ */}
                {activeTab === 'philosophy' && (
                  <motion.div
                    key="philosophy"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Clean Code, Measurable Impact & Aesthetic Craft
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {profile?.about_philosophy ||
                          'I believe in clean architecture, performance-first engineering, and aesthetic visual design. Every line of code should have purpose, every interface should delight the user, and every machine learning model should deliver tangible, actionable value.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {PHILOSOPHY_CARDS.map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800/60 space-y-1.5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shrink-0`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                {card.title}
                              </h5>
                            </div>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                              {card.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ═══ TAB 5: DEV TOOLKIT & LIVE TERMINAL ═══ */}
                {activeTab === 'toolkit' && (
                  <motion.div
                    key="toolkit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-500" />
                        Interactive Developer Toolkit & Terminal Sandbox
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Simulate live commands to inspect Muhammad Ahmad's core architecture, system specs, and diagnostics.
                      </p>
                    </div>

                    {/* Interactive Command Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['whoami', 'cat stack.json', 'git status', 'model.evaluate()'].map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => {
                            playClick();
                            setTerminalCmd(cmd);
                          }}
                          onMouseEnter={playHover}
                          className={`px-3 py-1 rounded-xl font-mono text-xs font-semibold transition-all ${
                            terminalCmd === cmd
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-105'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          $ {cmd}
                        </button>
                      ))}
                    </div>

                    {/* Terminal Window */}
                    <div className="rounded-2xl overflow-hidden bg-[#090d16] border border-gray-800 shadow-2xl font-mono text-xs">
                      {/* Window Header */}
                      <div className="px-4 py-2.5 bg-[#0f172a] border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                          <span className="text-[11px] text-gray-400 font-bold ml-2">
                            bash — ahmad@nexus-core:~
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ● Online
                        </span>
                      </div>

                      {/* Terminal Content */}
                      <div className="p-4 text-gray-300 space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <span>ahmad@nexus-core:~$</span>
                          <span className="text-white">{terminalCmd}</span>
                        </div>
                        <pre className="text-[11px] text-blue-200/90 whitespace-pre-wrap leading-relaxed">
                          {terminalOutputs[terminalCmd]}
                        </pre>
                      </div>
                    </div>

                    {/* Productivity & Work Setup Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { label: 'Editor', val: 'VS Code & NeoVim' },
                        { label: 'Cloud Host', val: 'AWS & Vercel' },
                        { label: 'VCS Workflow', val: 'Git & GitHub Actions' },
                        { label: 'API Testing', val: 'Postman & Swagger' },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 text-center"
                        >
                          <div className="text-[9px] uppercase font-bold text-gray-400">{item.label}</div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 truncate">{item.val}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Numerical Stat Counters Bar */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4"
        >
          {FUN_STATS.map((stat, i) => (
            <StatCounter key={i} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;