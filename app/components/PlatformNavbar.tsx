"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getProfile, getToken, signOut } from "../lib/api";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../lib/translations";

export default function PlatformNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useAccessibility();
  const [user, setUser] = useState<any | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (getToken()) {
      getProfile()
        .then((u) => setUser(u))
        .catch(() => setUser(null))
        .finally(() => setUserLoaded(true));
    } else {
      setUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const langLabel = { fr: "FR", en: "EN", ar: "ع" };
  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0f1419]">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-4 max-w-[1920px] mx-auto">
        {/* Logo : carré bleu foncé + icône terminal ">_" + texte */}
        <Link href={user ? "/home" : "/"} className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-10 rounded-lg bg-[#1a2332] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="text-[var(--accent)] font-mono text-sm font-bold tracking-tight">&gt;_</span>
          </div>
          <div>
            <p className="text-base font-bold text-white leading-tight">Arena of Coders</p>
            <p className="text-[10px] text-cyan-400 uppercase tracking-wider leading-tight font-medium">{t.competitiveHub}</p>
          </div>
        </Link>

        {/* Liens centraux */}
        <nav className="flex items-center gap-6 md:gap-8">
          {/* Home - visible only for regular users and during loading */}
          {!userLoaded || (user && user?.role !== "ADMIN" && user?.role !== "COMPANY") ? (
            <Link href={user ? "/home" : "/"} className={`text-sm font-medium transition-colors ${(user ? isActive("/home") : isActive("/") && pathname === "/") ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5" : "text-white hover:text-cyan-400"}`}>
              {t.nav.home}
            </Link>
          ) : null}

          <Link href="/hackathon" className={`text-sm font-medium transition-colors ${isActive("/hackathon") ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5" : "text-white hover:text-cyan-400"}`}>
            {t.nav.hackathon}
          </Link>
          <Link
            href="/classements"
            prefetch={true}
            className={`text-sm font-medium transition-colors ${isActive("/classements") ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5" : "text-white hover:text-cyan-400"}`}
          >
            {t.nav.leaderboards}
          </Link>

          {/* Profile - visible only for regular users and during loading */}
          {!userLoaded || (user && user?.role !== "ADMIN" && user?.role !== "COMPANY") ? (
            <Link href="/profile" className={`text-sm font-medium transition-colors ${isActive("/profile") ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5" : "text-white hover:text-cyan-400"}`}>
              {t.nav.profile}
            </Link>
          ) : null}

          {/* Dashboard - visible only for admin */}
          {userLoaded && user?.role === "ADMIN" && (
            <Link href="/dashboard" className={`text-sm font-medium transition-colors ${isActive("/dashboard") ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5" : "text-amber-400 hover:text-amber-300"}`}>
              Dashboard
            </Link>
          )}

          {/* Company Dashboard - visible only for company */}
          {userLoaded && user?.role === "COMPANY" && (
            <Link href="/company-dashboard" className={`text-sm font-medium transition-colors ${isActive("/company-dashboard") ? "text-cyan-400 border-b-2 border-cyan-400 pb-0.5" : "text-emerald-400 hover:text-emerald-300"}`}>
              Company Dashboard
            </Link>
          )}
        </nav>

        {/* Barre de recherche */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4 rounded-lg bg-white/10 border border-white/10 overflow-hidden">
          <span className="pl-3 text-white/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input type="search" placeholder={t.nav.searchChallenge} className="w-full py-2.5 pl-2 pr-4 text-sm bg-transparent text-white placeholder:text-white/50 outline-none" />
        </div>

        {/* Droite : langue, notifications, profil ou connexion */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              aria-label={t.a11y.lang}
              aria-expanded={langOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              <span className="text-sm font-medium">{langLabel[lang]}</span>
            </button>
            {langOpen && (
              <ul className="absolute right-0 top-full mt-1 py-1 min-w-[120px] bg-[#1a1f26] border border-white/10 rounded-lg shadow-xl z-50">
                {(["fr", "en", "ar"] as const).map((l) => (
                  <li key={l}>
                    <button type="button" onClick={() => { setLang(l); setLangOpen(false); }} className={`w-full text-left px-4 py-2 text-sm rounded-md ${lang === l ? "bg-cyan-500/20 text-cyan-400" : "text-white hover:bg-white/10"}`}>
                      {l === "fr" ? "Français" : l === "en" ? "English" : "العربية"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="p-2.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors" aria-label="Notifications">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          {userLoaded && (user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-expanded={profileOpen}
                aria-label="Profil"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white leading-tight">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Utilisateur"}</p>
                  <p className="text-[10px] text-white/50 leading-tight">Diamond II</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-bold text-black">
                    {user?.firstName?.[0] || "?"}{user?.lastName?.[0] || ""}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f1419]" />
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 py-1 rounded-xl shadow-xl border z-50 bg-[#1a1f26] border-white/10">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-white hover:bg-white/10">Mon profil</Link>
                  <Link href="/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-white hover:bg-white/10">Paramètres</Link>
                  <button type="button" onClick={() => { signOut(); setProfileOpen(false); router.push("/signin"); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/signup" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              {t.nav.signUp}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
