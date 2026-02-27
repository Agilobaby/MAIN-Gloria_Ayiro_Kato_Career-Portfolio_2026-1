
import React, { useState } from 'react';
import { sendMessage } from '../services/api';
import { MapPin, Mail, Smartphone, ExternalLink, Send, Info, Loader2, Check, UserCheck, ArrowRight } from 'lucide-react';
import { getContactFormMailLink } from '../constants';

const Contact = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
        alert("Please fill in all required fields.");
        return;
    }
    
    setStatus('submitting');
    try {
      await sendMessage(formData);
      setStatus('success');
      setFormData({ fullName: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const isFormFilled = formData.fullName && formData.email && formData.message;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 my-20">
      {/* Form Side */}
      <div className="flex flex-col">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">Get In Touch</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-md">
            Whether you have a project in mind or just want to say hi, I'm all ears. Fill out the form below or reach out directly.
          </p>
        </div>
        
        <div className="bg-white dark:bg-dark-card p-8 shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

          {status === 'success' && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-sm text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <Send size={14} />
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Transmission Success</p>
                <p className="opacity-80">Your message has been logged in my priority vault.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm text-sm flex items-center gap-3">
              <Info size={18} /> Error syncing with database. Please try the Gmail option.
            </div>
          )}
          
          <form onSubmit={handleInternalSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[2px]">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Jane Recruiter"
                  className="w-full bg-[#F3F4F6] dark:bg-dark-bg border border-transparent dark:border-gray-800 text-gray-800 dark:text-white p-4 rounded-sm focus:outline-none focus:border-primary transition-all text-sm placeholder:opacity-30"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  disabled={status === 'submitting'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[2px]">Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@company.com"
                  className="w-full bg-[#F3F4F6] dark:bg-dark-bg border border-transparent dark:border-gray-800 text-gray-800 dark:text-white p-4 rounded-sm focus:outline-none focus:border-primary transition-all text-sm placeholder:opacity-30"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  disabled={status === 'submitting'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[2px]">Subject</label>
              <input 
                type="text" 
                placeholder="Collaboration Opportunity"
                className="w-full bg-[#F3F4F6] dark:bg-dark-bg border border-transparent dark:border-gray-800 text-gray-800 dark:text-white p-4 rounded-sm focus:outline-none focus:border-primary transition-all text-sm placeholder:opacity-30"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                disabled={status === 'submitting'}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[2px]">Your Message</label>
              <textarea 
                rows={6}
                required
                placeholder="How can I help you today?"
                className="w-full bg-[#F3F4F6] dark:bg-dark-bg border border-transparent dark:border-gray-800 text-gray-800 dark:text-white p-4 rounded-sm focus:outline-none focus:border-primary transition-all text-sm resize-none placeholder:opacity-30"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                disabled={status === 'submitting'}
              ></textarea>
            </div>
            
            <div className="flex flex-col gap-4 pt-6">
              {/* EXTERNAL OPTION - Main CTA */}
<div className="relative group/btn">
  <button
    type="button"
    disabled={status === 'submitting' || !isFormFilled}
    onClick={async () => {
      if (!formData.fullName || !formData.email || !formData.message) {
        alert("Please fill in all required fields.");
        return;
      }
      setStatus('submitting');
      try {
        await sendMessage(formData);
        window.open(getContactFormMailLink(formData), '_blank');
        setStatus('success');
        setFormData({ fullName: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 6000);
      } catch (error) {
        console.error("Gmail send error:", error);
        // Still open Gmail even if DB save fails
        window.open(getContactFormMailLink(formData), '_blank');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    }}
    className="w-full inline-flex items-center justify-center gap-3 bg-primary text-black font-extrabold py-4 px-8 rounded-sm uppercase text-xs tracking-[2px] transition-all shadow-[0_10px_20px_-10px_var(--primary-color)] no-underline hover:scale-[1.01] hover:shadow-[0_15px_30px_-10px_var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
  >
    {status === 'submitting' ? (
      <>Sending... <Loader2 size={16} className="animate-spin" /></>
    ) : (
      <>Send via Gmail <ExternalLink size={16} /></>
    )}
  </button>
</div>
              {/* INTERNAL LOG OPTION */}
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold py-4 px-8 rounded-sm uppercase text-xs tracking-[2px] hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-white transition-all flex items-center justify-center gap-3 group/submit"
              >
                {status === 'submitting' ? (
                  <>Logging to DB... <Loader2 size={16} className="animate-spin" /></>
                ) : (
                  <>Log to Portfolio DB <Send size={14} className="group-hover/submit:translate-x-1 group-hover/submit:-translate-y-1 transition-transform" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Side */}
      <div className="flex flex-col justify-start gap-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 tracking-tight italic">Contact Details</h2>
          <div className="grid grid-cols-1 gap-4">
            <ContactInfoCard 
              icon={<MapPin size={24} />} 
              label="Location" 
              value="Nairobi, Kenya" 
            />
            <ContactInfoCard 
              icon={<Mail size={24} />} 
              label="Email" 
              value="ayirogloria@gmail.com" 
              isHighlighted
            />
            <ContactInfoCard 
              icon={<Smartphone size={24} />} 
              label="Work Status" 
              value="Available for Projects" 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] p-8 rounded-sm border-l-4 border-primary shadow-2xl relative overflow-hidden space-y-10 border border-gray-100 dark:border-transparent transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Send size={150} className="text-gray-900 dark:text-white" />
          </div>

          {/* SYSTEM PREFERENCES SECTION */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                <Info className="text-primary" size={20} />
              </div>
              <h3 className="text-gray-800 dark:text-white font-bold text-xl tracking-tight">System Preferences</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              <strong>Log to Portfolio DB</strong> creates a persistent record in my administrative dashboard. This ensures your inquiry is never lost and allows for professional case tracking.
            </p>
            <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--primary-color)]"></div>
                 Internal Dashboard Case Tracking
               </div>
               <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_var(--primary-color)]"></div>
                 Authorized Admin Notification
               </div>
            </div>
          </section>

          {/* FOR RECRUITERS SECTION - Enhanced for direct Gmail Engagement */}
          <section className="pt-8 border-t border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                <UserCheck className="text-primary" size={20} />
              </div>
              <h3 className="text-gray-800 dark:text-white font-bold text-xl tracking-tight">For Recruiters</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 italic">
              By using the <strong>Send via Gmail</strong> options, you will open a draft directly in your Gmail account. This allows you to:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                <Check size={14} className="text-primary" /> Keep a direct copy in your Sent folder
              </li>
              <li className="flex items-center gap-3 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                <Check size={14} className="text-primary" /> Send FROM your official email address
              </li>
              <li className="flex items-center gap-3 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                <Check size={14} className="text-primary" /> Facilitate immediate, direct responses from Gloria
              </li>
            </ul>
            
            <a 
              href={getContactFormMailLink(formData)}
              target="_blank"
              rel="noopener noreferrer"
              className="group/draft inline-flex items-center gap-3 py-2 no-underline border-b border-transparent hover:border-primary transition-all"
            >
               <span className="text-primary text-[10px] font-black uppercase tracking-[4px] group-hover/draft:opacity-80 transition-opacity">Open Quick Gmail Draft</span>
               <ArrowRight size={14} className="text-primary group-hover/draft:translate-x-2 transition-transform" />
            </a>
          </section>
        </div>
      </div>
    </section>
  );
};

const ContactInfoCard = ({ icon, label, value, isHighlighted = false }: { icon: React.ReactNode, label: string, value: string, isHighlighted?: boolean }) => (
  <div className={`bg-white dark:bg-dark-card p-6 flex items-center gap-6 border border-gray-100 dark:border-gray-800 rounded-sm transition-all duration-300 ${isHighlighted ? 'ring-1 ring-primary/30 shadow-lg' : 'hover:border-gray-300 dark:hover:border-gray-700'}`}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border ${isHighlighted ? 'bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(255,180,0,0.2)]' : 'bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-gray-800'}`}>
      <div className={isHighlighted ? 'text-primary' : 'text-gray-400'}>{icon}</div>
    </div>
    <div>
      <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px] mb-1">{label}</h4>
      <p className={`font-bold transition-colors ${isHighlighted ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>{value}</p>
    </div>
  </div>
);

export default Contact;
