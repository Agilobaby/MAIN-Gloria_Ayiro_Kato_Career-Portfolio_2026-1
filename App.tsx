
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Sidebar from './components/Sidebar';
import RightNavbar from './components/RightNavbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Recommendations from './components/Recommendations';
import ExperienceSection from './components/ExperienceSection';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ServiceDetail from './pages/ServiceDetail';
import ProjectDetail from './pages/ProjectDetail';
import AdminPortfolioEditor from './pages/AdminPortfolioEditor';
import RecruiterDetector from './components/RecruiterDetector';
import { logVisit } from './services/api';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8f7ff] dark:bg-dark-bg transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden lg:mr-[80px] transition-all">
        {children}
      </main>
      <div className="hidden lg:block">
        <RightNavbar />
      </div>
      {/* Recruiter Detector Popup - Only visible on Mobile (Desktop version is embedded in RightNavbar) */}
      <div className="lg:hidden">
        <RecruiterDetector />
      </div>
    </div>
  );
};

// Analytics Tracker Component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Log visit on route change, but debounced or simple logic to prevent admin spam
    if (!location.pathname.includes('/admin')) {
      logVisit();
    }
  }, [location]);

  return null;
};

const HomePage = () => {
  return (
    <Layout>
      <div id="home">
        <Hero />
      </div>
      <div className="px-4 md:px-8 lg:px-12 max-w-6xl mx-auto">
        <div id="services">
          <Services />
        </div>
        <div id="recommendations">
          <Recommendations />
        </div>
        <ExperienceSection />
        <div id="portfolio">
          <Portfolio />
        </div>
        <div id="contact">
          <Contact />
        </div>
        <footer className="bg-white dark:bg-dark-card py-20 text-center border-t border-gray-100 dark:border-gray-800">
           <div className="flex flex-col items-center gap-10">
             <div className="text-gray-400 dark:text-gray-500 text-sm font-medium">
               &copy; 2024 Gloria Kato. All Rights Reserved.
             </div>
             <Link 
               to="/login" 
               className="inline-flex items-center gap-4 bg-primary text-black px-10 py-5 rounded-sm border border-primary text-xs font-black uppercase tracking-[4px] hover:bg-black hover:text-primary transition-all no-underline shadow-[0_15px_30px_-10px_var(--primary-color)] group"
             >
               <Lock size={18} /> Admin Control Hub
             </Link>
           </div>
        </footer>
      </div>
    </Layout>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cms" 
          element={
            <ProtectedRoute>
              <AdminPortfolioEditor />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
