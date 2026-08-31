import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useMotionTemplate,
} from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Pagination,
  EffectCoverflow,
  Autoplay,
  Parallax,
  Keyboard,
  A11y,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/parallax';
import {
  FolderKanban,
  ExternalLink,
  Github,
  Heart,
  Eye,
  Search,
  Sparkles,
  X,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';
import { Project } from '../api/services';

type ProjectViewMode = 'coverflow' | 'grid';

/* ═══════════════════════════════════════════════════════════
   CUSTOM HOOKS — Professional Logic Layer
   ═══════════════════════════════════════════════════════════ */

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setMatches(e.matches);
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

/* ═══════════════════════════════════════════════════════════
   3D MOUSE GLOW CARD — Advanced UI Component
   ═══════════════════════════════════════════════════════════ */

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', enabled = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [enabled, mouseX, mouseY]
  );

  const background = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(59, 130, 246, 0.12),
      transparent 40%
    )
  `;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
    >
      {enabled && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background }}
        />
      )}
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ANIMATION VARIANTS — Advanced Motion System
   ═══════════════════════════════════════════════════════════ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, rotateX: 15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 80, damping: 15, mass: 1 },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: 10, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    rotateX: -5,
    y: 30,
    transition: { duration: 0.25, ease: 'easeInOut' },
  },
};

const heroTextVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

const Projects: React.FC = () => {
  const { projects, likeProject, trackProjectView } = usePortfolio();
  const { playClick, playHover, playWhoosh } = useSound();

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  // Responsive flags
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isTouch = useMediaQuery('(pointer: coarse)');

  // State
  const [viewMode, setViewMode] = useState<ProjectViewMode>('coverflow');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Scroll-linked parallax for section background
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const bgSpring = useSpring(bgY, { stiffness: 100, damping: 30 });

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.category && set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter logic with loading state
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 400);
    return () => clearTimeout(timer);
  }, [debouncedSearch, selectedCategory, viewMode]);

  const filteredProjects = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return projects.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      if (!q) return matchesCat;
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [projects, selectedCategory, debouncedSearch]);

  const showcaseProjects = useMemo(() => {
    return filteredProjects.length > 0 ? filteredProjects : projects;
  }, [filteredProjects, projects]);

  // Handlers
  const handleOpenCaseStudy = useCallback(
    (project: Project) => {
      playClick();
      trackProjectView(project.id);
      setSelectedProject(project);
      setActiveGalleryIndex(0);
      document.body.style.overflow = 'hidden';
    },
    [playClick, trackProjectView]
  );

  const handleCloseCaseStudy = useCallback(() => {
    setSelectedProject(null);
    document.body.style.overflow = '';
  }, []);

  const handleLike = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      playClick();
      if (!likedMap[id]) {
        setLikedMap((prev) => ({ ...prev, [id]: true }));
        likeProject(id);
      }
    },
    [likedMap, playClick, likeProject]
  );

  const handleReset = useCallback(() => {
    setSelectedCategory('All');
    setSearchQuery('');
    playWhoosh();
  }, [playWhoosh]);

  // Swiper responsive config
  const swiperSlidesPerView = useMemo(() => {
    if (isMobile) return 1.15;
    if (isTablet) return 1.8;
    return 'auto';
  }, [isMobile, isTablet]);

  const swiperSpaceBetween = isMobile ? 12 : 24;

  // Keyboard support for modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject) handleCloseCaseStudy();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedProject, handleCloseCaseStudy]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative min-h-screen py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500"
    >
      {/* Parallax Background Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none"
        style={{ y: bgSpring }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[128px]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-10 sm:space-y-14">
        {/* ═══ SECTION HEADER — 3D Text Reveal ═══ */}
        <div ref={headerRef} className="text-center space-y-4 perspective-1000">
          <motion.div
            custom={0}
            initial="hidden"
            animate={isHeaderInView ? 'visible' : 'hidden'}
            variants={heroTextVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-xl shadow-lg shadow-blue-500/5"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Featured Case Studies & Work</span>
          </motion.div>

          <motion.h2
            custom={1}
            initial="hidden"
            animate={isHeaderInView ? 'visible' : 'hidden'}
            variants={heroTextVariants}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight"
            style={{ perspective: 1000 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Architected & Built
            </span>
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {' '}
              Systems
            </span>
          </motion.h2>

          <motion.p
            custom={2}
            initial="hidden"
            animate={isHeaderInView ? 'visible' : 'hidden'}
            variants={heroTextVariants}
            className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Deep-dive into production full-stack platforms, machine learning vision
            applications, and cross-platform mobile apps.
          </motion.p>
        </div>

        {/* ═══ CONTROL BAR — Glassmorphism Dock ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
          className="p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-2xl shadow-black/5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 self-start lg:self-auto backdrop-blur-md">
              {[
                { mode: 'coverflow' as const, icon: Layers, label: '3D Coverflow' },
                { mode: 'grid' as const, icon: LayoutGrid, label: 'Grid Explorer' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    playWhoosh();
                    setViewMode(mode);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${viewMode === mode
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80 group">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, stack, tech..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-white transition-all shadow-inner"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Category Chips — Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playWhoosh();
                  setSelectedCategory(cat);
                }}
                onMouseEnter={playHover}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                  : 'bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ═══ VIEW MODE 1: 3D COVERFLOW SHOWCASE ═══ */}
        <AnimatePresence mode="wait">
          {viewMode === 'coverflow' && showcaseProjects.length > 0 && (
            <motion.div
              key="coverflow"
              initial={{ opacity: 0, rotateY: -5 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 5 }}
              transition={{ duration: 0.5 }}
              className="relative py-6 perspective-1500"
            >
              <Swiper
                modules={[Navigation, Pagination, EffectCoverflow, Autoplay, Parallax, Keyboard, A11y]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={swiperSlidesPerView}
                spaceBetween={swiperSpaceBetween}
                touchRatio={1.5}
                touchAngle={45}
                threshold={5}
                watchSlidesProgress={true}
                parallax={true}
                keyboard={{ enabled: true }}
                a11y={{ prevSlideMessage: 'Previous project', nextSlideMessage: 'Next project' }}
                loop={showcaseProjects.length > 2}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                coverflowEffect={{
                  rotate: isMobile ? 0 : 25,
                  stretch: 0,
                  depth: isMobile ? 80 : 200,
                  modifier: 1,
                  slideShadows: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={{
                  nextEl: '.swiper-btn-next',
                  prevEl: '.swiper-btn-prev',
                }}
                className="w-full pb-16 pt-6 !overflow-visible"
              >
                {showcaseProjects.map((project, idx) => (
                  <SwiperSlide
                    key={project.id}
                    className="max-w-[300px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[520px] rounded-3xl !h-auto"
                    style={{ perspective: 1200 }}
                  >
                    <Tilt
                      tiltMaxAngleX={isTouch ? 0 : 8}
                      tiltMaxAngleY={isTouch ? 0 : 8}
                      perspective={1200}
                      scale={1.02}
                      transitionSpeed={400}
                      tiltEnable={!isTouch}
                      className="h-full"
                    >
                      <GlowCard enabled={!isTouch} className="h-full rounded-3xl">
                        <div
                          onClick={() => handleOpenCaseStudy(project)}
                          onMouseEnter={playHover}
                          className="group relative h-full rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/60 dark:border-gray-800/60 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden flex flex-col cursor-pointer"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* Image */}
                          <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <motion.img
                              src={project.image}
                              alt={project.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.08 }}
                              transition={{ duration: 0.7, ease: 'easeOut' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/project1.png';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                                {project.category}
                              </span>
                              {project.featured && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-lg"
                                >
                                  <Sparkles className="w-3 h-3" /> Featured
                                </motion.span>
                              )}
                            </div>

                            {/* Like */}
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={(e) => handleLike(e, project.id)}
                              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${likedMap[project.id]
                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                                : 'bg-black/40 text-white hover:bg-pink-500'
                                }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${likedMap[project.id] ? 'fill-white' : ''}`}
                              />
                            </motion.button>
                          </div>

                          {/* Content */}
                          <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col">
                            <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {project.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                              {project.short_description}
                            </p>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {project.technologies.slice(0, 4).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 4 && (
                                <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                                  +{project.technologies.length - 4}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="p-4 bg-gray-50/90 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> {project.views || 0}
                              </span>
                              <span className="flex items-center gap-1.5 text-pink-500 font-bold">
                                <Heart className="w-3.5 h-3.5 fill-pink-500" />{' '}
                                {(project.likes || 0) + (likedMap[project.id] ? 1 : 0)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  title="GitHub"
                                >
                                  <Github className="w-4 h-4" />
                                </a>
                              )}
                              {project.live_url && (
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                  title="Live Demo"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 ml-1">
                                Case Study <ArrowUpRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlowCard>
                    </Tilt>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Arrows */}
              <button
                className="swiper-btn-prev absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 active:scale-90 disabled:opacity-30"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="swiper-btn-next absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 active:scale-90 disabled:opacity-30"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ═══ VIEW MODE 2: GRID EXPLORER — Staggered 3D Entrance ═══ */}
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 perspective-1500"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    layout
                    key={project.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9, rotateX: 10, transition: { duration: 0.2 } }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                    className="h-full"
                  >
                    <Tilt
                      tiltMaxAngleX={isTouch ? 0 : 5}
                      tiltMaxAngleY={isTouch ? 0 : 5}
                      perspective={1000}
                      scale={1.01}
                      transitionSpeed={500}
                      tiltEnable={!isTouch}
                      className="h-full"
                    >
                      <GlowCard enabled={!isTouch} className="h-full rounded-3xl group">
                        <div
                          onClick={() => handleOpenCaseStudy(project)}
                          onMouseEnter={playHover}
                          className="h-full rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 hover:border-blue-500/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
                        >
                          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <motion.img
                              src={project.image}
                              alt={project.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.06 }}
                              transition={{ duration: 0.6 }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/project1.png';
                              }}
                            />
                            <div className="absolute top-3 left-3 flex gap-1.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                                {project.category}
                              </span>
                              {project.featured && (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Featured
                                </span>
                              )}
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={(e) => handleLike(e, project.id)}
                              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${likedMap[project.id]
                                ? 'bg-pink-500 text-white shadow-lg'
                                : 'bg-black/40 text-white hover:bg-pink-500'
                                }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${likedMap[project.id] ? 'fill-white' : ''}`}
                              />
                            </motion.button>
                          </div>

                          <div className="p-5 sm:p-6 space-y-2.5 flex-1 flex flex-col">
                            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {project.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                              {project.short_description}
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {project.technologies.slice(0, 4).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 4 && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                                  +{project.technologies.length - 4}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> {project.views || 0}
                              </span>
                              <span className="flex items-center gap-1 text-pink-500 font-bold">
                                <Heart className="w-3.5 h-3.5 fill-pink-500" />{' '}
                                {(project.likes || 0) + (likedMap[project.id] ? 1 : 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Github className="w-4 h-4" />
                                </a>
                              )}
                              {project.live_url && (
                                <a
                                  href={project.live_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                Case Study <ArrowUpRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </GlowCard>
                    </Tilt>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {filteredProjects.length === 0 && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16 space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                No projects match your criteria.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all active:scale-95"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Searching Skeleton */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ CASE STUDY MODAL — 3D Spring Animation ═══ */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCaseStudy}
            />

            <motion.div
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 z-10 max-h-[92vh] flex flex-col overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ perspective: 1200 }}
            >
              {/* Top Bar */}
              <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                    {selectedProject.category}
                  </span>
                  <h3 className="font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white">
                    {selectedProject.title}
                  </h3>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseCaseStudy}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
                {/* Gallery */}
                <div className="space-y-3">
                  <div className="relative h-56 sm:h-80 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeGalleryIndex}
                        src={
                          selectedProject.gallery_images?.[activeGalleryIndex] ||
                          selectedProject.image
                        }
                        alt="Project screenshot"
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                      />
                    </AnimatePresence>
                  </div>

                  {selectedProject.gallery_images && selectedProject.gallery_images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {selectedProject.gallery_images.map((img, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveGalleryIndex(i)}
                          className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeGalleryIndex === i
                            ? 'border-blue-600 shadow-md'
                            : 'border-transparent opacity-50 hover:opacity-100'
                            }`}
                        >
                          <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Technologies & Architecture
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    System Architecture & Overview
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProject.full_description || selectedProject.short_description}
                  </p>
                </div>

                {/* Case Study Pillars */}
                {(selectedProject.challenges ||
                  selectedProject.solutions ||
                  selectedProject.outcomes) && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      {selectedProject.challenges && (
                        <motion.div
                          variants={itemVariants}
                          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Challenges</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedProject.challenges}
                          </p>
                        </motion.div>
                      )}
                      {selectedProject.solutions && (
                        <motion.div
                          variants={itemVariants}
                          className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                            <Lightbulb className="w-4 h-4" />
                            <span>Solutions</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedProject.solutions}
                          </p>
                        </motion.div>
                      )}
                      {selectedProject.outcomes && (
                        <motion.div
                          variants={itemVariants}
                          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Impact & Outcomes</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedProject.outcomes}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
              </div>

              {/* Footer */}
              <div className="p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {selectedProject.live_url && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </motion.a>
                  )}
                  {selectedProject.github_url && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold shadow-lg transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span>View Code</span>
                    </motion.a>
                  )}
                </div>

                <a
                  href="#contact"
                  onClick={handleCloseCaseStudy}
                  className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>Request Similar Architecture</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;