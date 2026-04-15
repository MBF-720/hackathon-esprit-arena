"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PlatformNavbar from "@/app/components/PlatformNavbar";
import StreamChatProvider from "@/app/components/stream/StreamChatProvider";
import { TeamChatChannel } from "@/app/components/room/TeamChatChannel";
import { getMyEquipe, type Equipe } from "@/app/lib/api";

export default function TeamChatPage() {
  const params = useParams();
  const equipeId = typeof params.equipeId === "string" ? params.equipeId : "";
  const competitionId =
    typeof params.competitionId === "string" ? params.competitionId : "";

  const [equipe, setEquipe] = useState<Equipe | null>(null);

  useEffect(() => {
    if (!competitionId) return;
    getMyEquipe(competitionId)
      .then((eq) => setEquipe(eq))
      .catch(() => {});
  }, [competitionId]);

  const teamName = equipe?.name ?? "Équipe";
  const competitionTitle = equipe?.competition?.title ?? "Hackathon";
  const memberCount = equipe?.members?.length ?? 0;

  return (
    <div className="h-screen flex flex-col bg-[#05080f] text-white font-sans overflow-hidden">
      {/* GLOBAL CSS OVERRIDES — Same as arena-live for premium look */}
      <style jsx global>{`
        /* 1. FIX VERTICAL TEXT: Force horizontal flow for letters */
        .str-chat__message-text-inner, 
        .str-chat__message-text {
          font-size: 14px !important;
          line-height: 1.5 !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
          display: inline-block !important;
          color: #e5e7eb !important;
        }

        /* 2. BUBBLE DESIGN: Clean, flat, and appropriately sized */
        .str-chat__message-bubble {
          padding: 10px 14px !important;
          border-radius: 12px !important;
          background-color: #111827 !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          min-height: auto !important;
          width: fit-content !important;
          max-width: 80% !important;
        }

        /* 3. LAYOUT FIX: Align messages to the left */
        .str-chat__message-inner {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          width: 100% !important;
        }

        /* 4. INPUT AREA: Remove double border, clean dark style */
        .str-chat__message-input-flat {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .str-chat__textarea textarea {
          background: #0a101f !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          color: white !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
          box-shadow: none !important;
          outline: none !important;
        }

        .str-chat__textarea textarea:focus {
          border-color: rgba(16, 185, 129, 0.3) !important;
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.15) !important;
        }

        /* 5. Send button: emerald theme */
        .str-chat__send-button {
          background: rgba(16, 185, 129, 0.2) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          border-radius: 10px !important;
          padding: 6px 10px !important;
          margin-left: 8px !important;
        }

        .str-chat__send-button svg path {
          fill: #10b981 !important;
        }

        /* Remove default library backgrounds */
        .str-chat-container, .str-chat {
          background: transparent !important;
        }

        /* Hide those big separators if they are too chunky */
        .str-chat__date-separator {
          margin: 20px 0 !important;
          opacity: 0.3;
        }

        /* Remove extra input container borders/outlines */
        .str-chat__message-input,
        .str-chat__message-input-inner {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>

      {/* 1. TOP NAVIGATION */}
      <div className="shrink-0 border-b border-white/5">
        <PlatformNavbar />
      </div>

      {/* 2. CHAT HEADER */}
      <header className="h-14 bg-[#05080f] px-6 flex items-center justify-between shrink-0 z-10 border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/hackathon/competition/${competitionId}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-emerald-500 font-bold text-xl select-none">#</span>
            <h1 className="text-sm font-bold tracking-tight text-white/90 uppercase">
              {teamName}
            </h1>
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            <p className="text-[10px] text-white/30 font-medium hidden sm:block uppercase tracking-wider">
              {competitionTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Members count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
              {memberCount} membres
            </span>
          </div>

          {/* Private indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a5 5 0 00-5 5v4H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 9H9V6a3 3 0 116 0v4z" />
            </svg>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Privé</span>
          </div>
        </div>
      </header>

      {/* 3. MAIN CHAT CONTAINER */}
      <main className="flex-1 relative flex flex-col min-h-0 bg-[#05080f]">
        <StreamChatProvider>
          <section className="flex-1 flex flex-col min-h-0 w-full relative z-0">
            <TeamChatChannel equipeId={equipeId} competitionId={competitionId} />
          </section>
        </StreamChatProvider>
      </main>

      {/* 4. FOOTER STATUS BAR */}
      <footer className="h-7 bg-[#03050a] border-t border-white/5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[8px] font-bold text-white/20 uppercase tracking-[0.25em]">
          <span>System Encryption: AES-256</span>
          <span className="text-white/5">|</span>
          <span className="text-emerald-500/40">v2.4.0-stable</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            Connection Sécurisée
          </p>
          <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
        </div>
      </footer>
    </div>
  );
}
