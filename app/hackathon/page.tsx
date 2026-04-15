"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PlatformNavbar from "../components/PlatformNavbar";
import { 
  getHackathonRooms, 
  getCompetitions, 
  getMyParticipation, 
  getMyEquipe,
  createEquipe,
  joinSolo,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  getProfile,
  getToken,
  type Competition,
  type Equipe,
  type EquipeInvitation,
  TEAM_SIZE_MAX,
} from "../lib/api";

type Room = { id: string; name: string; description: string; specialty?: string; canParticipate: boolean };
type DashboardView = "CATALOGUE" | "MY_EVENTS" | "COMMUNITY";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=800&h=400&fit=crop";

// ─────────────────────────────────────────────────────────────────
// useCountdown Hook
// ─────────────────────────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (d > 0) setTimeLeft(`${d}j ${h}h ${m}m`);
      else setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<DashboardView>("CATALOGUE");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [myJoinedIds, setMyJoinedIds] = useState<Set<string>>(new Set());
  const [myEquipes, setMyEquipes] = useState<Record<string, Equipe>>({});
  const [invitations, setInvitations] = useState<EquipeInvitation[]>([]);
  
  // Modal state for creating equipe
  const [showCreateModal, setShowCreateModal] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  
  const [search, setSearch] = useState("");
  const [activeTech, setActiveTech] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");

  const loadInvitations = async () => {
    try {
      const res = await getMyInvitations();
      setInvitations(res.invitations ?? []);
    } catch {}
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/signin");
      return;
    }
    
    setLoading(true);
    Promise.all([
      getProfile(),
      getCompetitions({ limit: 50 }),
      getHackathonRooms()
    ]).then(([profile, compRes, roomRes]) => {
      setUser(profile);
      setCompetitions(compRes.data ?? []);
      setRooms(roomRes.rooms ?? []);
      
      if (compRes.data) {
        compRes.data.forEach(async (c) => {
           try {
             const p = await getMyParticipation(c.id);
             if (p) {
               setMyJoinedIds(prev => {
                  const next = new Set(prev);
                  next.add(c.id);
                  return next;
               });
             }
             const eq = await getMyEquipe(c.id);
             if (eq) {
               setMyEquipes(prev => ({ ...prev, [c.id]: eq }));
             }
           } catch {}
        });
      }
      
      loadInvitations();
    }).catch(console.error).finally(() => setLoading(false));
  }, [router]);

  const handleCreateEquipe = async (competitionId: string) => {
    if (!newTeamName.trim()) return;
    setCreating(true);
    try {
      const eq = await createEquipe(competitionId, newTeamName.trim());
      setMyEquipes(prev => ({ ...prev, [competitionId]: eq }));
      setMyJoinedIds(prev => new Set(prev).add(competitionId));
      setShowCreateModal(null);
      setNewTeamName("");
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de la création de l'équipe");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSolo = async (id: string) => {
    try {
      await joinSolo(id);
      setMyJoinedIds(prev => new Set(prev).add(id));
    } catch (err: any) {
      alert(err?.message ?? "Erreur d'inscription");
    }
  };

  const handleAcceptInvite = async (inv: EquipeInvitation) => {
    try {
      const eq = await acceptInvitation(inv.id);
      setMyEquipes(prev => ({ ...prev, [eq.competitionId]: eq }));
      setMyJoinedIds(prev => new Set(prev).add(eq.competitionId));
      setInvitations(prev => prev.filter(i => i.id !== inv.id));
    } catch (err: any) {
      alert(err?.message ?? "Erreur");
    }
  };

  const handleDeclineInvite = async (invId: string) => {
    try {
      await declineInvitation(invId);
      setInvitations(prev => prev.filter(i => i.id !== invId));
    } catch (err: any) {
      alert(err?.message ?? "Erreur");
    }
  };

  const filteredCompetitions = competitions.filter(c => {
    const matchesSearch = !search.trim() || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesTech = activeTech === "all" || (c.specialty?.toLowerCase() === activeTech.toLowerCase());
    
    let matchesStatus = true;
    if (activeStatus === "soon") matchesStatus = c.status === "SCHEDULED" || c.status === "OPEN_FOR_ENTRY";
    else if (activeStatus === "live") matchesStatus = c.status === "RUNNING";
    
    if (activeView === "MY_EVENTS") {
        return matchesSearch && matchesTech && matchesStatus && myJoinedIds.has(c.id);
    }
    return matchesSearch && matchesTech && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-cyan-400 font-mono text-[10px] tracking-widest uppercase">Syncing Arena Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <PlatformNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 bg-[#090e18] border-r border-white/5 hidden lg:flex flex-col p-8 gap-10">
          <div className="space-y-6">
             <div className="px-2">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]"></div>
                   <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Profil Actif</p>
                </div>
                <h2 className="text-2xl font-black italic uppercase text-white truncate">{user?.firstName}</h2>
                <div className="flex items-center gap-3 mt-2">
                   <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40">LVL {Math.floor((user?.xp || 0) / 100) + 1}</div>
                   <p className="text-[9px] text-cyan-400/60 font-black uppercase tracking-widest">{user?.xp || 0} XP Total</p>
                </div>
             </div>

             <nav className="space-y-1.5">
                <SidebarTab label="Catalogue" icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" active={activeView === "CATALOGUE"} onClick={() => setActiveView("CATALOGUE")} />
                <SidebarTab label="Mes Inscriptions" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" active={activeView === "MY_EVENTS"} onClick={() => setActiveView("MY_EVENTS")} />
                <SidebarTab label="Communauté" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" active={activeView === "COMMUNITY"} onClick={() => setActiveView("COMMUNITY")} />
             </nav>
          </div>

          {/* Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Invitations ({invitations.length})</p>
              </div>
              {invitations.map(inv => (
                <div key={inv.id} className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 space-y-3">
                  <p className="text-[11px] text-white/80 font-semibold truncate">{inv.equipe?.name || "Équipe"}</p>
                  <p className="text-[9px] text-white/40">{inv.equipe?.competition?.title}</p>
                  <p className="text-[9px] text-white/30">De: {inv.inviter?.firstName} {inv.inviter?.lastName}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptInvite(inv)} className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
                      Accepter
                    </button>
                    <button onClick={() => handleDeclineInvite(inv.id)} className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all">
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto">
             <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -z-10 group-hover:bg-cyan-500/10 transition-all"></div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                   <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Global Arena</p>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed font-medium">Rejoignez le flux global pour échanger avec tous les initiés de l&apos;Arène.</p>
                <Link href="/hackathon/arena-live" className="block w-full py-3.5 rounded-2xl bg-cyan-500 text-black text-center text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10 active:scale-95">
                   Ouvrir Arena Live
                </Link>
             </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-auto p-6 lg:p-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
             <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                   Arena <span className="text-cyan-400">Hub</span>
                </h1>
                <p className="text-[11px] text-white/20 tracking-[0.4em] uppercase mt-2 font-bold">
                   {activeView === "CATALOGUE" ? "Flux des Compétitions Disponibles" : 
                    activeView === "MY_EVENTS" ? "Vos Hackathons" : 
                    "Salles de Discussion Communautaires"}
                </p>
             </div>

             {activeView !== "COMMUNITY" && (
                <div className="space-y-4">
                   <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 self-end">
                      {["ALL", "FRONTEND", "BACKEND", "DATA", "DESIGN"].map(f => (
                        <button 
                          key={f} 
                          onClick={() => setActiveTech(f.toLowerCase())}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTech === f.toLowerCase() ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                          {f}
                        </button>
                      ))}
                   </div>
                   <div className="flex items-center gap-2 justify-end">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mr-2">Status:</p>
                      {[
                        { id: "all", label: "TOUT" },
                        { id: "soon", label: "BIENTÔT" },
                        { id: "live", label: "EN DIRECT" }
                      ].map(s => {
                        const isLiveAndActive = s.id === "live" && activeStatus === "live";
                        return (
                          <button 
                            key={s.id} 
                            onClick={() => setActiveStatus(s.id)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all border flex items-center gap-2 ${
                              isLiveAndActive 
                              ? 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                              : activeStatus === s.id 
                                ? 'bg-white/10 text-white border-white/20' 
                                : s.id === "live" 
                                  ? 'text-red-500/40 border-red-500/20 hover:text-red-500 hover:border-red-500/40' 
                                  : 'text-white/20 border-transparent hover:text-white/40'
                            }`}
                          >
                            {s.id === "live" && <span className={`w-1 h-1 rounded-full bg-current ${s.id === "live" ? "animate-pulse" : ""}`}></span>}
                            {s.label}
                          </button>
                        );
                      })}
                   </div>
                </div>
             )}
          </div>

          {activeView === "COMMUNITY" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CommunityCard 
                   title="Arena Global"
                   desc="Le salon public. Discutez avec tous les participants de la plateforme en temps réel."
                   type="GLOBAL"
                   onClick={() => router.push("/hackathon/arena-live")}
                />
                <CommunityCard 
                   title="Salle générale"
                   desc="Espace commun pour tous les membres : chat, visio et partage d&apos;écran (indépendamment de la spécialité)."
                   type="SPECIALTY"
                   highlight={user?.mainSpecialty}
                   onClick={() => router.push("/hackathon/room-general")}
                />
             </div>
          ) : (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative group">
                   <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-focus-within:bg-cyan-500/10 transition-all"></div>
                   <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   <input 
                      placeholder="Rechercher une compétition par titre ou technologie..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-6 py-5 rounded-[32px] text-sm outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-white/20"
                   />
                </div>

                {filteredCompetitions.length === 0 ? (
                  <div className="bg-white/[0.01] border border-white/5 border-dashed rounded-[48px] py-32 text-center flex flex-col items-center gap-6">
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     </div>
                     <div className="space-y-2">
                        <p className="text-white/40 font-black italic uppercase text-3xl tracking-tight">Signal Interrompu</p>
                        <p className="text-[11px] text-white/10 uppercase tracking-[0.4em] font-bold">Aucune compétition ne correspond à votre recherche ou filtre.</p>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                    {filteredCompetitions.map(c => (
                      <CompetitionCard 
                        key={c.id} 
                        competition={c} 
                        isJoined={myJoinedIds.has(c.id)}
                        equipe={myEquipes[c.id]}
                        onCreateEquipe={() => setShowCreateModal(c.id)}
                        onJoinSolo={() => handleJoinSolo(c.id)}
                      />
                    ))}
                  </div>
                )}
             </div>
          )}
        </main>
      </div>

      {/* Create Equipe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(null)}>
          <div className="bg-[#0d1424] border border-white/10 rounded-[32px] p-8 max-w-md w-full space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">Créer une Équipe</h3>
              <p className="text-[11px] text-white/40">
                Créez votre équipe (effectif final {TEAM_SIZE_MAX} max. après invitations), puis invitez jusqu&apos;à compléter le groupe et validez-le quand il est prêt.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nom de l&apos;équipe</label>
              <input 
                type="text" 
                value={newTeamName} 
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Ex: Les Hackers, Team Alpha..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/20"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(null)}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleCreateEquipe(showCreateModal)}
                disabled={creating || !newTeamName.trim()}
                className="flex-1 py-4 rounded-2xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {creating ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────

function SidebarTab({ label, icon, active, onClick }: { label: string, icon: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-7 py-4.5 rounded-[20px] transition-all duration-500 border ${active ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' : 'text-white/30 border-transparent hover:bg-white/[0.03] hover:text-white'}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon}/></svg>
      <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      {active && (
        <div className="ml-auto flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
        </div>
      )}
    </button>
  );
}

function CompetitionCard({ competition: c, isJoined, equipe, onCreateEquipe, onJoinSolo }: { competition: Competition, isJoined: boolean, equipe?: Equipe, onCreateEquipe: () => void, onJoinSolo: () => void }) {
  const timeLeft = useCountdown(c.endDate);
  const isExpired = timeLeft === "EXPIRED" || c.status === "COMPLETED" || c.status === "ARCHIVED";
  const isOpen = c.status === "OPEN_FOR_ENTRY";
  const isRunning = c.status === "RUNNING";

  return (
    <div className="group bg-[#0a0f1a] border border-white/5 rounded-[40px] p-8 flex flex-col gap-8 transition-all duration-500 hover:border-cyan-500/30 hover:bg-[#0d1424] hover:shadow-2xl hover:shadow-cyan-500/5 relative overflow-hidden">
       <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.02] blur-[100px] -z-10 group-hover:bg-cyan-500/[0.05] transition-all"></div>
       
       <div className="flex items-start justify-between gap-6">
          <div className="w-28 h-28 rounded-[28px] overflow-hidden relative border border-white/5 shrink-0">
             <Image src={DEFAULT_IMAGE} alt={c.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${STATUS_BADGE[c.status] || 'bg-white/5 text-white/40'}`}>
                   {STATUS_LABEL[c.status] || c.status}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-black uppercase tracking-widest border border-cyan-500/20">
                   {c.specialty}
                </span>
                {isJoined && equipe && (
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-[9px] font-black uppercase tracking-widest border border-violet-500/20">
                     {equipe.name} ({equipe.members?.length || 0}/{TEAM_SIZE_MAX})
                  </span>
                )}
                {isJoined && !equipe && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                     File Solo
                  </span>
                )}
                {isJoined && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
                     INSCRIT
                  </span>
                )}
             </div>

             <h3 className="text-3xl font-black italic uppercase text-white leading-none tracking-tighter group-hover:text-cyan-400 transition-colors">
                {c.title}
             </h3>

             {!isExpired && (
                <div className="flex items-center gap-2 py-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                   <p className="text-[10px] font-mono text-cyan-400/80 uppercase font-black">
                      {isOpen ? 'Inscriptions se terminent dans: ' : 'Fin du hackathon dans: '} 
                      <span className="text-white ml-1">{timeLeft}</span>
                   </p>
                </div>
             )}
             
             {isExpired && (
                <div className="flex items-center gap-2 py-1 opacity-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                   <p className="text-[10px] font-mono text-red-400 uppercase font-black tracking-widest">Compétition Terminée</p>
                </div>
             )}
          </div>
       </div>

       <p className="text-sm text-white/30 leading-relaxed font-medium line-clamp-2 italic">
          {c.description}
       </p>

       <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-6">
             <div className="space-y-0.5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Reward Pool</p>
                <p className="text-xl font-black text-white italic">{c.rewardPool.toLocaleString()} <span className="text-cyan-400 text-xs not-italic">XC</span></p>
             </div>
             <div className="space-y-0.5">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Inscrits</p>
                <div className="flex items-center gap-2">
                   <p className="text-xl font-black text-white italic">{c._count?.participants || 0}</p>
                   <svg className="w-4 h-4 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                </div>
             </div>
          </div>

          <div className="flex gap-3">
             {isJoined ? (
               <>
                  <Link 
                    href={`/hackathon/competition/${c.id}`} 
                    className="px-8 py-4 rounded-3xl bg-white/[0.03] border border-white/10 text-[11px] font-black uppercase tracking-widest hover:border-cyan-500/40 hover:text-cyan-400 transition-all active:scale-95"
                  >
                     Détails
                  </Link>
                  {isRunning && (
                    <Link 
                      href="/hackathon/room-general"
                      className="px-8 py-4 rounded-3xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
                    >
                       ENTRER
                    </Link>
                  )}
               </>
             ) : isExpired ? (
               <button disabled className="px-12 py-4 rounded-3xl bg-white/5 text-white/20 text-[11px] font-black uppercase tracking-widest cursor-not-allowed">
                  Indisponible
               </button>
             ) : (
               <div className="flex gap-2">
                  <button 
                    onClick={onCreateEquipe}
                    className="px-6 py-4 rounded-3xl bg-cyan-500 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 transition-all active:scale-95"
                  >
                     Créer une Équipe
                  </button>
                  <button 
                    onClick={onJoinSolo}
                    className="px-6 py-4 rounded-3xl bg-white/[0.03] border border-white/10 text-[11px] font-black uppercase tracking-widest hover:border-amber-500/40 hover:text-amber-400 transition-all active:scale-95"
                  >
                     Pas d&apos;équipe
                  </button>
               </div>
             )}
          </div>
       </div>
    </div>
  );
}

function CommunityCard({ title, desc, type, highlight, onClick, disabled }: { title: string, desc: string, type: string, highlight?: string, onClick: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group p-12 rounded-[56px] border transition-all text-left space-y-8 ${disabled ? 'bg-white/[0.01] border-white/5 cursor-not-allowed opacity-30 shadow-none' : 'bg-[#0a0f1a] border-white/10 hover:border-cyan-500/40 hover:scale-[1.01] hover:shadow-2xl shadow-lg'}`}
    >
       <div className={`absolute top-0 right-0 w-80 h-80 blur-[120px] -z-10 transition-all group-hover:scale-125 ${type === 'GLOBAL' ? 'bg-indigo-500/10' : 'bg-cyan-500/10'}`}></div>
       
       <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center border transition-all ${type === 'GLOBAL' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994-1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
       </div>

       <div className="space-y-3">
          <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">{title}</h3>
          <p className="text-base text-white/30 leading-relaxed max-w-[340px] font-medium">{desc}</p>
       </div>

       <div className="pt-6 flex items-center gap-5">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400 group-hover:translate-x-2 transition-transform">{disabled ? "🔒 Accès Restreint" : "REJOINDRE LE HUB →"}</span>
          {highlight && <span className="bg-cyan-500/10 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">{highlight} SECTION</span>}
       </div>
    </button>
  );
}

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  OPEN_FOR_ENTRY: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  RUNNING: "bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
  SUBMISSION_CLOSED: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  EVALUATING: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Planifié",
  OPEN_FOR_ENTRY: "Inscriptions Ouvertes",
  RUNNING: "En Direct 🔴",
  SUBMISSION_CLOSED: "Soumissions Closes",
  EVALUATING: "Évaluation",
  COMPLETED: "Terminé",
};
