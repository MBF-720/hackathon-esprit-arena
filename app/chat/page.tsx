"use client";

import { useState } from "react";
import Link from "next/link";
import StreamChatProvider from "../components/stream/StreamChatProvider";
import {
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Window,
  useChatContext,
} from "stream-chat-react";
import VideoCall from "../components/stream/VideoCall";

const SERVERS = [
  { id: "hackathon", name: "Hackathon", initial: "H" },
  { id: "dev", name: "Dev", initial: "D" },
];

function ChatContent() {
  const [activeServer, setActiveServer] = useState(SERVERS[0].id);
  const [showVideo, setShowVideo] = useState(false);
  const { channel: activeChannel } = useChatContext("ChatContent");

  return (
    <div className="flex h-screen bg-[#36393f] text-white overflow-hidden">
      {/* Left sidebar - Servers (Discord circles) */}
      <div className="w-[72px] flex flex-col items-center py-3 bg-[#202225] flex-shrink-0">
        <Link
          href="/"
          className="w-12 h-12 rounded-[24px] bg-[#36393f] hover:rounded-2xl hover:bg-[#00d4ff] flex items-center justify-center text-lg font-bold transition-all mb-2"
        >
          &gt;_
        </Link>
        <div className="w-8 h-0.5 bg-white/20 rounded-full my-2" />
        {SERVERS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveServer(s.id)}
            className={`w-12 h-12 rounded-[24px] flex items-center justify-center text-sm font-bold transition-all my-1 ${
              activeServer === s.id
                ? "bg-[#00d4ff] text-black rounded-2xl"
                : "bg-[#36393f] hover:rounded-2xl hover:bg-[#00d4ff]/80"
            }`}
          >
            {s.initial}
          </button>
        ))}
      </div>

      {/* Channel list sidebar */}
      <div className="w-60 flex flex-col bg-[#2f3136] flex-shrink-0">
        <div className="h-12 px-4 flex items-center border-b border-black/20 shadow-sm">
          <span className="font-semibold text-white">
            {SERVERS.find((s) => s.id === activeServer)?.name ?? "Server"}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ChannelList
            filters={{ type: "messaging" }}
            options={{ state: true, watch: true }}
            List={(props: any) => (
              <div className="space-y-0.5 px-2">{props.children}</div>
            )}
            Preview={(props: any) => (
              <button
                type="button"
                onClick={() => props.setActiveChannel?.(props.channel)}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-[#b9bbbe] hover:bg-white/10 hover:text-white ${
                  props.active ? "bg-white/10 text-white" : ""
                }`}
              >
                <span className="text-lg">#</span>
                <span className="truncate">
                  {(props.channel?.data?.name as string) ||
                    props.channel?.id ||
                    "channel"}
                </span>
              </button>
            )}
          />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#36393f]">
        <Channel
          EmptyPlaceholder={
            <div className="flex-1 flex items-center justify-center text-[#b9bbbe]">
              <p>Select a channel to start messaging.</p>
            </div>
          }
        >
          <Window>
            <div className="flex-1 flex flex-col min-h-0">
              <div className="h-12 px-4 flex items-center justify-between border-b border-black/20 bg-[#36393f]">
                <span className="text-lg">#</span>
                <button
                  type="button"
                  onClick={() => setShowVideo((v) => !v)}
                  className="px-3 py-1.5 rounded bg-[#2f3136] hover:bg-white/10 text-sm"
                >
                  {showVideo ? "Hide" : "Start"} video call
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  <MessageList />
                </div>
                <div className="p-4 border-t border-black/20">
                  <MessageInput />
                </div>
              </div>
            </div>
          </Window>
        </Channel>
      </div>

      {showVideo && (
        <div className="w-80 flex-shrink-0 border-l border-black/20 bg-[#2f3136] flex flex-col">
          <VideoCall />
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <StreamChatProvider>
      <div className="h-screen flex flex-col bg-[#36393f]">
        <ChatContent />
      </div>
    </StreamChatProvider>
  );
}
