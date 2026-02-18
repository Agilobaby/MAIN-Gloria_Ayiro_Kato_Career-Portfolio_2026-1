
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Removed loginWithGoogle as it is not exported from ../services/api
import { login } from '../services/api';
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, User, ChevronLeft, UserPlus } from 'lucide-react';
import { PROFILE_IMAGE } from '../constants';

type LoginStep = 'main' | 'google-choose' | 'google-password';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('main');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const ADMIN_EMAIL = 'ayirogloria@gmail.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/admin');
    } catch (err) {
      setError('Authorization failed. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGoogleFlow = () => {
    setStep('google-choose');
    setError('');
  };

  const selectGoogleAccount = (selectedEmail: string) => {
    if (selectedEmail === ADMIN_EMAIL) {
      setStep('google-password');
    } else {
      setError(`Access denied for ${selectedEmail}. Only the primary admin account can sign in.`);
    }
  };

  const handleGooglePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await login(ADMIN_EMAIL, googlePassword);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/admin');
    } catch (err) {
      setError('Wrong password. Try again or click Forgot password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    const subject = encodeURIComponent("Admin Access Recovery Request");
    const body = encodeURIComponent("I am requesting a secure recovery for my portfolio admin credentials.\n\nAdmin Email: ayirogloria@gmail.com");
    window.location.href = `mailto:ayirogloria@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-2/3 h-2/3 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-2/3 h-2/3 bg-blue-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[450px] z-10">
        
        {/* Step 1: Main Login */}
        {step === 'main' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-sm mb-6 shadow-[0_0_40px_rgba(255,180,0,0.4)]">
                <ShieldCheck size={40} className="text-black" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                Admin <span className="text-primary">Core</span>
              </h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[5px] mt-3">Authorized Access Only</p>
            </div>

            <div className="bg-[#0e0e0e] border border-gray-800 p-8 shadow-2xl relative group rounded-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
              
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 text-[10px] font-black uppercase tracking-widest text-center rounded-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-sm focus:outline-none focus:border-primary text-white transition-all text-sm placeholder:text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Access Key</label>
                    <button type="button" onClick={handleForgotPassword} className="text-[9px] font-bold text-primary uppercase tracking-wider hover:opacity-70">Forgot Key?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-sm focus:outline-none focus:border-primary text-white transition-all text-sm placeholder:text-gray-800"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black font-black py-4 rounded-sm flex items-center justify-center gap-3 uppercase text-xs tracking-[4px] hover:bg-white transition-all shadow-[0_10px_30_rgba(255,180,0,0.5)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Initiate Session'} <ArrowRight size={18} />
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-gray-800"></div>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[3px]">OR</span>
                <div className="flex-1 h-[1px] bg-gray-800"></div>
              </div>

              <button 
                type="button" 
                onClick={startGoogleFlow}
                className="w-full bg-white text-black font-black py-4 rounded-sm flex items-center justify-center gap-3 uppercase text-xs tracking-[3px] hover:bg-gray-200 transition-all border border-transparent"
              >
                <GoogleIcon size={20} />
                Continue with Google
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Google Account Chooser (MATCHING SCREENSHOT) */}
        {step === 'google-choose' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-md shadow-2xl overflow-hidden border border-gray-200">
            {/* Top Google Bar */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <GoogleIcon size={18} />
              <span className="text-gray-600 text-[13px] font-medium">Sign in with Google</span>
            </div>

            <div className="p-8 md:p-10 pt-6">
              <div className="flex flex-col items-center mb-8">
                {/* Brand Logo - stylized G */}
                <div className="w-12 h-12 bg-white flex items-center justify-center mb-6">
                  <svg viewBox="0 0 48 48" className="w-10 h-10">
                    <path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/>
                    <path fill="#ffffff" d="M24,10c-7.732,0-14,6.268-14,14s6.268,14,14,14s14-6.268,14-14S31.732,10,24,10z M24,34c-5.523,0-10-4.477-10-10s4.477-10,10-10s10,4.477,10,10S29.523,34,24,34z"/>
                    <path fill="#ffffff" d="M24,15c-4.971,0-9,4.029-9,9s4.029,9,9,9s9-4.029,9-9S28.971,15,24,15z M24,30c-3.314,0-6-2.686-6-6s2.686-6,6-6s6,2.686,6,6S27.314,30,24,30z"/>
                  </svg>
                </div>
                <h2 className="text-[26px] font-normal text-[#202124] mb-2 tracking-tight">Choose an account</h2>
                <p className="text-[#202124] text-[15px]">
                  to continue to <span className="text-[#1a73e8] hover:underline cursor-pointer font-medium">Gloria Kato Portfolio</span>
                </p>
              </div>

              {error && (
                 <div className="mb-6 bg-red-50 text-red-600 p-3 rounded text-[13px] text-center border border-red-100 animate-in shake duration-300">
                   {error}
                 </div>
              )}

              <div className="space-y-0 border-t border-gray-200 mt-2">
                <GoogleAccountItem 
                  name="Gloria Kato" 
                  email="agilokato58@gmail.com" 
                  initial="G"
                  onClick={() => selectGoogleAccount('agilokato58@gmail.com')} 
                />
                <GoogleAccountItem 
                  name="gloria kato" 
                  email={ADMIN_EMAIL} 
                  image={PROFILE_IMAGE} 
                  onClick={() => selectGoogleAccount(ADMIN_EMAIL)} 
                />
                <GoogleAccountItem 
                  name="Gloria Ayiro" 
                  email="gloriaayiro@gmail.com" 
                  initial="G"
                  color="#009688"
                  onClick={() => selectGoogleAccount('gloriaayiro@gmail.com')} 
                />
                <button 
                  onClick={() => setError("This feature is limited for demo purposes.")}
                  className="w-full flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300">
                    <UserPlus size={18} className="text-gray-600" />
                  </div>
                  <span className="text-[14px] font-medium text-[#202124]">Use another account</span>
                </button>
              </div>

              <div className="mt-8">
                 <button 
                  onClick={() => setStep('main')}
                  className="text-[#5f6368] text-[14px] font-medium hover:bg-gray-50 px-3 py-2 rounded transition-colors flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Google Password Verification */}
        {step === 'google-password' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 bg-white p-10 rounded-lg shadow-2xl text-black border border-gray-200">
            <div className="flex justify-center mb-6">
              <GoogleIcon size={32} />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] text-center mb-2">Welcome</h2>
            
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full bg-white hover:bg-gray-50 cursor-default transition-colors">
                <img src={PROFILE_IMAGE} className="w-5 h-5 rounded-full object-cover" alt="Gloria" />
                <span className="text-sm font-medium text-gray-700">{ADMIN_EMAIL}</span>
              </div>
            </div>

            <form onSubmit={handleGooglePasswordSubmit} className="space-y-8">
              <div className="space-y-2">
                <input 
                  type="password" 
                  autoFocus
                  required
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-b-2 border-gray-200 focus:border-[#1a73e8] outline-none p-2 text-base transition-colors placeholder:text-gray-400"
                />
                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button type="button" className="text-[#1a73e8] text-sm font-bold hover:bg-blue-50 px-2 py-1 rounded">Forgot password?</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#1a73e8] text-white px-8 py-2 rounded font-medium hover:bg-[#1557b0] transition-colors flex items-center gap-2 disabled:bg-blue-300"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Next'}
                </button>
              </div>
            </form>

            <button 
              onClick={() => setStep('google-choose')}
              className="mt-12 text-[#5f6368] text-sm hover:underline"
            >
              Change account
            </button>
          </div>
        )}

        {/* Global Footer Navigation */}
        {step === 'main' && (
          <div className="mt-10 text-center">
            <Link 
              to="/" 
              className="inline-block text-[10px] text-gray-500 hover:text-primary transition-colors uppercase tracking-[4px] font-black no-underline"
            >
              ← Return to Website
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
    />
    <path
      fill="#34A853"
      d="M16.04 18.013c-1.09.696-2.43 1.077-3.841 1.077a7.11 7.11 0 0 1-6.933-4.909l-4.025 3.115a11.96 11.96 0 0 0 10.958 6.604c3.15 0 6.033-1.018 8.35-2.748l-4.509-3.139Z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.275c0-.668-.067-1.309-.19-1.924H12v4.464h6.442a5.504 5.504 0 0 1-2.387 3.6l4.507 3.14c2.633-2.433 4.15-6.014 4.15-9.423Z"
    />
    <path
      fill="#FBBC05"
      d="M5.266 14.181l-4.026 3.115A11.95 11.95 0 0 1 0 12c0-1.936.45-3.765 1.24-5.414l4.026 3.179a7.087 7.087 0 0 0 0 4.416Z"
    />
  </svg>
);

const GoogleAccountItem = ({ name, email, image, initial, color = "#1a73e8", onClick }: { name: string, email: string, image?: string, initial?: string, color?: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
  >
    <div 
      className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 text-white font-medium text-[13px]"
      style={{ backgroundColor: image ? 'transparent' : color }}
    >
      {image ? (
        <img src={image} className="w-full h-full object-cover" alt={name} />
      ) : (
        initial || name.charAt(0).toUpperCase()
      )}
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[14px] font-medium text-[#202124] truncate leading-tight">{name}</p>
      <p className="text-[12px] text-[#5f6368] truncate">{email}</p>
    </div>
  </button>
);

export default Login;
