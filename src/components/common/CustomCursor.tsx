import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Completely disable on mobile and touch devices
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth < 768
    ) {
      setIsSupported(false);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible]);

  if (!isSupported || !isVisible) return null;

  return (
    <>
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full mix-blend-screen hidden md:block"
        animate={{
          x: mousePosition.x - (isHovering ? 22 : 14),
          y: mousePosition.y - (isHovering ? 22 : 14),
          width: isHovering ? 44 : 28,
          height: isHovering ? 44 : 28,
          backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.12)',
          borderColor: isHovering ? 'rgba(96, 165, 250, 0.8)' : 'rgba(192, 132, 252, 0.4)',
        }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 300,
          mass: 0.4,
        }}
        style={{
          borderWidth: 1.5,
          boxShadow: isHovering
            ? '0 0 20px rgba(59, 130, 246, 0.4)'
            : '0 0 10px rgba(168, 85, 247, 0.15)',
        }}
      />

      {/* Center Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full hidden md:block bg-blue-500 dark:bg-cyan-400"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          scale: isHovering ? 0 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 35,
          stiffness: 450,
          mass: 0.1,
        }}
        style={{
          width: 6,
          height: 6,
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)',
        }}
      />
    </>
  );
};

export default CustomCursor;
