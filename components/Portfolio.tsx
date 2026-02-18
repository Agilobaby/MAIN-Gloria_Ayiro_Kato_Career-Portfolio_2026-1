
import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { getProjects } from '../services/api';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PortfolioProps {
  isEditable?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ isEditable }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchLatestData = () => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLatestData();

    // Listen for storage changes from the CMS tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolio_projects') {
        fetchLatestData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleProjectClick = (project: Project) => {
    if (isEditable) return; 
    // Navigate to the dedicated project folder page
    navigate(`/project/${project._id}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop"; 
    e.currentTarget.onerror = null;
  };

  if (loading) return (
    <div className="py-20 text-center animate-pulse">
      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[5px] text-gray-400">Loading Portfolio...</p>
    </div>
  );

  return (
    <section className="my-20" id="portfolio">
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="w-20 h-1.5 bg-primary mb-6"></div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4 uppercase">Portfolio</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-2xl">
          A visual archive of my professional projects and educational workshops. Click any project to open the document vault.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => {
          const isImage = project.image && (project.image.startsWith('data:image') || project.image.includes('http'));
          const docCount = project.documents?.length || 0;
          
          return (
            <div 
              key={project._id} 
              onClick={() => handleProjectClick(project)}
              className={`group relative bg-black aspect-video overflow-hidden rounded-sm shadow-xl border border-transparent dark:border-gray-800 transition-all duration-500 hover:shadow-primary/20 ${!isEditable ? 'cursor-pointer' : ''}`}
            >
              <div className="w-full h-full flex items-center justify-center bg-black">
                {isImage ? (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    onError={handleImageError} 
                    className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:scale-110 group-hover:opacity-60"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-600">
                    <FolderOpen size={48} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Document Folder</span>
                  </div>
                )}
              </div>
              
              {/* Folder Content Indicator */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 {docCount > 0 ? (
                   <><FolderOpen size={10} className="text-primary" /> {docCount} Item{docCount !== 1 ? 's' : ''}</>
                 ) : (
                   <span className="text-gray-400">Empty Vault</span>
                 )}
              </div>
              
              {/* Hovering Text Box */}
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                 <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm p-4 md:p-6 rounded-sm shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-center min-w-[200px] border border-transparent group-hover:border-primary/50">
                    <p className="text-primary text-[9px] font-black uppercase tracking-[3px] mb-2">{project.category}</p>
                    <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                      {project.title}
                    </h3>
                    <div className="h-0.5 w-0 bg-primary mx-auto mt-3 group-hover:w-10 transition-all duration-500 delay-100"></div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-sm">
           <p className="text-gray-400 font-bold uppercase tracking-[3px] text-xs">No projects found.</p>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
