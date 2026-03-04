
import React, { useEffect, useState } from 'react';
import { ArrowRight, Edit3 } from 'lucide-react';
import { PROFILE_IMAGE, getHireMeLink } from '../constants';
import { IdentityData } from '../types';
import { getIdentity } from '../services/api';

interface HeroProps {
  isEditable?: boolean;
  data?: IdentityData | null;
  onUpdate?: (newData: Partial<IdentityData>) => void;
}

const Hero: React.FC<HeroProps> = ({ isEditable, data: propData, onUpdate }) => {
  const [localData, setLocalData] = useState<IdentityData | null>(null);
  
  // Use passed data (CMS mode) or fetched data (Live mode)
  const displayData = isEditable ? propData : (localData || propData);

  useEffect(() => {
    // If we are not in edit mode, we need to fetch the data ourselves
    if (!isEditable) {
      const fetchData = async () => {
        try {
          const id = await getIdentity();
          setLocalData(id);
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();

      // Listen for updates from the CMS
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'portfolio_identity') {
          fetchData();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isEditable]);

  const name = displayData?.fullName || "Gloria Kato";
  const role = displayData?.role || "Education Technology Professional and Digital Support";
  
  const defaultBio = `I am a flexible digital support and operations expert with hands-on experience supporting technology, users, and day-to-day workflows in both organized and fast-paced environments.

I have significant experience working in educational institutions, where I helped students, instructors, and staff through the effective use of technology and digital tools. My experience includes IT and helpdesk support, device setup and debugging, digital tool onboarding, data and inventory management, and day-to-day operations coordination.

Throughout my career, I've worked with diverse teams to coordinate training sessions, conduct project-based activities, and ensure systems and procedures run smoothly.

In addition to technical and operational support, I have helped teams create digital content, provided basic web and design support, and prepared educational and presentation materials.

I am open to remote and hybrid possibilities in a variety of industries where I can apply my technological support, operations, coordination, and digital abilities while also growing and expanding my experience.`;

  const bio = displayData?.bio || defaultBio;
  
  const handleBioEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onUpdate) onUpdate({ bio: e.target.value });
  };

  return (
    <section className="bg-white dark:bg-dark-card p-0 md:p-12 lg:p-16 relative overflow-hidden shadow-sm transition-colors duration-300">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        <div className="w-full md:w-2/3 p-8 md:p-0 z-10">
          <div className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight flex items-center gap-3">
            <span>I'm</span>
            {isEditable ? (
              <input 
                value={name} 
                onChange={(e) => onUpdate?.({ fullName: e.target.value })}
                className="cms-input flex-1"
                placeholder="Your Name"
              />
            ) : name}
          </div>
          
          <div className="text-lg md:text-xl font-bold mb-8 dark:text-white leading-tight">
            <div className="text-primary uppercase tracking-tighter w-full">
              {isEditable ? (
                <input 
                  value={role} 
                  onChange={(e) => onUpdate?.({ role: e.target.value })}
                  className="cms-input w-full"
                  placeholder="Primary Role"
                />
              ) : role}
            </div> 
            <span className="opacity-60 text-xs md:text-sm block mt-2 font-semibold">
              | IT Integrator | STEM Educator | Emerging Web Developer & Designer | Graphic Designer 
            </span>
            <span className="block mt-4 text-[10px] md:text-xs font-black uppercase tracking-[4px] text-gray-400 dark:text-gray-500 border-l-2 border-primary pl-4">
              — Open to Remote and Hybrid Roles —
            </span>
          </div>

          <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed space-y-4 max-w-2xl mb-10">
            {isEditable ? (
              <div className="relative group/bio">
                <textarea 
                  value={bio}
                  onChange={handleBioEdit}
                  rows={18}
                  className="cms-input w-full p-4"
                  placeholder="Tell your professional story..."
                />
                <Edit3 size={16} className="absolute right-4 top-4 text-primary animate-pulse pointer-events-none" />
              </div>
            ) : (
              <p className="whitespace-pre-line">{bio}</p>
            )}
          </div>

          <a 
            href={getHireMeLink("General Professional Inquiry")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary hover:bg-black hover:text-primary text-black font-black py-4 px-10 rounded-sm transition-all uppercase text-xs tracking-[3px] no-underline shadow-[0_15px_30px_-10px_var(--primary-color)] group"
          >
            Hire Me <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
        <div className="w-full md:w-1/3 relative flex justify-center md:justify-end">
             <div className="absolute top-4 left-10 w-3 h-3 rounded-full border-2 border-primary animate-pulse"></div>
             <div className="absolute bottom-10 left-10 w-3 h-3 rounded-full border-2 border-[#7EB942]"></div>
             <div className="absolute top-10 right-20 w-3 h-3 rounded-full border-2 border-primary rotate-45"></div>

             <div className="relative group">
               <div className="absolute -inset-4 bg-primary/20 rounded-lg blur-2xl group-hover:bg-primary/30 transition-all duration-500"></div>
               <img 
                 src={PROFILE_IMAGE} 
                 alt={"Gloria Kato — Education Technology Professional and Digital Support"} 
                 referrerPolicy="no-referrer"
                 className="w-[280px] md:w-[350px] h-[350px] md:h-[450px] object-cover object-center rounded-sm shadow-2xl relative z-10 border-8 border-white dark:border-dark-card transition-all duration-700"
               />
             </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
