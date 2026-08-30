import api from './client';

// TypeScript Interfaces
export interface Profile {
  id: number;
  name: string;
  titles: string[];
  tagline?: string;
  bio?: string;
  about_story?: string;
  about_philosophy?: string;
  location?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  discord?: string;
  resume_url?: string;
  avatar_url?: string;
  available_for_hire: boolean;
  years_experience?: string;
  happy_clients?: string;
  projects_completed?: string;
  satisfaction_rate?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  short_description: string;
  full_description: string;
  image: string;
  gallery_images: string[];
  technologies: string[];
  challenges: string;
  solutions: string;
  outcomes: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  likes: number;
  views: number;
  order_index: number;
  created_at?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  level: string;
  percentage: number;
  icon?: string;
  color?: string;
  featured: boolean;
  years_experience?: string;
  order_index: number;
}

export interface Experience {
  id: number;
  type: 'work' | 'education';
  title: string;
  company_or_school: string;
  location?: string;
  period: string;
  description: string;
  achievements: string[];
  technologies: string[];
  icon?: string;
  order_index: number;
}

export interface Service {
  id: number;
  title: string;
  icon: string;
  description: string;
  features: string[];
  starting_price?: string;
  timeline_estimate?: string;
  order_index: number;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  year: string;
  description: string;
  credential_url?: string;
  credential_id?: string;
  image?: string;
  color?: string;
  dark_color?: string;
  order_index: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  project_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  created_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  project_type?: string;
  estimated_budget?: string;
  source: string;
  status: 'unread' | 'read' | 'starred' | 'replied' | 'archived';
  created_at?: string;
}

export interface ChatbotKnowledge {
  id: number;
  category: string;
  trigger_keywords: string;
  question: string;
  answer: string;
  order_index: number;
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  services: Service[];
  certificates: Certificate[];
  testimonials: Testimonial[];
}

// ================= API SERVICES ================= //

export const portfolioAPI = {
  getAll: async (): Promise<PortfolioData> => {
    const res = await api.get('/portfolio/all');
    return res.data;
  },
  getProfile: async (): Promise<{ profile: Profile }> => {
    const res = await api.get('/portfolio/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<Profile>) => {
    const res = await api.put('/portfolio/profile', data);
    return res.data;
  },
};

export const projectsAPI = {
  getAll: async (): Promise<{ projects: Project[] }> => {
    const res = await api.get('/projects');
    return res.data;
  },
  getById: async (id: number): Promise<{ project: Project }> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  create: async (data: Partial<Project>) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Project>) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
  like: async (id: number): Promise<{ likes: number }> => {
    const res = await api.post(`/projects/${id}/like`);
    return res.data;
  },
  trackView: async (id: number): Promise<{ views: number }> => {
    const res = await api.post(`/projects/${id}/view`);
    return res.data;
  },
};

export const skillsAPI = {
  getAll: async (): Promise<{ skills: Skill[] }> => {
    const res = await api.get('/skills');
    return res.data;
  },
  create: async (data: Partial<Skill>) => {
    const res = await api.post('/skills', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Skill>) => {
    const res = await api.put(`/skills/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/skills/${id}`);
    return res.data;
  },
};

export const experienceAPI = {
  getAll: async (): Promise<{ experiences: Experience[] }> => {
    const res = await api.get('/experience');
    return res.data;
  },
  create: async (data: Partial<Experience>) => {
    const res = await api.post('/experience', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Experience>) => {
    const res = await api.put(`/experience/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/experience/${id}`);
    return res.data;
  },
};

export const servicesAPI = {
  getAll: async (): Promise<{ services: Service[] }> => {
    const res = await api.get('/services');
    return res.data;
  },
  create: async (data: Partial<Service>) => {
    const res = await api.post('/services', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Service>) => {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/services/${id}`);
    return res.data;
  },
};

export const certificatesAPI = {
  getAll: async (): Promise<{ certificates: Certificate[] }> => {
    const res = await api.get('/certificates');
    return res.data;
  },
  create: async (data: Partial<Certificate>) => {
    const res = await api.post('/certificates', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Certificate>) => {
    const res = await api.put(`/certificates/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/certificates/${id}`);
    return res.data;
  },
};

export const testimonialsAPI = {
  getApproved: async (): Promise<{ testimonials: Testimonial[] }> => {
    const res = await api.get('/testimonials');
    return res.data;
  },
  getAll: async (): Promise<{ testimonials: Testimonial[] }> => {
    const res = await api.get('/testimonials/all');
    return res.data;
  },
  submit: async (data: Partial<Testimonial>) => {
    const res = await api.post('/testimonials', data);
    return res.data;
  },
  updateStatus: async (id: number, status: 'pending' | 'approved' | 'rejected') => {
    const res = await api.patch(`/testimonials/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/testimonials/${id}`);
    return res.data;
  },
};

export const contactAPI = {
  sendMessage: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    project_type?: string;
    estimated_budget?: string;
    source?: string;
  }) => {
    const res = await api.post('/contact', data);
    return res.data;
  },
  getMessages: async (params?: { status?: string; search?: string }): Promise<{
    messages: ContactMessage[];
    unreadCount: number;
    totalCount: number;
  }> => {
    const res = await api.get('/contact/messages', { params });
    return res.data;
  },
  updateStatus: async (id: number, status: ContactMessage['status']) => {
    const res = await api.patch(`/contact/messages/${id}/status`, { status });
    return res.data;
  },
  deleteMessage: async (id: number) => {
    const res = await api.delete(`/contact/messages/${id}`);
    return res.data;
  },
};

export const chatbotAPI = {
  ask: async (message: string, conversationHistory?: any[]): Promise<{
    reply: string;
    category?: string;
    suggestions?: string[];
  }> => {
    const res = await api.post('/chatbot/ask', { message, conversationHistory });
    return res.data;
  },
  submitLead: async (leadData: {
    name: string;
    email?: string;
    phone?: string;
    projectType?: string;
    budget?: string;
    timeline?: string;
    requirements?: string;
  }) => {
    const res = await api.post('/chatbot/lead', leadData);
    return res.data;
  },
  getKnowledge: async (): Promise<{ knowledge: ChatbotKnowledge[] }> => {
    const res = await api.get('/chatbot/knowledge');
    return res.data;
  },
  createKnowledge: async (data: Partial<ChatbotKnowledge>) => {
    const res = await api.post('/chatbot/knowledge', data);
    return res.data;
  },
  updateKnowledge: async (id: number, data: Partial<ChatbotKnowledge>) => {
    const res = await api.put(`/chatbot/knowledge/${id}`, data);
    return res.data;
  },
  deleteKnowledge: async (id: number) => {
    const res = await api.delete(`/chatbot/knowledge/${id}`);
    return res.data;
  },
};

export const analyticsAPI = {
  track: async (event_type: string, metadata?: any) => {
    try {
      await api.post('/analytics/track', {
        event_type,
        path: window.location.pathname,
        referrer: document.referrer,
        device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
        metadata,
      });
    } catch {
      // Non-blocking
    }
  },
  getSummary: async () => {
    const res = await api.get('/analytics/summary');
    return res.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
  updateProfile: async (name: string, email: string) => {
    const res = await api.put('/auth/profile', { name, email });
    return res.data;
  },
};

export const uploadAPI = {
  uploadFile: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
