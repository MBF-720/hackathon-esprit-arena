"use client";

import { Suspense, useState, useEffect } from "react";
import { resetPassword } from "../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) setEmail(decodeURIComponent(emailFromQuery));
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
      setMessage("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Reset failed";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[140px]" />
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Reset <span className="text-cyan-400">Password</span>
          </h1>
          <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase mt-2">
            Enter code from email and new password
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 px-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">
                6-DIGIT CODE
              </label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 px-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-lg tracking-[0.5em] text-center"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">
                NEW PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 px-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-cyan-400/80 tracking-[0.2em] ml-1">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0a0f1e]/60 border border-white/10 px-4 py-4 rounded-xl text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                required
                minLength={8}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-cyan-500 text-black p-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  RESETTING...
                </>
              ) : (
                "RESET PASSWORD"
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-full h-px bg-white/5" />
            <Link
              href="/forgot-password"
              className="text-white/40 text-[10px] hover:text-cyan-400 transition-colors tracking-widest uppercase"
            >
              Request a new code
            </Link>
            <p className="text-white/30 text-[10px] tracking-widest uppercase text-center">
              <Link
                href="/signin"
                className="text-cyan-400 font-bold hover:underline underline-offset-4"
              >
                Back to Sign In
              </Link>
            </p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white/60 font-sans">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
