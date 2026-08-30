import { Suspense, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInViewport } from '@/hooks/useInViewport';
import { useDeviceCapabilities } from '@/context/DeviceCapabilitiesContext';
import { pickSectionVariants } from '@/lib/motion';

interface LazySectionProps {
  children: ReactNode;
  /**
   * Reserved height for the not-yet-mounted placeholder. Prevents the scrollbar
   * from jumping as deferred sections come online (cumulative layout shift).
   */
  minHeight?: string;
  /** How early to start loading, relative to the viewport. */
  rootMargin?: string;
  /** Skip deferral for above-the-fold content. */
  eager?: boolean;
  className?: string;
}

/**
 * Defers mounting *and* reveals a page section.
 *
 * Previously every section — including nine `motion.section` wrappers, five
 * WebGL canvases and a 1,800-line chatbot — mounted during the initial render
 * pass. Combining lazy mounting with the reveal animation here means:
 *
 *  - the lazy chunk is only fetched as the user approaches the section
 *  - a placeholder of known height keeps the scroll position stable
 *  - the reveal animation and the mount are driven by one observer, so content
 *    can never get stuck invisible because two observers disagreed
 *
 * It intentionally renders a `motion.div`, not a `<section>`: each child
 * component already provides its own `<section id="...">` landmark, and the old
 * wrapper duplicated both the element and its `id`.
 */
const LazySection = ({
  children,
  minHeight = '60vh',
  rootMargin = '300px 0px',
  eager = false,
  className,
}: LazySectionProps) => {
  const { reducedMotion, tier } = useDeviceCapabilities();
  const [ref, inView] = useInViewport<HTMLDivElement>({
    rootMargin,
    once: true,
    threshold: 0,
  });

  const shouldMount = eager || inView;
  const variants = pickSectionVariants(reducedMotion || tier === 'low');

  return (
    <motion.div
      ref={ref}
      className={className}
      style={shouldMount ? undefined : { minHeight }}
      variants={variants}
      initial="hidden"
      animate={shouldMount ? 'visible' : 'hidden'}
    >
      {shouldMount ? <Suspense fallback={<SectionSkeleton minHeight={minHeight} />}>{children}</Suspense> : null}
    </motion.div>
  );
};

/** Neutral, low-cost placeholder shown while a section chunk downloads. */
const SectionSkeleton = ({ minHeight }: { minHeight: string }) => (
  <div className="flex items-center justify-center px-4" style={{ minHeight }} aria-hidden="true">
    <div className="h-8 w-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 motion-safe:animate-spin" />
  </div>
);

export default LazySection;
