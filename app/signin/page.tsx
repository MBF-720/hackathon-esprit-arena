"use client";
import { useState } from 'react';
import { signIn, saveToken, requestCompanyRole } from '../lib/api';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = (await signIn({ email, password })) as any;
      if (res?.tokens?.accessToken) {
        saveToken(res.tokens.accessToken);
        
        // Gérer les demandes de rôle entreprise en attente
        const pending = localStorage.getItem('pending_company_request');
        if (pending) {
          try {
            const data = JSON.parse(pending);
            if (data.email === email.toLowerCase()) {
              await requestCompanyRole({ 
                companyName: data.companyName, 
                description: data.description 
              });
              localStorage.removeItem('pending_company_request');
              setMessage('AUTHENTICATED — COMPANY REQUEST SUBMITTED');
            }
          } catch (err) {
            console.error("Failed to submit pending company request", err);
          }
        } else {
          setMessage('AUTHENTICATED — REDIRECTING...');
        }

        const role = (res as { user?: { role?: string } })?.user?.role;
        // Navigation pleine page : évite l’erreur client « Failed to fetch » (RSC/Turbopack) sur router.push après login
        const dest = role === "ADMIN" ? "/dashboard" : "/hackathon";
        window.location.assign(dest);
      } else {
        setMessage('ACCESS DENIED: NO TOKEN');
      }
    } catch (err: any) {
      setMessage(err?.message || "IDENTITY VERIFICATION FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans text-white">
      <div className="relative z-10 w-full max-w-md">
        
        {/* 2. Modern Hackathon Header */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-4">
            {/* The Main Brain/Gear Modern SVG */}
            <svg className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h3" />
              <circle cx="12" cy="12" r="9" className="opacity-20" />
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            </svg>
            {/* Live Indicator Dot */}
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Arena <span className="text-cyan-400">Of</span> Coders
          </h1>
          <div className="h-1 w-12 bg-cyan-500 mt-2 rounded-full"></div>
        </div>

        {/* 3. Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative">
          {/* Corner Accent */}
          <div className="absolute top-0 right-0 p-4">
             <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase opacity-50">v2.0.26</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
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
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono text-sm"
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
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-cyan-500 text-black p-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  VALIDATING...
                </>
              ) : 'INITIALIZE ACCESS'}
            </button>
          </form>

          {/* 4. Refined Navigation Links */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href="/forgot-password" className="text-white/40 text-[10px] hover:text-cyan-400 transition-colors tracking-widest uppercase">
              Lost access credentials?
            </Link>
            <div className="w-full h-px bg-white/5"></div>
            <p className="text-white/30 text-[10px] tracking-widest uppercase">
              Not in the system? 
              <Link href="/signup" className="ml-2 text-cyan-400 font-bold hover:underline underline-offset-4 transition-all">
                REQUEST CLEARANCE
              </Link>
            </p>
          </div>
        </div>

        {/* 5. Terminal Feedback Message — vert si succès, rouge si erreur */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-xl text-[10px] w-full font-mono text-center tracking-widest leading-relaxed ${
              message.includes("AUTHENTICATED")
                ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            <span className="mr-2">[{message.includes("AUTHENTICATED") ? "SUCCESS" : "ERROR"}]</span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}