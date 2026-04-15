"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Channel, MessageList, MessageInput, Window, useChatContext, useChannelStateContext } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { joinTeamChat } from "@/app/lib/api";

type TeamChatChannelProps = {
  equipeId: string;
  competitionId: string;
};

// ─────────────────────────────────────────────────────────────────
// BLOCKED FILE TYPES (videos)
// ─────────────────────────────────────────────────────────────────
const BLOCKED_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv", ".m4v", ".3gp", ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".iso"];
const BLOCKED_MIMES = ["video/", "application/zip", "application/x-rar", "application/x-7z", "application/gzip", "application/x-tar"];

function isBlockedFile(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (BLOCKED_EXTENSIONS.includes(ext)) return true;
  if (file.type && BLOCKED_MIMES.some((m) => file.type.startsWith(m))) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────
// FULLSCREEN IMAGE LIGHTBOX
// ─────────────────────────────────────────────────────────────────
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all group z-10"
      >
        <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 z-10">
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Aperçu image</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          fetch(src)
            .then((res) => res.blob())
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `image-${Date.now()}.jpg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            })
            .catch(() => window.open(src, "_blank"));
        }}
        className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20 hover:bg-emerald-500/30 transition-all z-10 cursor-pointer"
      >
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Télécharger</span>
      </button>

      <img
        src={src}
        alt="Fullscreen preview"
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// VOICE RECORDER COMPONENT
// ─────────────────────────────────────────────────────────────────
function VoiceRecorder() {
  const { channel } = useChannelStateContext("VoiceRecorder");
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sending, setSending] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        if (blob.size < 500) return;

        setSending(true);
        try {
          if (!channel) return;
          const file = new File([blob], `vocal-${Date.now()}.webm`, { type: "audio/webm" });
          const res = await channel.sendFile(file);
          await channel.sendMessage({
            text: "",
            attachments: [
              {
                type: "audio",
                asset_url: res.file,
                title: "🎤 Message vocal",
                file_size: blob.size,
                mime_type: "audio/webm",
              },
            ],
          });
        } catch (err) {
          console.error("Voice send error:", err);
          alert("Erreur lors de l'envoi du message vocal");
        } finally {
          setSending(false);
        }
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.ondataavailable = null;
      mediaRecorder.current.onstop = null;
      mediaRecorder.current.stop();
      mediaRecorder.current.stream?.getTracks().forEach((t) => t.stop());
    }
    chunks.current = [];
    setRecording(false);
    setDuration(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (recording) {
    return (
      <div className="flex items-center gap-3 px-2">
        {/* Cancel */}
        <button
          onClick={cancelRecording}
          className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all"
          title="Annuler"
        >
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Recording indicator */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Enregistrement</span>
          <span className="text-sm font-mono text-white/60">{formatTime(duration)}</span>
        </div>

        {/* Send */}
        <button
          onClick={stopRecording}
          className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/30 transition-all"
          title="Envoyer"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group shrink-0"
      title="Enregistrer un message vocal"
    >
      <svg className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// CUSTOM EMPTY STATE
// ─────────────────────────────────────────────────────────────────
function TeamEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-5 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white/90 mb-1">Canal privé de l&apos;équipe</h3>
          <p className="text-[11px] text-white/30 uppercase tracking-widest font-bold">🔒 Chiffré de bout en bout</p>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">
          Bienvenue dans le chat privé de votre équipe. Seuls les membres de votre groupe peuvent voir ces messages. Commencez à collaborer !
        </p>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10"></div>
          <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Envoyez le premier message</span>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10"></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CUSTOM INPUT WITH VOICE RECORDER
// ─────────────────────────────────────────────────────────────────
function CustomMessageInput() {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 min-w-0">
        <MessageInput />
      </div>
      <div className="shrink-0">
        <VoiceRecorder />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export function TeamChatChannel({ equipeId, competitionId }: TeamChatChannelProps) {
  const { client } = useChatContext("TeamChatChannel");
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client?.userID || !equipeId || !competitionId) return;

    const safeEquipe = equipeId.replace(/[^a-z0-9-_]/gi, "");
    const safeComp = competitionId.replace(/[^a-z0-9-_]/gi, "");
    const channelId = `team-${safeEquipe}-comp-${safeComp}`;

    const c = client.channel("messaging", channelId, {});
    setError(null);

    joinTeamChat(equipeId, competitionId)
      .then(() => c.watch())
      .then(() => setChannel(c))
      .catch((err) => {
        setError(err?.message ?? "Impossible de charger le chat d'équipe.");
      });

    return () => {
      c.stopWatching().catch(() => {});
    };
  }, [client, equipeId, competitionId]);

  // Click handler for images inside chat messages
  const handleImageClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG" && target.closest(".str-chat__message-bubble, .str-chat__attachment--image, .str-chat__gallery-image")) {
      e.preventDefault();
      e.stopPropagation();
      const src = (target as HTMLImageElement).src;
      if (src) setLightboxSrc(src);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("click", handleImageClick, true);
    return () => container.removeEventListener("click", handleImageClick, true);
  }, [handleImageClick, channel]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-red-400 text-sm p-4 text-center">
        {error}
      </div>
    );
  }
  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-white/60 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Connexion au chat d&apos;équipe...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen image lightbox — rendered via portal to cover entire screen */}
      {lightboxSrc && typeof document !== "undefined" &&
        createPortal(
          <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />,
          document.body
        )
      }

      <div ref={containerRef} className="flex-1 flex flex-col min-h-0">
        <Channel
          channel={channel}
          EmptyStateIndicator={TeamEmptyState}
        >
          <Window>
            <div className="flex-1 flex flex-col min-h-0 relative">
              <MessageList />
              <div className="p-3 bg-white/[0.02] border-t border-white/5">
                <CustomMessageInput />
              </div>
            </div>
          </Window>
        </Channel>
      </div>
    </>
  );
}
