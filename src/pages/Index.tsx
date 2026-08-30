import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import LazySection from '../components/common/LazySection';
import { useDeviceCapabilities } from '../context/DeviceCapabilitiesContext';
import { analyticsAPI } from '../api/services';

/**
 * Everything below the fold is code-split. On first load a visitor downloads
 * the navigation and the hero; the remaining sections stream in as they are
 * approached. This is what keeps the initial JS payload small enough to be
 * usable on a budget phone over mobile data.
 */
const About = lazy(() => import('../components/About'));
const Projects = lazy(() => import('../components/Projects'));
const Skills = lazy(() => import('../components/Skills'));
const Experience = lazy(() => import('../components/Experience'));
const Services = lazy(() => import('../components/Services'));
const Certificates = lazy(() => import('../components/Certificates'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const Contact = lazy(() => import('../components/Contact'));
const Footer = lazy(() => import('../components/Footer'));

/** Overlays: never needed for first paint, and some are tier-gated. */
const ChatBot = lazy(() => import('../components/ChatBot'));
const CommandPalette = lazy(() => import('../components/common/CommandPalette'));
const CyberTerminal = lazy(() => import('../components/common/CyberTerminal'));
const MobileBottomDock = lazy(() => import('../components/common/MobileBottomDock'));
const ParticleCanvas = lazy(() => import('../components/common/ParticleCanvas'));
const CustomCursor = lazy(() => import('../components/common/CustomCursor'));
const Preloader = lazy(() => import('../components/common/Preloader'));

const INTRO_SEEN_KEY = 'portfolio_intro_seen';

const Index = () => {
  const { enableParticles, enableCustomCursor, isTouch } = useDeviceCapabilities();

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      // Private browsing / storage disabled — skip the intro rather than crash.
      return false;
    }
  });

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isTerminalOpen, setTerminalOpen] = useState(false);

  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);
  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);

  // Analytics is fire-and-forget; `track` already swallows transport errors.
  useEffect(() => {
    void analyticsAPI.track('pageview');
  }, []);

  useEffect(() => {
    const handleOpenPalette = () => setCommandPaletteOpen(true);
    const handleOpenTerminal = () => setTerminalOpen(true);

    const handleKeyDown = (event: KeyboardEvent) => {
      // Never hijack keys while the visitor is typing into a field.
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
        return;
      }

      if ((event.ctrlKey && event.key === '\\') || (event.altKey && key === 't')) {
        event.preventDefault();
        setTerminalOpen((open) => !open);
      }
    };

    window.addEventListener('open-command-palette', handleOpenPalette);
    window.addEventListener('open-cyber-terminal', handleOpenTerminal);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-command-palette', handleOpenPalette);
      window.removeEventListener('open-cyber-terminal', handleOpenTerminal);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      /* storage unavailable — the intro simply shows again next visit */
    }
  }, []);

  // Lock body scroll while the intro overlay is up so the page cannot be
  // scrolled behind it.
  useEffect(() => {
    if (!isLoading) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLoading]);

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-gray-50 text-gray-900 transition-colors duration-300 selection:bg-cyan-500 selection:text-black dark:bg-gray-950 dark:text-white">
      {isLoading && (
        <Suspense fallback={null}>
          <Preloader onComplete={handlePreloaderComplete} />
        </Suspense>
      )}

      {/* Ambient background — skipped entirely on low-tier hardware. */}
      {enableParticles && (
        <Suspense fallback={null}>
          <ParticleCanvas />
        </Suspense>
      )}

      {enableCustomCursor && (
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      )}

      {/* Overlays are only mounted once actually opened, not merely rendered
          closed. This keeps their chunks — and the terminal's typing loop — out
          of the initial load completely. */}
      {isCommandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette isOpen onClose={closeCommandPalette} />
        </Suspense>
      )}

      {isTerminalOpen && (
        <Suspense fallback={null}>
          <CyberTerminal isOpen onClose={closeTerminal} />
        </Suspense>
      )}

      <Navigation onOpenCommandPalette={openCommandPalette} onOpenTerminal={openTerminal} />

      <main className="relative z-10">
        {/* Hero owns its own <section id="home"> and is never deferred: it is
            the largest contentful paint. */}
        <Hero onOpenTerminal={openTerminal} />

        <LazySection minHeight="100vh">
          <About />
        </LazySection>

        <LazySection minHeight="100vh">
          <Projects />
        </LazySection>

        <LazySection minHeight="100vh">
          <Skills />
        </LazySection>

        <LazySection minHeight="80vh">
          <Experience />
        </LazySection>

        <LazySection minHeight="90vh">
          <Services />
        </LazySection>

        <LazySection minHeight="80vh">
          <Certificates />
        </LazySection>

        <LazySection minHeight="80vh">
          <Testimonials />
        </LazySection>

        <LazySection minHeight="90vh">
          <Contact />
        </LazySection>
      </main>

      <LazySection minHeight="40vh" rootMargin="400px 0px">
        <Footer onOpenTerminal={openTerminal} />
      </LazySection>

      {/* Thumb-reachable dock, touch devices only. */}
      {isTouch && (
        <Suspense fallback={null}>
          <MobileBottomDock onOpenTerminal={openTerminal} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
};

export default Index;
