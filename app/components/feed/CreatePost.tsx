"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CreatePostProps {
  userAvatar?: string;
  userName?: string;
  onPostCreate?: (content: string, category: string) => void;
}

export default function CreatePost({ userAvatar, userName, onPostCreate }: CreatePostProps) {
  const [postContent, setPostContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("news");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (postContent.trim()) {
      onPostCreate?.(postContent, selectedCategory);
      setPostContent("");
      setSelectedCategory("news");
      setIsExpanded(false);
    }
  };

  const categories = [
    { id: "news", label: "📰 Actualité", icon: "📰", color: "from-blue-500/40 to-cyan-500/40 border-cyan-500/30 hover:border-cyan-400/50" },
    { id: "achievement", label: "🏆 Réussite", icon: "🏆", color: "from-green-500/40 to-emerald-500/40 border-green-500/30 hover:border-green-400/50" },
    { id: "challenge", label: "⚡ Défi", icon: "⚡", color: "from-purple-500/40 to-pink-500/40 border-purple-500/30 hover:border-purple-400/50" },
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] p-6 space-y-4 hover:border-white/20 transition-all shadow-lg shadow-black/20"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.div className="relative w-12 h-12 shrink-0">
          <Image
            src={userAvatar || "/api/placeholder/48/48"}
            alt={userName || "User"}
            fill
            className="rounded-full object-cover border-2 border-cyan-500/30"
          />
        </motion.div>
        <motion.input
          type="text"
          onClick={() => setIsExpanded(true)}
          placeholder="À quoi penses-tu? Partage une réussite ou un défi..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          className="flex-1 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-text backdrop-blur-sm"
        />
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 border-t border-white/10 pt-4"
        >
          {/* Textarea with gradient bg */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl blur opacity-50" />
            <textarea
              autoFocus
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Partage tes actualités, tes réussites ou tes défis avec la communauté..."
              className="relative w-full bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none backdrop-blur-sm"
              rows={4}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Catégorie:</p>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.color} border-white/60 shadow-lg shadow-blue-500/30 text-white`
                      : "bg-gray-800/30 text-gray-300 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsExpanded(false);
                setPostContent("");
              }}
              className="px-6 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all border border-gray-700/30 font-medium"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!postContent.trim()}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 disabled:shadow-none"
            >
              ✨ Publier
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
