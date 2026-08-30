import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import {
  Code,
  Brain,
  Smartphone,
  Database,
  Globe,
  Zap,
  Check,
  Calculator,
  ArrowRight,
  Sparkles,
  Send,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useSound } from '../context/SoundContext';
import { contactAPI } from '../api/services';
import toast from 'react-hot-toast';

const Services = () => {
  const { services } = usePortfolio();
  const { playClick, playHover, playSuccess } = useSound();

  // Estimator State
  const [projectType, setProjectType] = useState('fullstack');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'auth',
    'admin_panel',
    'responsive_ui',
  ]);
  const [timelineUrgency, setTimelineUrgency] = useState('standard');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Brain':
        return <Brain className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  const basePrices: Record<string, { price: number; time: number; label: string }> = {
    web: { price: 900, time: 2, label: 'Full Stack Web App' },
    mobile: { price: 1200, time: 3, label: 'Flutter Mobile App' },
    ai: { price: 1500, time: 3, label: 'Custom AI/ML Vision' },
    fullstack: { price: 2200, time: 4, label: 'Web + Mobile + AI' },
  };

  const featureOptions = [
    { id: 'auth', label: 'User Auth & RBAC', cost: 200, days: 3 },
    { id: 'admin_panel', label: 'Admin Control Suite', cost: 400, days: 5 },
    { id: 'payments', label: 'Payment Gateway (Stripe)', cost: 300, days: 4 },
    { id: 'ai_agent', label: 'AI/LLM Agent Assistant', cost: 500, days: 6 },
    { id: 'realtime', label: 'Real-Time WebSockets', cost: 350, days: 4 },
    { id: '3d_canvas', label: 'Three.js 3D WebGL', cost: 300, days: 4 },
    { id: 'seo_analytics', label: 'SEO & Live Analytics', cost: 250, days: 3 },
  ];

  const toggleFeature = (id: string) => {
    playClick();
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const calculateEstimate = () => {
    const base = basePrices[projectType] || basePrices.web;
    let totalCost = base.price;
    let totalDays = base.time * 7;

    selectedFeatures.forEach((fId) => {
      const feat = featureOptions.find((o) => o.id === fId);
      if (feat) {
        totalCost += feat.cost;
        totalDays += feat.days;
      }
    });

    if (timelineUrgency === 'accelerated') {
      totalCost *= 1.25;
      totalDays = Math.round(totalDays * 0.75);
    } else if (timelineUrgency === 'rush') {
      totalCost *= 1.5;
      totalDays = Math.round(totalDays * 0.55);
    }

    const estimatedWeeks = Math.max(1, Math.ceil(totalDays / 7));
    return {
      cost: Math.round(totalCost),
      weeks: estimatedWeeks,
    };
  };

  const estimate = calculateEstimate();

  const handleSubmitEstimatorBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) {
      toast.error('Please provide your name and email.');
      return;
    }

    const featureNames = selectedFeatures
      .map((fId) => featureOptions.find((o) => o.id === fId)?.label)
      .filter(Boolean)
      .join(', ');

    const briefMessage = `[Interactive Scope & Cost Estimator Brief]\nClient: ${clientName}\nEmail: ${clientEmail}\nProject Type: ${basePrices[projectType]?.label}\nSelected Features: ${featureNames}\nTimeline Urgency: ${timelineUrgency.toUpperCase()}\nEstimated Range: ~$${estimate.cost} (~${estimate.weeks} weeks)\nClient Notes: ${clientNotes || 'None'}`;

    try {
      setIsSubmittingBrief(true);
      playClick();
      await contactAPI.sendMessage({
        name: clientName.trim(),
        email: clientEmail.trim(),
        subject: `Project Estimator Brief: ${basePrices[projectType]?.label}`,
        message: briefMessage,
        project_type: basePrices[projectType]?.label,
        estimated_budget: `~$${estimate.cost}`,
        source: 'estimator',
      });
      playSuccess();
      toast.success('Project brief submitted! Muhammad Ahmad will get back to you within 24 hours.', {
        duration: 5000,
      });
      setClientName('');
      setClientEmail('');
      setClientNotes('');
    } catch {
      toast.error('Failed to submit project brief. Please try the direct contact form.');
    } finally {
      setIsSubmittingBrief(false);
    }
  };

  return (
    <section
      id="services"
      className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Value Engineering Solutions</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Services & Scope Estimator
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Explore specialized service offerings or configure custom requirements below using the interactive project calculator.
          </motion.p>
        </div>

        {/* 1. Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
            >
              <Tilt
                tiltMaxAngleX={6}
                tiltMaxAngleY={6}
                perspective={1000}
                scale={1.01}
                transitionSpeed={500}
                tiltEnable={typeof window !== 'undefined' ? window.innerWidth > 768 : true}
                className="h-full"
              >
                <div
                  onMouseEnter={playHover}
                  className="h-full p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 shadow-xl flex flex-col justify-between space-y-5 transition-all group"
                >
                  <div className="space-y-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                      {getIcon(service.icon)}
                    </div>

                    <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Feature Checklist */}
                    {service.features?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {service.features.map((feat, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs text-gray-700 dark:text-gray-300">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Pricing & Timeline */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-gray-400">Starting Rate</div>
                      <div className="font-extrabold text-sm sm:text-base text-blue-600 dark:text-blue-400">
                        {service.starting_price || '$999'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-gray-400">Est. Timeline</div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {service.timeline_estimate || '2-4 weeks'}
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>

        {/* 2. Interactive Project Scope & Cost Estimator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-5 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/95 via-blue-50/30 to-purple-50/20 dark:from-gray-900/95 dark:via-blue-950/20 dark:to-purple-950/20 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Quote Calculator</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                Estimate Your Project Scope & Cost
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Select required modules for instant budget and timeline calculations.
              </p>
            </div>

            {/* Live Pricing Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 shrink-0 text-center md:text-right space-y-0.5">
              <div className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">Estimated Budget</div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ~${estimate.cost.toLocaleString()}
              </div>
              <div className="text-xs text-blue-100 font-semibold">
                Est. Delivery: ~{estimate.weeks} Weeks
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Options Left Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Project Type */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  1. Platform / Project Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(basePrices).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        playClick();
                        setProjectType(key);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        projectType === key
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-sm scale-[1.01]'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{item.label}</div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                        Base: ~${item.price} • {item.time} wks
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  2. Required Architecture & Modules
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {featureOptions.map((feat) => {
                    const isChecked = selectedFeatures.includes(feat.id);
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => toggleFeature(feat.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="truncate">{feat.label}</span>
                        <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-1">
                          +${feat.cost}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Urgency */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  3. Timeline Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'accelerated', label: 'Fast (+25%)' },
                    { id: 'rush', label: 'Sprint (+50%)' },
                  ].map((urg) => (
                    <button
                      key={urg.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        setTimelineUrgency(urg.id);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        timelineUrgency === urg.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/30 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {urg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Brief Right Column */}
            <form onSubmit={handleSubmitEstimatorBrief} className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-blue-500" />
                    <span>Submit Configured Project Brief</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Directly deliver this specification into Muhammad Ahmad's inbox.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. David Harrison"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. david@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Project Notes & Goal (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Share any requirements, features, or deadlines..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingBrief}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95"
              >
                <span>{isSubmittingBrief ? 'Sending Brief...' : 'Send Configured Project Brief'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
