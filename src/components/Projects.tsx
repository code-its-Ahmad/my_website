import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, Autoplay, Parallax } from 'swiper/modules';
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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';
import { Project } from '../api/services';

type ProjectViewMode = 'coverflow' | 'grid';

const Projects = () => {
  const { projects, likeProject, trackProjectView } = usePortfolio();
  const { playClick, playHover, playWhoosh } = useSound();

  const [viewMode, setViewMode] = useState<ProjectViewMode>('coverflow');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  // Dynamic categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  const handleOpenCaseStudy = (project: Project) => {
    playClick();
    trackProjectView(project.id);
    setSelectedProject(project);
    setActiveGalleryIndex(0);
  };

  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    playClick();
    if (!likedMap[id]) {
      setLikedMap((prev) => ({ ...prev, [id]: true }));
      likeProject(id);
    }
  };

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Featured projects for coverflow showcase
  const showcaseProjects = useMemo(() => {
    return filteredProjects.length > 0 ? filteredProjects : projects;
  }, [filteredProjects, projects]);

  return (
    <section
      id="projects"
      className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 backdrop-blur-md"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Featured Case Studies & Work</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Architected & Built Systems
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Deep-dive into production full-stack platforms, machine learning vision applications, and cross-platform mobile apps.
          </motion.p>
        </div>

        {/* View Switcher, Filter & Search Bar */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start">
              <button
                onClick={() => {
                  playWhoosh();
                  setViewMode('coverflow');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'coverflow'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D Coverflow</span>
              </button>

              <button
                onClick={() => {
                  playWhoosh();
                  setViewMode('grid');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid Explorer</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, stack, tech..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playWhoosh();
                  setSelectedCategory(cat);
                }}
                onMouseEnter={playHover}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ VIEW MODE 1: SWIPER 3D COVERFLOW & PARALLAX SHOWCASE ═══ */}
        {viewMode === 'coverflow' && showcaseProjects.length > 0 && (
          <div className="relative py-4">
            <Swiper
              modules={[Navigation, Pagination, EffectCoverflow, Autoplay, Parallax]}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              spaceBetween={16}
              touchRatio={1.2}
              touchAngle={45}
              threshold={5}
              watchSlidesProgress={true}
              parallax={true}
              loop={showcaseProjects.length > 2}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              coverflowEffect={{
                rotate: 20,
                stretch: 0,
                depth: 120,
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
              className="w-full pb-14 pt-4"
            >
              {showcaseProjects.map((project) => (
                <SwiperSlide
                  key={project.id}
                  className="max-w-[285px] xs:max-w-[330px] sm:max-w-[420px] md:max-w-[480px] rounded-3xl"
                >
                  <Tilt
                    tiltMaxAngleX={6}
                    tiltMaxAngleY={6}
                    perspective={1000}
                    scale={1.01}
                    transitionSpeed={500}
                    tiltEnable={typeof window !== 'undefined' ? window.innerWidth > 768 : true}
                    className="h-full"
                  >
                    <div
                      onClick={() => handleOpenCaseStudy(project)}
                      onMouseEnter={playHover}
                      className="rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/60 shadow-2xl transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
                    >
                      {/* Project Header Image */}
                      <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={project.image}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e: any) => {
                            e.target.src = '/assets/project1.png';
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                            {project.category}
                          </span>
                          {project.featured && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-md">
                              <Sparkles className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>

                        {/* Like Button */}
                        <button
                          onClick={(e) => handleLike(e, project.id)}
                          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
                            likedMap[project.id]
                              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                              : 'bg-black/50 text-white hover:bg-pink-500'
                          }`}
                          title="Like Project"
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedMap[project.id] ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <h3 className="font-extrabold text-base sm:text-xl text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {project.short_description}
                        </p>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-gray-50/90 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Eye className="w-3.5 h-3.5" /> {project.views || 0}
                          </span>
                          <span className="flex items-center gap-1 text-pink-500 font-semibold text-[11px]">
                            ♥ {project.likes || 0}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="GitHub Repository"
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
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                            Case Study <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tilt>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrow Buttons */}
            <button
              className="swiper-btn-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="swiper-btn-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ═══ VIEW MODE 2: GRID EXPLORER ═══ */}
        {viewMode === 'grid' && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
                >
                  <Tilt
                    tiltMaxAngleX={6}
                    tiltMaxAngleY={6}
                    perspective={1000}
                    scale={1.01}
                    transitionSpeed={500}
                    tiltEnable={typeof window !== 'undefined' ? window.innerWidth > 768 : true}
                    className="h-full"
                  >
                    <div
                      onClick={() => handleOpenCaseStudy(project)}
                      onMouseEnter={playHover}
                      className="h-full rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/60 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                    >
                      {/* Project Cover */}
                      <div>
                        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={project.image}
                            alt={project.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e: any) => {
                              e.target.src = '/assets/project1.png';
                            }}
                          />

                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                              {project.category}
                            </span>
                            {project.featured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleLike(e, project.id)}
                            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                              likedMap[project.id]
                                ? 'bg-pink-500 text-white'
                                : 'bg-black/40 text-white hover:bg-pink-500'
                            }`}
                            title="Like Project"
                          >
                            <Heart className={`w-3.5 h-3.5 ${likedMap[project.id] ? 'fill-white' : ''}`} />
                          </button>
                        </div>

                        <div className="p-5 sm:p-6 space-y-2.5">
                          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {project.title}
                          </h3>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {project.short_description}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {project.technologies.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 4 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                                +{project.technologies.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Eye className="w-3.5 h-3.5" /> {project.views || 0}
                          </span>
                          <span className="flex items-center gap-1 text-pink-500 font-semibold text-[11px]">
                            ♥ {project.likes || 0}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="GitHub Repository"
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
                              title="Live Demo"
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
                  </Tilt>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">No projects match the selected criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ═══ CASE STUDY LIGHTBOX DRAWER ═══ */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
            />

            <motion.div
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 z-10 max-h-[92vh] flex flex-col overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              {/* Top Bar */}
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                    {selectedProject.category}
                  </span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                {/* Gallery */}
                {selectedProject.gallery_images?.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <img
                        src={selectedProject.gallery_images[activeGalleryIndex] || selectedProject.image}
                        alt="Project screenshot"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {selectedProject.gallery_images.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {selectedProject.gallery_images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveGalleryIndex(i)}
                            className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                              activeGalleryIndex === i
                                ? 'border-blue-600 scale-105 shadow-md'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-56 sm:h-72 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Tech Stack */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Technologies & Architecture
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    System Architecture & Overview
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProject.full_description || selectedProject.short_description}
                  </p>
                </div>

                {/* Case Study Pillars */}
                {(selectedProject.challenges || selectedProject.solutions || selectedProject.outcomes) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {selectedProject.challenges && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Challenges</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedProject.challenges}
                        </p>
                      </div>
                    )}

                    {selectedProject.solutions && (
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Solutions</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedProject.solutions}
                        </p>
                      </div>
                    )}

                    {selectedProject.outcomes && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Impact & Outcomes</span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedProject.outcomes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  {selectedProject.live_url && (
                    <a
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}

                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>View Code</span>
                    </a>
                  )}
                </div>

                <a
                  href="#contact"
                  onClick={() => setSelectedProject(null)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>Request Similar Architecture</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
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
