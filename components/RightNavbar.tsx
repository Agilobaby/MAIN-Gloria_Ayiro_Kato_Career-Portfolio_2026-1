
import React, { useState, useEffect } from 'react';
import { Home, Briefcase, GraduationCap, Code, Mail, Moon, Sun, Layers, Palette, X, Quote } from 'lucide-react';
import RecruiterDetector from './RecruiterDetector';

// Preset Themes from Screenshots
const THEMES = [
  { name: 'Neon Vibes', colors: ['#FF006E', '#8338EC', '#3A0CA3', '#3A86FF', '#4CC9F0'] },
  { name: 'Retro Pop', colors: ['#F7F3E3', '#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'] },
  { name: 'Bold & Fire', colors: ['#6a040f', '#d00000', '#fefae0', '#003049', '#669bbc'] },
  { name: 'Nature & Muted', colors: ['#264653', '#606c38', '#bcbd8b', '#fefae0'] },
  { name: 'Ocean Breeze', colors: ['#006d77', '#83c5be', '#edf6f9', '#ffddd2', '#e29578'] },
  { name: 'Coffee & Dusk', colors: ['#283618', '#fefae0', '#dda15e', '#603813', '#495057'] },
  { name: 'Default', colors: ['#FFB400'] } // Our default yellow
];

const RightNavbar = () => {
  const [isDark, setIsDark] = useState(true); // Default to Dark Mode
  const [showThemePanel, setShowThemePanel] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.hash !== '#/') {
        // If on another page, go home first
        window.location.href = '/#/' + id;
    }
  };

  const changePrimaryColor = (color: string) => {
    document.documentElement.style.setProperty('--primary-color', color);
  };

  return (
    <>
      <div className="hidden lg:flex fixed right-0 top-0 h-screen w-[80px] bg-white dark:bg-dark-card shadow-[-2px_0_10px_rgba(0,0,0,0.05)] z-40 flex-col items-center justify-center gap-8 border-l border-gray-200 dark:border-gray-800 transition-colors duration-300">
        
        {/* Theme Toggle Component */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-[#E4E5EA] dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-300 hover:bg-primary dark:hover:bg-primary hover:text-black transition-all flex items-center justify-center mb-4"
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Theme Customizer Toggle */}
        <button 
          onClick={() => setShowThemePanel(true)}
          className="w-10 h-10 rounded-full bg-[#E4E5EA] dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-300 hover:bg-primary dark:hover:bg-primary hover:text-black transition-all flex items-center justify-center mb-4"
          title="Customize Theme"
        >
          <Palette size={20} />
        </button>

        <NavIcon icon={<Home size={20} />} label="Home" onClick={() => scrollToSection('home')} />
        <NavIcon icon={<Code size={20} />} label="Services" onClick={() => scrollToSection('services')} />
        <NavIcon icon={<Quote size={20} />} label="Recommendations" onClick={() => scrollToSection('recommendations')} />
        <NavIcon icon={<GraduationCap size={20} />} label="Education" onClick={() => scrollToSection('education')} />
        <NavIcon icon={<Briefcase size={20} />} label="Work History" onClick={() => scrollToSection('work-history')} />
        <NavIcon icon={<Layers size={20} />} label="Portfolio" onClick={() => scrollToSection('portfolio')} />
        <NavIcon icon={<Mail size={20} />} label="Contact" onClick={() => scrollToSection('contact')} />

        {/* Recruiter Detector - Embedded Mode */}
        <RecruiterDetector inNavbar={true} />
      </div>

      {/* Slide-out Theme Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] bg-white dark:bg-[#0f0f0f] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 overflow-y-auto ${showThemePanel ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-gray-800 dark:text-white">Theme Colors</h3>
            <button 
              onClick={() => setShowThemePanel(false)}
              className="bg-primary p-2 rounded-full text-black hover:opacity-80 transition-opacity"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {THEMES.map((theme) => (
              <div key={theme.name}>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">{theme.name}</h4>
                <div className="flex flex-wrap gap-3">
                  {theme.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => changePrimaryColor(color)}
                      className="w-10 h-10 rounded-full border-2 border-transparent hover:scale-110 transition-transform shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const NavIcon = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 rounded-full bg-[#E4E5EA] dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-400 hover:bg-primary dark:hover:bg-primary hover:text-black dark:hover:text-black transition-all flex items-center justify-center group relative"
  >
    {icon}
    {/* Tooltip */}
    <div className="absolute right-14 bg-black text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg z-50">
      {label}
      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
    </div>
  </button>
);

export default RightNavbar;
