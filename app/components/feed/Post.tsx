"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface PostProps {
  id: string;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  category: "news" | "achievement" | "challenge";
  reactions: Record<string, Reaction>;
  comments: Comment[];
}

const EMOJI_REACTIONS = ["👍", "❤️", "😮", "😂", "🔥", "🎯"];

export default function Post({
  id,
  author,
  content,
  image,
  timestamp,
  category,
  reactions: initialReactions,
  comments: initialComments,
}: PostProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const totalReactions = Object.values(reactions).reduce((sum, r) => sum + r.count, 0);
  const userHasReacted = Object.values(reactions).some((r) => r.userReacted);

  const handleReaction = (emoji: string) => {
    setReactions((prev) => {
      const current = prev[emoji] || { emoji, count: 0, userReacted: false };
      return {
        ...prev,
        [emoji]: {
          emoji,
          count: current.userReacted ? current.count - 1 : current.count + 1,
          userReacted: !current.userReacted,
        },
      };
    });
    setShowEmojiPicker(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `${Date.now()}`,
        author: {
          name: "Vous",
          avatar: "/api/placeholder/40/40",
        },
        content: newComment,
        timestamp: "À l'instant",
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case "news":
        return "from-blue-600/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400/50";
      case "achievement":
        return "from-green-600/20 to-emerald-600/20 border-green-500/30 hover:border-green-400/50";
      case "challenge":
        return "from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-pink-400/50";
      default:
        return "from-white/5 to-white/[0.02] border-white/20 hover:border-white/30";
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "news":
        return "📰 Actualité";
      case "achievement":
        return "🏆 Réussite";
      case "challenge":
        return "⚡ Défi";
      default:
        return "";
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-2xl border backdrop-blur-md bg-gradient-to-br ${getCategoryColor()} p-6 space-y-4 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 group`}
    >
      {/* Gradient bg element */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative w-14 h-14 flex-shrink-0"
          >
            <Image
              src={author.avatar || "/api/placeholder/48/48"}
              alt={author.name}
              fill
              className="rounded-full object-cover border-2 border-cyan-500/30 group-hover:border-cyan-400/50 transition-all"
            />
          </motion.div>
          <div>
            <p className="font-bold text-white text-lg">{author.name}</p>
            {author.role && <p className="text-xs text-gray-400 font-medium">{author.role}</p>}
            <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
          </div>
        </div>
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 text-gray-200 border border-white/10 font-semibold uppercase tracking-wide"
        >
          {getCategoryLabel()}
        </motion.span>
      </div>

      {/* Content */}
      <p className="text-gray-100 leading-relaxed text-base">{content}</p>

      {/* Image */}
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative h-72 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all"
        >
          <Image
            src={image}
            alt="Post image"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
      )}

      {/* Reactions */}
      {totalReactions > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2 border border-white/10"
        >
          <div className="flex gap-1">
            {Object.values(reactions)
              .filter((r) => r.count > 0)
              .map((r) => (
                <motion.span
                  key={r.emoji}
                  whileHover={{ scale: 1.3 }}
                  className="text-lg cursor-default"
                >
                  {r.emoji}
                </motion.span>
              ))}
          </div>
          <span className="font-semibold text-gray-300">{totalReactions}</span>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0" />

      {/* Actions */}
      <div className="flex items-center gap-2 relative">
        <div className="relative flex-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
          >
            <span className="text-xl">😊</span>
            <span className="text-sm">Réagir</span>
          </motion.button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 mt-3 bg-gray-900/95 rounded-xl border border-white/20 p-4 flex gap-3 z-10 shadow-xl shadow-black/50 backdrop-blur-sm"
              >
                {EMOJI_REACTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-2xl cursor-pointer filter hover:drop-shadow-lg transition-all"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm">Commenter</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
        >
          <span className="text-xl">↗️</span>
          <span className="text-sm">Partager</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t border-white/10 pt-4 bg-white/[0.02] -mx-6 px-6 py-4 rounded-b-xl"
          >
            {/* Comment Input */}
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-9 h-9 flex-shrink-0"
              >
                <Image
                  src="/api/placeholder/32/32"
                  alt="Your avatar"
                  fill
                  className="rounded-full object-cover border border-cyan-500/30"
                />
              </motion.div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all backdrop-blur-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  →
                </motion.button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment, idx) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-8 h-8 flex-shrink-0"
                  >
                    <Image
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      fill
                      className="rounded-full object-cover border border-cyan-500/20"
                    />
                  </motion.div>
                  <div className="flex-1">
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 space-y-1 hover:border-gray-600/50 transition-all">
                      <p className="text-sm font-semibold text-white">
                        {comment.author.name}
                      </p>
                      <p className="text-sm text-gray-200 leading-relaxed">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">{comment.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
