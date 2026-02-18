
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getProjects, 
  getExperience, 
  getMessages,
  updateMessages,
  updateAdminCredentials,
  getVisitorLogs,
  getSecurityLogs,
  getAdminCredentials,
  exportFullBackup,
  importFullBackup
} from '../services/api';
import { Project, Experience, Message, VisitorLog, SecurityLog } from '../types';
import { 
  LogOut, MessageSquare, LayoutGrid, BarChart3, Clock, ChevronRight, 
  User, ShieldAlert, Edit3, ExternalLink, Star, Trash2, Mail, 
  Search, Lock, Globe, Smartphone, Monitor, MapPin, AlertTriangle, 
  CheckCircle, Reply, Eye, ShieldCheck, RefreshCw, Briefcase, Building2,
  Download, UploadCloud, Database
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'security' | 'analytics'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // System Health States
  const [storageHealth, setStorageHealth] = useState<string>('Checking...');
  const [apiLatency, setApiLatency] = useState<string>('0ms');

  // Security Form
  const [credsForm, setCredsForm] = useState({ 
    email: 'ayirogloria@gmail.com', 
    password: '', 
    confirm: '' 
  });
  const [passStatus, setPassStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Backup State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Load current admin email on mount
  useEffect(() => {
    const currentCreds = getAdminCredentials();
    if (currentCreds && currentCreds.email) {
      setCredsForm(prev => ({ ...prev, email: currentCreds.email }));
    }
  }, []);

  // Live Refresh interval logic
  useEffect(() => {
    fetchData();
    checkSystemHealth();
    
    // Refresh data every 5 seconds to show live recruiter activity
    const intervalId = setInterval(() => {
      fetchData(true); // true = silent background refresh
      checkSystemHealth();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const checkSystemHealth = () => {
    // 1. Check LocalStorage Capacity (Mock check)
    try {
      const usage = JSON.stringify(localStorage).length / 1024;
      setStorageHealth(`${Math.round(usage)}KB Used`);
    } catch(e) {
      setStorageHealth('Error');
    }
    // 2. Mock Latency
    setApiLatency(`${Math.floor(Math.random() * 40 + 10)}ms`);
  };

  const fetchData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [projData, expData, msgData, visitData, secData] = await Promise.all([
        getProjects(),
        getExperience(),
        getMessages(),
        getVisitorLogs(),
        getSecurityLogs()
      ]);
      setProjects(projData);
      setExperience(expData);
      setMessages(msgData);
      setVisitorLogs(visitData);
      setSecurityLogs(secData);
    } catch (e) {
      // Only redirect on full load failure, not background refresh
      if (!silent && localStorage.getItem('token') === null) navigate('/login');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus('idle');
    
    if (credsForm.password !== credsForm.confirm) {
      alert("Passwords do not match.");
      return;
    }
    if (credsForm.password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    await updateAdminCredentials(credsForm.email, credsForm.password);
    setPassStatus('success');
    
    // Refresh security logs
    const newLogs = await getSecurityLogs();
    setSecurityLogs(newLogs);
    setTimeout(() => setPassStatus('idle'), 5000);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("WARNING: This will overwrite your current portfolio data with the backup file. Continue?")) {
      e.target.value = '';
      return;
    }

    setRestoreStatus('loading');
    try {
      await importFullBackup(file);
      setRestoreStatus('success');
      alert("Restore Successful. The page will now reload.");
      window.location.reload();
    } catch (err) {
      setRestoreStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-sm animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-[5px] text-[10px]">Accessing Control Center...</p>
      </div>
    );
  }

  const recruiterMessages = messages.filter(m => m.isRecruiter);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-[#0a0a0a] border-r border-gray-800 flex flex-col h-screen sticky top-0">
        <div className="p-8 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 italic">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-black font-black not-italic text-lg">G</span>
            </div>
            CORE <span className="text-primary">ADMIN</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutGrid size={18} />} label="Overview" />
          <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18} />} label="Traffic & Leads" />
          <NavBtn active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<MessageSquare size={18} />} label="Communication" count={messages.filter(m => !m.isRead).length} />
          
          <div className="my-4 border-t border-gray-800 mx-2"></div>
          
          <Link 
            to="/admin/cms" 
            className="w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all text-[11px] font-black tracking-[1px] uppercase group text-gray-500 hover:text-white hover:bg-white/5 no-underline"
          >
            <div className="flex items-center gap-3">
              <Edit3 size={18} className="text-primary" />
              <span>Visual CMS</span>
            </div>
            <ExternalLink size={12} className="opacity-40" />
          </Link>
          
          <div className="my-4 border-t border-gray-800 mx-2"></div>

          <NavBtn active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<ShieldAlert size={18} />} label="Security Hub" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-sm transition-all text-[10px] font-black uppercase tracking-[3px]"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen bg-[#050505]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
              {activeTab === 'analytics' ? 'Traffic Data' : activeTab.toUpperCase()}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[4px]">System Monitor & Management</p>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-gray-800 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live System Online</span>
              </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <OverviewTab projects={projects} experience={experience} messages={messages} visitors={visitorLogs} health={{storage: storageHealth, latency: apiLatency}} recruiters={recruiterMessages} />}
          {activeTab === 'analytics' && <AnalyticsTab logs={visitorLogs} />}
          {activeTab === 'messages' && <MessagesTab messages={messages} setMessages={setMessages} />}
          {activeTab === 'security' && (
            <SecurityTab 
              passForm={credsForm} 
              setPassForm={setCredsForm} 
              passStatus={passStatus} 
              handleUpdatePassword={handleUpdateCredentials}
              logs={securityLogs}
              onExport={exportFullBackup}
              onImportTrigger={() => fileInputRef.current?.click()}
            />
          )}
        </div>
        
        {/* Hidden Input for Restore */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleRestore} 
        />
      </main>
    </div>
  );
};

// --- SUB COMPONENTS ---

const NavBtn = ({ active, onClick, icon, label, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition-all text-[11px] font-black tracking-[1px] uppercase group ${active ? 'bg-primary text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
    <div className="flex items-center gap-3">
      <span className={`${active ? 'text-black' : 'text-gray-600 group-hover:text-primary'} transition-colors`}>{icon}</span>
      <span>{label}</span>
    </div>
    {count !== undefined && count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold ${active ? 'bg-black text-white' : 'bg-primary text-black'}`}>{count}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color = "text-primary", subtext }: any) => (
  <div className="bg-[#0e0e0e] p-8 rounded-sm border border-gray-800 hover:border-primary/30 transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 bg-black rounded-sm border border-gray-800 group-hover:border-primary/50 transition-colors ${color}`}>{icon}</div>
      <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest bg-[#111] px-2 py-1 rounded-sm">Stats</span>
    </div>
    <div className="space-y-1">
      <p className="text-5xl font-black italic tracking-tighter text-white">{value}</p>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[2px]">{label}</p>
      {subtext && <p className="text-[9px] text-green-500 pt-2 font-mono">{subtext}</p>}
    </div>
  </div>
);

// --- TAB CONTENT ---

const OverviewTab = ({ projects, experience, messages, visitors, health, recruiters }: any) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Recruiters ID'd" value={recruiters.length} icon={<Briefcase size={24} />} color="text-green-500" subtext="Via Recruiter Popup" />
      <StatCard label="Inbox" value={messages.length} icon={<MessageSquare size={24} />} color="text-blue-500" subtext={`${messages.filter((m:any) => !m.isRead).length} Unread`} />
      <StatCard label="Total Visits" value={visitors.length} icon={<Globe size={24} />} subtext="Unique Sessions" />
      <StatCard label="Projects" value={projects.length} icon={<LayoutGrid size={24} />} color="text-purple-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-[#0e0e0e] border border-gray-800 rounded-sm p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <Globe size={16} className="text-primary" /> Live Traffic Stream
        </h3>
        <div className="space-y-4">
          {visitors.slice(0, 5).map((log: VisitorLog) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-[#111] border border-gray-800/50 rounded-sm hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${log.device === 'Mobile' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                  {log.device === 'Mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    {log.location}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                     <Building2 size={10} className="text-primary" /> {log.organization || 'Private Network'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                <p className="text-[9px] text-primary uppercase">{log.page}</p>
              </div>
            </div>
          ))}
          {visitors.length === 0 && <p className="text-gray-600 text-xs italic">Waiting for traffic data...</p>}
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-gray-800 rounded-sm p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-500" /> System Diagnostics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-900/10 border border-green-900/20 rounded-sm">
             <span className="text-xs font-bold text-green-500">Database Storage</span>
             <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-sm font-black uppercase">{health.storage}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-900/10 border border-green-900/20 rounded-sm">
             <span className="text-xs font-bold text-green-500">Geolocation API</span>
             <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-sm font-black uppercase">Online</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-900/10 border border-green-900/20 rounded-sm">
             <span className="text-xs font-bold text-green-500">System Latency</span>
             <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded-sm font-black uppercase">{health.latency}</span>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-800">
             <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center flex items-center justify-center gap-2">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
               Updating in Real-time
             </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsTab = ({ logs }: { logs: VisitorLog[] }) => {
  const desktopCount = logs.filter(l => l.device === 'Desktop').length;
  const mobileCount = logs.filter(l => l.device === 'Mobile' || l.device === 'Tablet').length;
  const total = logs.length || 1; 

  // Location Aggregation
  const locationCounts: Record<string, number> = {};
  logs.forEach(l => {
    locationCounts[l.location] = (locationCounts[l.location] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
    
  // Org Aggregation
  const orgCounts: Record<string, number> = {};
  logs.forEach(l => {
      const org = l.organization || 'Unknown';
      orgCounts[org] = (orgCounts[org] || 0) + 1;
  });
  const topOrgs = Object.entries(orgCounts).sort(([,a], [,b]) => b - a).slice(0,5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-[#0e0e0e] p-8 border border-gray-800 rounded-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
             <Monitor size={16} /> Device Breakdown
          </h3>
          <div className="space-y-6">
             <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>Desktop</span>
                  <span>{Math.round((desktopCount/total)*100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500" style={{ width: `${(desktopCount/total)*100}%` }}></div>
                </div>
             </div>
             <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>Mobile / Tablet</span>
                  <span>{Math.round((mobileCount/total)*100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500" style={{ width: `${(mobileCount/total)*100}%` }}></div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="bg-[#0e0e0e] p-8 border border-gray-800 rounded-sm">
           <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
             <MapPin size={16} /> Top Locations
          </h3>
          <div className="space-y-3">
            {topLocations.map(([loc, count], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                 <span className="text-sm font-bold text-gray-300">{loc}</span>
                 <span className="text-xs text-gray-500">{count} visits</span>
              </div>
            ))}
            {topLocations.length === 0 && <p className="text-gray-500 text-xs italic">No location data available.</p>}
          </div>
        </div>
        
        <div className="bg-[#0e0e0e] p-8 border border-gray-800 rounded-sm">
           <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-2">
             <Building2 size={16} /> Identifying Organizations
          </h3>
          <div className="space-y-3">
            {topOrgs.map(([org, count], idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                 <span className="text-sm font-bold text-gray-300 truncate w-2/3">{org}</span>
                 <span className="text-xs text-gray-500">{count} hits</span>
              </div>
            ))}
            {topOrgs.length === 0 && <p className="text-gray-500 text-xs italic">No data available.</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-gray-800 rounded-sm">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Detailed Visit Log (Deanonymized)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111] text-[10px] font-black uppercase text-gray-500 tracking-[2px]">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Company / Network</th>
                <th className="p-4">Location</th>
                <th className="p-4">Entry Page</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.map((log) => (
                <tr key={log.id} className="text-xs hover:bg-[#111] transition-colors">
                  <td className="p-4 font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                     <Building2 size={12} className="text-primary" />
                     {log.organization || 'Unknown ISP'}
                  </td>
                  <td className="p-4 font-bold text-gray-300">{log.location}</td>
                  <td className="p-4 text-gray-300">{log.page}</td>
                  <td className="p-4 font-mono text-gray-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MESSAGES COMPONENT ---

const MessagesTab = ({ messages, setMessages }: { messages: Message[], setMessages: any }) => {
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = messages.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (msg: Message) => {
    setSelectedMsg(msg);
    // Mark as read
    if (!msg.isRead) {
      const updated = messages.map(m => m._id === msg._id ? { ...m, isRead: true } : m);
      setMessages(updated);
      updateMessages(updated);
    }
  };

  const handleDelete = (id: string) => {
    if(confirm('Delete this message?')) {
      const updated = messages.filter(m => m._id !== id);
      setMessages(updated);
      updateMessages(updated);
      if (selectedMsg?._id === id) setSelectedMsg(null);
    }
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = messages.map(m => m._id === id ? { ...m, isStarred: !m.isStarred } : m);
    setMessages(updated);
    updateMessages(updated);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] border border-gray-800 bg-[#0e0e0e] rounded-sm overflow-hidden animate-in fade-in duration-500">
      {/* List */}
      <div className={`w-full md:w-1/3 border-r border-gray-800 flex flex-col ${selectedMsg ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-800 bg-[#111]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Search inbox..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-700 text-sm p-2 pl-9 rounded-sm focus:border-primary outline-none text-white" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && <div className="p-8 text-center text-gray-500 text-xs">No messages found</div>}
          {filtered.map(msg => (
            <div 
              key={msg._id} 
              onClick={() => handleSelect(msg)}
              className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-[#151515] transition-colors relative group ${selectedMsg?._id === msg._id ? 'bg-[#1a1a1a] border-l-2 border-l-primary' : ''} ${!msg.isRead ? 'bg-[#111]' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                 <h4 className={`text-sm truncate pr-4 ${!msg.isRead ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>{msg.fullName}</h4>
                 <span className="text-[10px] text-gray-600 whitespace-nowrap">{new Date(msg.createdAt || '').toLocaleDateString()}</span>
              </div>
              <p className={`text-xs truncate mb-2 ${!msg.isRead ? 'text-gray-200' : 'text-gray-500'}`}>{msg.subject || 'No Subject'}</p>
              
              <div className="flex items-center justify-between">
                 {msg.isRecruiter && (
                    <span className="text-[9px] bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                       Recruiter
                    </span>
                 )}
                 <div className="flex items-center gap-2 ml-auto">
                    <button onClick={(e) => toggleStar(e, msg._id!)} className={`${msg.isStarred ? 'text-yellow-500' : 'text-gray-700 hover:text-gray-400'}`}>
                      <Star size={12} fill={msg.isStarred ? "currentColor" : "none"} />
                    </button>
                    {!msg.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className={`w-full md:w-2/3 bg-[#0a0a0a] flex flex-col ${!selectedMsg ? 'hidden md:flex' : 'flex'}`}>
        {selectedMsg ? (
          <>
            <div className="p-6 border-b border-gray-800 flex justify-between items-start">
               <div>
                 <button onClick={() => setSelectedMsg(null)} className="md:hidden text-gray-500 mb-4 flex items-center gap-1 text-xs"><ChevronRight className="rotate-180" size={12}/> Back</button>
                 <div className="flex items-center gap-2 mb-2">
                    {selectedMsg.isRecruiter && <Briefcase size={16} className="text-green-500" />}
                    <h2 className="text-xl font-bold text-white">{selectedMsg.subject || 'No Subject'}</h2>
                 </div>
                 
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-xs">
                     {selectedMsg.fullName.charAt(0)}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-300">
                        {selectedMsg.fullName} 
                        {selectedMsg.organization && <span className="text-gray-500 font-normal"> from {selectedMsg.organization}</span>}
                        <span className="text-gray-600 font-normal"> &lt;{selectedMsg.email}&gt;</span>
                     </p>
                     <p className="text-[10px] text-gray-500">To: You • {new Date(selectedMsg.createdAt || '').toLocaleString()}</p>
                   </div>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleDelete(selectedMsg._id!)} className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-sm transition-colors" title="Delete">
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
               <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
            </div>
            <div className="p-6 border-t border-gray-800 bg-[#0e0e0e]">
               <a 
                 href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                 className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-gray-200"
               >
                 <Reply size={14} /> Reply via Gmail
               </a>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
             <Mail size={48} className="mb-4 opacity-20" />
             <p className="text-xs uppercase tracking-widest font-bold">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SECURITY COMPONENT ---

const SecurityTab = ({ passForm, setPassForm, passStatus, handleUpdatePassword, logs, onExport, onImportTrigger }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
       <div className="lg:col-span-2 space-y-8">
         {/* Lockdown Status */}
         <div className="bg-[#0e0e0e] border border-gray-800 p-8 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
               <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-900/50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-green-500 font-bold uppercase">System Secure</span>
               </div>
            </div>
            <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
              <ShieldCheck size={24} className="text-primary" /> Active Protection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-[#111] border border-gray-800 rounded-sm flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">Two-Factor Auth</span>
                  <span className="text-xs font-black text-green-500 uppercase">Enabled</span>
               </div>
               <div className="p-4 bg-[#111] border border-gray-800 rounded-sm flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">Session Timeout</span>
                  <span className="text-xs font-black text-white uppercase">30 Mins</span>
               </div>
               <div className="p-4 bg-[#111] border border-gray-800 rounded-sm flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">Public IP Access</span>
                  <span className="text-xs font-black text-yellow-500 uppercase">Monitored</span>
               </div>
               <div className="p-4 bg-[#111] border border-gray-800 rounded-sm flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">CMS Database</span>
                  <span className="text-xs font-black text-green-500 uppercase">Encrypted</span>
               </div>
            </div>
         </div>

         {/* DATA VAULT / BACKUP SECTION */}
         <div className="bg-[#0e0e0e] border border-gray-800 p-8 rounded-sm relative overflow-hidden">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-3">
              <Database size={20} className="text-blue-500" /> Data Persistence & Backup
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-1 p-5 bg-[#111] border border-gray-800 rounded-sm">
                  <h4 className="text-sm font-bold text-white mb-2">Create Restore Point</h4>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Download a full backup of all Projects, Services, Experience, and Identity data. Use this to restore your portfolio if data is lost.
                  </p>
                  <button onClick={onExport} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                     <Download size={14} /> Download Backup
                  </button>
               </div>
               <div className="flex-1 p-5 bg-[#111] border border-gray-800 rounded-sm">
                  <h4 className="text-sm font-bold text-white mb-2">Restore from Backup</h4>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Overwrite current site data with a previously saved backup file. This action cannot be undone.
                  </p>
                  <button onClick={onImportTrigger} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                     <UploadCloud size={14} /> Upload Backup File
                  </button>
               </div>
            </div>
         </div>

         {/* Security Logs */}
         <div className="bg-[#0e0e0e] border border-gray-800 rounded-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Lock size={16} /> Audit Log
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.map((log: SecurityLog) => (
                <div key={log.id} className="flex items-center justify-between p-3 border-b border-gray-800/50 text-xs font-mono">
                   <div>
                     <span className={`font-bold ${log.status === 'CRITICAL' ? 'text-red-500' : log.status === 'WARNING' ? 'text-yellow-500' : 'text-green-500'}`}>
                       [{log.status}]
                     </span> <span className="text-gray-300 ml-2">{log.action}</span>
                   </div>
                   <div className="text-gray-600">
                     {new Date(log.timestamp).toLocaleString()}
                   </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-gray-600 text-xs">No logs recorded.</p>}
            </div>
         </div>
       </div>

       {/* Credentials Update */}
       <div className="bg-[#0e0e0e] border border-gray-800 p-8 rounded-sm h-fit">
          <h3 className="text-lg font-black uppercase italic mb-6">Update Credentials</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Admin Email</label>
              <input 
                type="email" 
                value={passForm.email} 
                onChange={e => setPassForm({...passForm, email: e.target.value})} 
                className="w-full bg-black border border-gray-800 p-3 rounded-sm text-sm text-white focus:border-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">New Password</label>
              <input 
                type="password" 
                value={passForm.password} 
                onChange={e => setPassForm({...passForm, password: e.target.value})} 
                className="w-full bg-black border border-gray-800 p-3 rounded-sm text-sm text-white focus:border-primary outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Confirm Password</label>
              <input 
                type="password" 
                value={passForm.confirm} 
                onChange={e => setPassForm({...passForm, confirm: e.target.value})} 
                className="w-full bg-black border border-gray-800 p-3 rounded-sm text-sm text-white focus:border-primary outline-none" 
              />
            </div>

            {passStatus === 'success' && <div className="text-green-500 text-xs font-bold text-center">Credentials Updated Successfully</div>}
            {passStatus === 'error' && <div className="text-red-500 text-xs font-bold text-center">Update Failed</div>}
            
            <button type="submit" className="w-full bg-primary text-black font-black py-4 rounded-sm uppercase text-[10px] tracking-[3px] hover:bg-white transition-colors">
              Update Profile
            </button>
          </form>
       </div>
    </div>
  );
};

export default Admin;
