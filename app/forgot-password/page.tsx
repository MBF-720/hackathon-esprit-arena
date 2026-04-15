"use client";

import { useState } from "react";
import { forgotPassword } from "../lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setMessage(
        "If an account exists for this email, a reset code has been sent. Check your inbox and go to Reset Password."
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Request failed";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[140px]" />
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-4">
            <svg
              className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Forgot <span className="text-cyan-400">Password</span>
          </h1>
          <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase mt-2">
            Request a 6-digit reset code
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">
                CODENAME / EMAIL
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="USER@HACKER.SPACE"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0f1e]/60 border border-white/10 pl-12 pr-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
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
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  SENDING...
                </>
              ) : (
                "SEND RESET CODE"
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-white/5" />
            <p className="text-white/30 text-[10px] tracking-widest uppercase text-center">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="text-cyan-400 font-bold hover:underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
            <Link
              href={email ? `/reset-password?email=${encodeURIComponent(email)}` : "/reset-password"}
              className="text-cyan-400/80 text-[10px] hover:text-cyan-400 tracking-widest uppercase"
            >
              I have a code → Reset password
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`mt-6 p-4 border rounded-xl text-[10px] w-full font-mono text-center tracking-widest leading-relaxed ${
              success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
