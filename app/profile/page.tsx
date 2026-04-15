"use client";

import { useEffect, useState } from "react";
import { getProfile, getCompetitions, adminSendPreselectedEmail, getTopParticipants } from "../lib/api";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";
import { useAccessibility } from "../contexts/AccessibilityContext";

const RADAR_AXES = ["FRONTEND", "BACK", "SECUI", "DEVOPS", "U/ML", "MOBILE"] as const;
/** Mots-clés par axe pour dériver les scores du radar à partir des skillTags. */
const AXIS_KEYWORDS: Record<(typeof RADAR_AXES)[number], string[]> = {
  FRONTEND: ["react", "vue", "angular", "next", "html", "css", "javascript", "typescript", "frontend", "ui", "sass", "tailwind"],
  BACK: ["node", "nestjs", "express", "api", "backend", "java", "spring", "python", "django", "fastapi", "php", "ruby"],
  SECUI: ["security", "cybersec", "sécurité", "oauth", "jwt", "pentest", "cryptography"],
  DEVOPS: ["devops", "docker", "kubernetes", "ci/cd", "aws", "azure", "gcp", "linux", "terraform", "ansible"],
  "U/ML": ["machine learning", "ml", "ai", "tensorflow", "pytorch", "data", "pandas", "numpy", "nlp", "deep learning"],
  MOBILE: ["react native", "flutter", "ios", "android", "mobile", "kotlin", "swift"],
};

function resolveAvatarUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  const base =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
      : "";
  if (base) return `${base}${u.startsWith("/") ? u : `/${u}`}`;
  return u;
}

function computeRadarScores(mainSpecialty: string | null | undefined, skillTags: string[]): number[] {
  const tags = (skillTags || []).map((s) => s.toLowerCase());
  const specialty = (mainSpecialty || "").toUpperCase();
  return RADAR_AXES.map((axis) => {
    let score = 25;
    const keywords = AXIS_KEYWORDS[axis];
    const matchCount = keywords.filter((kw) => tags.some((t) => t.includes(kw) || kw.includes(t))).length;
    score += Math.min(50, matchCount * 12);
    if (specialty === axis || (axis === "BACK" && specialty === "BACKEND")) score += 25;
    return Math.min(100, Math.round(score));
  });
}

type ProfileUser = {
  id?: string;
  role?: string;
  email?: string;
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  mainSpecialty?: string;
  skillTags?: string[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  globalRank?: number;
  level?: number;
  xp?: number;
  linkedinPosts?: Array<{
    text: string;
    publishedAt: string;
    url?: string;
    likes?: number;
    comments?: number;
  }>;
  githubRepos?: Array<{
    name: string;
    description?: string;
    url: string;
    stars?: number;
    readme?: string;
    language?: string;
    updatedAt?: string;
    topics?: string[];
    languages?: Record<string, number>;
    watchers?: number;
    forks?: number;
    openIssues?: number;
    lastCommit?: {
      message: string;
      author: string;
      date: string;
    };
    license?: string;
  }>;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    themeType, setThemeType,
    zoom, setZoom,
    highContrast, setHighContrast,
    voiceGuideActive, setVoiceGuideActive,
    isTourRunning, startTour, stopTour
  } = useAccessibility();

  const isDarkMode = themeType !== "standardLight";

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((u) => { if (mounted) setUser(u as ProfileUser); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? "bg-[#0a0f1a] text-white" : "bg-slate-50 text-slate-900"}`}>
        <PlatformNavbar />
        <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 animate-pulse">
          <div className={`h-10 w-48 rounded-lg ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-72 rounded-2xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center relative ${isDarkMode ? "bg-[#0a0f1a] text-white" : "bg-slate-50 text-slate-800"}`}>
        <p>Erreur de chargement du profil. <Link href="/signin" className="text-cyan-500 underline font-medium">Se connecter</Link></p>
      </div>
    );
  }

  const skills = user.skillTags ?? [];
  const radarValues = computeRadarScores(user.mainSpecialty, skills);
  const competenceScore = Math.min(100, 50 + Math.min(30, skills.length * 3) + (user.mainSpecialty ? 15 : 0));
  const avatarResolved = resolveAvatarUrl(user.avatarUrl);
  const cardClass = `rounded-2xl border p-6 transition-shadow ${isDarkMode ? "bg-white/[0.06] border-white/10 shadow-none hover:border-white/15" : "bg-white border-slate-200/90 shadow-sm hover:shadow-md"}`;
  const subMuted = isDarkMode ? "text-white/55" : "text-slate-500";
  const bodyMuted = isDarkMode ? "text-white/70" : "text-slate-600";

  return (
    <div className={`min-h-screen font-sans relative ${isDarkMode ? "text-white bg-[#05080f]" : "bg-slate-50 text-slate-900"}`}>
      <PlatformNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10 space-y-8">
        {/* En-tête profil */}
        <section
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 md:p-10 ${isDarkMode ? "border-white/10 bg-gradient-to-br from-cyan-500/[0.07] via-[#0c1219] to-blue-600/[0.06]" : "border-slate-200 bg-gradient-to-br from-cyan-50/80 via-white to-slate-50 shadow-sm"}`}
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
            <div className="relative mx-auto shrink-0 md:mx-0">
              {avatarResolved ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarResolved}
                  alt=""
                  className={`h-28 w-28 rounded-full object-cover ring-4 sm:h-32 sm:w-32 ${isDarkMode ? "ring-cyan-500/35" : "ring-cyan-200"}`}
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl font-bold text-black ring-4 ring-cyan-500/30 sm:h-32 sm:w-32">
                  {user?.firstName?.[0] || "?"}
                  {user?.lastName?.[0] || ""}
                </div>
              )}
              <span className="absolute bottom-1 right-1 flex h-5 w-5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className={`relative inline-flex h-5 w-5 rounded-full border-2 ${isDarkMode ? "border-[#0a0f1e] bg-emerald-500" : "border-white bg-emerald-500"}`} />
              </span>
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${isDarkMode ? "text-cyan-400/90" : "text-cyan-600"}`}>
                Profil développeur
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {user.firstName} {user.lastName}
              </h1>
              {user.email && (
                <p className={`mt-1 text-sm ${subMuted}`}>{user.email}</p>
              )}
              <p className={`mt-2 text-sm font-semibold uppercase tracking-wider ${isDarkMode ? "text-cyan-400" : "text-cyan-700"}`}>
                {user.mainSpecialty || "Développeur"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isDarkMode ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-800"}`}>
                  Rang #{user.globalRank ?? "—"}
                </span>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isDarkMode ? "bg-white/10 text-white" : "bg-slate-100 text-slate-800"}`}>
                  Niveau {user.level ?? 1}
                </span>
              </div>

              <div className="mt-6 max-w-md">
                <div className="mb-1 flex justify-between text-xs">
                  <span className={subMuted}>Expérience (XP)</span>
                  <span className={`font-mono text-xs ${bodyMuted}`}>
                    {(user.xp ?? 0).toLocaleString()} / 15 000
                  </span>
                </div>
                <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((user.xp ?? 0) / 15000) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 5.232z" /></svg>
                  Modifier le profil
                </Link>
                <Link
                  href="/hackathon"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${isDarkMode ? "border-white/15 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"}`}
                >
                  Hackathons
                </Link>
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${isDarkMode ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    GitHub
                  </a>
                )}
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${isDarkMode ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Radar d&apos;expertise</h2>
                <p className={`mt-0.5 text-xs ${subMuted}`}>Dérivé de votre CV, LinkedIn et GitHub</p>
              </div>
              {skills.length > 0 && (
                <span className="shrink-0 rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-400">
                  {skills.length} compétences
                </span>
              )}
            </div>
            <div className="flex justify-center py-2">
              <RadarChart values={radarValues} labels={[...RADAR_AXES]} isDarkMode={isDarkMode} />
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-4">
              <h2 className="text-lg font-bold">Indice de compétence</h2>
              <p className={`mt-0.5 text-xs ${subMuted}`}>Synthèse basée sur vos tags et votre spécialité</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums">{competenceScore}</span>
              <span className={`text-2xl font-bold ${isDarkMode ? "text-white/50" : "text-slate-400"}`}>/100</span>
            </div>
            <p className={`mt-2 text-xs ${isDarkMode ? "text-emerald-400/90" : "text-emerald-700"}`}>
              Estimation interne — enrichissez votre profil pour affiner le score
            </p>
            {skills.length > 0 ? (
              <div className="mt-5 max-h-44 space-y-2 overflow-y-auto pr-1">
                <p className={`text-xs ${subMuted}`}>Compétences (extrait)</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 24).map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${isDarkMode ? "bg-cyan-500/20 text-cyan-200" : "bg-cyan-50 text-cyan-900 ring-1 ring-cyan-100"}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {skills.length > 24 && (
                    <span className={`text-xs ${subMuted}`}>+{skills.length - 24}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className={`mt-4 text-sm ${bodyMuted}`}>
                Ajoutez un CV et/ou des liens LinkedIn et GitHub dans les paramètres pour enrichir cette section.
              </p>
            )}
          </div>
        </div>

        <section className={cardClass}>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Badges</h2>
              <p className={`text-xs ${subMuted}`}>Aperçu — les badges seront liés à vos hackathons à terme</p>
            </div>
            <Link href="/hackathon" className="text-xs font-semibold text-cyan-500 hover:underline sm:shrink-0">
              Voir les hackathons →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              { icon: "✓", title: "Mentor Certifié", sub: "Niveau 3", locked: false },
              { icon: "🚀", title: "Speed Demon", sub: "Top 50", locked: false },
              { icon: "⚙", title: "Code Architect", sub: "Patterns", locked: false },
              { icon: "🐛", title: "Bug Hunter", sub: "100+ fixes", locked: false },
              { icon: "🔒", title: "À débloquer", sub: "Participez", locked: true },
            ].map((badge) => (
              <div
                key={badge.title}
                className={`w-[7.5rem] shrink-0 rounded-xl border p-3 text-center transition ${badge.locked ? (isDarkMode ? "border-white/15 bg-white/[0.03] opacity-70" : "border-slate-200 bg-slate-50 opacity-80") : isDarkMode ? "border-cyan-500/25 bg-cyan-500/10" : "border-cyan-100 bg-cyan-50/80"}`}
              >
                <span className="mb-1.5 block text-2xl">{badge.icon}</span>
                <p className="truncate text-xs font-bold">{badge.title}</p>
                <p className={`mt-0.5 text-[10px] ${subMuted}`}>{badge.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section LinkedIn Posts */}
        {user.linkedinPosts && user.linkedinPosts.length > 0 && (
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-blue-500">📱</span>
                Derniers Posts LinkedIn
              </h2>
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-cyan-400 hover:underline">Voir le profil</a>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.linkedinPosts.map((post, idx) => (
                <div key={idx} className={`rounded-xl border p-4 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <p className="text-sm text-white/80 line-clamp-4 mb-3">{post.text}</p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR')}</span>
                    <div className="flex gap-3">
                      {post.likes !== undefined && <span>👍 {post.likes}</span>}
                      {post.comments !== undefined && <span>💬 {post.comments}</span>}
                    </div>
                  </div>
                  {post.url && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">Voir le post →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section GitHub Repos */}
        {user.githubRepos && user.githubRepos.length > 0 && (
          <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🐙</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Derniers Repos GitHub
                </span>
              </h2>
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  Voir le profil <span>→</span>
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.githubRepos.map((repo, idx) => (
                <div
                  key={idx}
                  className={`group rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] ${isDarkMode
                    ? "bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-white/10 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-cyan-500/50 hover:shadow-xl"
                    }`}
                >
                  {/* Header with name and stars */}
                  <div className="flex items-start justify-between mb-3 pb-3 border-b border-white/10">
                    <h3 className="font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors text-base flex-1 line-clamp-1">{repo.name}</h3>
                    {repo.stars !== undefined && repo.stars > 0 && (
                      <span className="text-sm text-yellow-400 flex items-center gap-1 flex-shrink-0 ml-2 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                        ⭐ {repo.stars}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {repo.description && (
                    <p className="text-sm text-white/80 mb-4 line-clamp-2 min-h-[2.5rem] leading-relaxed">{repo.description}</p>
                  )}

                  {/* Topics/Tags */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {repo.topics.slice(0, 4).map((topic, topicIdx) => (
                        <span
                          key={topicIdx}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all hover:scale-105 ${isDarkMode
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
                            : "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                            }`}
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Language breakdown */}
                  {repo.languages && Object.keys(repo.languages).length > 0 ? (
                    <div className="mb-4">
                      <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden mb-2 shadow-inner">
                        {Object.entries(repo.languages).map(([lang, percent], langIdx) => (
                          <div
                            key={langIdx}
                            className={`transition-all hover:opacity-80 ${langIdx === 0 ? 'bg-gradient-to-r from-violet-500 to-violet-600' :
                              langIdx === 1 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                langIdx === 2 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                  'bg-gradient-to-r from-orange-500 to-orange-600'
                              }`}
                            style={{ width: `${percent}%` }}
                            title={`${lang}: ${percent}%`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {Object.entries(repo.languages).slice(0, 3).map(([lang, percent], langIdx) => (
                          <span key={langIdx} className="text-white/60 flex items-center gap-1">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${langIdx === 0 ? 'bg-violet-500' :
                              langIdx === 1 ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}></span>
                            <span className="font-medium">{lang}</span>
                            <span className="text-white/40">{percent}%</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : repo.language ? (
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold mb-4 ${isDarkMode ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-violet-100 text-violet-700 border border-violet-200"
                      }`}>
                      {repo.language}
                    </span>
                  ) : null}

                  {/* Stats Row - Watchers, Forks, Issues */}
                  <div className={`flex items-center gap-4 text-xs mb-4 pb-4 border-b ${isDarkMode ? "border-white/10" : "border-slate-200"
                    }`}>
                    <span className="flex items-center gap-1.5 text-white/60 hover:text-white/80 transition-colors" title="Watchers">
                      <span className="text-sm">👁️</span> {repo.watchers}
                    </span>
                    <span className="flex items-center gap-1.5 text-white/60 hover:text-white/80 transition-colors" title="Forks">
                      <span className="text-sm">🍴</span> {repo.forks}
                    </span>
                    {repo.openIssues !== undefined && repo.openIssues > 0 && (
                      <span className="flex items-center gap-1.5 text-orange-400/80 hover:text-orange-400 transition-colors" title="Open Issues">
                        <span className="text-sm">⚠️</span> {repo.openIssues}
                      </span>
                    )}
                  </div>

                  {/* Last commit info */}
                  {repo.lastCommit && (
                    <div className={`mb-4 p-3 rounded-lg transition-all ${isDarkMode
                      ? "bg-black/30 border border-white/5 hover:bg-black/40"
                      : "bg-slate-100 border border-slate-200 hover:bg-slate-50"
                      }`}>
                      <div className="text-[10px] text-white/40 mb-1.5 font-medium uppercase tracking-wide">Dernier commit</div>
                      <div className="text-xs text-white/80 mb-2 line-clamp-2 leading-relaxed">{repo.lastCommit.message}</div>
                      <div className="flex justify-between items-center text-[10px] text-white/50">
                        <span className="flex items-center gap-1">
                          <span className="text-xs">👤</span> {repo.lastCommit.author}
                        </span>
                        <span>{new Date(repo.lastCommit.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  )}

                  {/* License */}
                  {repo.license && (
                    <div className="text-[10px] text-white/40 mb-3 flex items-center gap-1">
                      <span>📜</span> {repo.license}
                    </div>
                  )}

                  {/* README preview */}
                  {repo.readme && (
                    <details className="mb-3 group/details">
                      <summary className={`cursor-pointer text-xs font-semibold transition-colors flex items-center gap-2 py-2 px-3 rounded-lg ${isDarkMode
                        ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        : "text-cyan-600 hover:text-cyan-500 hover:bg-cyan-50"
                        }`}>
                        <span className="text-sm">📄</span>
                        <span>Voir README</span>
                        <span className="ml-auto text-[10px] opacity-60">Cliquez pour lire</span>
                      </summary>
                      <div className={`mt-3 p-4 rounded-lg border text-xs leading-relaxed overflow-auto max-h-64 ${isDarkMode
                        ? "bg-black/40 border-white/10 text-white/70"
                        : "bg-white border-slate-200 text-slate-700"
                        }`}>
                        {(() => {
                          // Nettoyer le README: enlever les balises HTML et markdown
                          let cleaned = repo.readme
                            .replace(/<[^>]*>/g, ' ') // Enlever les balises HTML
                            .replace(/!\[.*?\]\(.*?\)/g, '') // Enlever les images markdown
                            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convertir les liens en texte
                            .replace(/#{1,6}\s/g, '') // Enlever les # de titres
                            .replace(/\*\*([^*]+)\*\*/g, '$1') // Enlever le bold markdown
                            .replace(/\*([^*]+)\*/g, '$1') // Enlever l'italic markdown
                            .replace(/`([^`]+)`/g, '$1') // Enlever les backticks
                            .replace(/\n{3,}/g, '\n\n') // Réduire les sauts de ligne multiples
                            .replace(/\s{2,}/g, ' ') // Réduire les espaces multiples
                            .trim();

                          // Limiter la longueur
                          if (cleaned.length > 600) {
                            cleaned = cleaned.substring(0, 600) + '...';
                          }

                          // Diviser en paragraphes
                          return cleaned.split('\n\n').map((para, i) => (
                            <p key={i} className="mb-2 last:mb-0">{para}</p>
                          ));
                        })()}
                      </div>
                    </details>
                  )}

                  {/* Footer - Dates and link */}
                  <div className={`flex justify-between items-center pt-3 border-t ${isDarkMode ? "border-white/10" : "border-slate-200"
                    }`}>
                    <div className="text-[10px] text-white/30">
                      Mise à jour: {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-semibold transition-all hover:gap-2 flex items-center gap-1 px-3 py-1.5 rounded-lg ${isDarkMode
                        ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        : "text-cyan-600 hover:text-cyan-500 hover:bg-cyan-50"
                        }`}
                    >
                      Voir le repo <span>→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Accessibilité */}
        <section className={`${cardClass} backdrop-blur-sm`}>
          <div className="mb-6 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isDarkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent" : "text-slate-800"}`}>
                Accessibilité
              </h2>
              <p className={`mt-0.5 text-xs ${subMuted}`}>Thème, zoom et options d&apos;usage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${subMuted}`}>Interface</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: "standardDark", label: "DARK", icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )
                  },
                  {
                    id: "standardLight", label: "LIGHT", icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )
                  },
                  {
                    id: "protanopia", label: "PROTAN", icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )
                  },
                  {
                    id: "deuteranopia", label: "DEUTAN", icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    )
                  },
                  {
                    id: "tritanopia", label: "TRITAN", icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" /></svg>
                    )
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeType(t.id as "standardDark" | "standardLight" | "protanopia" | "deuteranopia" | "tritanopia")}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${themeType === t.id
                      ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : isDarkMode
                        ? "border-white/10 bg-white/5 text-white/45 hover:bg-white/10"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    <div className="mb-2">{t.icon}</div>
                    <span className="text-[10px] font-bold uppercase">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase ${subMuted}`}>Zoom interface</span>
                  <span className="text-xs font-bold text-cyan-500">{100 + zoom * 15}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value, 10))}
                  className={`h-1.5 w-full cursor-pointer appearance-none rounded-lg accent-cyan-500 ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${subMuted}`}>Aide à la navigation</h3>

              <div className={`group rounded-xl border p-4 transition-colors ${isDarkMode ? "border-white/10 bg-white/5 hover:border-cyan-500/30" : "border-slate-200 bg-slate-50/90 hover:border-cyan-300"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDarkMode ? "text-white/90" : "text-slate-800"}`}>Visite guidée</h4>
                      <p className={`mt-1 text-xs ${subMuted}`}>Parcours pas à pas de l&apos;interface</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => (isTourRunning ? stopTour() : startTour())}
                  className={`mt-4 w-full rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all ${isTourRunning
                    ? "border border-red-500/50 bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-cyan-500 text-black hover:bg-cyan-400"
                    }`}
                >
                  {isTourRunning ? "Arrêter la visite" : "Lancer la visite"}
                </button>
              </div>

              <div className={`flex items-center gap-4 rounded-xl border p-4 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold ${isDarkMode ? "text-white/90" : "text-slate-800"}`}>Contraste élevé</h4>
                    <button
                      type="button"
                      onClick={() => setHighContrast(!highContrast)}
                      className={`relative h-5 w-10 rounded-full transition-colors ${highContrast ? "bg-cyan-500" : isDarkMode ? "bg-white/10" : "bg-slate-200"}`}
                      aria-pressed={highContrast}
                    >
                      <span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${highContrast ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                  <p className={`mt-1 text-[10px] ${subMuted}`}>Renforce le contraste des textes</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 rounded-xl border p-4 ${isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold ${isDarkMode ? "text-white/90" : "text-slate-800"}`}>Guide vocal</h4>
                    <button
                      type="button"
                      onClick={() => setVoiceGuideActive(!voiceGuideActive)}
                      className={`relative h-5 w-10 rounded-full transition-colors ${voiceGuideActive ? "bg-cyan-500" : isDarkMode ? "bg-white/10" : "bg-slate-200"}`}
                      aria-pressed={voiceGuideActive}
                    >
                      <span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${voiceGuideActive ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                  <p className={`mt-1 text-[10px] ${subMuted}`}>Commandes vocales (ex. accueil, hackathon)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {user?.role === "ADMIN" && (
          <AdminPreselectedMailSection isDarkMode={isDarkMode} />
        )}

      </main>
    </div>
  );
}

function AdminPreselectedMailSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [competitions, setCompetitions] = useState<{ id: string; title: string }[]>([]);
  const [competitionId, setCompetitionId] = useState("");
  const [limitStr, setLimitStr] = useState("");
  const [subject, setSubject] = useState("Présélection — {{competitionTitle}}");
  const [htmlBody, setHtmlBody] = useState(
    `<p>Bonjour {{firstName}},</p>
<p>Vous faites partie des participants présélectionnés pour <strong>{{competitionTitle}}</strong>.</p>
<p>Cordialement,<br/>L&apos;équipe Arena of Coders</p>`,
  );
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    getCompetitions({ limit: 200 })
      .then((r) => {
        if (!ok) return;
        setCompetitions(r.data.map((c) => ({ id: c.id, title: c.title })));
      })
      .catch(() => {});
    return () => { ok = false; };
  }, []);

  useEffect(() => {
    if (!competitionId) {
      setPreviewCount(null);
      return;
    }
    const lim = limitStr.trim() ? Math.min(50, Math.max(1, parseInt(limitStr, 10) || 5)) : undefined;
    let cancelled = false;
    getTopParticipants(competitionId, lim)
      .then((t) => {
        if (!cancelled) setPreviewCount(t.preselected.length);
      })
      .catch(() => {
        if (!cancelled) setPreviewCount(null);
      });
    return () => { cancelled = true; };
  }, [competitionId, limitStr]);

  const send = async () => {
    setFeedback(null);
    setError(null);
    if (!competitionId) {
      setError("Choisissez un hackathon.");
      return;
    }
    if (!subject.trim() || !htmlBody.trim()) {
      setError("Renseignez le sujet et le corps du message.");
      return;
    }
    setLoading(true);
    try {
      const lim = limitStr.trim() ? Math.min(50, Math.max(1, parseInt(limitStr, 10) || 5)) : undefined;
      const res = await adminSendPreselectedEmail(competitionId, {
        subject: subject.trim(),
        htmlBody: htmlBody.trim(),
        limit: lim,
      });
      setFeedback(
        `Envoyé : ${res.sent} / ${res.total} destinataire(s).` +
          (res.failedEmails.length ? ` Échecs : ${res.failedEmails.join(", ")}` : ""),
      );
    } catch (e: unknown) {
      const m = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Erreur d’envoi";
      setError(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`rounded-2xl border p-6 space-y-4 ${
        isDarkMode ? "bg-amber-500/10 border-amber-500/35 text-white" : "bg-amber-50 border-amber-200 text-slate-900"
      }`}
    >
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-amber-500">✉</span>
          E-mail aux participants présélectionnés
        </h2>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-white/70" : "text-slate-600"}`}>
          Envoie un message aux meilleurs scores ayant soumis (comme le classement « présélection »). Variables :{" "}
          <code className="text-xs bg-black/10 px-1 rounded">{"{{firstName}}"}</code>,{" "}
          <code className="text-xs bg-black/10 px-1 rounded">{"{{competitionTitle}}"}</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Hackathon</span>
          <select
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
            className={`rounded-xl border px-3 py-2 ${isDarkMode ? "bg-white/10 border-white/20 text-white" : "bg-white border-slate-300"}`}
          >
            <option value="">— Choisir —</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Nombre max de destinataires (optionnel, défaut = topN du hackathon)</span>
          <input
            type="number"
            min={1}
            max={50}
            placeholder="ex. 5"
            value={limitStr}
            onChange={(e) => setLimitStr(e.target.value)}
            className={`rounded-xl border px-3 py-2 ${isDarkMode ? "bg-white/10 border-white/20 text-white" : "bg-white border-slate-300"}`}
          />
          {previewCount !== null && (
            <span className={`text-xs ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>
              {previewCount} participant(s) ciblé(s) avec les paramètres actuels
            </span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Objet</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`rounded-xl border px-3 py-2 ${isDarkMode ? "bg-white/10 border-white/20 text-white" : "bg-white border-slate-300"}`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Corps (HTML)</span>
        <textarea
          rows={8}
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
          className={`rounded-xl border px-3 py-2 font-mono text-xs ${isDarkMode ? "bg-white/10 border-white/20 text-white" : "bg-white border-slate-300"}`}
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {feedback && <p className="text-sm text-emerald-400">{feedback}</p>}

      <button
        type="button"
        onClick={() => void send()}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer les e-mails"}
      </button>
    </section>
  );
}

function RadarChart({
  values,
  labels,
  isDarkMode,
}: {
  values: number[];
  labels: string[];
  isDarkMode: boolean;
}) {
  const size = 200;
  const center = size / 2;
  const maxR = center - 24;
  const n = values.length;
  const gridStroke = isDarkMode ? "rgba(14, 230, 255, 0.18)" : "rgba(6, 182, 212, 0.35)";
  const axisStroke = isDarkMode ? "rgba(14, 230, 255, 0.22)" : "rgba(6, 182, 212, 0.4)";
  const fillArea = isDarkMode ? "rgba(14, 230, 255, 0.32)" : "rgba(6, 182, 212, 0.22)";
  const strokeArea = isDarkMode ? "rgba(14, 230, 255, 0.55)" : "rgba(8, 145, 178, 0.65)";
  const points = values.map((v, i) => {
    const angle = (i * 360 / n - 90) * (Math.PI / 180);
    const r = (v / 100) * maxR;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  });
  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z";
  const axisPoints = labels.map((_, i) => {
    const angle = (i * 360 / n - 90) * (Math.PI / 180);
    return [center + maxR * Math.cos(angle), center + maxR * Math.sin(angle)];
  });
  return (
    <svg width={size} height={size} className="overflow-visible" role="img" aria-label="Radar des compétences par axe">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={axisPoints.map((p) => `${center + (p[0] - center) * scale},${center + (p[1] - center) * scale}`).join(" ")}
          fill="none"
          stroke={gridStroke}
          strokeWidth="1"
        />
      ))}
      {axisPoints.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p[0]} y2={p[1]} stroke={axisStroke} strokeWidth="1" />
      ))}
      <path d={pathData} fill={fillArea} stroke={strokeArea} strokeWidth="1.5" />
      {labels.map((label, i) => {
        const angle = (i * 360 / n - 90) * (Math.PI / 180);
        const x = center + (maxR + 16) * Math.cos(angle);
        const y = center + (maxR + 16) * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            className="text-[9px] font-bold"
            fill={isDarkMode ? "rgba(255,255,255,0.78)" : "#475569"}
            style={{ dominantBaseline: "central" }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
