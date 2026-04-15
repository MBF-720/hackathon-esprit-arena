"use client";

import React, { useState, useEffect } from "react";
import VideoCall from "../stream/VideoCall";
import { RoomChatChannel } from "./RoomChatChannel";
import { type Competition, submitWork, getMyParticipation } from "../../lib/api";

type Tab = "chat" | "video";

type RoomStreamPanelProps = {
  roomId: string;
  roomName: string;
  competition?: Competition;
  layout?: "tabs" | "split";
};

export default function RoomStreamPanel({
  roomId,
  roomName,
  competition,
  layout = "tabs",
}: RoomStreamPanelProps) {
  const [isLeader, setIsLeader] = useState<boolean | null>(null);

  useEffect(() => {
    if (!competition) return;
    getMyParticipation(competition.id).then((p) => {
      if (p) {
        const role = (p as any).equipeRole;
        // Leader can submit; if no equipe (solo), also allow
        setIsLeader(role === "LEADER" || !p.equipeId);
      } else {
        setIsLeader(false);
      }
    }).catch(() => setIsLeader(false));
  }, [competition]);
  const [tab, setTab] = useState<Tab>("chat");
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const safeRoomId = roomId.replace(/[^a-z0-9-_]/gi, "") || "default-room";

  // Check if we are in the last 20 minutes of the hackathon
  const [showSubmission, setShowSubmission] = useState(false);

  useEffect(() => {
    if (!competition) return;
    
    const checkTime = () => {
      const now = new Date();
      const end = new Date(competition.endDate);
      const diffMs = end.getTime() - now.getTime();
      const diffMin = diffMs / (1000 * 60);
      
      // Show between 20 minutes before and 2 hours after (for flexibility)
      setShowSubmission(diffMin <= 20 && diffMin >= -120);
    };

    checkTime();
    const interval = setInterval(checkTime, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [competition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competition || !githubUrl.trim()) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      await submitWork(competition.id, githubUrl.trim());
      setSubmitMsg({ type: 'success', text: "Travail soumis avec succès ! ✅" });
    } catch (err: any) {
      setSubmitMsg({ type: 'error', text: err.message || "Échec de la soumission." });
    } finally {
      setSubmitting(false);
    }
  };

  if (layout === "split") {
    return (
      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-6 p-4 md:p-6">
        <div className="flex-[2] min-w-0 min-h-[280px] md:min-h-0 flex flex-col rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/20 transition-colors">
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-cyan-500/5 to-transparent">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Visio & partage d&apos;écran</p>
              <p className="text-xs text-white/50">Rejoignez l&apos;appel avec votre équipe</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <VideoCall callId={safeRoomId} />
          </div>
        </div>
        <div className="flex-1 min-w-[280px] md:max-w-[380px] min-h-[260px] md:min-h-0 flex flex-col rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/20 transition-colors">
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-violet-500/5 to-transparent">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8 4.03 8 9 8 9-3.582 9-8z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Chat</p>
              <p className="text-xs text-white/50">Échangez en temps réel</p>
            </div>
          </div>
          
          {showSubmission && (
            <div className="px-5 py-4 bg-cyan-500/10 border-b border-white/10 space-y-3 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Fenêtre de Soumission Ouverte</p>
              </div>
              {isLeader ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                  <input 
                    type="url"
                    placeholder="Lien GitHub du projet..."
                    required
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                  <button 
                    disabled={submitting}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {submitting ? "ENVOI..." : "SOUMETTRE LE TRAVAIL"}
                  </button>
                </form>
              ) : (
                <p className="text-[10px] text-amber-400/80 font-semibold">
                  Seul le leader de votre équipe peut soumettre le travail final.
                </p>
              )}
              {submitMsg && (
                <p className={`text-[9px] font-bold uppercase tracking-widest ${submitMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {submitMsg.text}
                </p>
              )}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#0d1117]/50">
            <RoomChatChannel roomId={safeRoomId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {showSubmission && (
        <div className="mx-4 mt-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-4 duration-500">
           <div className="flex-1 text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Hackathon Closing Soon</p>
              <p className="text-xs text-white/70">
                {isLeader
                  ? "Soumettez votre repository GitHub pour l'évaluation finale."
                  : "Seul le leader de votre équipe peut soumettre le travail final."}
              </p>
           </div>
           {isLeader && (
             <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="url" 
                  placeholder="Repository URL" 
                  required
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="flex-1 sm:w-64 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
                <button 
                  disabled={submitting}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {submitting ? "ENVOI..." : "SOUMETTRE"}
                </button>
             </form>
           )}
           {submitMsg && (
            <div className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest ${submitMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {submitMsg.text}
            </div>
          )}
        </div>
      )}
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "chat"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "video"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Visio & partage d&apos;écran
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === "chat" ? (
          <RoomChatChannel roomId={safeRoomId} />
        ) : (
          <div className="flex-1 min-h-0 overflow-auto">
            <VideoCall callId={safeRoomId} />
          </div>
        )}
      </div>
    </div>
  );
}
