
import React, { useState, useEffect } from 'react';
import { UserCheck, X, Briefcase, ArrowRight } from 'lucide-react';
import { sendMessage } from '../services/api';

interface RecruiterDetectorProps {
  inNavbar?: boolean;
}

const RecruiterDetector: React.FC<RecruiterDetectorProps> = ({ inNavbar }) => {
  const [showModal, setShowModal] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState<'ask' | 'details' | 'thank_you'>('ask');
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: ''
  });

  useEffect(() => {
    // Show modal after 3 seconds if not previously interacted with
    const hasInteracted = sessionStorage.getItem('recruiter_interaction');
    
    // Auto-popup logic
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowModal(false);
    sessionStorage.setItem('recruiter_interaction', 'dismissed');
    if (!inNavbar) setMinimized(true); 
  };

  const handleMinimize = () => {
    setMinimized(true);
    if (inNavbar) setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await sendMessage({
      fullName: formData.name,
      email: formData.email,
      subject: `[Recruiter Identified] ${formData.company}`,
      message: `Recruiter identified via site popup.\nCompany: ${formData.company}\nName: ${formData.name}`,
      isRecruiter: true,
      organization: formData.company
    });

    setStep('thank_you');
    sessionStorage.setItem('recruiter_interaction', 'identified');
    setTimeout(() => {
        setShowModal(false);
    }, 4000);
  };

  // Button Render Logic
  // In navbar, we always show the button if the modal is closed, acting as a persistent tool.
  const shouldShowButton = inNavbar || minimized;

  if (!showModal && shouldShowButton) {
    const buttonClass = inNavbar 
      ? "w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform animate-bounce cursor-pointer relative group"
      : "fixed bottom-6 right-6 z-50 bg-primary text-black p-3 rounded-full shadow-2xl hover:scale-110 transition-transform animate-bounce";

    return (
      <button 
        onClick={() => setShowModal(true)}
        className={buttonClass}
        title="Recruiter Check-in"
      >
        <Briefcase size={20} />
        {inNavbar && (
          <div className="absolute right-14 bg-black text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg z-50">
            Recruiter Check-In
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
          </div>
        )}
      </button>
    );
  }

  if (!showModal) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-[350px] bg-white dark:bg-[#111] shadow-[0_0_50px_rgba(0,0,0,0.2)] rounded-sm border border-primary/20 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-700 font-sans">
       <div className="bg-primary h-1 w-full"></div>
       
       <button onClick={handleMinimize} className="absolute top-2 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" title="Minimize to Button">
          <span className="text-[10px] font-bold">_</span>
       </button>
       <button onClick={handleDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" title="Dismiss">
          <X size={16} />
       </button>

       <div className="p-6">
          {step === 'ask' && (
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <UserCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Visiting for Recruitment?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                If you are reviewing my portfolio for a potential role, I'd love to know you stopped by.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleDismiss}
                  className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                >
                  Just Browsing
                </button>
                <button 
                  onClick={() => setStep('details')}
                  className="flex-1 py-2 bg-primary text-black text-xs font-black uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity"
                >
                  Yes, I am
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
               <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                 Quick Check-in
               </h3>
               <div>
                 <input 
                   required
                   placeholder="Your Name"
                   className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 p-3 text-xs rounded-sm focus:border-primary outline-none transition-colors"
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                 />
               </div>
               <div>
                 <input 
                   required
                   placeholder="Company / Organization"
                   className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 p-3 text-xs rounded-sm focus:border-primary outline-none transition-colors"
                   value={formData.company}
                   onChange={e => setFormData({...formData, company: e.target.value})}
                 />
               </div>
               <div>
                 <input 
                   type="email"
                   placeholder="Email (Optional)"
                   className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 p-3 text-xs rounded-sm focus:border-primary outline-none transition-colors"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                 />
               </div>
               <button 
                 type="submit"
                 className="w-full bg-primary text-black py-2.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-white border border-primary transition-all flex items-center justify-center gap-2"
               >
                 Identify Me <ArrowRight size={14} />
               </button>
            </form>
          )}

          {step === 'thank_you' && (
             <div className="text-center py-4">
                <p className="text-lg font-bold text-gray-800 dark:text-white mb-2">Thank You!</p>
                <p className="text-xs text-gray-500">I have noted your visit. Enjoy the portfolio.</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default RecruiterDetector;
