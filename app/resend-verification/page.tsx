"use client";
import { useState } from 'react';
import { resendVerification } from '../lib/api';
import Link from 'next/link';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await resendVerification(email);
      setMessage('PROTOCOL INITIATED: VERIFICATION LINK TRANSMITTED.');
    } catch (err: any) {
      setMessage(err?.message || "TRANSMISSION ERROR: RETRY REQUIRED.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      
      {/* 1. Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[140px] animate-pulse"></div>
        {/* Decorative Floating Text */}
        <div className="absolute top-1/4 right-10 text-white/5 font-mono text-[10px] tracking-[0.5em] uppercase -rotate-90 select-none">
          security_layer_bypass_active
        </div>
      </div>

      <div className="z-10 w-full max-w-md">
        
        {/* 2. Modern Header */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-6">
            {/* Satellite/Signal Transmission Icon */}
            <svg className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11l-3 3m3-3l3 3" />
              <circle cx="12" cy="12" r="10" className="opacity-10" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Signal <span className="text-cyan-400">Recovery</span>
          </h1>
          <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase mt-2 text-center">
            Resend Auth Credentials to Registry
          </p>
        </div>

        {/* 3. Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          {/* Subtle Top Glow Line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1 uppercase">Target Email Address</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input 
                  type="email"
                  placeholder="USER@CODER.SPACE" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-white text-black p-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  TRANSMITTING...
                </>
              ) : (
                <>
                  RE-TRANSMIT CODE
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          {/* 4. Footer Links */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-white/5"></div>
            <Link href="/signin" className="text-white/40 text-[10px] tracking-[0.3em] uppercase hover:text-white transition-all font-bold">
              RETURN TO LOGIN TERMINAL
            </Link>
          </div>
        </div>

        {/* 5. Terminal Feedback */}
        {message && (
          <div className={`mt-6 p-4 border rounded-xl text-[10px] w-full font-mono text-center tracking-widest leading-relaxed animate-in fade-in slide-in-from-top-2 ${
            message.includes('PROTOCOL') 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className="mr-2">[{message.includes('PROTOCOL') ? 'DONE' : 'WARN'}]</span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}