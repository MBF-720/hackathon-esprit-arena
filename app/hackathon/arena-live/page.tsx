"use client";

import React from "react";
import Link from "next/link";
import PlatformNavbar from "@/app/components/PlatformNavbar";
import StreamChatProvider from "@/app/components/stream/StreamChatProvider";
import { RoomChatChannel } from "@/app/components/room/RoomChatChannel";

export default function ArenaLivePage() {
  return (
    <div className="h-screen flex flex-col bg-[#05080f] text-white font-sans overflow-hidden">
      {/* GLOBAL CSS OVERRIDES 
          This is the "secret sauce" that fixes the vertical text 
          and gives it that high-end Discord/Messenger look.
      */}
      <style jsx global>{`
        /* 1. FIX VERTICAL TEXT: Force horizontal flow for letters */
        .str-chat__message-text-inner, 
        .str-chat__message-text {
          font-size: 14px !important;
          line-height: 1.5 !important;
          word-break: normal !important;        /* Prevents breaking words into single letters */
          overflow-wrap: break-word !important; /* Wraps only at the end of the bubble */
          white-space: pre-wrap !important;     /* Keeps spacing natural */
          display: inline-block !important;     /* Ensures it treats text as a block */
          color: #e5e7eb !important;            /* text-gray-200 */
        }

        /* 2. BUBBLE DESIGN: Clean, flat, and appropriately sized */
        .str-chat__message-bubble {
          padding: 10px 14px !important;
          border-radius: 12px !important;
          background-color: #111827 !important; /* Deep Navy/Gray */
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          min-height: auto !important;
          width: fit-content !important;        /* Bubble only as wide as the text */
          max-width: 80% !important;
        }

        /* 3. LAYOUT FIX: Align messages to the left */
        .str-chat__message-inner {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          width: 100% !important;
        }

        /* 4. INPUT AREA: Professional Dark Terminal style */
        .str-chat__textarea textarea {
          background: #0a101f !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          color: white !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
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
      `}</style>

      {/* 1. TOP NAVIGATION */}
      <div className="shrink-0 border-b border-white/5">
        <PlatformNavbar />
      </div>

      {/* 2. CHAT HEADER */}
      <header className="h-14 bg-[#05080f] px-6 flex items-center justify-between shrink-0 z-10 border-b border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/hackathon"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-cyan-500 font-bold text-xl select-none">#</span>
            <h1 className="text-sm font-bold tracking-tight text-white/90 uppercase">
              global-community
            </h1>
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            <p className="text-[10px] text-white/30 font-medium hidden sm:block uppercase tracking-wider">
              Arena Protocol Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Node</span>
          </div>
        </div>
      </header>

      {/* 3. MAIN CHAT CONTAINER */}
      <main className="flex-1 relative flex flex-col min-h-0 bg-[#05080f]">
        <StreamChatProvider>
          <section className="flex-1 flex flex-col min-h-0 w-full relative z-0">
            {/* This component handles the actual message list. 
                The CSS above ensures it looks amazing.
            */}
            <RoomChatChannel roomId="arena-live" isGlobal={true} />
          </section>
        </StreamChatProvider>
      </main>

      {/* 4. FOOTER STATUS BAR */}
      <footer className="h-7 bg-[#03050a] border-t border-white/5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[8px] font-bold text-white/20 uppercase tracking-[0.25em]">
          <span>System Encryption: AES-256</span>
          <span className="text-white/5">|</span>
          <span className="text-cyan-500/40">v2.4.0-stable</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
            Connection Secure
          </p>
          <div className="w-1 h-1 rounded-full bg-cyan-500/50"></div>
        </div>
      </footer>
    </div>
  );
}