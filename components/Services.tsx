
import React, { useState, useEffect } from 'react';
import { INITIAL_SERVICES } from '../constants';
import { Code, Layout, Smartphone, Cloud, Bot, PenTool, Monitor, ArrowRight, Plus, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ServiceDetailData } from '../types';
import { getServices, saveServices } from '../services/api';

const iconMap: Record<string, React.ReactNode> = {
  'code': <Code size={40} className="text-primary" />,
  'layout': <Layout size={40} className="text-primary" />,
  'smartphone': <Smartphone size={40} className="text-primary" />,
  'cloud': <Cloud size={40} className="text-primary" />,
  'bot': <Bot size={40} className="text-primary" />,
  'pen-tool': <PenTool size={40} className="text-primary" />,
  'monitor': <Monitor size={40} className="text-primary" />,
};

interface ServicesProps {
  isEditable?: boolean;
}

const Services: React.FC<ServicesProps> = ({ isEditable }) => {
  const [services, setServices] = useState<ServiceDetailData[]>([]);

  const fetchServices = () => {
    getServices().then(setServices).catch(() => setServices(INITIAL_SERVICES));
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchServices();

    // Re-fetch whenever edit mode toggles to ensure we see latest drafted changes
    fetchServices();

    if (!isEditable) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'portfolio_services') {
          fetchServices();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isEditable]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    if (isEditable) await saveServices(updated);
  };

  const handleAdd = async () => {
    const newService: ServiceDetailData = {
      id: `service-${Date.now()}`,
      icon: 'smartphone',
      title: 'New Professional Service',
      desc: 'High-impact technological solution focused on improving operational efficiency and digital transformation.',
      features: [
        'Strategic System Audit',
        'Custom Workflow Optimization',
        'Staff Onboarding & Training',
        'Continuous Operational Support'
      ],
      tools: ['Enterprise Suite', 'Collaboration Platforms'],
      whyMe: [
        'Pedagogy-First Methodology',
        'Extensive Field Experience',
        'Scalable Infrastructure Focus'
      ],
      caseStudies: [
        {
          id: `cs-new-${Date.now()}`,
          title: 'Transformation Project Alpha',
          desc: 'A flagship implementation demonstrating significant ROI and workflow enhancement.',
          images: Array(4).fill('https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?q=80&w=600')
        }
      ]
    };
    const updated = [newService, ...services];
    setServices(updated);
    if (isEditable) await saveServices(updated);
  };

  return (
    <section className="my-12 text-center" id="services">
      <div className="flex justify-between items-center mb-10 max-w-xl mx-auto">
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 uppercase">My Services</h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed px-4">
            Professional solutions tailored to your digital needs. Explore my core areas of expertise below.
          </p>
        </div>
        {isEditable && (
          <button onClick={handleAdd} className="bg-primary text-black p-3 rounded-sm shadow-xl hover:scale-110 transition-all ml-4">
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="relative group h-full">
            {isEditable && (
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleDelete(e, service.id)} className="bg-red-500 text-white p-2 rounded-sm hover:bg-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <Link 
              to={`/service/${service.id}${isEditable ? '?edit=true' : ''}`}
              className="bg-white dark:bg-dark-card p-8 shadow-sm flex flex-col items-center justify-center gap-4 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 relative overflow-hidden rounded-sm h-full border border-gray-100 dark:border-gray-800 no-underline"
            >
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>

              <div className="mb-2 transition-transform duration-300 group-hover:scale-110">
                  {iconMap[service.icon] || <Monitor size={40} className="text-primary" />}
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors duration-300 uppercase tracking-tight">
                  {service.title}
              </h3>
              
              <p className="text-gray-500 dark:text-gray-400 text-[13px] text-center line-clamp-3 leading-relaxed font-medium">
                {service.desc}
              </p>
              
              <span 
                className="text-primary text-[9px] font-black uppercase flex items-center gap-2 mt-4 tracking-[3px] group-hover:opacity-80 transition-opacity"
              >
                Read More <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
