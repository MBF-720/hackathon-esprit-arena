"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PlatformNavbar from "../components/PlatformNavbar";
import {
  getToken,
  getProfile,
  getAdminDashboardStats,
  getAdminRecentUsers,
  getAdminUsers,
  triggerN8nWebhookTest,
  getCompetitions,
  createCompetition,
  changeCompetitionStatus,
  getCompanyRequests,
  reviewCompanyRequest,
  type AdminUserRow,
  type Competition,
  type CompetitionStatus,
  type Specialty,
  type CreateCompetitionPayload,
} from "../lib/api";

const PAGE_SIZE = 10;

type Stats = {
  users: {
    total: number;
    verified: number;
    banned?: number;
    noSpecialty?: number;
    byRole: Record<string, number>;
  };
  specialties: { list: string[]; bySpecialty: Record<string, number> };
  rooms: { total: number; description: string };
};

type View = "OVERVIEW" | "USERS" | "COMPANIES" | "HACKATHONS" | "WORKFLOWS";

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<View>("OVERVIEW");
  
  // Dashboard Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Users View
  const [usersSearch, setUsersSearch] = useState("");
  const [usersQuery, setUsersQuery] = useState("");
  const [usersRole, setUsersRole] = useState<string>("");
  const [usersResult, setUsersResult] = useState<{
    users: AdminUserRow[];
    total: number;
  } | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Auto-filter for users (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsersQuery(usersSearch);
      setUsersPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [usersSearch]);

  // Companies View
  const [companyRequests, setCompanyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Hackathons View
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [compLoading, setCompLoading] = useState(false);
  const [compSearch, setCompSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [compSuccess, setCompSuccess] = useState<string | null>(null);
  const [compForm, setCompForm] = useState<CreateCompetitionPayload>({
    title: "",
    description: "",
    difficulty: "MEDIUM",
    specialty: undefined,
    startDate: "",
    endDate: "",
    rewardPool: 0,
    maxParticipants: undefined,
    antiCheatEnabled: false,
    antiCheatThreshold: 70,
    topN: 5,
  });

  // n8n
  const [n8nLoading, setN8nLoading] = useState(false);
  const [n8nMsg, setN8nMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/signin");
      return;
    }
    setLoading(true);
    getProfile()
      .then((profile: any) => {
        if (profile?.role !== "ADMIN") {
          router.replace("/hackathon");
          return;
        }
        return Promise.all([
          getAdminDashboardStats(),
          getAdminRecentUsers(8),
          getCompetitions({ limit: 10 })
        ]);
      })
      .then((results: any) => {
        if (results) {
          setStats(results[0]);
          setRecentUsers(results[1]);
          setCompetitions(results[2]?.data ?? []);
        }
      })
      .catch((err) => setError(err?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [router]);

  // Load section-specific data
  useEffect(() => {
    if (activeView === "USERS") {
      setLoadingUsers(true);
      getAdminUsers({
        limit: PAGE_SIZE,
        offset: usersPage * PAGE_SIZE,
        search: usersQuery || undefined,
        role: usersRole || undefined
      })
        .then(setUsersResult)
        .finally(() => setLoadingUsers(false));
    } else if (activeView === "COMPANIES") {
      setLoadingRequests(true);
      getCompanyRequests("PENDING")
        .then(setCompanyRequests)
        .finally(() => setLoadingRequests(false));
    } else if (activeView === "HACKATHONS") {
      setCompLoading(true);
      getCompetitions({ limit: 50 })
        .then((res) => setCompetitions(res.data ?? []))
        .finally(() => setCompLoading(false));
    }
  }, [activeView, usersPage, usersQuery, usersRole]);

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    setCompSuccess(null);
    try {
      await createCompetition(compForm);
      setCompSuccess("Hackathon créé avec succès !");
      setShowCreateForm(false);
      setCompForm({
        title: "",
        description: "",
        difficulty: "MEDIUM",
        specialty: undefined,
        startDate: "",
        endDate: "",
        rewardPool: 0,
        maxParticipants: undefined,
        antiCheatEnabled: false,
        antiCheatThreshold: 70,
        topN: 5,
      });
      // reload competitions
      getCompetitions({ limit: 50 }).then((res) => setCompetitions(res.data ?? []));
    } catch (err: any) {
      setError(err?.message ?? "Erreur de création");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: CompetitionStatus) => {
    try {
      await changeCompetitionStatus(id, newStatus);
      setCompetitions(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleReviewRequest = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewCompanyRequest(id, status);
      setCompanyRequests(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleRunN8n = async () => {
    setN8nLoading(true);
    setN8nMsg(null);
    try {
      const res = await triggerN8nWebhookTest();
      if (res.success) setN8nMsg({ type: 'success', text: "Workflow executed successfully!" });
      else setN8nMsg({ type: 'error', text: res.message || "Execution failed." });
    } catch (err: any) {
      setN8nMsg({ type: 'error', text: err.message });
    } finally {
      setN8nLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
        <PlatformNavbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase">Initializing secure area...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col selection:bg-cyan-500/30">
      <PlatformNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-white/5 bg-[#0d1117] hidden md:flex flex-col p-6 gap-8">
          <div className="space-y-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Navigation</p>
            <nav className="space-y-1">
              <SidebarItem 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>}
                label="Vue d'ensemble" active={activeView === "OVERVIEW"} onClick={() => setActiveView("OVERVIEW")} 
              />
              <SidebarItem 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
                label="Utilisateurs" active={activeView === "USERS"} onClick={() => setActiveView("USERS")} 
              />
              <SidebarItem 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
                label="Entreprises" active={activeView === "COMPANIES"} onClick={() => setActiveView("COMPANIES")} 
              />
              <SidebarItem 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
                label="Hackathons" active={activeView === "HACKATHONS"} onClick={() => setActiveView("HACKATHONS")} 
              />
              <SidebarItem 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                label="Workflows n8n" active={activeView === "WORKFLOWS"} onClick={() => setActiveView("WORKFLOWS")} 
              />
            </nav>
          </div>
          
          <div className="mt-auto p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
            <p className="text-xs font-bold text-cyan-400 mb-1">Status Admin</p>
            <p className="text-[10px] text-white/50">Vous avez un accès complet à la gestion système.</p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto p-6 md:p-10">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              System <span className="text-cyan-400">Control</span> Panel
            </h1>
            <p className="text-[10px] text-white/40 tracking-[0.5em] uppercase mt-2">Arena of Coders · Administrative Terminal</p>
          </div>

          {/* Dynamic Content Views */}
          {activeView === "OVERVIEW" && stats && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Metric Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Total Talent" value={stats.users.total} subValue={`${stats.users.verified} vérifiés`} color="cyan" />
                <MetricCard label="Companies" value={stats.users.byRole?.COMPANY ?? 0} subValue="Partenaires actifs" color="emerald" />
                <MetricCard label="Admins" value={stats.users.byRole?.ADMIN ?? 0} subValue="Opérateurs système" color="amber" />
                <MetricCard label="Live Rooms" value={stats.rooms.total} subValue="Salles actives" color="violet" />
              </div>

              {/* Two Column Layout for Recent Data */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <SectionTitle title="Dernières Inscriptions" />
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.02] border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Identité</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Rôle</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Spécialité</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Inscrit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-white">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] text-white/40 font-mono">{u.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : u.role === 'COMPANY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-cyan-400">{u.mainSpecialty || "—"}</td>
                            <td className="px-6 py-4 text-[10px] text-white/30 font-mono">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => setActiveView("USERS")} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                    VOIR TOUS LES UTILISATEURS <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <SectionTitle title="Répartition Spécialités" />
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                    {stats.specialties.list.map(s => {
                      const count = stats.specialties.bySpecialty[s] ?? 0;
                      const pct = Math.round((count / stats.users.total) * 100);
                      return (
                        <div key={s} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase">
                            <span>{s}</span>
                            <span>{count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500/60 transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "USERS" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input 
                    placeholder="Chercher par nom, email..."
                    value={usersSearch}
                    onChange={e => setUsersSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
                <select 
                  value={usersRole}
                  onChange={e => { setUsersRole(e.target.value); setUsersPage(0); }}
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 outline-none min-w-[160px]"
                >
                  <option value="">Tous les rôles</option>
                  <option value="USER">User</option>
                  <option value="COMPANY">Company</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {loadingUsers ? (
                <div className="py-20 text-center"><div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-cyan-400 text-xs font-mono animate-pulse">QUERYING TALENT DATABASE...</p></div>
              ) : usersResult && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.02] border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Email</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Identité</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Rôle</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Statut</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersResult.users.map(u => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-white/80">{u.email}</td>
                            <td className="px-6 py-4 font-bold text-white">{u.firstName} {u.lastName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' : u.role === 'COMPANY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {u.isEmailVerified && <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-black">VÉRIFIÉ</span>}
                                {u.isBanned && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black">BANNI</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest">Éditer</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {usersResult.total > PAGE_SIZE && (
                    <div className="flex justify-center gap-4 pt-4">
                      <button disabled={usersPage === 0} onClick={() => setUsersPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold disabled:opacity-30">PRÉCÉDENT</button>
                      <button disabled={(usersPage + 1) * PAGE_SIZE >= usersResult.total} onClick={() => setUsersPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold disabled:opacity-30">SUIVANT</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeView === "COMPANIES" && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <SectionTitle title="Demandes de Rôle Entreprise" />
                {loadingRequests ? (
                  <div className="py-20 text-center text-white/30 font-mono text-sm uppercase animate-pulse">Fetching verification requests...</div>
                ) : companyRequests.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Aucune demande en attente</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companyRequests.map(r => (
                      <div key={r.id} className="bg-[#1a1f26] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-all shadow-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-black italic uppercase text-white leading-tight">{r.companyName}</h3>
                            <p className="text-[10px] text-cyan-400 font-mono mt-1">SOUHAITÉ PAR: {r.user?.firstName} {r.user?.lastName}</p>
                          </div>
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase rounded tracking-widest animate-pulse">En attente</span>
                        </div>
                        <p className="text-sm text-white/60 line-clamp-3 leading-relaxed">{r.description}</p>
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => handleReviewRequest(r.id, 'APPROVED')}
                            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-black uppercase py-3 rounded-xl transition-all"
                          >
                            Accepter
                          </button>
                          <button 
                            onClick={() => handleReviewRequest(r.id, 'REJECTED')}
                            className="flex-1 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 text-[10px] font-black uppercase py-3 rounded-xl transition-all"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "HACKATHONS" && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 space-y-4">
                   <SectionTitle title="Système de Compétitions" />
                   <div className="relative">
                     <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                     <input 
                      placeholder="RECHERCHER UN HACKATHON..."
                      value={compSearch}
                      onChange={e => setCompSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                   </div>
                 </div>
                 <button 
                    onClick={() => setShowCreateForm(f => !f)} 
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest shadow-lg shadow-cyan-500/20 whitespace-nowrap"
                 >
                   {showCreateForm ? " ANNULER " : " CRÉER HACKATHON "}
                 </button>
               </div>

               {showCreateForm && (
                 <div className="bg-[#1a1f26] border border-white/10 rounded-2xl p-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreateCompetition}>
                       <div className="md:col-span-2 space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Titre du Hackathon</label>
                         <input 
                          required 
                          value={compForm.title}
                          onChange={e => setCompForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="EX: GLOBAL ARENA 2026" 
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                       </div>
                       <div className="md:col-span-2 space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Description / Lore</label>
                         <textarea 
                          required 
                          rows={4} 
                          value={compForm.description}
                          onChange={e => setCompForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="CONTEXTE DU CHALLENGE..." 
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                        />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Spécialité Cible</label>
                         <select 
                          required
                          value={compForm.specialty || ""}
                          onChange={e => setCompForm(f => ({ ...f, specialty: e.target.value as any || undefined }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="">-- Choisir --</option>
                            <option value="FRONTEND">FRONTEND</option>
                            <option value="BACKEND">BACKEND</option>
                            <option value="FULLSTACK">FULLSTACK</option>
                            <option value="MOBILE">MOBILE</option>
                            <option value="DATA">DATA</option>
                            <option value="CYBERSECURITY">CYBERSECURITY</option>
                         </select>
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Niveau de Danger</label>
                         <select 
                          value={compForm.difficulty}
                          onChange={e => setCompForm(f => ({ ...f, difficulty: e.target.value as any }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="EASY">EASY</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HARD">HARD</option>
                         </select>
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Date de Début</label>
                         <input 
                          required
                          type="datetime-local"
                          value={compForm.startDate}
                          onChange={e => setCompForm(f => ({ ...f, startDate: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Date de Fin</label>
                         <input 
                          required
                          type="datetime-local"
                          value={compForm.endDate}
                          onChange={e => setCompForm(f => ({ ...f, endDate: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Reward Pool (XC)</label>
                         <input 
                          type="number"
                          value={compForm.rewardPool}
                          onChange={e => setCompForm(f => ({ ...f, rewardPool: Number(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Top N Gagnants</label>
                         <input 
                          type="number"
                          value={compForm.topN}
                          onChange={e => setCompForm(f => ({ ...f, topN: Number(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                       </div>

                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Capacité Max (Participants)</label>
                          <input 
                           type="number"
                           placeholder="Ex: 50"
                           value={compForm.maxParticipants || ""}
                           onChange={e => setCompForm(f => ({ ...f, maxParticipants: e.target.value ? Number(e.target.value) : undefined }))}
                           className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                         />
                       </div>

                       <div className="flex items-center gap-3">
                         <input 
                          type="checkbox"
                          id="adminAntiCheat"
                          checked={compForm.antiCheatEnabled}
                          onChange={e => setCompForm(f => ({ ...f, antiCheatEnabled: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                        />
                         <label htmlFor="adminAntiCheat" className="text-xs text-white/60 uppercase tracking-widest cursor-pointer">Activer Anti-Triche IA</label>
                       </div>

                       {compForm.antiCheatEnabled && (
                         <div className="space-y-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                            <div className="flex justify-between items-center text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                               <span>Seuil de Confiance</span>
                               <span>{compForm.antiCheatThreshold}%</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              value={compForm.antiCheatThreshold}
                              onChange={e => setCompForm(f => ({ ...f, antiCheatThreshold: Number(e.target.value) }))}
                              className="w-full accent-orange-500"
                            />
                         </div>
                       )}

                       <button 
                        disabled={createLoading}
                        className="md:col-span-2 bg-cyan-500 p-4 rounded-xl font-black uppercase text-black tracking-[0.2em] shadow-xl disabled:opacity-50"
                       >
                         {createLoading ? "INITIALISATION EN COURS..." : "Créer Hackathon"}
                       </button>
                    </form>
                 </div>
               )}

               <div className="space-y-4">
                 {competitions
                  .filter(c => c.title.toLowerCase().includes(compSearch.toLowerCase()))
                  .map(c => (
                    <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition-all">
                       <div className="flex-1 space-y-2">
                         <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${STATUS_COLOR[c.status] || 'bg-white/10 text-white/60'}`}>
                             {c.status}
                           </span>
                           <span className="text-[8px] border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">{c.specialty}</span>
                         </div>
                         <h3 className="text-lg font-black italic uppercase text-white leading-tight">{c.title}</h3>
                         <p className="text-xs text-white/40 font-mono tracking-tighter line-clamp-1">{c.description}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Participants</p>
                            <p className="text-xl font-black text-white">{c._count?.participants || 0}</p>
                          </div>
                          <div className="flex gap-2">
                            {getNextStatus(c.status) && getNextStatusLabel(c.status) !== "Lancer" && (
                              <button 
                                onClick={() => handleStatusChange(c.id, getNextStatus(c.status)!)}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                              >
                                {getNextStatusLabel(c.status)}
                              </button>
                            )}
                            <button onClick={() => router.push(`/hackathon/${c.id}/details`)} className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Gérer</button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeView === "WORKFLOWS" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10 animate-pulse"></div>
                  <div className="max-w-2xl space-y-6">
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-widest">Startup <span className="text-cyan-400">Idea</span> Scraper</h2>
                    <p className="text-white/60 leading-relaxed font-mono text-sm lowercase tracking-tighter">
                      Ce workflow connecte Reddit, une analyse IA par Claude et un envoi automatisé via Gmail. Idéal pour monitorer les tendances en temps réel.
                    </p>
                    <div className="flex items-center gap-6 pt-4">
                      <button 
                        onClick={handleRunN8n}
                        disabled={n8nLoading}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {n8nLoading ? "EXÉCUTION EN COURS..." : "DÉCLENCHER WORKFLOW"}
                      </button>
                      <div className="flex items-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                         <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Connecté à n8n Instance</span>
                      </div>
                    </div>

                    {n8nMsg && (
                      <div className={`mt-6 p-4 rounded-xl font-mono text-[10px] tracking-widest uppercase ${n8nMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                        [{n8nMsg.type === 'success' ? 'SUCCESS' : 'FAILURE'}] {n8nMsg.text}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
    >
      {icon}
      <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
    </button>
  );
}

function MetricCard({ label, value, subValue, color }: { label: string, value: string | number, subValue: string, color: 'cyan' | 'emerald' | 'amber' | 'violet' }) {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };
  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-xl ${colorMap[color]} transition-transform hover:scale-[1.02] duration-300 cursor-default`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-4xl font-black italic tracking-tighter leading-none">{value}</p>
        <span className="text-[8px] font-bold opacity-40 uppercase mb-1">{subValue}</span>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-4 w-1 bg-cyan-500"></div>
      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">{title}</h2>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-amber-500/20 text-amber-300",
  OPEN_FOR_ENTRY: "bg-emerald-500/20 text-emerald-300",
  RUNNING: "bg-cyan-500/20 text-cyan-300",
  SUBMISSION_CLOSED: "bg-orange-500/20 text-orange-300",
  EVALUATING: "bg-violet-500/20 text-violet-300",
  COMPLETED: "bg-blue-500/20 text-blue-300",
  ARCHIVED: "bg-white/10 text-white/40",
};

function getNextStatus(status: string): CompetitionStatus | null {
  const flow: Record<string, CompetitionStatus | null> = {
    SCHEDULED: "OPEN_FOR_ENTRY",
    OPEN_FOR_ENTRY: "RUNNING",
    RUNNING: "SUBMISSION_CLOSED",
    SUBMISSION_CLOSED: "EVALUATING",
    EVALUATING: "COMPLETED",
    COMPLETED: "ARCHIVED",
    ARCHIVED: null,
  };
  return flow[status] || null;
}

function getNextStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SCHEDULED: "Ouvrir",
    OPEN_FOR_ENTRY: "Lancer",
    RUNNING: "Fermer",
    SUBMISSION_CLOSED: "Évaluer",
    EVALUATING: "Calculer",
    COMPLETED: "Archiver",
  };
  return labels[status] || "Suivant";
}
