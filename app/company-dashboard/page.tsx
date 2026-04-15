"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";
import RecruitmentDashboard from "../components/company/RecruitmentDashboard";
import {
  getToken,
  getProfile,
  getCompetitions,
  createCompetition,
  changeCompetitionStatus,
  type Competition,
  type CompetitionStatus,
  type Specialty,
  type CreateCompetitionPayload,
} from "../lib/api";

const PAGE_SIZE = 10;

type View = "OVERVIEW" | "MY_HACKATHONS" | "CREATE" | "RECRUITMENT";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<View>("OVERVIEW");
  const [user, setUser] = useState<any>(null);
  
  // Data
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [compLoading, setCompLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compSuccess, setCompSuccess] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Create Form
  const [createLoading, setCreateLoading] = useState(false);
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

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/signin");
      return;
    }
    setLoading(true);
    getProfile()
      .then((profile: any) => {
        if (profile?.role !== "COMPANY" && profile?.role !== "ADMIN") {
          router.push("/hackathon");
          return;
        }
        setUser(profile);
        return loadCompetitions();
      })
      .catch((err) => setError(err?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [router]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCompetitions = async () => {
    setCompLoading(true);
    try {
      // Backend automatically filters by company for COMPANY role
      const res = await getCompetitions({ limit: 100 });
      setCompetitions(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Erreur de chargement des hackathons");
    } finally {
      setCompLoading(false);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    setCompSuccess(null);
    try {
      await createCompetition(compForm);
      setCompSuccess("Hackathon créé avec succès");
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
      loadCompetitions();
      setActiveView("MY_HACKATHONS");
    } catch (err: any) {
      setError(err?.message ?? "Erreur de création");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: CompetitionStatus) => {
    try {
      await changeCompetitionStatus(id, newStatus);
      loadCompetitions();
    } catch (err: any) {
      alert(err?.message ?? "Erreur");
    }
  };

  const filteredCompetitions = competitions.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: competitions.length,
    active: competitions.filter(c => ["OPEN_FOR_ENTRY", "RUNNING", "EVALUATING"].includes(c.status)).length,
    participants: competitions.reduce((acc, c) => acc + (c._count?.participants || 0), 0),
    completed: competitions.filter(c => c.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col">
        <PlatformNavbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-mono text-xs mt-6 tracking-[0.2em] uppercase">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-white flex flex-col selection:bg-blue-500/30">
      <PlatformNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-72 border-r border-white/5 bg-[#0a0f18] hidden lg:flex flex-col p-8 gap-10">
          <div className="space-y-8">
            <div className="px-2">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">Utilisateur</p>
              <h2 className="text-lg font-bold text-white truncate">{user?.firstName} {user?.lastName}</h2>
              <p className="text-[9px] text-gray-400 font-mono">ID: {user?.id?.slice(-8)}</p>
            </div>

            <nav className="space-y-2">
              <SidebarItem 
                icon="A"
                label="Centre d'Analyse" active={activeView === "OVERVIEW"} onClick={() => setActiveView("OVERVIEW")} 
              />
              <SidebarItem 
                icon="H"
                label="Mes Hackathons" active={activeView === "MY_HACKATHONS"} onClick={() => setActiveView("MY_HACKATHONS")} 
              />
              <SidebarItem 
                icon="+"
                label="Nouvel Event" active={activeView === "CREATE"} onClick={() => setActiveView("CREATE")} 
              />
              <SidebarItem 
                icon="R"
                label="Recrutement" active={activeView === "RECRUITMENT"} onClick={() => setActiveView("RECRUITMENT")} 
              />
            </nav>
          </div>

          <div className="mt-auto p-6 bg-blue-600/10 rounded-lg border border-blue-600/20 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mode Entreprise</p>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
              Accès illimité à la création d'événements et à la gestion des talents.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-6 lg:p-12">
          {/* Header */}
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Tableau de Bord Entreprise
              </h1>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase mt-2">Arena of Coders - Gestion d'entreprise</p>
            </div>
            <button 
              onClick={() => setActiveView("CREATE")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              + Launch Event
            </button>
          </div>

          {activeView === "OVERVIEW" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Total Events" value={stats.total} subValue="Historique complet" />
                <MetricCard label="In Progress" value={stats.active} subValue="Actions requises" />
                <MetricCard label="Talents Reached" value={stats.participants} subValue="Inscriptions uniques" />
                <MetricCard label="Finished" value={stats.completed} subValue="Challenges clos" />
              </div>

              {/* Recent Activity Mockup or List */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-6">
                  <SectionTitle title="État de vos Hackathons" />
                  <div className="grid grid-cols-1 gap-4">
                    {competitions.slice(0, 3).map(c => (
                      <div key={c.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:bg-white/[0.04] transition-all">
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${STATUS_COLOR[c.status] || 'bg-gray-700/50 text-gray-300'}`}>
                              {c.status}
                            </span>
                            <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">{c.specialty}</span>
                          </div>
                          <h3 className="text-lg font-black italic uppercase text-white truncate max-w-[300px]">{c.title}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Participants</p>
                           <p className="text-xl font-black text-white">{c._count?.participants || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {competitions.length > 3 && (
                    <button onClick={() => setActiveView("MY_HACKATHONS")} className="text-xs font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-all flex items-center gap-2">
                       Voir tous vos hackathons →
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                    <SectionTitle title="Statistiques Talents" />
                    <div className="p-8 rounded-3xl bg-gray-800/30 border border-gray-700 space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Engagements Actifs</p>
                            <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-black italic text-white">{stats.participants}</p>
                                <p className="text-[8px] font-bold text-white/20 uppercase">Inscrits</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black italic text-white text-right">86%</p>
                                <p className="text-[8px] font-bold text-white/20 uppercase text-right">Remplissage</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "MY_HACKATHONS" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input 
                    placeholder="Chercher parmi vos hackathons..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 pl-12 pr-4 py-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-mono text-white"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 px-6 py-4 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 outline-none min-w-[200px] text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="OPEN_FOR_ENTRY">Ouvert</option>
                  <option value="RUNNING">En cours</option>
                  <option value="EVALUATING">Évaluation</option>
                  <option value="COMPLETED">Terminé</option>
                </select>
              </div>

              {compLoading ? (
                <div className="py-20 text-center font-mono opacity-40 uppercase tracking-widest text-xs animate-pulse">Chargement en cours...</div>
              ) : filteredCompetitions.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-700 border-dashed rounded-lg p-20 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest">Aucun hackathon trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCompetitions.map(c => (
                    <div key={c.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 space-y-6 hover:border-blue-600 hover:bg-gray-800/70 transition-all group">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest ${STATUS_COLOR[c.status] || 'bg-white/10 text-white/60'}`}>
                              {c.status}
                            </span>
                            <h3 className="text-xl font-bold text-white leading-tight mt-2">{c.title}</h3>
                          </div>
                          <div className="p-3 bg-gray-700 rounded-lg group-hover:bg-blue-600 transition-all">
                             <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                          </div>
                       </div>
                       
                       <p className="text-xs text-gray-400 font-mono leading-relaxed line-clamp-2">{c.description}</p>
                       
                       <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <div className="flex gap-4 items-center">
                             <div className="text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Participants</p>
                                <p className="text-sm font-black text-white">{c._count?.participants || 0}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Budget (XC)</p>
                                <p className="text-sm font-black text-blue-400">{c.rewardPool}</p>
                             </div>
                          </div>
                          <Link 
                            href={`/hackathon/${c.id}/details`}
                            className="px-6 py-2.5 rounded-lg bg-gray-700 border border-gray-600 hover:border-blue-600 hover:bg-gray-700 text-[10px] font-bold uppercase tracking-widest transition-all text-white"
                          >
                            Détails & Actions
                          </Link>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === "CREATE" && (
            <div className="max-w-4xl animate-in fade-in duration-700">
               <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 shadow-lg relative overflow-hidden">
                  <div className="mb-10 text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-white">Créer un Nouvel Événement</h2>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">Définissez les paramètres de votre nouvelle compétition</p>
                  </div>

                  <form className="space-y-10" onSubmit={handleCreateCompetition}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Désignation de l'Événement</label>
                          <input 
                            required
                            placeholder="EX: PROJECT ZERO • 2026"
                            value={compForm.title}
                            onChange={e => setCompForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white font-mono text-sm outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                       </div>

                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Description et Objectifs</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="DÉTAILLEZ LES OBJECTIFS DU CHALLENGE..."
                            value={compForm.description}
                            onChange={e => setCompForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white font-mono text-sm outline-none focus:ring-1 focus:ring-blue-600 resize-none transition-all"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Spécialité</label>
                          <select 
                            required
                            value={compForm.specialty || ""}
                            onChange={e => setCompForm(f => ({ ...f, specialty: e.target.value as any || undefined }))}
                            className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-blue-600 transition-all font-bold"
                          >
                              <option value="">-- SÉLECTIONNER --</option>
                              <option value="BACKEND">BACKEND</option>
                              <option value="FRONTEND">FRONTEND</option>
                              <option value="FULLSTACK">FULLSTACK</option>
                              <option value="MOBILE">MOBILE</option>
                              <option value="DATA">DATA SCI</option>
                              <option value="CYBERSECURITY">CYBER OP</option>
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Difficulty</label>
                          <select 
                             value={compForm.difficulty}
                             onChange={e => setCompForm(f => ({ ...f, difficulty: e.target.value as any }))}
                             className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-blue-600 transition-all font-bold"
                          >
                              <option value="EASY">NORMAL</option>
                              <option value="MEDIUM">INTERMÉDIAIRE</option>
                              <option value="HARD">CRITICAL</option>
                          </select>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Date de Début</label>
                          <input 
                             required
                             type="datetime-local"
                             value={compForm.startDate}
                             onChange={e => setCompForm(f => ({ ...f, startDate: e.target.value }))}
                             className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Date de Fin</label>
                          <input 
                             required
                             type="datetime-local"
                             value={compForm.endDate}
                             onChange={e => setCompForm(f => ({ ...f, endDate: e.target.value }))}
                             className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Budget (XC)</label>
                          <input 
                             type="number"
                             value={compForm.rewardPool}
                             onChange={e => setCompForm(f => ({ ...f, rewardPool: Number(e.target.value) }))}
                             className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white font-mono text-lg outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Nombre de Lauréats</label>
                          <input 
                             type="number"
                             value={compForm.topN}
                             onChange={e => setCompForm(f => ({ ...f, topN: Number(e.target.value) }))}
                             className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white font-mono text-lg outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Capacité de Participants</label>
                          <input 
                             type="number"
                             value={compForm.maxParticipants || ""}
                             onChange={e => setCompForm(f => ({ ...f, maxParticipants: e.target.value ? Number(e.target.value) : undefined }))}
                             className="w-full bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-white font-mono text-lg outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                          />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-center gap-4 py-4 border-y border-gray-700">
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={compForm.antiCheatEnabled}
                              onChange={e => setCompForm(f => ({ ...f, antiCheatEnabled: e.target.checked }))}
                            />
                            <div className="w-12 h-6 bg-gray-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                          </div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activer Vérification IA (Anti-Cheat)</label>
                       </div>

                       {compForm.antiCheatEnabled && (
                         <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-600/10 space-y-4 animate-in slide-in-from-top-4">
                            <div className="flex justify-between items-center text-[10px] font-black text-blue-400 uppercase tracking-widest">
                               <span>Paramétrage du Seuil Critical</span>
                               <span>{compForm.antiCheatThreshold}%</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="100"
                              value={compForm.antiCheatThreshold}
                              onChange={e => setCompForm(f => ({ ...f, antiCheatThreshold: Number(e.target.value) }))}
                              className="w-full accent-blue-600"
                            />
                            <p className="text-[9px] text-gray-400 italic font-mono uppercase text-center">Un score de confiance inférieur au seuil entraînera une disqualification automatique.</p>
                         </div>
                       )}
                    </div>

                    <div className="pt-8">
                       <button 
                        disabled={createLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                       >
                         {createLoading ? "CRÉATION EN COURS..." : "CRÉER L'ÉVÉNEMENT"}
                       </button>
                       {error && <p className="text-center text-red-400 text-[10px] font-bold uppercase mt-4 animate-pulse">{error}</p>}
                       {compSuccess && <p className="text-center text-blue-400 text-[10px] font-bold uppercase mt-4">{compSuccess}</p>}
                    </div>
                  </form>
               </div>
            </div>
          )}

          {activeView === "RECRUITMENT" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <RecruitmentDashboard />
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

function SidebarItem({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-300 border ${active ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'text-gray-400 border-transparent hover:bg-gray-700/20 hover:text-gray-200'}`}
    >
      <span className={`w-6 h-6 flex items-center justify-center text-sm font-bold ${active ? 'text-blue-400' : 'text-gray-400'}`}>{icon}</span>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
    </button>
  );
}

function MetricCard({ label, value, subValue }: { label: string, value: string | number, subValue: string }) {
  return (
    <div className="p-8 rounded-[32px] border bg-gray-800/30 border-gray-700 backdrop-blur-sm transition-all hover:border-blue-600/30 hover:bg-gray-800/40 duration-300 cursor-default">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-4xl font-black italic tracking-tighter leading-none text-white">{value}</p>
        <span className="text-[8px] font-bold text-gray-400 uppercase mb-1 tracking-widest">{subValue}</span>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-4 w-1 bg-blue-600"></div>
      <h2 className="text-[10px] font-bold uppercase tracking-wide text-gray-300">{title}</h2>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "bg-gray-700/30 text-gray-300",
  OPEN_FOR_ENTRY: "bg-blue-600/20 text-blue-300",
  RUNNING: "bg-blue-600/20 text-blue-300",
  SUBMISSION_CLOSED: "bg-gray-700/30 text-gray-300",
  EVALUATING: "bg-blue-600/20 text-blue-300",
  COMPLETED: "bg-blue-600/20 text-blue-300",
  ARCHIVED: "bg-gray-700/20 text-gray-400",
};
