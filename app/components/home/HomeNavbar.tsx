"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getProfile, getToken, signOut } from "../../lib/api";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { translations } from "../../lib/translations";

interface HomeNavbarProps {
  user?: any;
}

export default function HomeNavbar({ user: initialUser }: HomeNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, themeType } = useAccessibility();
  const isLight = themeType === "standardLight";
  const [user, setUser] = useState<any | null>(initialUser || null);
  const [userLoaded, setUserLoaded] = useState(!!initialUser);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hackathonDropdownOpen, setHackathonDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const hackathonRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setUserLoaded(true);
      return;
    }
    if (getToken()) {
      getProfile()
        .then((u) => setUser(u))
        .catch(() => setUser(null))
        .finally(() => setUserLoaded(true));
    } else {
      setUserLoaded(true);
    }
  }, [initialUser]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (hackathonRef.current && !hackathonRef.current.contains(e.target as Node))
        setHackathonDropdownOpen(false);
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const langLabel = { fr: "FR", en: "EN", ar: "ع" };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? isLight
            ? "backdrop-blur-xl bg-white/85 border-b border-black/[0.08] shadow-md"
            : "backdrop-blur-xl bg-[rgba(10,15,26,0.8)] border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={user ? "/home" : "/"} className="flex items-center gap-3 shrink-0">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-[var(--accent)]/40 flex items-center justify-center font-mono font-bold text-[var(--accent)]"
              style={{
                background: "rgba(0, 212, 255, 0.1)",
                boxShadow: "0 0 15px rgba(0, 212, 255, 0.2)",
              }}
            >
              &gt;_
            </div>
            <span className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
              Arena <span className="text-[var(--accent)]">of Coders</span>
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className={`lg:hidden p-2 rounded-lg text-[var(--text-primary)] ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <div className="relative" ref={hackathonRef}>
              <button
                type="button"
                onClick={() => setHackathonDropdownOpen((o) => !o)}
                className="flex items-center gap-1 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium"
              >
                Hackathon
                <svg
                  className={`w-4 h-4 transition-transform ${hackathonDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {hackathonDropdownOpen && (
                <div className={`absolute top-full left-0 mt-2 py-2 min-w-[200px] rounded-xl backdrop-blur-xl border shadow-xl ${isLight ? "bg-white/95 border-black/10" : "bg-[rgba(13,26,45,0.95)] border-white/10"}`}>
                  <Link
                    href="/hackathon"
                    className={`block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] ${isLight ? "hover:bg-black/[0.04]" : "hover:bg-white/5"}`}
                    onClick={() => setHackathonDropdownOpen(false)}
                  >
                    Salles
                  </Link>
                  <Link
                    href="/classements"
                    prefetch={true}
                    className={`block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] ${isLight ? "hover:bg-black/[0.04]" : "hover:bg-white/5"}`}
                    onClick={() => setHackathonDropdownOpen(false)}
                  >
                    Classements
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/#solutions"
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium"
            >
              Solutions
            </Link>
            <Link
              href="/#rooms"
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium"
            >
              Développeurs
            </Link>
            <Link
              href="/#pricing"
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium"
            >
              Tarifs
            </Link>
            <Link
              href="/chat"
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium"
            >
              Chat
            </Link>
          </nav>

          {/* CTA + Auth */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className={`p-2 rounded-lg text-[var(--text-secondary)] transition-colors ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}
                aria-label={t.a11y.lang}
              >
                <span className="text-sm font-medium">{langLabel[lang]}</span>
              </button>
              {langOpen && (
                <ul className={`absolute right-0 top-full mt-1 py-1 min-w-[100px] rounded-lg backdrop-blur-xl border shadow-xl z-50 ${isLight ? "bg-white/95 border-black/10" : "bg-[rgba(13,26,45,0.95)] border-white/10"}`}>
                  {(["fr", "en", "ar"] as const).map((l) => (
                    <li key={l}>
                      <button
                        type="button"
                        onClick={() => {
                          setLang(l);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm rounded-md ${lang === l ? "text-[var(--accent)]" : "text-[var(--text-primary)] " + (isLight ? "hover:bg-black/5" : "hover:bg-white/10")}`}
                      >
                        {l === "fr" ? "Français" : l === "en" ? "English" : "العربية"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {userLoaded &&
              (user ? (
                <div className="flex items-center gap-3">
                  <Link 
                    href={user.role === 'ADMIN' ? '/dashboard' : user.role === 'COMPANY' ? '/company-dashboard' : '/home'}
                    className="hidden md:block bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    {user.role === 'ADMIN' ? 'Admin Panel' : user.role === 'COMPANY' ? 'Company HQ' : 'Homepage'}
                  </Link>
                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileOpen((o) => !o)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center text-sm font-bold text-black border border-white/20">
                        {user?.firstName?.[0] || "?"}
                        {user?.lastName?.[0] || ""}
                      </div>
                    </button>
                    {profileOpen && (
                      <div className={`absolute right-0 top-full mt-2 w-56 py-1 rounded-xl backdrop-blur-xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 ${isLight ? "bg-white/95 border-black/10" : "bg-[rgba(13,26,45,0.95)] border-white/10"}`}>
                        <div className={`px-4 py-3 border-b ${isLight ? "border-black/10" : "border-white/10"}`}>
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] truncate font-mono">{user?.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setProfileOpen(false)}
                          className={`block px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}
                        >
                          Mon profil
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className={`block px-4 py-2.5 text-sm font-bold transition-colors ${isLight ? "text-cyan-700 hover:bg-black/5" : "text-cyan-400 hover:bg-white/10"}`}
                          >
                            Système Admin
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            signOut();
                            setProfileOpen(false);
                            router.push("/signin");
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 font-bold hover:bg-red-500/10 transition-colors"
                        >
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className="bg-[var(--accent)] text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  Lancer l&apos;App
                </Link>
              ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden py-4 border-t ${isLight ? "border-black/10" : "border-white/10"}`}>
            <nav className="flex flex-col gap-2">
              <Link href="/hackathon" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-2 text-[var(--text-primary)] rounded-lg ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}>Hackathon</Link>
              <Link href="/classements" prefetch={true} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-2 text-[var(--text-primary)] rounded-lg ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}>Classements</Link>
              <Link href="/#solutions" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-2 text-[var(--text-primary)] rounded-lg ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}>Solutions</Link>
              <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-2 text-[var(--text-primary)] rounded-lg ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}>Tarifs</Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className={`px-4 py-2 text-[var(--text-primary)] rounded-lg ${isLight ? "hover:bg-black/5" : "hover:bg-white/10"}`}>Chat</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
