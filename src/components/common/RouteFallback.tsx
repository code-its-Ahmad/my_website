/**
 * Route-level suspense fallback.
 *
 * Deliberately dependency-free and animation-light: it renders while a lazy
 * chunk is still downloading, which on a slow 3G connection is exactly the
 * moment the device has the least headroom to spare.
 */
const RouteFallback = () => (
  <div
    className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950"
    role="status"
    aria-live="polite"
  >
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 motion-safe:animate-spin" />
    </div>
    <p className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">Loading…</p>
    <span className="sr-only">Loading page content</span>
  </div>
);

export default RouteFallback;
