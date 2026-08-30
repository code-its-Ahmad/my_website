import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, Code, Cpu, Database, Send } from 'lucide-react';
import CodingScene from './3D/CodingScene';
import { useTheme } from '../context/ThemeContext';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';
import { analyticsAPI } from '../api/services';

const Hero = () => {
  const { theme } = useTheme();
  const { profile } = usePortfolio();
  const { playClick, playHover } = useSound();
  const [currentRole, setCurrentRole] = useState(0);
  const [typedName, setTypedName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const heroName = profile?.name || 'Muhammad Ahmad';
  const roles = profile?.titles?.length
    ? profile.titles
    : [
      'Full Stack Developer',
      'AI/ML Engineer',
      'Mobile App Architect',
      'Cloud & DevOps Engineer',
      'UI/UX Designer',
    ];

  // Smooth typing effect for Name
  useEffect(() => {
    setIsLoaded(true);
    let i = 0;
    setTypedName('');
    const typeInterval = setInterval(() => {
      if (i < heroName.length) {
        setTypedName(heroName.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 70);

    return () => clearInterval(typeInterval);
  }, [heroName]);

  // Role switching animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [roles.length]);

  const downloadCV = () => {
    playClick();
    analyticsAPI.track('cv_download', { source: 'hero_button' });
    const cvUrl =
      profile?.resume_url ||
      'https://drive.google.com/file/d/1LEb7Scv_BQzuClhKMqYnNDqrOdwfnJI0/view?usp=sharing';
    window.open(cvUrl, '_blank', 'noopener,noreferrer');
  };

  const scrollTo = (id: string) => {
    playClick();
    const el = document.getElementById(id);
    if (el) {
      const offset = 75;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const roleVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20 pb-12 sm:pb-16"
    >
      {/* 3D Background Scene */}
      <div className="absolute inset-0 pointer-events-none">
        <CodingScene theme={theme} />
      </div>

      {/* Layered Gradient Overlays */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90 z-10 pointer-events-none transition-opacity duration-300 ${theme === 'dark' ? 'opacity-90' : 'opacity-65'
          }`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20 z-10 pointer-events-none transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-70'
          }`}
      />

      {/* Floating Animated Ambient Glows (GPU Accelerated) */}
      <div className="absolute top-20 left-10 w-32 sm:w-48 h-32 sm:h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none transform-gpu" />
      <div className="absolute bottom-20 right-10 w-36 sm:w-56 h-36 sm:h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none transform-gpu" />

      {/* Main Hero Content */}
      <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Availability Badge */}
        {profile?.available_for_hire !== false && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-[11px] sm:text-xs font-semibold shadow-lg shadow-emerald-500/10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">Available for Worldwide Remote & Freelance Roles</span>
          </motion.div>
        )}

        {/* Hero Name & Dynamic Role Typing */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-blue-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg min-h-[48px] sm:min-h-[64px] md:min-h-[80px] flex items-center justify-center">
            <span>{typedName}</span>
            <span className="inline-block w-1 sm:w-1.5 h-7 sm:h-12 bg-blue-400 ml-1.5 animate-pulse rounded-full" />
          </h1>

          <div className="h-8 sm:h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentRole}
                variants={roleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-100 via-blue-200 to-white bg-clip-text text-transparent"
              >
                {roles[currentRole]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Tagline / Subtitle */}
        <motion.p
          className="text-xs sm:text-sm md:text-base text-gray-200 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {profile?.tagline ||
            'Crafting high-performance digital ecosystems with modern web architectures, AI/ML deep learning pipelines, and world-class UI/UX design.'}
        </motion.p>

        {/* Quick Skill Pillar Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 py-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          {[
            { icon: Code, label: 'Full Stack Web' },
            { icon: Cpu, label: 'AI/ML & Vision' },
            { icon: Database, label: 'Cloud & DevOps' },
          ].map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/10 dark:bg-gray-900/60 backdrop-blur-md border border-white/10 dark:border-gray-800 text-[11px] sm:text-xs font-semibold text-gray-200 transition-transform"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{skill.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2 max-w-md sm:max-w-none mx-auto w-full"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <button
            onClick={downloadCV}
            onMouseEnter={playHover}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download CV / Resume</span>
          </button>

          <button
            onClick={() => scrollTo('projects')}
            onMouseEnter={playHover}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-gray-800/80 border border-white/15 dark:border-gray-700 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Explore Projects</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollTo('contact')}
            onMouseEnter={playHover}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Let's Talk</span>
          </button>
        </motion.div>

        {/* Live Counters / Statistics */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-6 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {[
            { value: profile?.projects_completed || '50+', label: 'Projects Built', color: 'text-blue-400' },
            { value: profile?.years_experience || '3+', label: 'Years Experience', color: 'text-purple-400' },
            { value: profile?.happy_clients || '100+', label: 'Global Clients', color: 'text-cyan-400' },
            { value: profile?.satisfaction_rate || '99%', label: 'Satisfaction', color: 'text-emerald-400' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-white/10 dark:border-gray-800 text-center transition-colors"
            >
              <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-300 dark:text-gray-400 font-medium mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;