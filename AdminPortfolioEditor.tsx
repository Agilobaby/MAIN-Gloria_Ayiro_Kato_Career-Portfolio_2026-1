
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getIdentity, 
  getProjects, 
  getExperience, 
  getServices,
  getRecommendations,
  savePortfolioDraft
} from './services/api';
import { IdentityData, Project, Experience, PortfolioDraft, ServiceDetailData } from './types';
import Sidebar from './components/Sidebar';
import RightNavbar from './components/RightNavbar';
import Hero from './components/Hero';
import Services from './components/Services';
import ExperienceSection from './components/ExperienceSection';
import { 
  Save, Globe, Eye, Layout, ShieldCheck, ArrowLeft, 
  RefreshCw, Plus, Trash2, Check, Edit3, FileText
} from 'lucide-react';

const AdminPortfolioEditor = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // CMS Application State
  const [isEditMode, setIsEditMode] = useState(true);
  const [identity, setIdentity] = useState<IdentityData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [services, setServices] = useState<ServiceDetailData[]>([]);
  
  // UI Flow State
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [activeUploadId, setActiveUploadId] = useState<string | 'NEW' | null>(null);

  // Load state on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [idRes, projRes, expRes, servRes] = await Promise.all([
          getIdentity(),
          getProjects(),
          getExperience(),
          getServices()
        ]);
        setIdentity(idRes);
        setProjects(projRes);
        setExperience(expRes);
        setServices(servRes);
      } catch (err) {
        console.error("CMS Load Error:", err);
      }
    };
    fetchData();
  }, []);

  const handleIdentityUpdate = (newData: Partial<IdentityData>) => {
    if (identity) setIdentity({ ...identity, ...newData });
  };

  /**
   * GLOBAL PERSISTENCE: This method ensures that every change made in the CMS 
   * is pushed to the 'portfolio_projects' and other storage keys that the live site reads.
   */
  const handleSaveAndPublish = async () => {
    if (!identity) return;
    setIsSaving(true);
    
    try {
      // 1. Pull latest versions of child-managed data (Experience/Services) to prevent stale overwrites
      const [currentExp, currentServ, currentRecs] = await Promise.all([
        getExperience(),
        getServices(),
        getRecommendations()
      ]);

      const draft: PortfolioDraft = {
        identity,
        projects, // The current editor's project state (Source of Truth)
        experience: currentExp,
        services: currentServ,
        recommendations: currentRecs
      };
      
      // 2. Commit to Storage
      await savePortfolioDraft(draft);
      
      // 3. UI Confirmation
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
      
      // 4. Force a storage event locally to update any open tabs
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      console.error("Publication error:", err);
      alert("System Sync Error: Changes were not published to the live site.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * FILE UPLOAD SYSTEM: Connects UI buttons to local computer folder
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadId) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const isDoc = file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('ms-excel');
      
      if (activeUploadId === 'NEW') {
        const newProj: Project = { 
          _id: Date.now().toString(), 
          title: file.name.split('.')[0].toUpperCase(), 
          category: isDoc ? 'DOCUMENT' : 'UI DESIGN', 
          image: base64String 
        };
        setProjects([newProj, ...projects]);
      } else {
        setProjects(prev => prev.map(p => 
          p._id === activeUploadId ? { ...p, image: base64String, category: isDoc ? 'DOCUMENT' : p.category } : p
        ));
      }
      setActiveUploadId(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (id: string | 'NEW') => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };

  const deleteProject = (id: string) => {
    if (confirm("Permanently delete this item from your showcase? This change is final once you click Save & Publish.")) {
      setProjects(projects.filter(p => p._id !== id));
    }
  };

  const updateMetadata = (id: string, field: keyof Project, value: string) => {
    setProjects(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  if (!identity) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <RefreshCw className="text-primary animate-spin" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-black transition-colors duration-300">
      {/* Hidden Global File Picker */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx" 
        onChange={handleFileChange} 
      />

      {/* Sync Success Notification */}
      {showSaveToast && (
        <div className="fixed bottom-10 right-10 bg-[#7EB942] text-white px-8 py-4 rounded-sm shadow-2xl z-[200] flex items-center gap-4 animate-in slide-in-from-right-10 duration-500">
          <Check size={20} />
          <p className="text-xs font-black uppercase tracking-widest leading-none">Live Sync: Changes Published Successfully</p>
        </div>
      )}

      {/* Master Toolbar */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[3px]">
            <ArrowLeft size={16} /> Admin Hub
          </button>
          <div className="h-6 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-primary rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(255,180,0,0.4)]">
               <ShieldCheck size={20} className="text-black" />
             </div>
             <div>
               <p className="text-white text-[11px] font-black uppercase tracking-widest leading-none">Visual CMS Center</p>
               <p className="text-primary text-[8px] uppercase tracking-[4px] mt-1.5 font-bold">
                 {isEditMode ? 'Management Mode' : 'Draft View'}
               </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white/5 p-1 rounded-sm flex gap-1 border border-white/5">
            <button onClick={() => setIsEditMode(false)} className={`flex items-center gap-2 px-6 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${!isEditMode ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>
              <Eye size={14} /> Preview
            </button>
            <button onClick={() => setIsEditMode(true)} className={`flex items-center gap-2 px-6 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${isEditMode ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'}`}>
              <Layout size={14} /> Design
            </button>
          </div>

          <button 
            onClick={handleSaveAndPublish} 
            disabled={isSaving} 
            className="flex items-center gap-3 px-10 py-3 bg-primary text-black rounded-sm text-[10px] font-black uppercase tracking-[3px] transition-all shadow-[0_15px_30px_rgba(255,180,0,0.3)] hover:bg-white active:scale-95 disabled:opacity-30"
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Globe size={16} />} 
            {isSaving ? 'Synchronizing...' : 'Save & Publish Live'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row pt-[80px]">
        <Sidebar isEditable={isEditMode} data={identity} onUpdate={handleIdentityUpdate} />
        
        <main className="flex-1 overflow-x-hidden lg:mr-[80px] transition-all pb-32">
          <Hero isEditable={isEditMode} data={identity} onUpdate={handleIdentityUpdate} />
          
          <div className="px-4 md:px-8 lg:px-12 max-w-6xl mx-auto py-20">
            <Services isEditable={isEditMode} />
            
            <div className="mt-20">
               <ExperienceSection isEditable={isEditMode} />
            </div>

            {/* WORK SHOWCASE - EXACT MATCH TO SCREENSHOT DESIGN */}
            <div className="relative group scroll-mt-24 mt-32" id="portfolio">
              <div className="relative flex flex-col items-center mb-16">
                 <div className="w-20 h-1.5 bg-primary mb-6"></div>
                 <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">
                   Work Showcase
                 </h2>
                 
                 {isEditMode && (
                    <button 
                      onClick={() => triggerUpload('NEW')} 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-primary text-black rounded-sm shadow-[0_10px_20px_rgba(255,180,0,0.4)] hover:scale-110 transition-all flex items-center justify-center border-none"
                      title="Upload New Work From Computer"
                    >
                      <Plus size={32} strokeWidth={3} />
                    </button>
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map(p => {
                  const isImage = p.image.startsWith('data:image') || p.image.includes('unsplash') || p.image.includes('picsum') || p.image.startsWith('http');
                  return (
                    <div key={p._id} className="relative group/item bg-black aspect-video overflow-hidden rounded-sm shadow-xl flex flex-col border border-transparent dark:border-gray-800">
                      <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                        {isImage ? (
                          <img src={p.image} className="w-full h-full object-cover opacity-90 group-hover/item:opacity-30 transition-all duration-700" alt={p.title} />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <FileText size={48} className="text-primary opacity-50" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Local Document Attached</span>
                          </div>
                        )}
                        
                        {isEditMode && (
                          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover/item:opacity-100 transition-all duration-300 bg-black/40">
                            <button 
                              onClick={() => deleteProject(p._id!)} 
                              className="w-14 h-14 bg-[#ff4d4d] text-white rounded-sm hover:scale-110 transition-transform shadow-2xl flex items-center justify-center border-none"
                              title="Delete Item"
                            >
                              <Trash2 size={24} />
                            </button>
                            
                            <button 
                               onClick={() => triggerUpload(p._id!)}
                               className="w-14 h-14 bg-primary text-black rounded-sm hover:scale-110 transition-transform shadow-2xl flex items-center justify-center border-none"
                               title="Replace with File from Computer"
                            >
                              <Edit3 size={24} />
                            </button>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none">
                          <p className="text-primary text-[11px] font-black uppercase tracking-[4px] mb-2">{p.category}</p>
                          <h4 className="font-extrabold text-white text-xl tracking-tight uppercase leading-tight truncate">{p.title}</h4>
                        </div>
                      </div>

                      {isEditMode && (
                        <div className="p-6 bg-white dark:bg-[#0a0a0a] border-t dark:border-gray-800 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Headline</label>
                            <input 
                              value={p.title} 
                              onChange={e => updateMetadata(p._id!, 'title', e.target.value)}
                              className="cms-input font-bold text-sm"
                              placeholder="PROJECT NAME"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Display Category</label>
                            <input 
                              value={p.category} 
                              onChange={e => updateMetadata(p._id!, 'category', e.target.value)}
                              className="cms-input text-[10px] font-black uppercase tracking-[3px]"
                              placeholder="UI DESIGN"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isEditMode && (
                  <button 
                    onClick={() => triggerUpload('NEW')}
                    className="aspect-video bg-white dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-primary hover:text-primary transition-all group/add shadow-inner"
                  >
                    <div className="w-14 h-14 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center group-hover/add:bg-primary group-hover/add:text-black transition-colors shadow-sm">
                      <Plus size={32} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-400 group-hover/add:text-primary">Add From Folder</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        <RightNavbar />
      </div>
    </div>
  );
};

export default AdminPortfolioEditor;
