import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  Menu,
  X,
  User,
  Home,
  Briefcase,
  Code,
  Folder,
  Award,
  MessageSquare,
  Sparkles,
  Command,
  Terminal,
  Volume2,
  VolumeX,
  ShieldCheck,
  Users,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useSound } from '../context/SoundContext';

interface NavigationProps {
  onOpenCommandPalette?: () => void;
  onOpenTerminal?: () => void;
}

/**
 * Navigation bar items — declared outside the component to avoid
 * creating a new array reference on every render. This fixes
 * the infinite useEffect re-registration bug that caused scroll
 * listener leak and janky performance on low-end devices.
 */
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'testimonials', label: 'Reviews', icon: Users },
  { id: 'contact', label: 'Contact', icon: MessageSquare },
] as const;

const Navigation = ({ onOpenCommandPalette, onOpenTerminal }: NavigationProps) => {
  const { isMuted, toggleMute, playClick, playHover, playWhoosh, vibrate } = useSound();

  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);

  // Keep ref in sync so the scroll handler reads the latest value
  // without re-registering the listener
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Smooth Scroll Progress Indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  // ── Scroll spy & directional navbar reveal logic ──────────────
  // Dependencies are now stable (no array re-creation per render)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Compact floating pill style after scrolling past threshold
        setIsScrolled(currentScrollY > 20);

        // Auto-hide on fast scroll down, reveal on scroll up
        if (currentScrollY > 150) {
          if (currentScrollY > lastScrollY.current + 10 && !isOpenRef.current) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current - 10) {
            setIsVisible(true);
          }
        } else {
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;

        // Active section calculation with scroll offset
        const scrollPosition = currentScrollY + 160;
        for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
          const section = document.getElementById(NAV_ITEMS[i].id);
          if (section) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (
              scrollPosition >= sectionTop &&
              scrollPosition < sectionTop + sectionHeight
            ) {
              setActiveSection(NAV_ITEMS[i].id);
              break;
            } else if (i === 0 && currentScrollY < 120) {
              setActiveSection('home');
              break;
            }
          }
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial run

    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // ← stable deps, no re-registration

  // ── Lock body scroll when mobile drawer is open ────────────────
  // Uses overflow + position fixed to prevent iOS Safari rubber-band
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ── Smooth scroll to section ──────────────────────────────────
  const scrollToSection = useCallback(
    (id: string) => {
      playWhoosh();
      setIsOpen(false);

      // Small delay so body scroll lock releases before scrolling
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 75;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      });
    },
    [playWhoosh]
  );

  // ── Memoize the terminal trigger to avoid inline closures ─────
  const handleTerminalClick = useCallback(() => {
    vibrate(12);
    playClick();
    if (onOpenTerminal) {
      onOpenTerminal();
    } else {
      window.dispatchEvent(new CustomEvent('open-cyber-terminal'));
    }
  }, [vibrate, playClick, onOpenTerminal]);

  const handleCommandPaletteClick = useCallback(() => {
    vibrate(10);
    playClick();
    if (onOpenCommandPalette) onOpenCommandPalette();
  }, [vibrate, playClick, onOpenCommandPalette]);

  const handleSoundToggle = useCallback(() => {
    vibrate(10);
    playClick();
    toggleMute();
  }, [vibrate, playClick, toggleMute]);

  const handleMenuToggle = useCallback(() => {
    vibrate(10);
    playClick();
    setIsOpen((prev) => !prev);
  }, [vibrate, playClick]);

  return (
    <>
      {/* Top Animated Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] overflow-hidden pointer-events-none"
        style={{ position: 'fixed' }}
      >
        <motion.div
          className="h-full w-full bg-gradient-to-r from-cyan-400 via-blue-500 via-indigo-500 to-purple-500 origin-left will-change-transform"
          style={{
            scaleX,
            boxShadow: '0 0 12px rgba(59,130,246,0.8)',
          }}
        />
      </div>

      {/* Main Dynamic Floating Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -90,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[45] px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3 flex justify-center pointer-events-none will-change-transform"
      >
        <nav
          ref={navRef}
          className={`w-full max-w-7xl px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl pointer-events-auto transition-all duration-300 flex items-center justify-between ${isScrolled
            ? 'bg-white/85 dark:bg-gray-950/85 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl shadow-blue-500/5'
            : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/40 dark:border-gray-800/40 shadow-lg shadow-black/5'
            }`}
        >
          {/* Logo / Brand */}
          <button
            onClick={() => scrollToSection('home')}
            onMouseEnter={playHover}
            className="flex items-center space-x-2 sm:space-x-2.5 text-left group focus:outline-none min-w-0"
            aria-label="Scroll to home"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                MA
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-950 animate-pulse" />
            </div>
            <div className="hidden min-[480px]:block min-w-0">
              <span className="font-extrabold text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all block truncate">
                Muhammad Ahmad
              </span>
              <span className="block text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-tight truncate">
                Full Stack & AI Engineer
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  onMouseEnter={playHover}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] xl:text-xs font-semibold transition-all duration-200 relative flex items-center gap-1 xl:gap-1.5 focus:outline-none whitespace-nowrap ${isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-800/60'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/15 rounded-xl border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)] -z-10"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & Mobile Hamburger */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Cyber Terminal HUD Trigger */}
            {/* <button
              onClick={handleTerminalClick}
              onMouseEnter={playHover}
              title="Cyber Terminal HUD (Ctrl + \)"
              className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95 shadow-sm shadow-cyan-500/10 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline font-mono text-[10px]">HUD</span>
            </button> */}

            {/* Command Palette Trigger Button (Ctrl + K) */}
            <button
              onClick={handleCommandPaletteClick}
              onMouseEnter={playHover}
              title="Command Palette (Ctrl + K)"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100/90 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700/80 text-xs font-medium transition-all hover:scale-105 active:scale-95"
            >
              <Command className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="font-mono text-[10px] bg-white dark:bg-gray-900 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                ⌘K
              </span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleSoundToggle}
              onMouseEnter={playHover}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${isMuted
                ? 'bg-gray-100/70 dark:bg-gray-800/60 border-transparent text-gray-400'
                : 'bg-blue-500/10 dark:bg-blue-400/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/10'
                }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            </button>

            {/* Dark / Light Toggle */}
            <ThemeToggle />

            {/* Admin Panel Portal Shortcut */}
            <Link
              to="/admin"
              onMouseEnter={playHover}
              title="Admin Control Suite"
              className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-purple-500/10"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={handleMenuToggle}
              className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-200 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700/80 transition-all active:scale-95"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5 text-blue-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Drawer Menu & Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Blur Overlay — z-[46] so it sits above header z-[45] */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[46] bg-black/60 backdrop-blur-md lg:hidden"
              aria-hidden="true"
            />

            {/* Mobile Drawer Content — z-[47] above backdrop */}
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-2.5 sm:inset-x-3 top-[60px] sm:top-[68px] z-[47] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl lg:hidden space-y-3 overflow-y-auto overscroll-contain touch-pan-y"
              style={{
                maxHeight: 'calc(100dvh - 76px)',
                WebkitOverflowScrolling: 'touch',
              }}
              role="dialog"
              aria-label="Navigation Menu"
            >
              {/* Drawer Header Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                    MA
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Navigation Menu
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white active:scale-90 transition-transform"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Staggered Navigation Items Grid */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {NAV_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all relative active:scale-[0.97] touch-manipulation ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50'
                        }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/80 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Action Buttons in Mobile Drawer */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenTerminal) {
                      onOpenTerminal();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-cyber-terminal'));
                    }
                  }}
                  className="py-2 px-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold flex items-center justify-center gap-1 text-[11px] active:scale-95 touch-manipulation transition-transform"
                >
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Terminal</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenCommandPalette) onOpenCommandPalette();
                  }}
                  className="py-2 px-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center gap-1 text-[11px] active:scale-95 touch-manipulation transition-transform"
                >
                  <Command className="w-3.5 h-3.5 shrink-0" />
                  <span>⌘K</span>
                </button>

                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold flex items-center justify-center gap-1 text-[11px] active:scale-95 touch-manipulation transition-transform"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin</span>
                </Link>
              </div>

              {/* Direct Quick Contact CTA in Drawer */}
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-[0.97] touch-manipulation transition-transform"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Get In Touch</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
