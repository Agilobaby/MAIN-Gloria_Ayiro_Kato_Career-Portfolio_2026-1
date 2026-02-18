
import React, { useState, useEffect, useRef } from 'react';
import { Recommendation } from '../types';
import { getRecommendations, saveRecommendations } from '../services/api';
import { Plus, Trash2, Edit3, Image, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface RecommendationsProps {
  isEditable?: boolean;
}

const Recommendations: React.FC<RecommendationsProps> = ({ isEditable }) => {
  const [items, setItems] = useState<Recommendation[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchData = () => {
    getRecommendations().then(setItems).catch(console.error);
  };

  useEffect(() => {
    fetchData();
    
    if (!isEditable) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'portfolio_recommendations') {
          fetchData();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isEditable]);

  const handleUpdate = (id: string, updates: Partial<Recommendation>) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => item.id === id ? { ...item, ...updates } : item);
      if (isEditable) saveRecommendations(updated);
      return updated;
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    // Prevent event bubbling and default behavior
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this recommendation?')) {
      setItems(prevItems => {
        const updated = prevItems.filter(item => item.id !== id);
        
        // Save immediately
        if (isEditable) {
          saveRecommendations(updated).catch(err => {
            console.error("Failed to save deletion:", err);
            alert("Could not delete item. Please try again.");
          });
        }
        
        return updated;
      });
    }
  };

  const handleAdd = () => {
    const newItem: Recommendation = {
      id: `rec-${Date.now()}`,
      name: 'New Reference',
      role: 'Job Title',
      company: 'Company Name',
      image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
      text: 'Draft your recommendation text here...',
      rating: 5
    };
    setItems(prevItems => {
      const updated = [...prevItems, newItem];
      if (isEditable) saveRecommendations(updated);
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdate(activeId, { image: reader.result as string });
      setActiveId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (id: string) => {
    setActiveId(id);
    fileInputRef.current?.click();
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Scroll by one card width (approx 350px)
      const scrollAmount = 350;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderStars = (rating: number, id: string) => {
    return (
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!isEditable}
            onClick={() => handleUpdate(id, { rating: star })}
            className={`focus:outline-none ${isEditable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={18}
              className={`${star <= rating ? 'fill-primary text-primary' : 'text-gray-300 dark:text-gray-600'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="my-24 relative" id="recommendations">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      
      <div className="flex justify-between items-center mb-12">
        <div className="flex-1 text-center px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 uppercase">Recommendations</h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-2xl mx-auto">
            Here is what people are saying about my work in education and technology.
          </p>
        </div>
        {isEditable && (
          <button onClick={handleAdd} className="bg-primary text-black p-2 rounded-sm shadow-lg hover:scale-110 transition-transform flex-shrink-0">
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="relative group/container px-4">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-[#222] text-gray-800 dark:text-white p-3 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 hover:bg-primary hover:text-black transition-all -ml-6 lg:-ml-12 focus:outline-none hidden md:flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-[#222] text-gray-800 dark:text-white p-3 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 hover:bg-primary hover:text-black transition-all -mr-6 lg:-mr-12 focus:outline-none hidden md:flex items-center justify-center"
        >
          <ChevronRight size={24} />
        </button>

        {/* Scrolling Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 pt-4 px-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((rec) => (
            <div 
              key={rec.id} 
              className="min-w-[300px] md:min-w-[350px] flex-1 snap-center bg-white dark:bg-[#111] p-8 rounded-sm shadow-xl border border-gray-100 dark:border-gray-800 relative group transition-transform hover:-translate-y-1 duration-300"
            >
              {isEditable && (
                <button 
                  type="button"
                  onClick={(e) => handleDelete(e, rec.id)}
                  onMouseDown={(e) => e.stopPropagation()} 
                  className="absolute top-0 right-0 m-3 bg-red-600 hover:bg-red-700 text-white w-8 h-8 flex items-center justify-center rounded-sm shadow-lg z-50 transition-all hover:scale-110 cursor-pointer"
                  title="Delete Recommendation"
                  aria-label="Delete Recommendation"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              {renderStars(rec.rating || 5, rec.id)}

              <div className="relative z-10 mb-6 min-h-[80px]">
                {isEditable ? (
                  <textarea 
                    value={rec.text}
                    onChange={(e) => handleUpdate(rec.id, { text: e.target.value })}
                    rows={4}
                    className="cms-input text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed w-full resize-none"
                  />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">"{rec.text}"</p>
                )}
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <div className="relative group/img flex-shrink-0">
                  <img 
                    src={rec.image} 
                    alt={rec.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                  />
                  {isEditable && (
                    <button onClick={() => triggerUpload(rec.id)} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:img:opacity-100 transition-opacity text-white">
                      <Image size={14} />
                    </button>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {isEditable ? (
                    <div className="space-y-1">
                      <input 
                        value={rec.name}
                        onChange={(e) => handleUpdate(rec.id, { name: e.target.value })}
                        className="cms-input font-bold text-xs"
                        placeholder="Name"
                      />
                      <input 
                        value={rec.role}
                        onChange={(e) => handleUpdate(rec.id, { role: e.target.value })}
                        className="cms-input text-[10px]"
                        placeholder="Role"
                      />
                      <input 
                        value={rec.company}
                        onChange={(e) => handleUpdate(rec.id, { company: e.target.value })}
                        className="cms-input text-[10px]"
                        placeholder="Company"
                      />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white">{rec.name}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {rec.role}, <span className="text-primary">{rec.company}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
