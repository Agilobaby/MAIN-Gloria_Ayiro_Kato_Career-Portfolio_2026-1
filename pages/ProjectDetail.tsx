
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjects } from '../services/api';
import { Project, ProjectDocument } from '../types';
import { ArrowLeft, FileText, Image, Link as LinkIcon, Download, ExternalLink, Video, FolderOpen, Eye, ShieldCheck } from 'lucide-react';
import RightNavbar from '../components/RightNavbar';
import DocumentViewer from '../components/DocumentViewer';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);

  const fetchProject = async () => {
    try {
      const allProjects = await getProjects();
      const found = allProjects.find(p => p._id === id);
      setProject(found || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolio_projects') {
        fetchProject();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id]);

  const handleOpenDoc = (doc: ProjectDocument) => {
    // DIRECT LINK HANDLING: Open external links immediately in new tab
    if (doc.type === 'link') {
      window.open(doc.content, '_blank');
      return;
    }
    
    // For local files (PDF, Image, Video), open the secure internal viewer
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  const handleCloseDoc = () => {
    setViewerOpen(false);
    setSelectedDoc(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <Link to="/" className="text-primary uppercase tracking-widest text-xs font-bold hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
           <Link to="/#portfolio" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[3px]">
             <ArrowLeft size={16} /> Return to Portfolio
           </Link>
           <div className="h-1 w-20 bg-primary"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Main Project Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-[#0a0a0a] p-8 border border-gray-100 dark:border-gray-800 rounded-sm shadow-xl sticky top-8">
              <span className="bg-primary text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm mb-6 inline-block">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white uppercase italic tracking-tighter leading-none mb-6">
                {project.title}
              </h1>
              <div className="w-full h-[1px] bg-gray-100 dark:bg-gray-800 mb-6"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line mb-8">
                {project.description || "Detailed project documentation is available in the file vault. Please select a file to view."}
              </p>
              
              <div className="aspect-video bg-black rounded-sm overflow-hidden border border-gray-800">
                <img src={project.image} alt="Cover" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
          </div>

          {/* RIGHT: File Vault (Recruiter View) */}
          <div className="lg:col-span-8">
             <div className="bg-white dark:bg-[#111] min-h-[500px] p-8 md:p-12 rounded-sm shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                 <FolderOpen size={300} className="text-primary" />
               </div>

               <div className="relative z-10 mb-10 flex justify-between items-end">
                 <div>
                   <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary/20 text-primary flex items-center justify-center rounded-sm">
                       <FolderOpen size={20} />
                     </div>
                     Project File Vault
                   </h2>
                   <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest ml-14">
                     Click a document to view it securely in the browser.
                   </p>
                 </div>
                 <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-900/10 px-3 py-1 rounded-full border border-green-500/20">
                   <ShieldCheck size={12} /> Secure Viewer Active
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                 {(project.documents || []).map((doc, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => handleOpenDoc(doc)}
                     className="group flex items-start gap-4 p-5 text-left border rounded-sm transition-all duration-300 bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-800 hover:border-primary hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_5px_15px_rgba(255,180,0,0.1)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                   >
                     <div className={`w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors ${
                       doc.type === 'pdf' ? 'bg-red-500/10 text-red-500' :
                       doc.type === 'image' ? 'bg-blue-500/10 text-blue-500' :
                       doc.type === 'video' ? 'bg-purple-500/10 text-purple-500' :
                       doc.type === 'doc' ? 'bg-yellow-500/10 text-yellow-500' :
                       'bg-green-500/10 text-green-500'
                     }`}>
                       {doc.type === 'image' && <Image size={24} />}
                       {doc.type === 'pdf' && <FileText size={24} />}
                       {doc.type === 'doc' && <FileText size={24} />}
                       {doc.type === 'link' && <LinkIcon size={24} />}
                       {doc.type === 'video' && <Video size={24} />}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate mb-1 group-hover:text-primary transition-colors">{doc.name}</h3>
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest bg-gray-200 dark:bg-gray-900 px-2 py-0.5 rounded-sm">
                           {doc.type === 'doc' ? 'DOCUMENT' : doc.type}
                         </span>
                         <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors uppercase tracking-wider">
                           {doc.type === 'link' ? 'Open' : 'View'} <Eye size={10} />
                         </span>
                       </div>
                     </div>
                   </button>
                 ))}
               </div>

               {(!project.documents || project.documents.length === 0) && (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-sm">
                   <FolderOpen size={48} className="mb-4 opacity-20" />
                   <p className="text-xs font-black uppercase tracking-widest">No documents attached to this folder.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
      
      <RightNavbar />

      {/* SECURE DOCUMENT VIEWER MODAL */}
      <DocumentViewer 
        isOpen={viewerOpen}
        onClose={handleCloseDoc}
        document={selectedDoc}
        allDocuments={project.documents || []}
        onSelect={(doc) => setSelectedDoc(doc)}
      />
    </div>
  );
};

export default ProjectDetail;
