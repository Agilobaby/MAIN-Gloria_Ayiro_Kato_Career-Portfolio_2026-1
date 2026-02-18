
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getHireMeLink } from '../constants';
import { 
  ArrowLeft, CheckCircle, Smartphone, Layout, Code, Cloud, Bot, 
  PenTool, Monitor, X, BookOpen, ArrowRight, GraduationCap, 
  Plus, Trash2, Edit3, Save, Globe, RefreshCw, ShieldCheck,
  Image as ImageIcon, Upload
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RightNavbar from '../components/RightNavbar';
import { getServices, getIdentity, savePortfolioDraft, getProjects, getExperience, getRecommendations } from '../services/api';
import { ServiceDetailData, CaseStudy, IdentityData } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  'code': <Code size={64} className="text-primary" />,
  'layout': <Layout size={64} className="text-primary" />,
  'smartphone': <Smartphone size={64} className="text-primary" />,
  'cloud': <Cloud size={64} className="text-primary" />,
  'bot': <Bot size={64} className="text-primary" />,
  'pen-tool': <PenTool size={64} className="text-primary" />,
  'monitor': <Monitor size={64} className="text-primary" />,
};

const ServiceDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditable = location.search.includes('edit=true');
  
  const [activeCaseStudyIndex, setActiveCaseStudyIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | 'NEW' | null>(null);
  
  const [service, setService] = useState<ServiceDetailData | null>(null);
  const [allServices, setAllServices] = useState<ServiceDetailData[]>([]);
  const [identity, setIdentity] = useState<IdentityData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [servicesData, identityData] = await Promise.all([
        getServices(),
        getIdentity()
      ]);
      setAllServices(servicesData);
      setIdentity(identityData);
      const current = servicesData.find(s => s.id === id);
      setService(current || null);
    };
    fetchData();
  }, [id]);

  const handleUpdate = (newData: Partial<ServiceDetailData>) => {
    if (!service) return;
    const updated = { ...service, ...newData };
    setService(updated);
    setAllServices(prev => prev.map(s => s.id === id ? updated : s));
    setHasChanges(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !service || activeCaseStudyIndex === null) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newCS = [...service.caseStudies];
      
      if (activeImageIndex === 'NEW') {
        newCS[activeCaseStudyIndex].images.push(base64String);
      } else if (typeof activeImageIndex === 'number') {
        newCS[activeCaseStudyIndex].images[activeImageIndex] = base64String;
      }
      
      handleUpdate({ caseStudies: newCS });
      setActiveCaseStudyIndex(null);
      setActiveImageIndex(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (csIdx: number, imgIdx: number | 'NEW') => {
    setActiveCaseStudyIndex(csIdx);
    setActiveImageIndex(imgIdx);
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!identity || !service) return;
    setIsSaving(true);
    try {
      // Ensure we get latest projects/experiences/recommendations to not overwrite them with stale state
      const [projs, exps, recs] = await Promise.all([
        getProjects(), 
        getExperience(),
        getRecommendations()
      ]);
      await savePortfolioDraft({
        identity,
        services: allServices,
        projects: projs,
        experience: exps,
        recommendations: recs
      });
      setHasChanges(false);
      
      // FORCE SYSTEM SYNC
      window.dispatchEvent(new Event('storage'));
      
      alert("Changes published to live site.");
    } catch (err) {
      alert("Failed to sync changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7ff] dark:bg-black text-gray-800 dark:text-white">
        <div className="text-center">
          <RefreshCw className="text-primary animate-spin mx-auto mb-4" size={48} />
          <p className="text-xs font-black uppercase tracking-[5px]">Locating Service Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f7ff] dark:bg-black transition-colors duration-300">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <Sidebar isEditable={isEditable} data={identity} onUpdate={(d) => setIdentity(prev => prev ? {...prev, ...d} : null)} />
      
      {isEditable && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/admin/cms')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[3px]">
              <ArrowLeft size={16} /> Exit Editor
            </button>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-primary rounded-sm flex items-center justify-center">
                 <ShieldCheck size={20} className="text-black" />
               </div>
               <div>
                 <p className="text-white text-[11px] font-black uppercase tracking-widest leading-none">Deep Service Editor</p>
                 <p className="text-primary text-[8px] uppercase tracking-[4px] mt-1.5 font-bold">Node: {service.id}</p>
               </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={!hasChanges || isSaving} className={`flex items-center gap-3 px-10 py-3 bg-primary text-black rounded-sm text-[10px] font-black uppercase tracking-[3px] transition-all shadow-[0_15px_30px_rgba(255,180,0,0.3)] disabled:opacity-30 disabled:shadow-none hover:bg-white`}>
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
            {isSaving ? 'Syncing...' : 'Publish Service Changes'}
          </button>
        </div>
      )}

      <main className={`flex-1 overflow-x-hidden lg:mr-[80px] p-4 md:p-8 lg:p-12 transition-all ${isEditable ? 'pt-[100px]' : ''}`}>
        <div className="bg-white dark:bg-dark-card text-gray-800 dark:text-white p-8 md:p-12 rounded-sm relative shadow-sm mb-12 border border-transparent dark:border-gray-800 transition-colors duration-300">
          <Link to={isEditable ? "/admin/cms" : "/"} className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors bg-gray-100 dark:bg-gray-800/50 p-2 rounded-full">
            <X size={24} />
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-100 dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-dark-bg shadow-inner relative group">
               {iconMap[service.icon]}
               {isEditable && (
                 <button onClick={() => {
                    const newIcon = prompt('Icon Key (code, layout, smartphone, cloud, bot, pen-tool, monitor):', service.icon);
                    if (newIcon && iconMap[newIcon]) handleUpdate({ icon: newIcon });
                  }} className="absolute -bottom-2 -right-2 bg-primary text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                   <Edit3 size={14} />
                 </button>
               )}
            </div>
            <div className="flex-1 text-center md:text-left w-full">
              {isEditable ? (
                <div className="space-y-4 w-full">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Headline</label>
                    <input value={service.title} onChange={e => handleUpdate({ title: e.target.value })} className="cms-input text-2xl md:text-4xl font-extrabold tracking-tight" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea value={service.desc} onChange={e => handleUpdate({ desc: e.target.value })} rows={3} className="cms-input text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed resize-none" />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">{service.title}</h1>
                  <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">{service.desc}</p>
                </>
              )}
              <div className="mt-8 flex justify-center md:justify-start">
                <a href={getHireMeLink(service.title)} target="_blank" rel="noopener noreferrer" className="bg-primary hover:opacity-80 text-black font-bold py-4 px-10 rounded-sm flex items-center gap-3 uppercase text-xs tracking-widest no-underline transition-all shadow-lg">
                  Hire Me For This Service <ArrowRight size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 px-4">
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-primary" size={28} />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight uppercase italic">Key Features</h2>
              </div>
              {isEditable && (
                <button onClick={() => handleUpdate({ features: [...service.features, 'New Feature'] })} className="bg-primary text-black p-2 rounded-sm hover:scale-110 transition-transform">
                  <Plus size={16} />
                </button>
              )}
            </div>
            <div className="space-y-4">
              {service.features.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-card p-5 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 group hover:border-primary transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {isEditable ? (
                      <input value={feature} onChange={e => {
                        const newF = [...service.features];
                        newF[idx] = e.target.value;
                        handleUpdate({ features: newF });
                      }} className="cms-input" />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    )}
                  </div>
                  {isEditable && (
                    <button onClick={() => handleUpdate({ features: service.features.filter((_, i) => i !== idx) })} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <PenTool className="text-primary" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight uppercase italic">Tools & Stack</h2>
                </div>
                {isEditable && (
                  <button onClick={() => handleUpdate({ tools: [...service.tools, 'New Tool'] })} className="bg-primary text-black p-2 rounded-sm hover:scale-110 transition-transform">
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {service.tools.map((tool, idx) => (
                  <div key={idx} className="relative group">
                    {isEditable ? (
                      <div className="flex items-center gap-2">
                        <input value={tool} onChange={e => {
                          const newT = [...service.tools];
                          newT[idx] = e.target.value;
                          handleUpdate({ tools: newT });
                        }} className="cms-input w-24 text-[10px] uppercase font-bold" />
                        <button onClick={() => handleUpdate({ tools: service.tools.filter((_, i) => i !== idx) })} className="bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="px-5 py-2 rounded-sm bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-800 hover:border-primary transition-all uppercase tracking-widest shadow-sm">
                        {tool}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <BookOpen className="text-primary" size={28} />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight uppercase italic">Live Case Studies</h2>
            </div>
            {isEditable && (
              <button onClick={() => {
                  const newCS: CaseStudy = {
                    id: `cs-${Date.now()}`,
                    title: 'New Project',
                    desc: 'Narrative description of implementation.',
                    images: Array(1).fill('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600')
                  };
                  handleUpdate({ caseStudies: [...(service.caseStudies || []), newCS] });
                }} className="bg-primary text-black px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                <Plus size={16} /> Add Case Study
              </button>
            )}
          </div>

          {(service.caseStudies || []).map((study, csIdx) => (
            <div key={study.id} className="bg-white dark:bg-dark-card rounded-sm overflow-hidden shadow-sm mb-12 border border-transparent dark:border-gray-800 transition-colors duration-300 relative group">
              {isEditable && (
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                   <button onClick={() => handleUpdate({ caseStudies: service.caseStudies.filter(s => s.id !== study.id) })} className="bg-red-500 text-white p-2 rounded-sm hover:scale-110 transition-transform shadow-lg">
                     <Trash2 size={16} />
                   </button>
                </div>
              )}

              <div className="p-8 md:p-12 text-center">
                {isEditable ? (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <input value={study.title} onChange={e => {
                        const newCS = [...service.caseStudies];
                        newCS[csIdx].title = e.target.value;
                        handleUpdate({ caseStudies: newCS });
                      }} className="cms-input text-2xl font-bold text-center" />
                    <textarea value={study.desc} onChange={e => {
                        const newCS = [...service.caseStudies];
                        newCS[csIdx].desc = e.target.value;
                        handleUpdate({ caseStudies: newCS });
                      }} className="cms-input text-sm text-center resize-none" rows={3} />
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-tight">{study.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed text-sm font-medium">{study.desc}</p>
                  </>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {study.images.map((img, imgIdx) => (
                    <div key={imgIdx} className="aspect-square rounded-sm overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 relative group/img bg-black">
                      <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                      {isEditable && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity gap-2">
                          <button onClick={() => triggerUpload(csIdx, imgIdx)} className="bg-primary text-black p-2 rounded-sm flex items-center gap-2 text-[8px] font-black uppercase tracking-widest shadow-xl">
                            <Upload size={14} /> Replace
                          </button>
                          <button onClick={() => {
                              const newCS = [...service.caseStudies];
                              newCS[csIdx].images = newCS[csIdx].images.filter((_, idx) => idx !== imgIdx);
                              handleUpdate({ caseStudies: newCS });
                            }} className="bg-red-500 text-white p-2 rounded-sm flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isEditable && study.images.length < 8 && (
                    <button onClick={() => triggerUpload(csIdx, 'NEW')} className="aspect-square rounded-sm border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all gap-2">
                      <Plus size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-center">
                  <a href={getHireMeLink(service.title, study.title)} target="_blank" rel="noopener noreferrer" className="bg-primary hover:opacity-80 text-black font-black py-4 px-10 rounded-sm flex items-center gap-3 uppercase text-xs tracking-widest no-underline shadow-lg">
                    Discuss This Case Study <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="flex justify-center mt-20 pb-10">
          <Link to={isEditable ? "/admin/cms" : "/"} className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-all font-black uppercase tracking-[3px] text-[10px] no-underline">
            <ArrowLeft size={16} /> Exit Editor
          </Link>
        </div>
      </main>
      <div className="hidden lg:block">
        <RightNavbar />
      </div>
    </div>
  );
};

export default ServiceDetail;
