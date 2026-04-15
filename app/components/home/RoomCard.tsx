"use client";

import { motion } from "framer-motion";

interface RoomCardProps {
  title: string;
  participants: number;
  nextCompetition?: string;
  icon: React.ReactNode;
  index?: number;
}

export default function RoomCard({
  title,
  participants,
  nextCompetition = "Dans 2h",
  icon,
  index = 0,
}: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 cursor-pointer transition-all duration-200 hover:border-[var(--accent)]/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)] hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
          {icon}
        </div>
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {participants} participants
        </span>
      </div>
      <h4 className="text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors">
        {title}
      </h4>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Prochaine compétition : {nextCompetition}
      </p>
    </motion.div>
  );
}
