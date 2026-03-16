
import axios from 'axios';
import { API_URL, INITIAL_SERVICES } from '../constants';
import { Project, Experience, Message, AuthResponse, IdentityData, PortfolioDraft, ServiceDetailData, VisitorLog, SecurityLog, Recommendation } from '../types';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const STORAGE_KEYS = {
  PROJECTS: 'portfolio_projects',
  EXPERIENCE: 'portfolio_experience_v3', 
  SERVICES: 'portfolio_services',
  MESSAGES: 'portfolio_messages',
  ADMIN_PASS: 'admin_pass',
  ADMIN_CREDS: 'portfolio_admin_creds', 
  IDENTITY: 'portfolio_identity_v5_idb', // Bumped version and moved to IDB
  VISITOR_LOGS: 'portfolio_visitor_logs',
  SECURITY_LOGS: 'portfolio_security_logs',
  RECOMMENDATIONS: 'portfolio_recommendations'
};

const DEFAULT_IDENTITY: IdentityData = {
  fullName: 'Gloria Kato',
  role: 'Education Technology Professional and Digital Support',
  age: '24',
  residence: 'Kenya',
  address: 'Nairobi/Kiambu',
  email: 'ayirogloria@gmail.com',
  bio: `I am a flexible digital support and operations expert with hands-on experience supporting technology, users, and day-to-day workflows in both organized and fast-paced environments.\n\nI have significant experience working in educational institutions, where I helped students, instructors, and staff through the effective use of technology and digital tools. My experience includes IT and helpdesk support, device setup and debugging, digital tool onboarding, data and inventory management, and day-to-day operations coordination.\n\nThroughout my career, I've worked with diverse teams to coordinate training sessions, conduct project-based activities, and ensure systems and procedures run smoothly.\n\nIn addition to technical and operational support, I have helped teams create digital content, provided basic web and design support, and prepared educational and presentation materials.\n\nI am open to remote and hybrid possibilities in a variety of industries where I can apply my technological support, operations, coordination, and digital abilities while also growing and expanding my experience.`,
  socialLinks: [
    { platform: 'linkedin', url: 'https://linkedin.com/in/' },
    { platform: 'github', url: 'https://github.com/' },
    { platform: 'website', url: 'https://gloriakato.com/' },
    { platform: 'email', url: 'mailto:ayirogloria@gmail.com' },
    { platform: 'twitter', url: 'https://x.com/' }
  ],
  languages: [{ name: 'English', level: 100 }, { name: 'Swahili', level: 100 }],
  skills: [
    { name: 'Google Workspace', level: 98 },
    { name: 'STEM & Coding', level: 90 },
    { name: 'Tech Integration', level: 95 },
    { name: 'Web Design', level: 85 },
    { name: 'Web Dev', level: 80 },
    { name: 'Graphic Design', level: 85 },
    { name: 'ICT Support', level: 90 }
  ],
  extraSkills: [
    'AWS Cloud',
    'AppSheet',
    'Hardware Repair',
    'Data Analysis',
    'Virtual Assistance',
    'Woodworking',
    'Adobe Illustrator'
  ]
};

const DEFAULT_PROJECTS: Project[] = [
  { _id: '1', title: 'Tech Integration', category: 'Education', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800' },
  { _id: '2', title: 'Web Design', category: 'Creative', image: 'https://images.unsplash.com/photo-1541462608141-ad60317056b2?q=80&w=800' },
  { _id: '3', title: 'Web Development', category: 'Technical', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800' },
  { _id: '4', title: 'Google Workspace', category: 'Administration', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800' },
  { _id: '5', title: 'STEM & Coding', category: 'Education', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800' },
  { _id: '6', title: 'Graphic Design', category: 'Creative', image: 'https://images.unsplash.com/photo-1626785774583-b756e9cd181d?q=80&w=800' },
  { _id: '7', title: 'ICT Support', category: 'Technical', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800' }
];

const DEFAULT_EXPERIENCE: Experience[] = [
  { 
    _id: 'e1', 
    type: 'education', 
    title: 'St. Paul’s University, Limuru', 
    role: 'DIPLOMA IN BUSINESS AND INFORMATION TECHNOLOGY', 
    date: 'GRADUATED: NOVEMBER 2024', 
    description: 'Focus: Business operations, computer systems, information management, IT fundamentals.' 
  },
  { 
    _id: 'e2', 
    type: 'education', 
    title: 'AWS Certified Cloud Practitioner', 
    role: 'CERTIFICATION - AWS RE/START', 
    date: 'AUG 2024', 
    description: 'Professional certification focusing on cloud infrastructure and foundational cloud services.' 
  },
  { 
    _id: 'e3', 
    type: 'education', 
    title: 'Certificate in Data Analysis', 
    role: 'CERTIFICATION - AJIRA', 
    date: 'JUN 2024', 
    description: 'Specialized training in data collection, processing, and visual presentation for business insights.' 
  },
  { 
    _id: 'e4', 
    type: 'education', 
    title: 'Certificate in Virtual Assistance', 
    role: 'CERTIFICATION - AJIRA', 
    date: 'JAN 2024', 
    description: 'Comprehensive training in remote administrative support and executive coordination.' 
  },
  {
    _id: 'w1',
    type: 'work',
    role: 'Operations & Executive Support Associate',
    date: 'Sept 2025 - Dec 2025',
    title: 'International School of Kenya (ISK)',
    description: 'Reviewed operational requests, case notes, and queries to decide on the right actions according to company procedures. Used internal guidelines to resolve tasks consistently. Created organized summaries for planning, ensuring compliance and making decisions. Handled several cases simultaneously, managing priority and urgency.'
  },
  {
    _id: 'w2',
    type: 'work',
    role: 'Technology & Operations Partner',
    date: 'April 2025 - Dec 2025',
    title: 'International School of Kenya/Children’s Garden Home and School',
    description: 'Evaluated current administrative and educational processes to transition key operations from paper-based methods to digital systems. Assessed procedural documents and instructed staff on proper implementation. Trained personnel on Google Workspace to increase productivity and served as the main problem-solver for technical difficulties.'
  },
  {
    _id: 'w3',
    type: 'work',
    role: 'Technology & Executive Support Associate',
    date: 'Jan 2025 - Sep 2025',
    title: 'International School of Kenya (ISK)',
    description: 'Provided technical and operational support to staff, students, and leaders. Managed setting up devices, fixing them, keeping track of inventory, and reporting problems. Kept careful records, logs, and dashboards up-to-date. Balanced fixing urgent problems with system health, collaborating with leadership on operational improvements.'
  },
  {
    _id: 'w4',
    type: 'work',
    role: 'Private Education Support Coordinator (Contract)',
    date: 'Feb 2024 - July 2024',
    title: 'Private Family Engagement',
    description: 'Managed educational support cases by coordinating schedules, deliverables, and learning plans. Reviewed requirements and documentation to ensure services aligned with agreed goals. Designed and developed workflows to ensure consistency, quality, and progress without micromanagement.'
  },
  {
    _id: 'w5',
    type: 'work',
    role: 'Casual Summer IT Support',
    date: 'Jun 2025 - Jul 2025',
    title: 'International School of Kenya (ISK)',
    description: 'Prepared Chromebooks for the new term: cleaning, updating, and testing features. Managed accurate inventory tracking in Google Sheets and ensured high-volume device maintenance met rigorous school standards.'
  },
  {
    _id: 'w6',
    type: 'work',
    role: 'Teaching Assistant',
    date: 'Jan 2022 - Apr 2022',
    title: 'Nione Initiative Foundation',
    description: 'Assisted special needs students with classroom routines and reading, fostering a nurturing and inclusive learning environment. Demonstrated ownership of outcomes by modifying plans to limits or student changes.'
  }
];

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec1',
    name: 'Sarah Jenkins',
    role: 'Principal',
    company: 'International School',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    text: 'Gloria transformed our digital infrastructure. Her ability to train staff while managing complex migrations is unmatched.',
    rating: 5
  },
  {
    id: 'rec2',
    name: 'David Okoth',
    role: 'Director of Operations',
    company: 'Tech Solutions Ltd',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
    text: 'A proactive problem solver. Gloria’s insights into workflow automation saved us countless hours.',
    rating: 5
  },
  {
    id: 'rec3',
    name: 'Emily Chen',
    role: 'Lead Educator',
    company: 'STEM Forward',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
    text: 'Her dedication to student learning through technology is inspiring. She makes complex concepts accessible to everyone.',
    rating: 5
  },
  {
    id: 'rec4',
    name: 'Michael Ross',
    role: 'IT Manager',
    company: 'Global Systems',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    text: 'Efficient, knowledgeable, and always ready to tackle the hardest problems. A true professional.',
    rating: 5
  },
  {
    id: 'rec5',
    name: 'Linda Kimani',
    role: 'Head of Admin',
    company: 'Nairobi Academy',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
    text: 'The transition to Google Workspace was seamless thanks to Gloria. Her training sessions were excellent.',
    rating: 5
  },
  {
    id: 'rec6',
    name: 'James Mwangi',
    role: 'Founder',
    company: 'StartUp Kenya',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    text: 'She brought our vision to life with a website that is both beautiful and highly functional.',
    rating: 5
  }
];

// --- INDEXED DB HELPER (For Large Data) ---
const DB_NAME = 'PortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
};

const idbGet = async <T>(key: string): Promise<T | undefined> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("IndexedDB Read Error:", e);
    return undefined;
  }
};

const idbSet = async (key: string, val: any): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(val, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

// --- DATA ACCESS LAYERS ---

const getFromStorage = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialData;
  }
};

const saveToStorage = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(data) }));
  } catch (e) {
    console.error("LocalStorage Save Error (Quota?):", e);
  }
};

const getHeavyData = async <T>(key: string, defaultVal: T): Promise<T> => {
  // 1. Try MongoDB via public API (no login needed — works for ALL visitors)
  try {
    const baseURL = (API_URL || 'http://localhost:5000/api').replace('/api', '');
    const res = await fetch(`${baseURL}/api/cms/public/${key}`);
    if (res.ok) {
      const data = await res.json();
      if (data !== undefined && data !== null) {
        return data as T;
      }
    }
  } catch (e) {
    console.warn('MongoDB CMS fetch failed, falling back to IndexedDB:', e);
  }

  // 2. Try IndexedDB (local fallback)
  const dbVal = await idbGet<T>(key);
  if (dbVal) return dbVal;

  // 3. Try LocalStorage (migration path)
  const lsVal = localStorage.getItem(key);
  if (lsVal) {
    try {
      const parsed = JSON.parse(lsVal);
      await idbSet(key, parsed);
      return parsed;
    } catch {
      // invalid data in LS
    }
  }

  // 4. Fallback to default
  try {
    await idbSet(key, defaultVal);
  } catch (e) {
    console.error("Failed to initialize IndexedDB with defaults", e);
  }
  return defaultVal;
};

const saveHeavyData = async <T>(key: string, data: T) => {
  // 1. Save to MongoDB (syncs across all devices)
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/cms/content', { key, data });
    }
  } catch (e) {
    console.warn('MongoDB CMS save failed, saving locally only:', e);
  }

  // 2. Also save to IndexedDB (local backup)
  try {
    await idbSet(key, data);
    const timestamp = Date.now().toString();
    localStorage.setItem(key + '_version', timestamp);
    window.dispatchEvent(new StorageEvent('storage', { key: key }));
  } catch (e) {
    console.error("Failed to save to IndexedDB", e);
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (lsErr) {
      console.error("Critical: LocalStorage backup also failed", lsErr);
    }
  }
};

// --- BACKUP & RESTORE SYSTEM ---

export const exportFullBackup = async () => {
  const identity = await getIdentity();
  const projects = await getProjects();
  const experience = await getExperience();
  const services = await getServices();
  const messages = await getMessages();
  const recommendations = await getRecommendations();
  
  const backup = {
    version: '1.2',
    timestamp: new Date().toISOString(),
    data: {
      identity,
      projects,
      experience,
      services,
      messages,
      recommendations
    }
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Portfolio_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFullBackup = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.data) throw new Error("Invalid backup file format");

        const { identity, projects, experience, services, messages, recommendations } = json.data;

        // Restore to IndexedDB
        await savePortfolioDraft({ 
          identity, 
          projects, 
          experience, 
          services,
          recommendations: recommendations || DEFAULT_RECOMMENDATIONS 
        });
        updateMessages(messages || []);

        logSecurityEvent('LOCKDOWN_TOGGLE', 'SUCCESS'); // Reusing type for System Restore
        resolve(true);
      } catch (err) {
        console.error("Restore failed:", err);
        reject(false);
      }
    };
    reader.readAsText(file);
  });
};


// --- ANALYTICS & SECURITY LOGIC ---

export const logVisit = async () => {
  const logs = getFromStorage<VisitorLog[]>(STORAGE_KEYS.VISITOR_LOGS, []);
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const freshLogs = logs.filter(log => new Date(log.timestamp).getTime() > oneDayAgo);
  
  const userAgent = navigator.userAgent;
  let device = 'Desktop';
  if (/Mobi|Android/i.test(userAgent)) device = 'Mobile';
  else if (/iPad|Tablet/i.test(userAgent)) device = 'Tablet';

  let browser = 'Unknown';
  if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
  else if (userAgent.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
  else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) browser = "Opera";
  else if (userAgent.indexOf("Trident") > -1) browser = "Internet Explorer";
  else if (userAgent.indexOf("Edge") > -1) browser = "Edge";
  else if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
  else if (userAgent.indexOf("Safari") > -1) browser = "Safari";

  let ip = sessionStorage.getItem('visitor_ip');
  let location = sessionStorage.getItem('visitor_loc');
  let organization = sessionStorage.getItem('visitor_org');

  if (!ip || !location || !organization) {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      ip = data.ip || 'Unknown IP';
      location = data.city && data.country_code ? `${data.city}, ${data.country_code}` : 'Unknown Location';
      organization = data.org || 'Unknown ISP';
      
      sessionStorage.setItem('visitor_ip', ip);
      sessionStorage.setItem('visitor_loc', location);
      sessionStorage.setItem('visitor_org', organization);
    } catch (e) {
      ip = '127.0.0.1 (Hidden)';
      location = 'Unknown Location';
      organization = 'Private Network';
    }
  }

  const newLog: VisitorLog = {
    id: Date.now().toString(),
    ip: ip!,
    location: location!,
    organization: organization!,
    device,
    browser,
    timestamp: new Date().toISOString(),
    page: window.location.hash || 'Home'
  };

  const updatedLogs = [newLog, ...freshLogs];
  saveToStorage(STORAGE_KEYS.VISITOR_LOGS, updatedLogs);
};

export const getVisitorLogs = async () => {
  const logs = getFromStorage<VisitorLog[]>(STORAGE_KEYS.VISITOR_LOGS, []);
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  return logs.filter(log => new Date(log.timestamp).getTime() > oneDayAgo);
};

export const logSecurityEvent = (action: SecurityLog['action'], status: SecurityLog['status']) => {
  const logs = getFromStorage<SecurityLog[]>(STORAGE_KEYS.SECURITY_LOGS, []);
  const ip = sessionStorage.getItem('visitor_ip') || 'System/Admin';
  
  const newLog: SecurityLog = {
    id: Date.now().toString(),
    action,
    status,
    ip,
    timestamp: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.SECURITY_LOGS, [newLog, ...logs].slice(0, 100));
};

export const getSecurityLogs = async () => getFromStorage<SecurityLog[]>(STORAGE_KEYS.SECURITY_LOGS, []);

// --- AUTH & DATA ---

export const getAdminCredentials = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) { return null; }
  }
  return null;
};

export const login = async (email: string, password: string) => {
  let validEmail = 'ayirogloria@gmail.com';
  let validPass = '5860gloriaKATO';
  
  const customCreds = getAdminCredentials();
  if (customCreds && customCreds.email && customCreds.password) {
    validEmail = customCreds.email;
    validPass = customCreds.password;
  } else {
    const legacyPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS);
    if (legacyPass) validPass = legacyPass;
  }

  try {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    logSecurityEvent('LOGIN_SUCCESS', 'SUCCESS');
    return res.data;
  } catch (error) {
    logSecurityEvent('LOGIN_FAIL', 'WARNING');
    throw error;
  }

};

export const updateAdminCredentials = async (email: string, password: string) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify({ email, password }));
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, password);
  logSecurityEvent('PASSWORD_CHANGE', 'CRITICAL');
  return { success: true };
};

export const updatePassword = async (newPass: string) => {
  const currentCreds = getAdminCredentials();
  const currentEmail = currentCreds?.email || 'ayirogloria@gmail.com';
  return updateAdminCredentials(currentEmail, newPass);
};

// --- HEAVY DATA GETTERS (Using IDB) ---
export const getProjects = async () => getHeavyData<Project[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
export const getExperience = async () => getHeavyData<Experience[]>(STORAGE_KEYS.EXPERIENCE, DEFAULT_EXPERIENCE);
export const getServices = async () => getHeavyData<ServiceDetailData[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
export const getRecommendations = async () => getHeavyData<Recommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, DEFAULT_RECOMMENDATIONS);
export const getIdentity = async (): Promise<IdentityData> => getHeavyData<IdentityData>(STORAGE_KEYS.IDENTITY, DEFAULT_IDENTITY);

// --- LIGHT DATA GETTERS (Using LS) ---
export const getMessages = async () => getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);

// --- DATA SAVERS ---

export const savePortfolioDraft = async (draft: PortfolioDraft) => {
  // Save ALL large datasets to IndexedDB for reliability
  await saveHeavyData(STORAGE_KEYS.IDENTITY, draft.identity);
  await saveHeavyData(STORAGE_KEYS.PROJECTS, draft.projects);
  await saveHeavyData(STORAGE_KEYS.EXPERIENCE, draft.experience);
  await saveHeavyData(STORAGE_KEYS.SERVICES, draft.services);
  await saveHeavyData(STORAGE_KEYS.RECOMMENDATIONS, draft.recommendations);
};

export const saveServices = async (services: ServiceDetailData[]) => {
  await saveHeavyData(STORAGE_KEYS.SERVICES, services);
};

export const saveProjects = async (projects: Project[]) => {
  await saveHeavyData(STORAGE_KEYS.PROJECTS, projects);
};

export const saveRecommendations = async (recommendations: Recommendation[]) => {
  await saveHeavyData(STORAGE_KEYS.RECOMMENDATIONS, recommendations);
};

export const updateMessages = async (messages: Message[]) => {
  saveToStorage(STORAGE_KEYS.MESSAGES, messages);
};

export const sendMessage = async (data: Omit<Message, '_id'>) => {
  const current = getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
  const newMessage = { 
    ...data, 
    _id: Date.now().toString(), 
    createdAt: new Date().toISOString(),
    isRead: false,
    isStarred: false,
    isRecruiter: !!data.isRecruiter,
    organization: data.organization || sessionStorage.getItem('visitor_org') || 'Unknown'
  };
  saveToStorage(STORAGE_KEYS.MESSAGES, [newMessage, ...current]);
  
  if (data.isRecruiter) {
     logSecurityEvent('RECRUITER_IDENTIFIED', 'SUCCESS');
  }
  
  return { message: 'Logged' };
};

export default api;
