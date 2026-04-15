"use client";

/**
 * Fond ciel étoilé / réseau numérique : bleu marine, points lumineux, traînées fines.
 * Utilisé sur toute la plateforme (layout).
 */
export default function AnimatedTechBackground() {
  // Points lumineux dispersés (style ciel étoilé)
  const stars = [
    [5, 8, 0.9, 1], [12, 22, 0.6, 1.5], [18, 5, 0.7, 1], [25, 35, 0.5, 2],
    [32, 12, 0.8, 1], [38, 48, 0.5, 1.5], [45, 8, 0.6, 1], [52, 28, 0.7, 2],
    [58, 55, 0.5, 1], [65, 15, 0.8, 1.5], [72, 42, 0.6, 1], [78, 8, 0.5, 2],
    [85, 32, 0.7, 1], [92, 58, 0.6, 1.5], [8, 45, 0.5, 1], [22, 68, 0.7, 2],
    [35, 72, 0.6, 1], [48, 88, 0.5, 1.5], [62, 75, 0.8, 1], [75, 92, 0.5, 2],
    [88, 18, 0.6, 1], [15, 55, 0.7, 1.5], [42, 62, 0.5, 1], [55, 42, 0.8, 2],
    [28, 18, 0.6, 1], [68, 35, 0.5, 1.5], [82, 68, 0.7, 1], [3, 78, 0.5, 2],
    [95, 12, 0.6, 1], [11, 92, 0.7, 1.5], [50, 5, 0.5, 1], [20, 42, 0.8, 2],
    [60, 65, 0.6, 1], [30, 88, 0.5, 1.5], [70, 8, 0.7, 1], [40, 25, 0.6, 2],
  ];

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--bg-primary, #0a0f1a) 0%, var(--bg-secondary, #0d1a2d) 100%)",
      }}
      aria-hidden
    >
      {/* Grille tech fine (opacité 10%) */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Points lumineux (ciel étoilé) */}
      <div className="absolute inset-0">
        {stars.map(([left, top, opacity, size], i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-300/90 shadow-[0_0_8px_rgba(103,232,249,0.8)]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              opacity,
            }}
          />
        ))}
      </div>

      {/* Traînées / lignes fines lumineuses */}
      <div className="absolute inset-0 overflow-hidden opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(103, 232, 249, 0)" />
              <stop offset="50%" stopColor="rgba(103, 232, 249, 0.6)" />
              <stop offset="100%" stopColor="rgba(103, 232, 249, 0)" />
            </linearGradient>
          </defs>
          <line x1="10%" y1="15%" x2="25%" y2="30%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="35%" y1="20%" x2="55%" y2="35%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="60%" y1="45%" x2="80%" y2="25%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="15%" y1="60%" x2="40%" y2="55%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="50%" y1="70%" x2="70%" y2="85%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="85%" y1="50%" x2="95%" y2="70%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="5%" y1="40%" x2="20%" y2="75%" stroke="url(#lineGlow)" strokeWidth="0.5" />
          <line x1="75%" y1="10%" x2="90%" y2="40%" stroke="url(#lineGlow)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Lignes de flux animées (subtiles) */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[
          { top: "10%", left: "0%", width: "40%", delay: "0s", duration: "12s" },
          { top: "40%", left: "15%", width: "55%", delay: "2s", duration: "14s" },
          { top: "70%", left: "-5%", width: "50%", delay: "1s", duration: "11s" },
          { top: "85%", left: "25%", width: "45%", delay: "3s", duration: "13s" },
        ].map((line, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-flow-line"
            style={{
              top: line.top,
              left: line.left,
              width: line.width,
              animationDelay: line.delay,
              animationDuration: line.duration,
            }}
          />
        ))}
      </div>

      {/* Dégradés subtils pour profondeur */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(6, 182, 212, 0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 30% at 90% 90%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
