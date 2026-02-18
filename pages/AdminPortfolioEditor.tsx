
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getIdentity, 
  getProjects, 
  getExperience, 
  getServices,
  getRecommendations,
  savePortfolioDraft
} from '../services/api';
import { IdentityData, Project, Experience, PortfolioDraft, ServiceDetailData, ProjectDocument } from '../types';
import Sidebar from '../components/Sidebar';
import RightNavbar from '../components/RightNavbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Recommendations from '../components/Recommendations';
import ExperienceSection from '../components/ExperienceSection';
import { 
  Save, Globe, Eye, Layout, ShieldCheck, ArrowLeft, 
  RefreshCw, Plus, Trash2, Check, Edit3, FileText, 
  FolderOpen, Upload, Link as LinkIcon, Image, Video
} from 'lucide-react';

const AdminPortfolioEditor = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null); // Global file input
  
  // CMS Application State
  const [isEditMode, setIsEditMode] = useState(true);
  const [identity, setIdentity] = useState<IdentityData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  
  // Note: Services and Recommendations are self-managed by their components, 
  // but we fetch them during save to ensure consistency.
  
  // UI Flow State
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // --- PROJECT EDITOR STATE ---
  const [activeUploadId, setActiveUploadId] = useState<string | 'NEW' | 'COVER' | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  const editingProject = projects.find(p => p._id === editingProjectId) || null;

  // Document Adder State
  const [docTab, setDocTab] = useState<'upload' | 'link'>('upload');
  const [newDocName, setNewDocName] = useState('');
  const [newDocLink, setNewDocLink] = useState('');
  const docInputRef = useRef<HTMLInputElement>(null);

  // Load state on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [idRes, projRes, expRes] = await Promise.all([
          getIdentity(),
          getProjects(),
          getExperience()
        ]);
        setIdentity(idRes);
        setProjects(projRes);
        setExperience(expRes);
      } catch (err) {
        console.error("CMS Load Error:", err);
      }
    };
    fetchData();
  }, []);

  const handleIdentityUpdate = (newData: Partial<IdentityData>) => {
    if (identity) setIdentity({ ...identity, ...newData });
  };

  const handleSaveAndPublish = async () => {
    if (!identity) return;
    setIsSaving(true);
    try {
      // Pull latest versions of child-managed data (Services, Recommendations)
      const [currentServices, currentRecommendations] = await Promise.all([
        getServices(),
        getRecommendations()
      ]);

      const draft: PortfolioDraft = {
        identity,
        projects,
        experience,
        services: currentServices,
        recommendations: currentRecommendations
      };
      
      await savePortfolioDraft(draft);
      
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
      
      // Dispatch event to update other tabs/components listening for changes
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      console.error("Publication error:", err);
      alert("System Sync Error: Changes were not published to the live site.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    await handleSaveAndPublish();
    setEditingProjectId(null);
  };

  /**
   * GLOBAL FILE HANDLER (Projects Grid & Cover Images)
   */
  const handleGlobalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const isDoc = file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('ms-excel');

      if (activeUploadId === 'NEW') {
        // Creating a new project from the grid
        const newProj: Project = { 
          _id: Date.now().toString(), 
          title: file.name.split('.')[0].toUpperCase(), 
          category: isDoc ? 'DOCUMENT' : 'UI DESIGN', 
          image: base64String,
          documents: []
        };
        const updatedProjects = [newProj, ...projects];
        setProjects(updatedProjects);
        setEditingProjectId(newProj._id!); // Immediately open editor
      } else if (activeUploadId === 'COVER' && editingProjectId) {
        // Updating cover image inside the editor
        setProjects(prev => prev.map(p => 
          p._id === editingProjectId ? { ...p, image: base64String } : p
        ));
      }
      
      setActiveUploadId(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const triggerGlobalUpload = (id: string | 'NEW' | 'COVER') => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };

  const createNewProject = () => {
     const newProj: Project = { 
        _id: Date.now().toString(), 
        title: 'NEW PROJECT', 
        category: 'UNCATEGORIZED', 
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
        documents: []
      };
      setProjects([newProj, ...projects]);
      setEditingProjectId(newProj._id!);
  };

  // ... (Project Editor handlers remain largely the same, handled by render logic below) ...
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProjectId) return;

    const currentDocs = projects.find(p => p._id === editingProjectId)?.documents || [];
    if (currentDocs.length >= 10) {
      alert("Maximum 10 documents allowed per project.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      let type: ProjectDocument['type'] = 'doc';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type === 'application/pdf') type = 'pdf';
      else if (file.type.includes('video')) type = 'video';

      const newDoc: ProjectDocument = {
        id: Date.now().toString(),
        name: newDocName || file.name,
        type,
        content: reader.result as string
      };

      setProjects(prev => prev.map(p => 
        p._id === editingProjectId 
          ? { ...p, documents: [...(p.documents || []), newDoc] } 
          : p
      ));
      
      setNewDocName('');
      if(docInputRef.current) docInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleLinkAdd = () => {
    if (!editingProjectId || !newDocLink) return;
    const currentDocs = projects.find(p => p._id === editingProjectId)?.documents || [];
    if (currentDocs.length >= 10) {
      alert("Maximum 10 documents allowed per project.");
      return;
    }
    const isVideo = newDocLink.includes('youtube') || newDocLink.includes('vimeo') || newDocLink.includes('mp4');
    const newDoc: ProjectDocument = {
      id: Date.now().toString(),
      name: newDocName || 'External Resource',
      type: isVideo ? 'video' : 'link',
      content: newDocLink
    };
    setProjects(prev => prev.map(p => 
      p._id === editingProjectId 
        ? { ...p, documents: [...(p.documents || []), newDoc] } 
        : p
    ));
    setNewDocName('');
    setNewDocLink('');
  };

  const removeDocument = (docId: string) => {
    if (!editingProjectId) return;
    setProjects(prev => prev.map(p => 
      p._id === editingProjectId 
        ? { ...p, documents: p.documents?.filter(d => d.id !== docId) } 
        : p
    ));
  };

  const updateProjectMetadata = (field: keyof Project, value: string) => {
    if (!editingProjectId) return;
    setProjects(prev => prev.map(p => 
      p._id === editingProjectId ? { ...p, [field]: value } : p
    ));
  };

  if (!identity) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <RefreshCw className="text-primary animate-spin" size={48} />
    </div>
  );

  // --- FULL SCREEN PROJECT EDITOR VIEW ---
  if (editingProject) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        {/* Hidden Input for Cover Image */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleGlobalFileChange} />
        
        {/* Editor Top Bar */}
        <div className="h-16 border-b border-gray-800 bg-[#050505] flex items-center justify-between px-6 sticky top-0 z-50">
           <div className="flex items-center gap-4">
             <button 
               onClick={handleSaveAndClose} 
               className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
             >
               <ArrowLeft size={16} /> Save & Return
             </button>
             <div className="h-6 w-[1px] bg-gray-800"></div>
             <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
               <Edit3 size={14} className="text-primary" /> Editing: {editingProject.title}
             </h2>
           </div>
           
           <div className="flex items-center gap-4">
             <button 
               onClick={handleSaveAndPublish} 
               disabled={isSaving}
               className="bg-[#111] border border-gray-700 hover:border-primary text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-[2px] transition-colors flex items-center gap-2"
             >
               {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 
               Save Changes
             </button>

             <button 
               onClick={handleSaveAndClose} 
               className="bg-primary hover:bg-white text-black px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-[2px] transition-colors flex items-center gap-2"
             >
               <Check size={14} /> Save & Exit
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN: Project Details */}
            <div className="lg:col-span-5 space-y-8">
              {/* Cover Image Manager */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Project Cover Image</label>
                <div className="aspect-video rounded-sm overflow-hidden border border-gray-800 relative group bg-black">
                  <img src={editingProject.image} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => triggerGlobalUpload('COVER')}
                      className="bg-primary text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Image size={14} /> Change Cover
                    </button>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Recommended: 16:9 Aspect Ratio</p>
                  </div>
                </div>
              </div>

              {/* Metadata Inputs */}
              <div className="space-y-6 bg-[#111] p-6 rounded-sm border border-gray-800">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Project Title</label>
                   <input 
                     value={editingProject.title}
                     onChange={(e) => updateProjectMetadata('title', e.target.value)}
                     className="w-full bg-black border border-gray-800 p-3 rounded-sm text-sm font-bold text-white focus:border-primary outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Display Category</label>
                   <input 
                     value={editingProject.category}
                     onChange={(e) => updateProjectMetadata('category', e.target.value)}
                     className="w-full bg-black border border-gray-800 p-3 rounded-sm text-xs font-bold text-white focus:border-primary outline-none uppercase tracking-wider"
                     placeholder="e.g. UI DESIGN, CASE STUDY"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Description / Abstract</label>
                   <textarea 
                     value={editingProject.description || ''}
                     onChange={(e) => updateProjectMetadata('description', e.target.value)}
                     rows={6}
                     className="w-full bg-black border border-gray-800 p-3 rounded-sm text-sm text-gray-300 focus:border-primary outline-none resize-none leading-relaxed"
                     placeholder="Describe the project, tools used, and outcome..."
                   />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Document Vault */}
            <div className="lg:col-span-7 space-y-6">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
                     <FolderOpen className="text-primary" /> Document Vault
                   </h3>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide mt-1">
                     Manage up to 10 downloadable files, links, or videos.
                   </p>
                 </div>
                 <span className="bg-[#111] border border-gray-800 px-3 py-1 rounded-sm text-[10px] font-bold text-gray-400">
                   {editingProject.documents?.length || 0} / 10 Items
                 </span>
               </div>

               {/* Add New Item Section */}
               <div className="bg-[#111] border border-gray-800 rounded-sm p-6">
                  <div className="flex gap-4 border-b border-gray-800 mb-6">
                    <button 
                      onClick={() => setDocTab('upload')}
                      className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${docTab === 'upload' ? 'border-primary text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                    >
                      Upload File
                    </button>
                    <button 
                      onClick={() => setDocTab('link')}
                      className={`pb-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${docTab === 'link' ? 'border-primary text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                    >
                      Add Link / Video
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Display Name (Optional)</label>
                      <input 
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder={docTab === 'upload' ? "e.g. Project Proposal PDF" : "e.g. YouTube Walkthrough"}
                        className="w-full bg-black border border-gray-800 p-3 rounded-sm text-xs text-white focus:border-primary outline-none"
                      />
                    </div>

                    {docTab === 'upload' ? (
                       <div className="relative group">
                         <input 
                           type="file" 
                           ref={docInputRef}
                           className="hidden" 
                           onChange={handleDocUpload}
                         />
                         <button 
                           onClick={() => docInputRef.current?.click()}
                           className="w-full border-2 border-dashed border-gray-700 hover:border-primary hover:bg-primary/5 transition-all rounded-sm p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary group-hover:scale-[1.01]"
                         >
                           <Upload size={24} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Select File from Computer</span>
                           <span className="text-[9px] text-gray-600">Supports PDF, DOCX, JPG, PNG</span>
                         </button>
                       </div>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          value={newDocLink}
                          onChange={(e) => setNewDocLink(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 bg-black border border-gray-800 p-3 rounded-sm text-xs text-white focus:border-primary outline-none"
                        />
                        <button 
                          onClick={handleLinkAdd}
                          disabled={!newDocLink}
                          className="bg-white text-black px-6 font-bold uppercase text-[10px] tracking-widest rounded-sm hover:bg-gray-200 disabled:opacity-50"
                        >
                          Add Link
                        </button>
                      </div>
                    )}
                  </div>
               </div>

               {/* Items List */}
               <div className="space-y-2">
                 {(editingProject.documents || []).map((doc) => (
                   <div key={doc.id} className="flex items-center gap-4 bg-[#111] border border-gray-800 p-4 rounded-sm hover:border-primary/50 transition-colors group">
                      <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        doc.type === 'pdf' ? 'bg-red-900/20 text-red-500' :
                        doc.type === 'video' ? 'bg-purple-900/20 text-purple-500' :
                        doc.type === 'image' ? 'bg-blue-900/20 text-blue-500' :
                        doc.type === 'link' ? 'bg-green-900/20 text-green-500' :
                        'bg-yellow-900/20 text-yellow-500'
                      }`}>
                        {doc.type === 'image' && <Image size={20} />}
                        {doc.type === 'pdf' && <FileText size={20} />}
                        {doc.type === 'video' && <Video size={20} />}
                        {doc.type === 'link' && <LinkIcon size={20} />}
                        {doc.type === 'doc' && <FileText size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{doc.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black uppercase text-gray-500 bg-black px-1.5 py-0.5 rounded-sm">{doc.type}</span>
                          {doc.type === 'link' || doc.type === 'video' ? (
                            <span className="text-[10px] text-gray-600 truncate max-w-[200px]">{doc.content}</span>
                          ) : (
                            <span className="text-[10px] text-gray-600">Stored Locally</span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => removeDocument(doc.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-red-500/20 hover:text-red-500 text-gray-600 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}

                 {(!editingProject.documents || editingProject.documents.length === 0) && (
                   <div className="p-8 text-center border-2 border-dashed border-gray-800 rounded-sm">
                     <FolderOpen className="text-gray-700 mx-auto mb-2" size={32} />
                     <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Vault Empty</p>
                   </div>
                 )}
               </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---

  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-black transition-colors duration-300">
      {/* Hidden Global File Picker for Cover Images from Grid */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleGlobalFileChange} 
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
            
            {/* Recommendations Section - ADDED HERE */}
            <Recommendations isEditable={isEditMode} />
            
            <div className="mt-20">
               <ExperienceSection 
                 isEditable={isEditMode} 
                 data={experience} 
                 onUpdate={setExperience} 
               />
            </div>

            {/* WORK SHOWCASE (PORTFOLIO GRID) */}
            <div className="relative group scroll-mt-24 mt-32" id="portfolio">
              <div className="relative flex flex-col items-center mb-16">
                 <div className="w-20 h-1.5 bg-primary mb-6"></div>
                 <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-800 dark:text-white">
                   Work Showcase
                 </h2>
                 
                 {isEditMode && (
                    <button 
                      onClick={createNewProject} 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-primary text-black rounded-sm shadow-[0_10px_20px_rgba(255,180,0,0.4)] hover:scale-110 transition-all flex items-center justify-center border-none"
                      title="Create New Project"
                    >
                      <Plus size={32} strokeWidth={3} />
                    </button>
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map(p => {
                  const isImage = p.image.startsWith('data:image') || p.image.includes('unsplash') || p.image.includes('picsum') || p.image.startsWith('http');
                  const docCount = p.documents?.length || 0;

                  return (
                    <div 
                      key={p._id} 
                      onClick={() => isEditMode && setEditingProjectId(p._id!)} // CLICK TO EDIT
                      className={`relative group/item bg-black aspect-video overflow-hidden rounded-sm shadow-xl flex flex-col border border-transparent dark:border-gray-800 ${isEditMode ? 'cursor-pointer hover:border-primary' : ''}`}
                    >
                      <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                        {isImage ? (
                          <img src={p.image} className="w-full h-full object-cover opacity-90 group-hover/item:opacity-40 transition-all duration-700" alt={p.title} />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <FileText size={48} className="text-primary opacity-50" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Document</span>
                          </div>
                        )}
                        
                        {isEditMode && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all duration-300 bg-black/60 z-10">
                             <Edit3 size={32} className="text-primary mb-2" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">Click to Manage Content</span>
                             <span className="text-[9px] text-gray-400 font-bold">{docCount} Docs in Vault</span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none">
                          <p className="text-primary text-[11px] font-black uppercase tracking-[4px] mb-2">{p.category}</p>
                          <h4 className="font-extrabold text-white text-xl tracking-tight uppercase leading-tight truncate">{p.title}</h4>
                        </div>
                      </div>

                      {isEditMode && (
                        <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t dark:border-gray-800 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                           <span className="text-[10px] font-bold text-gray-500 uppercase">Quick Actions:</span>
                           <button 
                             onClick={(e) => { e.stopPropagation(); if(confirm('Delete Project?')) setProjects(projects.filter(pr => pr._id !== p._id)); }}
                             className="text-red-500 hover:text-white hover:bg-red-500 p-1 rounded-sm transition-colors"
                             title="Delete Project"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isEditMode && (
                  <button 
                    onClick={createNewProject}
                    className="aspect-video bg-white dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-sm flex flex-col items-center justify-center gap-4 hover:border-primary hover:text-primary transition-all group/add shadow-inner"
                  >
                    <div className="w-14 h-14 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center group-hover/add:bg-primary group-hover/add:text-black transition-colors shadow-sm">
                      <Plus size={32} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-400 group-hover/add:text-primary">Create New Project</span>
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
