
import React, { useEffect, useState } from 'react';
import { PROFILE_IMAGE, CV_URL } from '../constants';
import { 
  Facebook, Twitter, Instagram, Linkedin, Youtube, Download, 
  Check, Edit2, Plus, Trash2, Github, Globe, Mail, X, Settings,
  MessageCircle, Dribbble, Figma, Palette
} from 'lucide-react';
import { IdentityData, Skill, SocialLink, SocialPlatform } from '../types';
import { getIdentity } from '../services/api';

interface SidebarProps {
  isEditable?: boolean;
  data?: IdentityData | null;
  onUpdate?: (newData: Partial<IdentityData>) => void;
}

const SOCIAL_ICONS: Record<SocialPlatform, React.ElementType> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  website: Globe,
  email: Mail,
  whatsapp: MessageCircle,
  dribbble: Dribbble,
  behance: Palette, // Using Palette as proxy for Behance
  figma: Figma
};

const Sidebar: React.FC<SidebarProps> = ({ isEditable, data, onUpdate }) => {
  const [localData, setLocalData] = useState<IdentityData | null>(null);
  const [showSocialEditor, setShowSocialEditor] = useState(false);
  
  const displayData = isEditable ? data : (localData || data);

  // Fetch data locally if not in edit mode (Live Site Mode)
  useEffect(() => {
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

      // Listen for CMS updates
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'portfolio_identity') {
          fetchData();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isEditable]);

  const socialClass = "bg-primary p-2 rounded-full text-black hover:opacity-80 transition-opacity cursor-pointer shadow-sm flex items-center justify-center w-8 h-8";
  
  const name = displayData?.fullName || "Gloria Kato";
  const role = displayData?.role || "Education Technology Professional and Digital Support";
  const socialLinks = displayData?.socialLinks || [];

  const handleEdit = (field: keyof IdentityData, value: any) => {
    if (onUpdate) onUpdate({ [field]: value });
  };

  const handleUpdateSkill = (type: 'skills' | 'languages', index: number, field: keyof Skill, value: string | number) => {
    if (!displayData) return;
    const newItems = [...(displayData[type] || [])];
    newItems[index] = { ...newItems[index], [field]: field === 'level' ? Number(value) : value };
    handleEdit(type, newItems);
  };

  const handleDeleteSkill = (type: 'skills' | 'languages', index: number) => {
    if (!displayData) return;
    const newItems = displayData[type].filter((_, i) => i !== index);
    handleEdit(type, newItems);
  };

  const handleAddSkill = (type: 'skills' | 'languages') => {
    if (!displayData) return;
    const newItems = [...(displayData[type] || []), { name: 'New Skill', level: 80 }];
    handleEdit(type, newItems);
  };

  const handleUpdateExtraSkill = (index: number, value: string) => {
    if (!displayData) return;
    const newItems = [...(displayData.extraSkills || [])];
    newItems[index] = value;
    handleEdit('extraSkills', newItems);
  };

  const handleDeleteExtraSkill = (index: number) => {
    if (!displayData) return;
    const newItems = displayData.extraSkills.filter((_, i) => i !== index);
    handleEdit('extraSkills', newItems);
  };

  const handleAddExtraSkill = () => {
    if (!displayData) return;
    const newItems = [...(displayData.extraSkills || []), 'New Skill'];
    handleEdit('extraSkills', newItems);
  };

  // Social Media Management
  const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    if (!displayData) return;
    const newLinks = [...(displayData.socialLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleEdit('socialLinks', newLinks);
  };

  const handleRemoveSocialLink = (index: number) => {
    if (!displayData) return;
    const newLinks = (displayData.socialLinks || []).filter((_, i) => i !== index);
    handleEdit('socialLinks', newLinks);
  };

  const handleAddSocialLink = () => {
    if (!displayData) return;
    const newLinks = [...(displayData.socialLinks || []), { platform: 'website', url: 'https://' } as SocialLink];
    handleEdit('socialLinks', newLinks);
  };

  return (
    <aside className="w-full lg:w-[305px] bg-white dark:bg-dark-card shadow-2xl border-b-2 lg:border-b-0 lg:border-r-[1.5px] border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col h-auto lg:h-screen lg:sticky lg:top-0 overflow-y-auto scrollbar-hide z-30 relative transition-colors duration-300">
      {/* Profile Section */}
      <div className="p-8 text-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent relative group">
        <div className="relative w-[150px] h-[150px] mx-auto mb-5 group/img">
          <img 
            src={PROFILE_IMAGE} 
            alt={name} 
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover object-center shadow-xl border-4 border-white dark:border-gray-800 group-hover/img:scale-105 transition-transform duration-300"
          />
          <span className="absolute bottom-4 right-4 w-5 h-5 bg-[#7EB942] rounded-full border-4 border-white dark:border-dark-card shadow-lg animate-pulse"></span>
        </div>

        {isEditable ? (
          <div className="space-y-2 relative">
            <div className="relative group/field">
              <input 
                value={name}
                onChange={(e) => handleEdit('fullName', e.target.value)}
                className="cms-input text-xl font-bold text-center"
              />
              <Edit2 size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary opacity-50 pointer-events-none" />
            </div>
            <div className="relative group/field">
              <textarea 
                value={role}
                onChange={(e) => handleEdit('role', e.target.value)}
                rows={2}
                className="cms-input text-primary text-[10px] font-bold uppercase tracking-wider leading-tight text-center resize-none"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">{name}</h2>
            <div className="mt-2 space-y-1">
              <p className="text-primary text-[10px] font-bold uppercase tracking-wider leading-tight">
                {role}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-[9px] font-medium uppercase tracking-tight">
                | IT Integrator | STEM Educator | Emerging Web Developer & Designer | Graphic Designer
              </p>
            </div>
          </>
        )}
        
        {/* Social Icons Row */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap relative">
          {socialLinks.map((link, idx) => {
            const Icon = SOCIAL_ICONS[link.platform] || Globe;
            return (
              <a 
                key={idx} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={socialClass}
                title={link.platform}
              >
                <Icon size={14} />
              </a>
            );
          })}
          
          {isEditable && (
             <button 
               onClick={() => setShowSocialEditor(!showSocialEditor)}
               className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center relative z-50"
               title="Manage Social Links"
             >
               {showSocialEditor ? <X size={14} /> : <Settings size={14} />}
             </button>
          )}

          {/* Social Media Editor Popover */}
          {isEditable && showSocialEditor && (
             <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[320px] bg-white dark:bg-[#1a1a1a] p-5 rounded-sm shadow-2xl border border-gray-200 dark:border-gray-700 z-[100] animate-in slide-in-from-top-2 fade-in duration-200 text-left">
                {/* Arrow Pointer */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1a1a1a] border-t border-l border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Edit Social Platforms</h4>
                   <button onClick={handleAddSocialLink} className="text-primary hover:text-white bg-black/5 hover:bg-black p-1.5 rounded-sm transition-colors flex items-center gap-1">
                     <Plus size={12} /> <span className="text-[9px] font-bold">Add New</span>
                   </button>
                </div>
                
                <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar relative z-10 pr-1">
                   {socialLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-2 items-start bg-gray-50 dark:bg-black p-2 rounded-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-colors">
                         <div className="flex flex-col gap-1">
                           <label className="text-[8px] font-bold text-gray-400 uppercase">Platform</label>
                           <select 
                             value={link.platform}
                             onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)}
                             className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-sm text-[10px] p-1.5 w-[90px] focus:outline-none focus:border-primary text-gray-800 dark:text-gray-200 uppercase font-bold"
                           >
                              {Object.keys(SOCIAL_ICONS).sort().map(p => (
                                 <option key={p} value={p}>{p}</option>
                              ))}
                           </select>
                         </div>
                         <div className="flex flex-col gap-1 flex-1 min-w-0">
                           <label className="text-[8px] font-bold text-gray-400 uppercase">Profile URL</label>
                           <input 
                              value={link.url}
                              onChange={(e) => handleUpdateSocialLink(idx, 'url', e.target.value)}
                              className="flex-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-sm text-[10px] p-1.5 focus:outline-none focus:border-primary text-gray-800 dark:text-gray-200 w-full"
                              placeholder="https://..."
                           />
                         </div>
                         <button onClick={() => handleRemoveSocialLink(idx)} className="text-gray-400 hover:text-red-500 mt-5 self-center">
                            <Trash2 size={14} />
                         </button>
                      </div>
                   ))}
                   {socialLinks.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">No social links visible. Click Add New.</p>}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Info List */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-800 space-y-4">
        <InfoItem editable={isEditable} field="age" label="Age" value={displayData?.age || "24"} onUpdate={handleEdit} />
        <InfoItem editable={isEditable} field="residence" label="Residence" value={displayData?.residence || "Kenya"} onUpdate={handleEdit} />
        <InfoItem label="Freelance" value="Available" valueClass="text-[#7EB942] font-bold" />
        <InfoItem editable={isEditable} field="address" label="Address" value={displayData?.address || "Nairobi/Kiambu"} onUpdate={handleEdit} />
      </div>

      {/* Languages */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-800">
        <SectionHeader title="Languages" onAdd={isEditable ? () => handleAddSkill('languages') : undefined} />
        <div className="space-y-4">
          {(displayData?.languages || []).map((lang, idx) => (
            <div key={idx} className="relative group/item">
              <LanguageBar 
                lang={lang.name} 
                percent={lang.level} 
                editable={isEditable}
                onUpdate={(field, val) => handleUpdateSkill('languages', idx, field, val)}
              />
              {isEditable && (
                <button 
                  onClick={() => handleDeleteSkill('languages', idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Core Skills */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-800">
        <SectionHeader title="Core Skills" onAdd={isEditable ? () => handleAddSkill('skills') : undefined} />
        <div className="space-y-4">
          {(displayData?.skills || []).map((skill, idx) => (
            <div key={idx} className="relative group/item">
              <LanguageBar 
                lang={skill.name} 
                percent={skill.level} 
                editable={isEditable}
                onUpdate={(field, val) => handleUpdateSkill('skills', idx, field, val)}
              />
              {isEditable && (
                <button 
                  onClick={() => handleDeleteSkill('skills', idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Extra Skills */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-800">
        <SectionHeader title="Extra Skills" onAdd={isEditable ? handleAddExtraSkill : undefined} />
        <ul className="space-y-2.5">
          {(displayData?.extraSkills || []).map((skill, idx) => (
            <li key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm group/extra">
              <Check size={16} className="text-primary flex-shrink-0" /> 
              {isEditable ? (
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    value={skill}
                    onChange={(e) => handleUpdateExtraSkill(idx, e.target.value)}
                    className="cms-input text-xs py-0"
                  />
                  <button onClick={() => handleDeleteExtraSkill(idx)} className="text-red-500 opacity-0 group-hover/extra:opacity-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <span className="group-hover:text-gray-800 dark:group-hover:text-white transition-colors">{skill}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-8 mt-auto sticky bottom-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md">
         <a 
           href={CV_URL} 
           target="_blank"
           rel="noopener noreferrer"
           className="w-full flex items-center justify-center gap-3 bg-primary hover:shadow-[0_0_15px_rgba(255,180,0,0.4)] text-black font-bold py-3.5 px-4 rounded-sm transition-all uppercase text-sm no-underline"
         >
            Download CV <Download size={18} />
         </a>
      </div>
    </aside>
  );
};

const SectionHeader = ({ title, onAdd }: { title: string, onAdd?: () => void }) => (
  <div className="flex items-center justify-between mb-5">
    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--primary-color)]"></span>
      {title}
    </h3>
    {onAdd && (
      <button onClick={onAdd} className="bg-primary text-black p-1 rounded-sm hover:scale-110 transition-transform">
        <Plus size={12} />
      </button>
    )}
  </div>
);

const InfoItem = ({ label, value, valueClass = "", editable, field, onUpdate }: { label: string; value: string; valueClass?: string, editable?: boolean, field?: keyof IdentityData, onUpdate?: (f: keyof IdentityData, v: string) => void }) => (
  <div className="flex justify-between items-center text-sm group/info">
    <span className="bg-primary/10 dark:bg-primary/5 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-sm font-medium border-l-2 border-primary">{label}:</span>
    {editable && field && onUpdate ? (
      <input 
        value={value}
        onChange={(e) => onUpdate(field, e.target.value)}
        className={`cms-input text-right w-32 ${valueClass}`}
      />
    ) : (
      <span className={`text-gray-600 dark:text-gray-400 ${valueClass}`}>{value}</span>
    )}
  </div>
);

const LanguageBar = ({ lang, percent, editable, onUpdate }: { lang: string; percent: number, editable?: boolean, onUpdate?: (field: keyof Skill, val: string | number) => void }) => (
  <div className="group">
    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm mb-1.5">
      {editable && onUpdate ? (
        <div className="flex items-center gap-2 w-full">
          <input 
            value={lang} 
            onChange={(e) => onUpdate('name', e.target.value)}
            className="cms-input text-xs py-0 flex-1"
          />
          <input 
            type="number" 
            value={percent} 
            onChange={(e) => onUpdate('level', e.target.value)}
            className="cms-input text-xs py-0 w-12"
          />
        </div>
      ) : (
        <>
          <span className="font-medium group-hover:text-gray-800 dark:group-hover:text-white transition-colors">{lang}</span>
          <span className="text-xs opacity-70">{percent}%</span>
        </>
      )}
    </div>
    {!editable && (
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-[1.5px] overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    )}
  </div>
);

export default Sidebar;
