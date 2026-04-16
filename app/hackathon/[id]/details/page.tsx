"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlatformNavbar from "../../../components/PlatformNavbar";
import {
  getToken,
  getProfile,
  getCompetitionById,
  getCompetitionParticipantsForAdmin,
  getCompetitionEquipes,
  deleteEquipe,
  selectWinner,
  type Competition,
  type CompetitionParticipantAdmin,
  type UserProfile,
  type Equipe,
} from "../../../lib/api";

export default function HackathonDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<CompetitionParticipantAdmin[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/signin");
      return;
    }
    
    getProfile()
      .then((profile: UserProfile) => {
        if (profile.role !== "COMPANY" && profile.role !== "ADMIN") {
          router.replace("/hackathon");
          return;
        }
        return Promise.all([
          getCompetitionById(id),
          getCompetitionParticipantsForAdmin(id),
          getCompetitionEquipes(id),
        ]);
      })
      .then((result) => {
        if (!result) return;
        const [comp, partsData, equipesData] = result;
        setCompetition(comp);
        setParticipants(partsData.participants ?? []);
        setEquipes(equipesData.equipes ?? []);
      })
      .catch((err) => setError(err?.message ?? "Erreur de chargement des détails"))
      .finally(() => {
        setTimeout(() => setLoading(false), 1000);
      });
  }, [id, router]);

  const handleSelectWinner = async (participantId: string) => {
    setSuccess(null);
    setError(null);
    if (!confirm("Voulez-vous vraiment sélectionner ce participant comme gagnant ?")) return;

    try {
      await selectWinner(id, participantId);
      setSuccess("Gagnant sélectionné avec succès !");
      
      // Refresh participants
      const partsData = await getCompetitionParticipantsForAdmin(id);
      setParticipants(partsData.participants ?? []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string"
          ? (err as { message: string }).message
          : "Erreur lors de la sélection du gagnant";
      setError(msg);
    }
  };

  const handleDeleteTeam = async (equipeId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette équipe ? Cette action est irréversible.")) return;
    setError(null);
    setSuccess(null);

    try {
      await deleteEquipe(equipeId);
      setSuccess("Équipe supprimée avec succès !");
      // Refresh teams and participants
      const equipesData = await getCompetitionEquipes(id);
      setEquipes(equipesData.equipes ?? []);
      const partsData = await getCompetitionParticipantsForAdmin(id);
      setParticipants(partsData.participants ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la suppression de l'équipe");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col bg-[#0a0f1a]">
        <PlatformNavbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-amber-400 font-medium text-sm tracking-widest uppercase animate-pulse">
            Récupération des détails...
          </p>
        </div>
      </div>
    );
  }

  if (error && !competition) {
    return (
      <div className="min-h-screen text-white flex flex-col bg-[#0a0f1a]">
        <PlatformNavbar />
        <main className="max-w-4xl mx-auto px-4 py-10 w-full">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans bg-[#0a0f1a]">
      <PlatformNavbar />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          &larr; Retour au dashboard
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            ✅ {success}
          </div>
        )}

        {competition && (
          <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              🏆
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                  {competition.status.replace(/_/g, " ")}
                </span>
                {competition.specialty && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                    {competition.specialty}
                  </span>
                )}
                <span className="text-sm font-semibold text-white/50">
                  {competition.difficulty}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2">{competition.title}</h1>
              <p className="text-white/60 mb-6 max-w-3xl leading-relaxed">{competition.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Dates</p>
                  <p className="text-sm font-medium">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Récompense</p>
                  <p className="text-sm font-medium text-amber-400">
                    {competition.rewardPool > 0 ? `🏆 ${competition.rewardPool} Coins` : "Aucune"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Anti-Triche</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {competition.antiCheatEnabled ? (
                      <><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Activé ({competition.topN}% seuil)</>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-red-400"></span> Désactivé</>
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Participants</p>
                  <p className="text-sm font-medium">
                    {competition._count?.participants ?? 0} {competition.maxParticipants ? `/ ${competition.maxParticipants}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          Saisies & Classement
          <span className="text-sm font-normal text-white/40 px-3 py-1 rounded-full bg-white/5">
            {participants.length} Participant{participants.length !== 1 && "s"}
          </span>
        </h2>

        {participants.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
            <p className="text-white/40 text-lg">Aucun participant pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/50 text-sm uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">Participant</th>
                  <th className="py-4 px-4 font-medium">Score Projet</th>
                  <th className="py-4 px-4 font-medium">Anti-Triche (IA)</th>
                  <th className="py-4 px-4 font-medium">Dépôt Git</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants.map((p, index) => {
                  const confidence = p.antiCheatConfidenceLevel ?? 0;
                  const isFlagged = p.antiCheatFlagged ?? false;
                  
                  return (
                    <tr key={p.id ? `${p.id}-${index}` : `participant-${index}`} className={`hover:bg-white/[0.02] transition-colors ${p.isWinner ? "bg-amber-500/5" : ""}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/50">
                            {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center gap-2">
                              {p.user?.firstName} {p.user?.lastName}
                              {p.isWinner && <span className="text-amber-400" title="Gagnant">👑</span>}
                            </p>
                            <p className="text-xs text-white/40">{p.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2 py-1 rounded">
                          {p.score ?? 0} pts
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isFlagged ? "bg-red-500" : confidence > 80 ? "bg-emerald-500" : "bg-orange-500"}`}
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${isFlagged ? "text-red-400" : confidence > 80 ? "text-emerald-400" : "text-orange-400"}`}>
                            {confidence}%
                          </span>
                          {isFlagged && <span className="text-[10px] uppercase bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded ml-1 border border-red-500/20">Suspect</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {p.repoLink ? (
                          <a href={p.repoLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5 text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            Ouvrir repo
                          </a>
                        ) : (
                          <span className="text-white/30 text-sm italic">Aucun</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!p.isWinner && competition?.status === "EVALUATING" && (
                          <button
                            onClick={() => handleSelectWinner(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold transition-colors"
                          >
                            Élire Gagnant 👑
                          </button>
                        )}
                        {p.isWinner && (
                          <span className="inline-flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                            ✓ Gagnant
                          </span>
                        )}
                        {!p.isWinner && competition?.status !== "EVALUATING" && (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TEAMS SECTION */}
        <div className="mt-16 mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
            <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
            Equipes & Membres
          </h2>
          <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            {equipes.length} Équipe{equipes.length !== 1 && "s"}
          </span>
        </div>

        {equipes.length === 0 ? (
          <div className="py-24 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <span className="text-2xl text-white/20">👥</span>
            </div>
            <p className="text-white/40 text-lg font-light italic">Aucune équipe inscrite pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pb-20">
            {equipes.map((eq) => (
              <div key={eq.id} className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent hover:from-white/[0.08] transition-all duration-500 overflow-hidden shadow-2xl">
                {/* Status Glow Overlay */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -mr-16 -mt-16 transition-all duration-500 group-hover:opacity-30 ${
                  eq.status === 'READY' ? 'bg-emerald-500' : 
                  eq.status === 'PARTICIPATING' ? 'bg-cyan-500' : 
                  'bg-amber-500'
                }`} />

                <div className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                          {eq.name}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-[0.15em] border ${
                          eq.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          eq.status === 'PARTICIPATING' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        }`}>
                          {eq.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/20 font-mono tracking-widest">UID: {eq.id.toUpperCase()}</p>
                    </div>

                    <button 
                      onClick={() => handleDeleteTeam(eq.id)}
                      className="group/btn p-3 rounded-2xl bg-white/5 text-white/20 border border-white/5 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90 md:opacity-0 group-hover:opacity-100"
                      title="Supprimer l'équipe"
                    >
                      <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                       <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Effectif de Combat</p>
                       <span className="text-[10px] font-mono text-white/50">{eq.members?.length || 0} / 6</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {eq.members?.map((m) => (
                        <div key={m.id} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-inner ${
                            m.role === 'LEADER' 
                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20' 
                            : 'bg-white/5 text-white/40 border border-white/10'
                          }`}>
                            {m.user?.firstName?.[0]}{m.user?.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white tracking-tight truncate">
                              {m.user?.firstName} {m.user?.lastName}
                            </p>
                            <p className="text-[10px] text-white/30 truncate font-light tracking-wide">{m.user?.email}</p>
                          </div>
                          {m.role === 'LEADER' && (
                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shadow-sm">
                              Leader
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className={`absolute bottom-0 left-0 w-full h-1 opacity-20 ${
                  eq.status === 'READY' ? 'bg-emerald-500' : 
                  eq.status === 'PARTICIPATING' ? 'bg-cyan-500' : 
                  'bg-amber-500'
                }`} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
