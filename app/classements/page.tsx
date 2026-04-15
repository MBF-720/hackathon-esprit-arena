"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../lib/translations";
import { getLeaderboard, getProfile, type LeaderboardUser, type UserProfile } from "../lib/api";

export default function ClassementsPage() {
  const { lang } = useAccessibility();
  const t = translations[lang];
  
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 20;

  useEffect(() => {
    // Récupérer le profil de l'utilisateur connecté
    getProfile()
      .then((profile: UserProfile) => setCurrentUserId(profile.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    const TIMEOUT_MS = 25_000;
    const timer = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    setError(null);

    getLeaderboard(ctrl.signal)
      .then((data) => {
        if (!alive) return;
        const raw = data && typeof data === "object" && "users" in data ? (data as { users: unknown }).users : [];
        setUsers(Array.isArray(raw) ? raw : []);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        const name = err instanceof DOMException ? err.name : "";
        const isAbort =
          name === "AbortError" ||
          (err &&
            typeof err === "object" &&
            "message" in err &&
            typeof (err as { message?: string }).message === "string" &&
            /abort/i.test((err as { message: string }).message));
        const msg = isAbort
          ? "Délai dépassé ou API injoignable. Lance le backend Nest (ex. npm run start:dev dans le dossier back, port 3000) et vérifie NEXT_PUBLIC_API_URL."
          : err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string"
            ? (err as { message: string }).message
            : "Impossible de charger le classement";
        setError(msg);
        setUsers([]);
      })
      .finally(() => {
        clearTimeout(timer);
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
    setPage((p) => Math.min(Math.max(1, p), tp));
  }, [users.length]);

  // Pagination (au moins 1 page pour éviter totalPages === 0 et page qui passe à 0)
  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, endIndex);

  // Top 3
  const top3 = users.slice(0, 3);

  // Générer des couleurs et initiales
  const getInitials = (firstName: string, lastName: string) => {
    const a = (firstName ?? "").trim();
    const b = (lastName ?? "").trim();
    return `${a.charAt(0) || "?"}${b.charAt(0) || ""}`.toUpperCase();
  };

  const getColor = (index: number) => {
    const colors = [
      "from-cyan-400 to-blue-600",
      "from-violet-500 to-purple-600",
      "from-emerald-500 to-green-600",
      "from-orange-500 to-amber-600",
      "from-blue-600 to-indigo-600",
      "from-pink-500 to-rose-600",
      "from-teal-500 to-cyan-600",
    ];
    return colors[index % colors.length];
  };

  const getBadgeColor = (rank: number) => {
    if (rank === 1) return { badge: "bg-amber-500", border: "border-amber-400" };
    if (rank === 2) return { badge: "bg-slate-400", border: "border-slate-300" };
    if (rank === 3) return { badge: "bg-amber-700", border: "border-amber-600" };
    return { badge: "bg-white/20", border: "border-white/20" };
  };

  const getBadgeText = (rank: number) => {
    if (rank === 1) return t.ranking.firstPlace;
    if (rank === 2) return t.ranking.secondPlace;
    if (rank === 3) return t.ranking.thirdPlace;
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen text-white font-sans relative">
      <PlatformNavbar />

      <main className="max-w-5xl mx-auto px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t.ranking.weekly}</h1>
          <p className="mt-2 text-white/60 text-sm flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            {t.ranking.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/60">Chargement du classement...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-white/80 text-lg">
              {lang === "fr" && "Aucun codeur dans le classement pour le moment."}
              {lang === "en" && "No developers on the leaderboard yet."}
              {lang === "ar" && "لا يوجد مطورون في التصنيف بعد."}
            </p>
            <p className="mt-2 text-sm text-white/50">
              {lang === "fr" && "Reviens plus tard ou inscris-toi pour apparaître ici."}
              {lang === "en" && "Check back later or sign up to appear here."}
              {lang === "ar" && "عد لاحقًا أو سجّل لتظهر في القائمة."}
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-4 md:gap-8 mb-16">
                {top3.map((coder) => {
                  const colors = getBadgeColor(coder.rank);
                  return (
                    <div
                      key={coder.id}
                      className={`flex flex-col items-center ${
                        coder.rank === 1 ? "order-2 -mt-4" : coder.rank === 2 ? "order-1" : "order-3"
                      }`}
                    >
                      <div className={`relative ${coder.rank === 1 ? "scale-110" : "scale-95"}`}>
                        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl font-bold text-black border-2 ${colors.border}`}>
                          {getInitials(coder.firstName, coder.lastName)}
                        </div>
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full ${colors.badge} text-white text-[10px] font-bold whitespace-nowrap`}>
                          {getBadgeText(coder.rank)}
                        </div>
                      </div>
                      <p className="mt-4 text-cyan-400 font-semibold">
                        {coder.firstName} {(coder.lastName ?? "").charAt(0)}
                        {(coder.lastName ?? "").length > 0 ? "." : ""}
                      </p>
                      <p className="text-sm text-white/70">{Number(coder.xp ?? 0).toLocaleString()} XP</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.rank}</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.coder}</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.experience}</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">Spécialité</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-white/60 uppercase tracking-wider">{t.ranking.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => {
                      const isCurrentUser = user.id === currentUserId;
                      return (
                        <tr
                          key={user.id}
                          className={`border-b border-white/5 ${isCurrentUser ? "bg-cyan-500/10 border-l-4 border-l-cyan-500" : "hover:bg-white/5"}`}
                        >
                          <td className="py-4 px-4 text-sm font-bold text-white/80">#{String(user.rank).padStart(2, "0")}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getColor(user.rank)} flex items-center justify-center text-sm font-bold`}>
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {user.firstName} {user.lastName}
                                  {isCurrentUser && (
                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-400 text-[10px] font-semibold">
                                      {t.ranking.you}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-white/50">{user.mainSpecialty}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-cyan-400 font-semibold">{Number(user.xp ?? 0).toLocaleString()} XP</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/70">
                              {user.mainSpecialty}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {isCurrentUser ? (
                              <Link
                                href="/profile"
                                className="inline-block px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs uppercase hover:bg-cyan-400 transition-colors"
                              >
                                {t.ranking.viewStats}
                              </Link>
                            ) : (
                              <button type="button" className="p-2 rounded-lg text-white/60 hover:bg-white/10" aria-label="Menu">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-white/10">
                <p className="text-sm text-white/50">
                  {t.ranking.showing} {startIndex + 1}-{Math.min(endIndex, users.length)} {t.ranking.coders} {users.length}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 disabled:opacity-50" 
                    aria-label="Page précédente"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="px-3 text-sm text-white/80 tabular-nums min-w-[5rem] text-center">
                    {safePage} / {totalPages}
                  </span>
                  <button 
                    type="button" 
                    className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 disabled:opacity-50" 
                    aria-label="Page suivante"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
