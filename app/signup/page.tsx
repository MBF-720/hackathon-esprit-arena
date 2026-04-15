"use client";
import { useState } from 'react';
import { signUpWithResume, saveToken } from '../lib/api';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!avatarFile) {
      setMessage('Veuillez uploader une photo de profil (Avatar).');
      return;
    }
    if (resumeFile && !resumeFile.name.toLowerCase().endsWith('.docx')) {
      setMessage('Le CV doit être un fichier .docx.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('avatar', avatarFile);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (githubUrl.trim()) formData.append('githubUrl', githubUrl.trim());
      if (linkedinUrl.trim()) formData.append('linkedinUrl', linkedinUrl.trim());
      
      const res = (await signUpWithResume(formData)) as { email?: string; message?: string; tokens?: { accessToken?: string } };
      
      // Si c'est une entreprise, on stocke l'intention pour après la vérification/login
      if (isCompany && companyName) {
        localStorage.setItem('pending_company_request', JSON.stringify({
          companyName,
          description: companyDescription,
          email: email.toLowerCase()
        }));
      }
      if (res?.tokens?.accessToken) {
        saveToken(res.tokens.accessToken);
      }
      const targetEmail = res?.email ?? email;
      setMessage(res?.message ?? 'Compte créé. Un code de vérification a été envoyé à votre email.');
      setTimeout(() => {
        window.location.assign(`/verify?email=${encodeURIComponent(targetEmail)}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : 'ENROLLMENT FAILED. PROTOCOL ERROR.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      
      {/* 1. Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[140px]"></div>
        {/* Decorative Hackathon Text */}
        <div className="absolute bottom-20 right-10 text-white/5 font-mono text-sm -rotate-12 select-none hidden lg:block uppercase tracking-widest">
          {"$> join_arena --talent=developer"} <br />
          {"status: waiting_for_registration..."}
        </div>
      </div>

      <div className="z-10 w-full max-w-lg">
        
        {/* 2. Modern Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            {/* User Plus / Hackathon Icon */}
            <svg className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5L12 10L5 7.5M12 10V17M12 3L5 5.5V13.5L12 16L19 13.5V5.5L12 3Z" />
              <circle cx="12" cy="12" r="10" className="opacity-10" />
            </svg>
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Create <span className="text-cyan-400">Account</span>
          </h1>
          <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase mt-2">New Participant Enrollment</p>
        </div>

        {/* 3. Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative">
          
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">FIRST NAME</label>
                <input 
                  placeholder="JOHN" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">LAST NAME</label>
                <input 
                  placeholder="DOE" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">CODENAME / EMAIL</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </span>
                <input 
                  type="email"
                  placeholder="USER@HACKER.SPACE" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">SECURITY KEY</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input 
                  type="password"
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">RESUME (CV) — .docx (optionnel)</label>
              <input 
                type="file"
                accept=".docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">GITHUB (optionnel)</label>
              <input 
                type="url"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">PHOTO DE PROFIL (AVATAR) — Requis</label>
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
                required
              />
            </div>

            <div className="pt-4 pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isCompany}
                    onChange={(e) => setIsCompany(e.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${isCompany ? 'bg-cyan-500' : 'bg-white/10'}`}></div>
                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isCompany ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                  S&apos;inscrire en tant qu&apos;Entreprise
                </span>
              </label>
            </div>

            {isCompany && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">NOM DE L&apos;ENTREPRISE</label>
                  <input 
                    placeholder="MA SOCIÉTÉ" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                    required={isCompany}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">DESCRIPTION DE L&apos;ENTREPRISE</label>
                  <textarea 
                    placeholder="DÉCRIVEZ VOTRE ACTIVITÉ..." 
                    value={companyDescription} 
                    onChange={(e) => setCompanyDescription(e.target.value)} 
                    className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm min-h-[100px]"
                    required={isCompany}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">LINKEDIN (optionnel)</label>
              <input 
                type="url"
                placeholder="https://www.linkedin.com/in/username/"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-cyan-500 text-black p-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ENROLLING...
                </>
              ) : 'REQUEST ACCESS'}
            </button>
          </form>

          {/* Navigation Links : Sign In depuis la page Sign Up */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-white/5"></div>
            <p className="text-white/30 text-[10px] tracking-widest uppercase font-mono text-center">
              Already have an account?{" "}
              <Link href="/signin" className="text-cyan-400 font-bold hover:underline underline-offset-4 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Message Feedback */}
        {message && (
          <div className={`mt-6 p-4 border rounded-xl text-[10px] w-full font-mono text-center tracking-widest leading-relaxed ${
            message.includes('CREATED') 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className="mr-2">[{message.includes('CREATED') ? 'SUCCESS' : 'SYSTEM_ERROR'}]</span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}