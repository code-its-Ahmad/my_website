/**
 * Single source of truth for in-page section navigation.
 *
 * ## Problems this replaces
 *
 * There were three different, mutually inconsistent implementations:
 *
 *  - the navbar used `element.offsetTop - (innerWidth < 768 ? 70 : 90)`
 *  - the command palette used bare `scrollIntoView()` with **no** offset, so
 *    every heading it jumped to landed underneath the fixed navbar
 *  - the footer used a hard-coded `75`
 *
 * On top of that, `offsetTop` is measured relative to the nearest positioned
 * ancestor, not the document. It only happened to work because `<main>` sits at
 * document y = 0; adding any in-flow element above it would have silently
 * broken every nav link. `getBoundingClientRect()` + `scrollY` is
 * document-absolute and cannot drift.
 *
 * The offset itself is read from the `--nav-offset` custom property so CSS
 * (`scroll-padding-top`, used by native anchor jumps and `:target`) and JS can
 * never disagree.
 */

const FALLBACK_OFFSET = 72;

/** Current fixed-navbar clearance in CSS pixels. */
export function getNavOffset(): number {
  if (typeof document === 'undefined') return FALLBACK_OFFSET;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-offset')
    .trim();

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return FALLBACK_OFFSET;

  // The property is authored in px; rem would need the root font size applied.
  return raw.endsWith('rem')
    ? parsed * Number.parseFloat(getComputedStyle(document.documentElement).fontSize || '16')
    : parsed;
}

/** Live reduced-motion preference. Cheap enough to read per interaction. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Absolute document Y of an element's top edge, minus the navbar clearance. */
export function getSectionTop(element: Element): number {
  const top = element.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, Math.round(top - getNavOffset()));
}

interface ScrollOptions {
  /**
   * Mirror the target into `location.hash` so the section is deep-linkable and
   * survives a refresh. `replaceState` is used rather than `pushState`: adding
   * a history entry per nav click would turn the browser Back button into a
   * section stepper, which is not what visitors expect from a one-page site.
   */
  updateHash?: boolean;
  /** Force instant positioning (used when restoring, not when navigating). */
  instant?: boolean;
}

/**
 * Scroll to a section by id.
 *
 * @returns `true` when the element existed and a scroll was issued. Callers can
 *          use the result to fall back to a route change.
 */
export function scrollToSection(id: string, options: ScrollOptions = {}): boolean {
  if (typeof document === 'undefined') return false;

  const element = document.getElementById(id);
  if (!element) return false;

  const { updateHash = true, instant = false } = options;
  const behavior: ScrollBehavior = instant || prefersReducedMotion() ? 'auto' : 'smooth';

  window.scrollTo({ top: getSectionTop(element), behavior });

  if (updateHash) {
    /*
     * Writing `location.hash` directly would trigger a second, un-offset
     * native jump on top of the smooth scroll above. `replaceState` updates
     * the address bar without any scrolling side effect.
     */
    try {
      window.history.replaceState(null, '', `#${id}`);
    } catch {
      /* Some embedded webviews forbid history writes; the scroll still worked. */
    }
  }

  return true;
}

/**
 * Honour a `#section` fragment present on first load.
 *
 * Native fragment navigation runs before the lazily-mounted sections exist, so
 * the browser either does nothing or lands on the wrong offset. This retries
 * for a bounded window and stops the moment it succeeds — no permanent timer.
 */
export function restoreHashTarget(maxWaitMs = 2500): () => void {
  if (typeof window === 'undefined') return () => {};

  const id = window.location.hash.replace('#', '');
  if (!id) return () => {};

  const deadline = Date.now() + maxWaitMs;
  let frame = 0;
  let cancelled = false;

  const attempt = () => {
    if (cancelled) return;

    const element = document.getElementById(id);
    if (element) {
      // Instant: an animated jump on page load reads as a glitch, not polish.
      window.scrollTo({ top: getSectionTop(element), behavior: 'auto' });
      return;
    }

    if (Date.now() < deadline) frame = requestAnimationFrame(attempt);
  };

  frame = requestAnimationFrame(attempt);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
}
