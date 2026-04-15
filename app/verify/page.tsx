"use client";
import { useState, useEffect, Suspense } from 'react';
import { verifyEmail, saveToken, resendVerification } from '../lib/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();

  useEffect(() => {
    const e = params?.get('email') ?? '';
    if (e) setEmail(e);
  }, [params]);

  const [resendLoading, setResendLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = (await verifyEmail(email, code)) as { tokens?: { accessToken?: string } };
      if (res?.tokens?.accessToken) {
        saveToken(res.tokens.accessToken);
      }
      setMessage('IDENTITY VERIFIED. ACCESS GRANTED.');
      setTimeout(() => {
        window.location.assign("/hackathon");
      }, 1500);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : 'Code invalide ou expiré.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onResendCode() {
    if (!email) {
      setMessage('Email manquant. Retournez à l\'inscription.');
      return;
    }
    setResendLoading(true);
    setMessage(null);
    try {
      await resendVerification(email);
      setMessage('Un nouveau code a été envoyé à votre email.');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: string }).message) : 'Échec de l\'envoi du code.';
      setMessage(msg);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      
      {/* 1. Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[140px]"></div>
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        
        {/* 2. Modern Verification Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            {/* Shield / Keyhole Icon */}
            <svg className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            Verify <span className="text-cyan-400">Identity</span>
          </h1>
          <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase mt-4">
            A secure token was dispatched to:
          </p>
          <p className="text-cyan-400 text-xs font-mono mt-1 opacity-80">{email.toUpperCase() || 'REGISTERED_TERMINAL'}</p>
        </div>

        {/* 3. Glassmorphism Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <form onSubmit={onSubmit} className="space-y-6">
            
            <div className="space-y-1 hidden"> {/* Email kept hidden but functional if needed */}
              <input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1 uppercase block text-center">
                Enter 6-Digit Decryption Key
              </label>
              <input 
                type="text"
                placeholder="000000" 
                value={code} 
                maxLength={6}
                onChange={(e) => setCode(e.target.value)} 
                className="w-full bg-[#0a0f1e]/60 border border-white/10 p-5 rounded-xl text-white placeholder:text-white/5 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-center text-3xl tracking-[0.4em] font-black font-mono transition-all shadow-inner"
                required
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-cyan-500 text-black p-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  VALIDATING...
                </>
              ) : 'CONFIRM ACCESS'}
            </button>
          </form>

          {/* 4. Resend code + Navigation */}
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <div className="w-full h-px bg-white/5"></div>
            <button
              type="button"
              onClick={onResendCode}
              disabled={resendLoading || !email}
              className="text-cyan-400/80 hover:text-cyan-400 text-[10px] tracking-[0.2em] uppercase font-bold disabled:opacity-50"
            >
              {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
            </button>
            <Link href="/signup" className="text-white/40 text-[10px] tracking-[0.2em] uppercase hover:text-white transition-all font-bold">
              Email incorrect ? <span className="text-cyan-400 underline">S'inscrire à nouveau</span>
            </Link>
          </div>
        </div>

        {/* 5. Terminal Alert Message */}
        {message && (
          <div className={`mt-6 p-4 border rounded-xl text-[10px] w-full font-mono text-center tracking-widest leading-relaxed animate-in zoom-in-95 duration-300 ${
            message.includes('VERIFIED') 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <span className="mr-2">[{message.includes('VERIFIED') ? 'ACCESS_GRANTED' : 'AUTH_ERROR'}]</span>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}