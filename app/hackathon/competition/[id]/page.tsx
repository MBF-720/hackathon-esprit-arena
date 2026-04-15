"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PlatformNavbar from "../../../components/PlatformNavbar";
import {
  getCompetitionById,
  getMyParticipation,
  getMyEquipe,
  joinSolo,
  inviteToEquipe,
  searchUsersForInvite,
  joinTeamChat,
  getToken,
  markEquipeReady,
  TEAM_SIZE_MIN,
  TEAM_SIZE_MAX,
  type Competition,
  type Equipe,
  type SearchUserResult,
} from "../../../lib/api";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop";

export default function CompetitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [equipe, setEquipe] = useState<Equipe | null>(null);
  const [equipeRole, setEquipeRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [equipePanelMsg, setEquipePanelMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Search users
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Team chat
  const [joiningChat, setJoiningChat] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  const refreshEquipe = async () => {
    try {
      const eq = await getMyEquipe(id);
      setEquipe(eq);
    } catch {}
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const comp = await getCompetitionById(id);
        setCompetition(comp);

        if (getToken()) {
          const participation = await getMyParticipation(id);
          if (participation) {
            setIsJoined(true);
            setEquipeRole((participation as any).equipeRole ?? null);
          }
          const eq = await getMyEquipe(id);
          setEquipe(eq);
        }
      } catch (err: any) {
        setError(err.message || "Impossible de charger les détails.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleJoinSolo = async () => {
    try {
      await joinSolo(id);
      setIsJoined(true);
    } catch (err: any) {
      alert(err?.message ?? "Erreur");
    }
  };

  const handleInvite = async (email: string) => {
    if (!equipe || !email.trim()) return;
    setInviting(true);
    setEquipePanelMsg(null);
    try {
      const res = await inviteToEquipe(equipe.id, email.trim());
      setEquipePanelMsg({ type: "success", text: res.message });
      setInviteEmail("");
      setSearchQuery("");
      setSearchResults([]);
      await refreshEquipe();
    } catch (err: any) {
      setEquipePanelMsg({ type: "error", text: err?.message ?? "Erreur" });
    } finally {
      setInviting(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const results = await searchUsersForInvite(searchQuery.trim(), id);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) handleSearch();
      else setSearchResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleJoinTeamChat = async () => {
    if (!equipe) return;
    setJoiningChat(true);
    try {
      await joinTeamChat(equipe.id, id);
      router.push(`/hackathon/team-chat/${equipe.id}/${id}`);
    } catch (err: any) {
      alert(err?.message ?? "Impossible de rejoindre le chat d'équipe");
    } finally {
      setJoiningChat(false);
    }
  };

  const handleMarkEquipeReady = async () => {
    if (!equipe) return;
    setMarkingReady(true);
    try {
      const updated = await markEquipeReady(equipe.id);
      setEquipe(updated);
      setEquipePanelMsg({
        type: "success",
        text: "Équipe validée : le groupe est prêt.",
      });
    } catch (err: any) {
      setEquipePanelMsg({
        type: "error",
        text: err?.message ?? "Impossible de valider l'équipe",
      });
    } finally {
      setMarkingReady(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
        <PlatformNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
        <PlatformNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Erreur</h2>
          <p className="text-white/60 mb-6">{error || "Hackathon introuvable."}</p>
          <Link href="/hackathon" className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(competition.startDate);
  const endDate = new Date(competition.endDate);
  const isRunning = competition.status === "RUNNING";
  const isOpen = competition.status === "OPEN_FOR_ENTRY";
  const isLeader = equipeRole === "LEADER" || equipe?.myRole === "LEADER";
  const memberCount = equipe?.members?.length ?? 0;
  const canMarkReady =
    isLeader &&
    equipe?.status === "FORMING" &&
    memberCount >= TEAM_SIZE_MIN &&
    memberCount <= TEAM_SIZE_MAX;
  const showInvitePanel =
    isLeader &&
    equipe?.status === "FORMING" &&
    memberCount < TEAM_SIZE_MAX;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col font-sans">
      <PlatformNavbar />

      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <Image src={DEFAULT_IMAGE} alt={competition.title} fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex gap-3">
              {competition.specialty && (
                <span className="px-3 py-1 bg-cyan-500 text-black font-black text-[10px] uppercase tracking-widest rounded">
                  {competition.specialty}
                </span>
              )}
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest rounded border border-white/10">
                {competition.difficulty}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{competition.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-6">
            <h2 className="text-xl font-black italic uppercase text-cyan-400 tracking-widest">Description du Challenge</h2>
            <p className="text-white/80 leading-relaxed text-lg font-light whitespace-pre-wrap">{competition.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoCard icon="📅" label="Début" value={startDate.toLocaleString("fr-FR")} />
            <InfoCard icon="🏁" label="Fin" value={endDate.toLocaleString("fr-FR")} />
            <InfoCard icon="🏆" label="Récompenses" value={competition.rewardPool > 0 ? `${competition.rewardPool.toLocaleString()} XC` : "Gloire & Honneur"} />
            <InfoCard icon="👥" label="Participants Max" value={competition.maxParticipants?.toString() || "Illimité"} />
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Règles & Conditions</h3>
            <ul className="space-y-3 text-sm text-white/60 list-disc pl-5">
              <li>
                Équipes manuelles : {TEAM_SIZE_MIN} à {TEAM_SIZE_MAX} membres (vous inclus) ; le leader valide le groupe lorsqu&apos;il est prêt.
              </li>
              <li>Le leader de l&apos;équipe soumet le travail final via GitHub.</li>
              <li>Le respect de la spécialité ({competition.specialty}) est obligatoire.</li>
              <li>{competition.antiCheatEnabled ? "L'anti-triche par IA est activé." : "Fair play exigé."}</li>
              <li>Les participants solo seront assignés automatiquement à une équipe au démarrage.</li>
            </ul>
          </div>

          {/* Equipe Panel */}
          {isJoined && equipe && (
            <div className="p-8 rounded-3xl bg-violet-500/5 border border-violet-500/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">{equipe.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      equipe.status === "READY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" :
                      equipe.status === "PARTICIPATING" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20" :
                      "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                    }`}>
                      {equipe.status === "FORMING"
                        ? `${memberCount}/${TEAM_SIZE_MAX} membres (min. ${TEAM_SIZE_MIN})`
                        : equipe.status === "READY"
                          ? "Équipe prête"
                          : "En Compétition"}
                    </span>
                  </div>
                  {equipe.isAutoFormed && (
                    <p className="text-[10px] text-white/30 mt-1">Équipe formée automatiquement</p>
                  )}
                </div>
                {isLeader && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                    Leader
                  </span>
                )}
              </div>

              {/* Team Chat Button */}
              <button
                onClick={handleJoinTeamChat}
                disabled={joiningChat}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all active:scale-[0.98] group disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  {joiningChat ? "Connexion..." : "💬 Chat d'équipe"}
                </span>
              </button>

              {isLeader && equipe.status === "FORMING" && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    Invitez des coéquipiers jusqu&apos;à {TEAM_SIZE_MAX} personnes au total, puis validez
                    lorsque l&apos;effectif est entre {TEAM_SIZE_MIN} et {TEAM_SIZE_MAX} membres.
                  </p>
                  {canMarkReady && (
                    <button
                      type="button"
                      onClick={handleMarkEquipeReady}
                      disabled={markingReady}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      {markingReady
                        ? "Validation..."
                        : "Valider l'équipe (groupe prêt)"}
                    </button>
                  )}
                  {!canMarkReady && memberCount < TEAM_SIZE_MIN && (
                    <p className="text-[9px] font-mono text-amber-400/90">
                      Encore {TEAM_SIZE_MIN - memberCount} place(s) minimum à remplir pour pouvoir valider.
                    </p>
                  )}
                </div>
              )}

              {/* Members */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Membres</p>
                {equipe.members?.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-sm font-black text-white/60">
                      {m.user.firstName?.[0]}{m.user.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{m.user.firstName} {m.user.lastName}</p>
                      <p className="text-[10px] text-white/30">{m.user.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      m.role === "LEADER" ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/30"
                    }`}>
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pending invitations */}
              {equipe.invitations && equipe.invitations.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Invitations en attente</p>
                  {equipe.invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-black text-amber-400">
                        {inv.invitee?.firstName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white/70">{inv.invitee?.firstName} {inv.invitee?.lastName}</p>
                        <p className="text-[9px] text-white/30">{inv.invitee?.email}</p>
                      </div>
                      <span className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest">En attente</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Invite form (leader only, team not full, still forming) */}
              {showInvitePanel && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Inviter un membre</p>

                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom ou email..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                        {searchResults.map((u) => (
                          <button
                            key={u.id}
                            disabled={u.alreadyInTeam || u.inSoloQueue}
                            onClick={() => {
                              handleInvite(u.email);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-xs font-black text-violet-400">
                              {u.firstName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{u.firstName} {u.lastName}</p>
                              <p className="text-[9px] text-white/30">{u.email}</p>
                            </div>
                            {u.alreadyInTeam && <span className="text-[8px] text-red-400">Déjà en équipe</span>}
                            {u.inSoloQueue && <span className="text-[8px] text-amber-400">File solo</span>}
                            {!u.alreadyInTeam && !u.inSoloQueue && <span className="text-[8px] text-violet-400">Inviter</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Direct email invite */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Ou saisir un email directement..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20"
                    />
                    <button
                      onClick={() => handleInvite(inviteEmail)}
                      disabled={inviting || !inviteEmail.trim()}
                      className="px-6 py-3 rounded-xl bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-400 transition-all disabled:opacity-50"
                    >
                      {inviting ? "..." : "Inviter"}
                    </button>
                  </div>

                </div>
              )}

              {equipePanelMsg && (
                <p
                  className={`text-[10px] font-bold ${equipePanelMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {equipePanelMsg.text}
                </p>
              )}
            </div>
          )}

          {/* Solo queue info */}
          {isJoined && !equipe && (
            <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">File d&apos;attente solo</h3>
                  <p className="text-[10px] text-white/40">Vous serez automatiquement assigné à une équipe au démarrage du hackathon.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="p-8 rounded-3xl bg-[#1a1f26] border border-white/10 shadow-2xl space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Statut actuel</p>
                <p className="text-xl font-bold text-white uppercase italic">
                  {isJoined ? (equipe ? `Équipe: ${equipe.name}` : "Solo — En attente") : "Non Inscrit"}
                </p>
              </div>

              <div className="h-px bg-white/5" />

              {isJoined ? (
                <div className="space-y-6">
                  <p className="text-sm text-white/60 leading-relaxed font-light italic">
                    {isRunning
                      ? "Le hackathon est en cours ! Rejoignez votre salle dédiée."
                      : equipe
                        ? `Votre équipe "${equipe.name}" est ${equipe.status === "READY" ? "validée (prête)" : "en formation"}. ${isLeader ? `Invitez entre ${TEAM_SIZE_MIN} et ${TEAM_SIZE_MAX} membres puis validez le groupe.` : "En attente du leader."}`
                        : "Vous êtes en file solo. Vous serez assigné à une équipe au démarrage."}
                  </p>
                  {isRunning ? (
                    <Link
                      href="/hackathon/room-general"
                      className="block w-full bg-cyan-500 hover:bg-cyan-400 text-black p-4 rounded-2xl font-black uppercase tracking-[0.2em] text-center transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
                    >
                      Rejoindre la salle
                    </Link>
                  ) : (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Compte à rebours</p>
                      <p className="text-lg font-mono text-cyan-400 mt-1">EN ATTENTE...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    La création d&apos;équipe côté leader n&apos;est pas disponible sur le web. Acceptez une invitation reçue par email, ou rejoignez la file solo pour être assigné à une équipe au démarrage.
                  </p>
                  <button
                    type="button"
                    onClick={handleJoinSolo}
                    disabled={!isOpen}
                    className="block w-full bg-white/[0.03] border border-white/10 hover:border-amber-500/30 hover:text-amber-400 p-4 rounded-2xl font-black uppercase tracking-[0.2em] text-center transition-all active:scale-95 text-white/80 disabled:opacity-50"
                  >
                    Rejoindre la file solo
                  </button>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <span>Réf ID: {competition.id.slice(0, 8)}</span>
                <span>v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
