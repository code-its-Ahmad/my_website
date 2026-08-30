import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Calendar, MapPin, CheckCircle2, Award, Sparkles, Building, GraduationCap } from 'lucide-react';
import Tilt from 'react-parallax-tilt';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';

const Experience = () => {
  const { experiences } = usePortfolio();
  const { playHover, playWhoosh, playClick } = useSound();
  const [filter, setFilter] = useState<'all' | 'work' | 'education'>('all');

  const filteredExperiences = experiences.filter((e) => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

  return (
    <section
      id="experience"
      className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300"
    >
      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 backdrop-blur-md"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Milestones & Engineering Roles</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Experience & Education
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed"
          >
            A chronological timeline of production software engineering roles, client leadership, and academic foundations.
          </motion.p>
        </div>

        {/* Filter Controls */}
        <div className="flex justify-center gap-2">
          {(['all', 'work', 'education'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                playWhoosh();
                setFilter(t);
              }}
              onMouseEnter={playHover}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold capitalize transition-all ${
                filter === t
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {t === 'all' ? 'All Milestones' : t === 'work' ? 'Work & Engineering' : 'Education & Research'}
            </button>
          ))}
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-6 sm:pl-10 space-y-6 sm:space-y-8 border-l-2 border-blue-500/30 dark:border-blue-500/20 ml-2 sm:ml-6">
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.25) }}
                className="relative group"
              >
                {/* Timeline Indicator Dot */}
                <div className="absolute -left-[35px] sm:-left-[51px] top-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500 flex items-center justify-center text-xs sm:text-sm shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {exp.icon || (exp.type === 'education' ? '🎓' : '💻')}
                </div>

                <Tilt
                  tiltMaxAngleX={5}
                  tiltMaxAngleY={5}
                  perspective={1000}
                  scale={1.01}
                  transitionSpeed={500}
                  tiltEnable={typeof window !== 'undefined' ? window.innerWidth > 768 : true}
                >
                  <div className="p-5 sm:p-7 rounded-3xl bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-3 sm:space-y-4 hover:border-blue-500/50 transition-all">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{exp.title}</span>
                          {exp.type === 'work' ? (
                            <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          ) : (
                            <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          )}
                        </h3>
                        <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                          {exp.company_or_school}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 font-semibold text-blue-500">
                          <Calendar className="w-3 h-3" />
                          {exp.period}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Achievements */}
                    {exp.achievements?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Key Impact & Engineering Deliverables
                        </div>
                        <ul className="space-y-1">
                          {exp.achievements.map((ach, i) => (
                            <li key={i} className="flex items-start space-x-2 text-xs text-gray-700 dark:text-gray-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tech stack badges */}
                    {exp.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/60"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Experience;