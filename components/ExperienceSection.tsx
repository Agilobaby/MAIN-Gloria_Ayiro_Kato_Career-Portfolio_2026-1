
import React, { useEffect, useState } from 'react';
import { Experience } from '../types';
import { getExperience } from '../services/api';
import { GraduationCap, Calendar, ShieldCheck, Trash2, Plus } from 'lucide-react';

interface ExperienceSectionProps {
  isEditable?: boolean;
  data?: Experience[];
  onUpdate?: (newData: Experience[]) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ isEditable, data: propData, onUpdate }) => {
  const [localData, setLocalData] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine source of truth: Props (CMS) or Local State (Live Site)
  const displayData = (isEditable && propData) ? propData : localData;

  const fetchExperience = async () => {
    try {
      const res = await getExperience();
      setLocalData(res);
    } catch (err) {
      console.error("Failed to fetch experience", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch internally if we are NOT in edit mode (Live Site)
    if (!isEditable) {
      fetchExperience();

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'portfolio_experience') {
          fetchExperience();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } else {
      setLoading(false);
    }
  }, [isEditable]);

  const handleUpdateItem = (id: string, updates: Partial<Experience>) => {
    if (!onUpdate || !displayData) return;
    const newData = displayData.map(item => item._id === id ? { ...item, ...updates } : item);
    onUpdate(newData);
  };

  const handleDelete = (id: string) => {
    if (!onUpdate || !displayData) return;
    const newData = displayData.filter(item => item._id !== id);
    onUpdate(newData);
  };

  const handleAdd = (type: 'education' | 'work') => {
    if (!onUpdate || !displayData) return;
    const newItem: Experience = {
      _id: Date.now().toString(),
      type,
      title: 'New Institution',
      role: 'Job Role / Degree',
      date: 'Start - End Date',
      description: 'Detail your achievements here.'
    };
    onUpdate([...displayData, newItem]);
  };

  const education = displayData.filter(d => d.type === 'education');
  const work = displayData.filter(d => d.type === 'work');

  if (loading) return null;

  return (
    <div className="space-y-24 mb-24">
      {/* Education */}
      <section id="education" className="scroll-mt-24">
        <div className="flex justify-between items-center mb-10">
          <div className="text-center flex-1 px-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 uppercase">Education & Certifications</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-2xl mx-auto">
              My academic background and specialized certifications.
            </p>
          </div>
          {isEditable && (
            <button onClick={() => handleAdd('education')} className="bg-primary text-black p-2 rounded-sm shadow-lg hover:scale-110 transition-transform flex-shrink-0">
              <Plus size={20} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {education.map((item) => (
            <div key={item._id} className="bg-white dark:bg-[#111111] p-7 rounded-sm shadow-xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-all group relative">
              {isEditable && (
                <button onClick={() => handleDelete(item._id!)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Trash2 size={14} />
                </button>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-sm flex-shrink-0">
                  <GraduationCap size={18} className="text-black" />
                </div>
                {isEditable ? (
                  <input 
                    value={item.date} 
                    onChange={e => handleUpdateItem(item._id!, { date: e.target.value })} 
                    className="cms-input w-40 text-[10px] font-black uppercase text-primary tracking-widest text-right" 
                    placeholder="DATE"
                  />
                ) : (
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">{item.date}</span>
                )}
              </div>
              <div className="space-y-3">
                {isEditable ? (
                  <>
                    <input 
                      value={item.title} 
                      onChange={e => handleUpdateItem(item._id!, { title: e.target.value })} 
                      className="cms-input text-lg font-bold text-gray-800 dark:text-white uppercase w-full"
                      placeholder="INSTITUTION"
                    />
                    <input 
                      value={item.role} 
                      onChange={e => handleUpdateItem(item._id!, { role: e.target.value })} 
                      className="cms-input text-[10px] font-black uppercase text-primary tracking-widest w-full"
                      placeholder="QUALIFICATION"
                    />
                    <textarea 
                      value={item.description} 
                      onChange={e => handleUpdateItem(item._id!, { description: e.target.value })} 
                      rows={3} 
                      className="cms-input text-xs text-gray-500 dark:text-gray-400 leading-relaxed w-full resize-none"
                      placeholder="Description details..."
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase">{item.title}</h3>
                    <h4 className="text-primary text-[10px] font-black uppercase tracking-widest">{item.role}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.description}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Work History */}
      <section id="work-history" className="scroll-mt-24">
        <div className="flex justify-between items-center mb-10">
          <div className="text-center flex-1 px-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 uppercase">Professional Experience</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-2xl mx-auto">
              A timeline of my professional experience
            </p>
          </div>
          {isEditable && (
            <button onClick={() => handleAdd('work')} className="bg-primary text-black p-2 rounded-sm shadow-lg hover:scale-110 transition-transform flex-shrink-0">
              <Plus size={20} />
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-[#111111] p-8 md:p-10 rounded-sm shadow-2xl border border-gray-100 dark:border-transparent">
          <div className="space-y-12">
            {work.map((item) => (
              <div key={item._id} className="flex flex-col md:flex-row gap-6 md:gap-12 relative group border-b border-gray-50 dark:border-gray-800/50 pb-8 last:border-0">
                {isEditable && (
                  <button onClick={() => handleDelete(item._id!)} className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="md:w-1/3">
                  {isEditable ? (
                    <div className="space-y-3">
                      <input 
                        value={item.role} 
                        onChange={e => handleUpdateItem(item._id!, { role: e.target.value })} 
                        className="cms-input text-xl font-bold text-gray-800 dark:text-white uppercase w-full mb-2"
                        placeholder="ROLE TITLE"
                      />
                      <input 
                        value={item.date} 
                        onChange={e => handleUpdateItem(item._id!, { date: e.target.value })} 
                        className="cms-input text-[10px] font-black uppercase tracking-widest w-auto inline-block"
                        placeholder="DATE RANGE"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 uppercase">{item.role}</h3>
                      <span className="bg-primary text-black text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest inline-block">{item.date}</span>
                    </>
                  )}
                </div>
                <div className="md:w-2/3">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-primary flex-shrink-0" />
                    {isEditable ? (
                      <input 
                        value={item.title} 
                        onChange={e => handleUpdateItem(item._id!, { title: e.target.value })} 
                        className="cms-input text-lg font-bold text-gray-800 dark:text-white uppercase w-full"
                        placeholder="COMPANY / ORGANIZATION"
                      />
                    ) : (
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white uppercase">{item.title}</h4>
                    )}
                  </div>
                  {isEditable ? (
                    <textarea 
                      value={item.description} 
                      onChange={e => handleUpdateItem(item._id!, { description: e.target.value })} 
                      rows={6} 
                      className="cms-input text-sm text-gray-500 dark:text-gray-400 leading-relaxed w-full whitespace-pre-line resize-none"
                      placeholder="Job description and achievements..."
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExperienceSection;
