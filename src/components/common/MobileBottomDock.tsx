// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Home,
//   FolderKanban,
//   Zap,
//   MessageSquare,
//   Bot,
//   Terminal,
//   Volume2,
//   VolumeX,
//   ArrowUp,
//   Sparkles,
// } from 'lucide-react';
// import { useSound } from '../../context/SoundContext';

// interface MobileBottomDockProps {
//   onOpenTerminal: () => void;
//   onOpenChatBot?: () => void;
// }

// const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
//   onOpenTerminal,
//   onOpenChatBot,
// }) => {
//   const { isMuted, toggleMute, playClick, playWhoosh, vibrate } = useSound();
//   const [activeSection, setActiveSection] = useState('home');
//   const [isVisible, setIsVisible] = useState(true);
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const lastScrollY = useRef(0);

//   useEffect(() => {
//     let ticking = false;

//     const handleScroll = () => {
//       if (!ticking) {
//         window.requestAnimationFrame(() => {
//           const currentScrollY = window.scrollY;

//           // Toggle scroll-to-top button
//           setShowScrollTop(currentScrollY > 350);

//           // Intelligent auto-hide on fast scroll down
//           if (currentScrollY > 200) {
//             if (currentScrollY > lastScrollY.current + 15) {
//               setIsVisible(false);
//             } else if (currentScrollY < lastScrollY.current - 10) {
//               setIsVisible(true);
//             }
//           } else {
//             setIsVisible(true);
//           }
//           lastScrollY.current = currentScrollY;

//           // Active section spy
//           const sections = ['home', 'about', 'projects', 'skills', 'services', 'contact'];
//           const scrollPosition = currentScrollY + 200;

//           for (let i = sections.length - 1; i >= 0; i--) {
//             const section = document.getElementById(sections[i]);
//             if (section) {
//               const top = section.offsetTop;
//               const height = section.offsetHeight;
//               if (scrollPosition >= top && scrollPosition < top + height) {
//                 setActiveSection(sections[i]);
//                 break;
//               } else if (i === 0 && currentScrollY < 150) {
//                 setActiveSection('home');
//                 break;
//               }
//             }
//           }

//           ticking = false;
//         });
//         ticking = true;
//       }
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const scrollToSection = (id: string) => {
//     vibrate(15);
//     playWhoosh();
//     const el = document.getElementById(id);
//     if (el) {
//       const offset = 70;
//       const bodyRect = document.body.getBoundingClientRect().top;
//       const elementRect = el.getBoundingClientRect().top;
//       const offsetPosition = elementRect - bodyRect - offset;
//       window.scrollTo({
//         top: offsetPosition,
//         behavior: 'smooth',
//       });
//     }
//   };

//   const scrollToTop = () => {
//     vibrate(20);
//     playWhoosh();
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const triggerChatBot = () => {
//     vibrate(15);
//     playClick();
//     if (onOpenChatBot) {
//       onOpenChatBot();
//     } else {
//       window.dispatchEvent(new CustomEvent('open-portfolio-chatbot'));
//     }
//   };

//   const triggerTerminal = () => {
//     vibrate(15);
//     playClick();
//     onOpenTerminal();
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ y: 80, opacity: 0 }}
//         animate={{
//           y: isVisible ? 0 : 85,
//           opacity: isVisible ? 1 : 0,
//         }}
//         transition={{ duration: 0.3, ease: 'easeOut' }}
//         className="fixed bottom-3 inset-x-0 z-[42] flex justify-center px-3 pointer-events-none lg:hidden will-change-transform"
//         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)' }}
//       >
//         <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-gray-950/85 dark:bg-gray-950/90 backdrop-blur-2xl border border-white/15 dark:border-cyan-500/30 shadow-2xl shadow-black/60 pointer-events-auto max-w-[95vw]">
//           {/* Home */}
//           <button
//             onClick={() => scrollToSection('home')}
//             className={`p-2 sm:p-2.5 rounded-full relative transition-all active:scale-90 touch-manipulation ${activeSection === 'home'
//               ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
//               : 'text-gray-400 hover:text-white'
//               }`}
//             title="Home"
//             aria-label="Home"
//           >
//             <Home className="w-4 h-4" />
//           </button>

//           {/* Projects */}
//           <button
//             onClick={() => scrollToSection('projects')}
//             className={`p-2 sm:p-2.5 rounded-full relative transition-all active:scale-90 touch-manipulation ${activeSection === 'projects'
//               ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40'
//               : 'text-gray-400 hover:text-white'
//               }`}
//             title="Projects"
//             aria-label="Projects"
//           >
//             <FolderKanban className="w-4 h-4" />
//           </button>

//           {/* Skills */}
//           <button
//             onClick={() => scrollToSection('skills')}
//             className={`p-2 sm:p-2.5 rounded-full relative transition-all active:scale-90 touch-manipulation ${activeSection === 'skills'
//               ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/40'
//               : 'text-gray-400 hover:text-white'
//               }`}
//             title="Skills"
//             aria-label="Skills"
//           >
//             <Zap className="w-4 h-4" />
//           </button>

//           {/* Contact */}
//           <button
//             onClick={() => scrollToSection('contact')}
//             className={`p-2 sm:p-2.5 rounded-full relative transition-all active:scale-90 touch-manipulation ${activeSection === 'contact'
//               ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40'
//               : 'text-gray-400 hover:text-white'
//               }`}
//             title="Contact"
//             aria-label="Contact"
//           >
//             <MessageSquare className="w-4 h-4" />
//           </button>

//           <div className="w-[1px] h-5 bg-gray-800 mx-0.5" />

//           {/* Cyber Terminal HUD Action */}
//           <button
//             onClick={triggerTerminal}
//             className="p-2 sm:p-2.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-90 border border-cyan-500/30 text-cyan-400 shadow-sm touch-manipulation"
//             title="Launch Terminal HUD"
//             aria-label="Launch Terminal HUD"
//           >
//             <Terminal className="w-4 h-4" />
//           </button>

//           {/* AI ChatBot Action */}
//           <button
//             onClick={triggerChatBot}
//             className="p-2 sm:p-2.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 active:scale-90 relative touch-manipulation"
//             title="Open AI Chat Assistant"
//             aria-label="Open AI Chat Assistant"
//           >
//             <Bot className="w-4 h-4" />
//             <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
//           </button>

//           {/* Sound Toggle */}
//           <button
//             onClick={() => {
//               vibrate(10);
//               playClick();
//               toggleMute();
//             }}
//             className={`p-2 sm:p-2.5 rounded-full active:scale-90 transition-all touch-manipulation ${isMuted
//               ? 'text-gray-500 hover:text-gray-300'
//               : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
//               }`}
//             title={isMuted ? 'Unmute' : 'Mute'}
//             aria-label="Toggle Sound"
//           >
//             {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
//           </button>

//           {/* Scroll To Top */}
//           {showScrollTop && (
//             <motion.button
//               initial={{ scale: 0, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0, opacity: 0 }}
//               onClick={scrollToTop}
//               className="p-2 sm:p-2.5 rounded-full bg-gray-800 text-cyan-300 hover:bg-gray-700 active:scale-90 border border-gray-700 touch-manipulation"
//               title="Scroll to Top"
//               aria-label="Scroll to Top"
//             >
//               <ArrowUp className="w-4 h-4" />
//             </motion.button>
//           )}
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default MobileBottomDock;
