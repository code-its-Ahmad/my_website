import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Code, Brain, Smartphone, Database, Globe, Zap, X, Check } from 'lucide-react';
import { servicesAPI, Service } from '../../api/services';
import { usePortfolio } from '../../context/PortfolioContext';
import { useSound } from '../../context/SoundContext';
import toast from 'react-hot-toast';

const ServiceManager: React.FC = () => {
  const { services, refetch } = usePortfolio();
  const { playClick, playHover, playSuccess } = useSound();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    icon: 'Code',
    description: '',
    features: [],
    starting_price: '$999',
    timeline_estimate: '2-4 weeks',
    order_index: 0,
  });

  const [featureInput, setFeatureInput] = useState('');

  const iconOptions = ['Code', 'Brain', 'Smartphone', 'Database', 'Globe', 'Zap'];

  const handleOpenCreate = () => {
    playClick();
    setEditingService(null);
    setFormData({
      title: '',
      icon: 'Code',
      description: '',
      features: ['Modern Responsive UI', 'Scalable Architecture', 'Secure API Integration'],
      starting_price: '$999',
      timeline_estimate: '2-4 weeks',
      order_index: services.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (serv: Service) => {
    playClick();
    setEditingService(serv);
    setFormData({ ...serv });
    setIsModalOpen(true);
  };

  const handleAddFeature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && featureInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required.');
      return;
    }

    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, formData);
        toast.success('Service updated successfully!');
      } else {
        await servicesAPI.create(formData);
        toast.success('Service created successfully!');
      }
      playSuccess();
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to save service.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    playClick();
    if (!window.confirm(`Delete service "${title}"?`)) return;

    try {
      await servicesAPI.delete(id);
      toast.success('Service deleted.');
      refetch();
    } catch (err) {
      toast.error('Failed to delete service.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Services & Offerings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage your engineering packages, deliverables, timeline estimates, and starting rates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          onMouseEnter={playHover}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Code className="w-6 h-6" />
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{service.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-3">
                  {service.description}
                </p>
              </div>

              {/* Feature Checklist */}
              {service.features?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {service.features.map((feat, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Timeline */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                Starting at {service.starting_price || '$999'}
              </span>
              <span className="text-gray-400 font-medium">{service.timeline_estimate || '2-4 weeks'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 z-10 space-y-5 max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Full Stack Web Development"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Starting Price
                    </label>
                    <input
                      type="text"
                      value={formData.starting_price}
                      onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                      placeholder="e.g. $999"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Timeline Estimate
                    </label>
                    <input
                      type="text"
                      value={formData.timeline_estimate}
                      onChange={(e) => setFormData({ ...formData, timeline_estimate: e.target.value })}
                      placeholder="e.g. 2-4 weeks"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive description of the service and deliverables..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Included Features / Deliverables (Type and press Enter)
                  </label>
                  <div className="space-y-2">
                    {formData.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs">
                        <span>✓ {feat}</span>
                        <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-red-500 hover:text-red-700">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={handleAddFeature}
                      placeholder="Add a deliverable feature..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
                  >
                    {editingService ? 'Update Service' : 'Save Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManager;
