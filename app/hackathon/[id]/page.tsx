"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PlatformNavbar from "../../components/PlatformNavbar";
import StreamChatProvider from "../../components/stream/StreamChatProvider";
import RoomStreamPanel from "../../components/room/RoomStreamPanel";
import {
  getHackathonRooms,
  getCompetitions,
  type Competition,
  type Specialty,
} from "../../lib/api";

const GENERAL_MEMBER_ROOM_ID = "room-general";

/** Affiche un libellé lisible à partir d'un roomId */
function roomIdToDisplayName(roomId: string): string {
  if (!roomId || !roomId.startsWith("room-")) return roomId || "Salle";
  if (roomId.replace(/[^a-z0-9-_]/gi, "") === GENERAL_MEMBER_ROOM_ID) {
    return "Salle générale";
  }
  const specialty = roomId.replace(/^room-/, "").replace(/-/g, " ");
  return specialty ? `Salle ${specialty.charAt(0).toUpperCase() + specialty.slice(1).toLowerCase()}` : roomId;
}

export default function HackathonRoomPage() {
  const params = useParams();
  const roomId = typeof params.id === "string" ? params.id : "";
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [roomName, setRoomName] = useState<string>(() => roomIdToDisplayName(roomId));
  const [competition, setCompetition] = useState<Competition | null>(null);

  useEffect(() => {
    if (!roomId) return;
    
    // 1. Check room access
    getHackathonRooms()
      .then((data) => {
        const normalized = roomId.trim().replace(/[^a-z0-9-_]/gi, "");
        const room = (data.rooms ?? []).find(
          (r) => r.id.trim().replace(/[^a-z0-9-_]/gi, "") === normalized,
        );
        setAllowed(room?.canParticipate ?? false);
        if (room?.name) setRoomName(room.name);

        const isGeneral = normalized === GENERAL_MEMBER_ROOM_ID;
        return isGeneral
          ? getCompetitions({ status: "RUNNING" })
          : getCompetitions({
              status: "RUNNING",
              specialty: roomId.replace(/^room-/, "") as Specialty,
            });
      })
      .then((res) => {
        if (res?.data?.length) {
          setCompetition(res.data[0]);
        }
      })
      .catch(() => setAllowed(false));
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <PlatformNavbar />
        <p>Room introuvable.</p>
      </div>
    );
  }

  if (allowed === null) {
    return (
      <div className="min-h-screen text-white flex flex-col">
        <PlatformNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/60">Vérification de l&apos;accès...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen text-white flex flex-col">
        <PlatformNavbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Accès refusé</h2>
            <p className="text-white/70 mb-6">
              Seule la salle générale est ouverte aux membres. Les anciennes salles par spécialité ne sont plus utilisées.
            </p>
            <Link
              href="/hackathon"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors"
            >
              Retour aux salles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col bg-gradient-to-b from-[#0a0f1a] via-[#0d1a2d] to-[#0a0f1a]">
      <PlatformNavbar />

      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-4 md:px-6 py-4 flex items-center gap-4 shadow-[0_1px_0_rgba(0,212,255,0.08)]">
        <Link
          href="/hackathon"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-white/80 hover:text-cyan-400 transition-all"
          aria-label="Retour aux salles"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{roomName}</h1>
          <p className="text-sm text-white/50 flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Chat · Visio · Partage d&apos;écran
            </span>
          </p>
        </div>
      </header>

      <StreamChatProvider>
        <div className="flex-1 min-h-0 flex flex-col">
          <RoomStreamPanel
            roomId={roomId}
            roomName={roomName}
            competition={competition || undefined}
            layout="split"
          />
        </div>
      </StreamChatProvider>
    </div>
  );
}
