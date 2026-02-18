
export interface ProjectDocument {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'link' | 'video' | 'doc';
  content: string; // Base64 string or URL
}

export interface Project {
  _id?: string;
  title: string;
  category: string;
  image: string;
  link?: string;
  description?: string;
  documents?: ProjectDocument[];
}

export interface Experience {
  _id?: string;
  type: 'education' | 'work';
  title: string;
  role: string;
  date: string;
  description: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  desc: string;
  images: string[];
}

export interface ServiceDetailData {
  id: string;
  icon: string;
  title: string;
  desc: string;
  features: string[];
  tools: string[];
  whyMe: string[];
  caseStudies: CaseStudy[];
}

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  text: string;
  rating: number;
}

export interface Message {
  _id?: string;
  fullName: string;
  email: string;
  subject?: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
  isStarred?: boolean;
  isRecruiter?: boolean; // New field to flag identified recruiters
  organization?: string;
}

export interface User {
  _id: string;
  email: string;
  role: 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Skill {
  name: string;
  level: number;
}

export type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'website' | 'email' | 'whatsapp' | 'dribbble' | 'behance' | 'figma';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface IdentityData {
  fullName: string;
  role: string;
  bio: string;
  age: string;
  residence: string;
  address: string;
  email: string;
  socialLinks: SocialLink[];
  languages: Skill[];
  skills: Skill[];
  extraSkills: string[];
}

export interface PortfolioDraft {
  identity: IdentityData;
  projects: Project[];
  experience: Experience[];
  services: ServiceDetailData[];
  recommendations: Recommendation[];
}

export interface VisitorLog {
  id: string;
  ip: string; 
  location: string;
  organization: string; // New: Tracks ISP or Company Name
  device: string;
  browser: string;
  timestamp: string;
  page: string;
}

export interface SecurityLog {
  id: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'PASSWORD_CHANGE' | 'LOCKDOWN_TOGGLE' | 'RECRUITER_IDENTIFIED';
  ip: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}
