"use client";

import { motion } from "framer-motion";

export default function LogoCube() {
  return (
    <motion.div
      className="relative w-24 h-24 md:w-32 md:h-32"
      animate={{
        y: [0, -10, 0],
        rotateY: [0, 360],
        rotateX: [0, 15],
      }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
        rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      <div
        className="absolute inset-0 rounded-xl flex items-center justify-center font-mono font-bold text-2xl md:text-3xl text-[var(--accent)] border-2 border-[var(--accent)]/50"
        style={{
          background: "rgba(0, 212, 255, 0.1)",
          boxShadow:
            "0 0 30px rgba(0, 212, 255, 0.3), inset 0 0 20px rgba(0, 212, 255, 0.1)",
        }}
      >
        &gt;_
      </div>
      {/* Glow behind */}
      <div
        className="absolute inset-0 rounded-xl -z-10 blur-2xl opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}
