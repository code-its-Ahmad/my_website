import type { Transition, Variants } from 'framer-motion';

/**
 * Shared, module-level animation primitives.
 *
 * Two problems this solves:
 *
 * 1. Correctness — variant objects declared inline were inferred as
 *    `{ ease: string }`, which is not assignable to framer-motion's `Easing`
 *    union, so every one of them was a type error. Declaring them once with an
 *    explicit `Variants` annotation makes the literals check properly.
 *
 * 2. Referential stability — variants defined inside a component body are a new
 *    object on every render. framer-motion compares variant identity when
 *    deciding whether to restart an animation, so inline variants in a
 *    component that re-renders (for example a section containing a live clock)
 *    caused avoidable animation churn. Hoisting them to module scope makes them
 *    permanently stable.
 */

/** Cubic bezier equivalent of `easeOut`, typed as a tuple so TS keeps it exact. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 18,
  mass: 0.6,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 26,
  mass: 0.5,
};

/** Standard "section rises into view" entrance. */
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

/** Reduced-motion / low-tier counterpart: fade only, no transform. */
export const sectionVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: springSoft },
};

/** Vertical swap used by the Hero's rotating job titles. */
export const swapVertical: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: EASE_OUT } },
};

/** Parent that staggers its children. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/**
 * Viewport config for scroll-triggered entrances.
 *
 * `once: true` matters for performance: without it framer-motion keeps an
 * IntersectionObserver callback re-triggering animations every time a long page
 * is scrolled up and down.
 */
export const viewportOnce = { once: true, amount: 0.15 } as const;
export const viewportOnceEager = { once: true, amount: 0.05 } as const;

/** Pick the right entrance for the current device, avoiding transform cost. */
export const pickSectionVariants = (reduced: boolean): Variants =>
  reduced ? sectionVariantsReduced : sectionVariants;
