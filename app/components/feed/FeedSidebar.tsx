"use client";

import { motion } from "framer-motion";

export default function FeedSidebar() {
  const trends = [
    { name: "Hackathon AI", posts: 15430 },
    { name: "Performance Web", posts: 9250 },
    { name: "TypeScript Tips", posts: 8735 },
    { name: "DevOps", posts: 7820 },
    { name: "Cloud Native", posts: 6540 },
    { name: "React 19", posts: 5890 },
  ];

  const suggestions = [
    { name: "Arena Tech", role: "Official Team", icon: "🚀" },
    { name: "Dev Tips Daily", role: "Educational", icon: "📚" },
    { name: "Hackathon Winners", role: "Community", icon: "🏆" },
  ];

  return (
    <aside className="hidden lg:block fixed right-0 top-20 w-80 h-screen border-l border-white/10 bg-gradient-to-b from-gray-900/80 via-gray-950 to-gray-950 p-6 space-y-6 overflow-y-auto backdrop-blur-sm">
      {/* Trending Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Tendances
          </span>
        </h3>
        <div className="space-y-2.5">
          {trends.map((trend, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-orange-500/30 transition-all group cursor-pointer"
            >
              <p className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                #{trend.name}
              </p>
              <p className="text-xs text-gray-500 group-hover:text-gray-400">+{(trend.posts / 1000).toFixed(1)}K posts</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0" />

      {/* Suggestions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            À suivre
          </span>
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="p-3.5 rounded-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-cyan-500/20 hover:border-cyan-400/50 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="text-2xl flex-shrink-0"
                  >
                    {suggestion.icon}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate group-hover:text-gray-400">
                      {suggestion.role}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/20 flex-shrink-0"
                >
                  ✓
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0" />

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 py-4"
      >
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20">
          <p className="text-sm text-gray-300 leading-relaxed">
            ✨ Reste connecté pour voir les dernières <span className="font-bold text-purple-300">actualités</span> et <span className="font-bold text-pink-300">innovations</span> de la communauté!
          </p>
        </div>

        <div className="flex gap-2 justify-center text-xs">
          <motion.button
            whileHover={{ color: "#06b6d4" }}
            className="text-gray-500 hover:text-cyan-400 transition-colors"
          >
            À propos
          </motion.button>
          <span className="text-gray-700">•</span>
          <motion.button
            whileHover={{ color: "#06b6d4" }}
            className="text-gray-500 hover:text-cyan-400 transition-colors"
          >
            Aide
          </motion.button>
          <span className="text-gray-700">•</span>
          <motion.button
            whileHover={{ color: "#06b6d4" }}
            className="text-gray-500 hover:text-cyan-400 transition-colors"
          >
            Contact
          </motion.button>
        </div>
      </motion.div>
    </aside>
  );
}
