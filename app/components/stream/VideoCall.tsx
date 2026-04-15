"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import { getStreamToken, getProfile } from "../../lib/api";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";
const DEFAULT_CALL_ID = "hackathon-default-call";

function VideoCallUI({ onLeave }: { onLeave: () => void }) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 min-h-[160px] rounded-xl overflow-hidden bg-black/30 border border-white/5 mb-4 flex items-center justify-center min-w-0">
        <SpeakerLayout participantsBarPosition="bottom" participantsBarLimit={4} />
      </div>
      <div className="flex-shrink-0 pt-2 pb-1 px-2 rounded-xl bg-white/5 border border-white/10 str-video-call-controls-wrapper">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
}

type VideoCallProps = {
  /** Identifiant de l'appel (un par salle). Par défaut : hackathon. */
  callId?: string;
};

export default function VideoCall({ callId = DEFAULT_CALL_ID }: VideoCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<StreamVideoClient["call"]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initClient = useCallback(async () => {
    const profile = (await getProfile()) as { id?: string };
    const userId = profile?.id;
    if (!userId) {
      setError("You must be logged in to use video.");
      return null;
    }
    const { token, apiKey: key } = await getStreamToken(userId);
    const keyToUse = key || apiKey;
    return new StreamVideoClient({
      apiKey: keyToUse,
      user: { id: userId },
      token,
      options: {
        logLevel: "warn",
        // Ne pas afficher l'erreur générique "[SfuClient]: SFU reported error {}" (souvent non bloquante)
        logger: (level, message, ...args) => {
          const msg = typeof message === "string" ? message : String(message);
          const firstArg = args[0];
          const isEmptyObj = typeof firstArg === "object" && firstArg !== null && Object.keys(firstArg as object).length === 0;
          if (msg.includes("SFU reported error") && (args.length === 0 || isEmptyObj)) return;
          if (level === "error") console.error("[Stream]", message, ...args);
          else if (level === "warn") console.warn("[Stream]", message, ...args);
        },
      },
    });
  }, []);

  useEffect(() => {
    initClient()
      .then((c) => {
        setClient(c);
      })
      .catch(() => setError("Failed to initialize video."))
      .finally(() => setLoading(false));
  }, [initClient]);

  const joinCall = async () => {
    if (!client) return;
    setError(null);
    try {
      const callInstance = client.call("default", callId);
      await callInstance.join({
        create: true,
        maxJoinRetries: 3,
        ring: false,
      });
      setCall(callInstance);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Failed to join call.";
      setError(msg);
    }
  };

  const leaveCall = useCallback(async () => {
    if (!call) return;
    try {
      await call.camera.disable().catch(() => {});
      await call.microphone.disable().catch(() => {});
      await call.screenShare.disable().catch(() => {});
      await call.leave();
    } catch (err) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: string }).message) : "";
      if (!msg.toLowerCase().includes("already been left") && !msg.toLowerCase().includes("already left")) {
        setError(msg || "Failed to leave call.");
      }
    } finally {
      setCall(null);
    }
  }, [call]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[180px] gap-3">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }
  if (error && !call) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
        {error}
      </div>
    );
  }
  if (!client) return null;

  return (
    <StreamVideo client={client}>
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0 overflow-auto p-6">
          {!call ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white font-medium mb-1">Prêt à rejoindre ?</p>
                <p className="text-white/50 text-sm">Cliquez pour rejoindre la visio et partager votre écran</p>
              </div>
              <button
                type="button"
                onClick={joinCall}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-semibold text-sm shadow-[0_4px_20px_rgba(0,212,255,0.35)] hover:shadow-[0_4px_24px_rgba(0,212,255,0.45)] transition-all"
              >
                Rejoindre l&apos;appel
              </button>
            </div>
          ) : (
            <StreamCall call={call}>
              <VideoCallUI onLeave={leaveCall} />
            </StreamCall>
          )}
        </div>
      </div>
    </StreamVideo>
  );
}
