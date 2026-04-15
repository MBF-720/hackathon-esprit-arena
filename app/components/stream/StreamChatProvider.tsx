"use client";

import React, { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { getStreamToken, getProfile } from "../../lib/api";
import "stream-chat-react/dist/css/v2/index.css";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

export default function StreamChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let chatClient: StreamChat | null = null;

    async function init() {
      try {
        const profile = await getProfile() as { id?: string; firstName?: string; lastName?: string };
        const userId = profile?.id;
        if (!userId) {
          setError("You must be logged in to use chat");
          setLoading(false);
          return;
        }
        const { token, apiKey: key } = await getStreamToken(userId);
        const keyToUse = key || apiKey;
        chatClient = StreamChat.getInstance(keyToUse);
        await chatClient.connectUser(
          {
            id: userId,
            name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User",
          },
          token,
        );
        setClient(chatClient);
      } catch (err) {
        const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: string }).message) : "Failed to connect to chat";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    init();
    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(() => {});
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-[#36393f]">
        <div className="text-white/70">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-[#36393f] p-4">
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <Chat client={client} theme="dark">
      {children}
    </Chat>
  );
}
