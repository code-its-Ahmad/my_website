import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Plus, X, MessageSquareHeart, CheckCircle, Award, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';
import { testimonialsAPI } from '../api/services';
import toast from 'react-hot-toast';

const Testimonials = () => {
  const { testimonials, refetch } = usePortfolio();
  const { playClick, playHover, playSuccess } = useSound();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    rating: 5,
    text: '',
    project_name: '',
  });

  const nextSlide = () => {
    playClick();
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevSlide = () => {
    playClick();
    if (testimonials.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) {
      toast.error('Please provide your name and feedback.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await testimonialsAPI.submit(formData);
      playSuccess();
      toast.success(res.message || 'Thank you for your review! It will be displayed after quick verification.', {
        duration: 5000,
      });
      setIsModalOpen(false);
      setFormData({ name: '', role: '', company: '', rating: 5, text: '', project_name: '' });
      refetch();
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTestimonial = testimonials[currentIndex] || null;

  return (
    <section
      id="testimonials"
      className="relative min-h-[80vh] flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300"
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
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Client Trust & Feedback</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            What Clients & Leaders Say
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed"
          >
            Endorsements from founders, engineering leads, and clients across high-growth startups and global platforms.
          </motion.p>
        </div>

        {/* Featured Testimonial Carousel Card */}
        {testimonials.length > 0 && currentTestimonial && (
          <div className="relative">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98, x: 15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -15 }}
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -50) {
                  nextSlide();
                } else if (swipe > 100 || offset.x > 50) {
                  prevSlide();
                }
              }}
              className="p-6 sm:p-10 rounded-3xl bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 shadow-2xl relative overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
            >
              <Quote className="w-12 h-12 text-blue-500/15 dark:text-blue-400/15 absolute top-5 right-5 pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* 5-Star Rating */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: currentTestimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] font-bold text-gray-400 ml-1.5">5.0 / 5.0 Rating</span>
                </div>

                {/* Review Quote */}
                <blockquote className="text-sm sm:text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                  "{currentTestimonial.text}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/40 shadow-sm"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop';
                      }}
                    />
                    <div>
                      <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>{currentTestimonial.name}</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" title="Verified Client" />
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {currentTestimonial.role}
                        {currentTestimonial.company ? ` • ${currentTestimonial.company}` : ''}
                      </div>
                    </div>
                  </div>

                  {currentTestimonial.project_name && (
                    <div className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                      Project: {currentTestimonial.project_name}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Navigation Arrows & Leave Review */}
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSlide}
                  onMouseEnter={playHover}
                  className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  onMouseEnter={playHover}
                  className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Indicators */}
                <div className="flex items-center space-x-1.5 ml-2.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        playClick();
                        setCurrentIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Leave Review Button */}
              <button
                onClick={() => {
                  playClick();
                  setIsModalOpen(true);
                }}
                onMouseEnter={playHover}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Leave Review</span>
              </button>
            </div>
          </div>
        )}

        {/* Submit Review Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
              />

              <motion.div
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-7 z-10 space-y-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Submit a Client Review</h3>
                    <p className="text-[11px] text-gray-500">Your feedback is appreciated!</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Lin"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. VP of Product"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Company / Project
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Vanguard Tech"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= formData.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Your Feedback *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      placeholder="Share your experience working with Muhammad Ahmad..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 active:scale-95"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Testimonials;
