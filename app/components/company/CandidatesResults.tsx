"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CandidateAnalysis {
  id: string;
  name: string;
  email: string;
  overallScore: number;
  softSkills: Record<string, number>;
  dominantEmotion: string;
  framesAnalyzed: number;
  duration: number;
  analyzedAt: string;
}

export default function CandidatesResults() {
  const [candidates, setCandidates] = useState<CandidateAnalysis[]>([
    {
      id: "1",
      name: "Sarah Dupont",
      email: "sarah@example.com",
      overallScore: 8.5,
      softSkills: {
        communication: 0.9,
        empathy: 0.8,
        confidence: 0.85,
        leadership: 0.75,
        adaptability: 0.8,
        stress_management: 0.82,
      },
      dominantEmotion: "happy",
      framesAnalyzed: 120,
      duration: 45,
      analyzedAt: "2026-04-06T10:30:00Z",
    },
    {
      id: "2",
      name: "Marc Johnson",
      email: "marc@example.com",
      overallScore: 7.8,
      softSkills: {
        communication: 0.75,
        empathy: 0.7,
        confidence: 0.8,
        leadership: 0.85,
        adaptability: 0.72,
        stress_management: 0.75,
      },
      dominantEmotion: "neutral",
      framesAnalyzed: 115,
      duration: 42,
      analyzedAt: "2026-04-05T14:20:00Z",
    },
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAnalysis | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-green-500 to-emerald-500";
    if (score >= 7) return "from-blue-500 to-cyan-500";
    if (score >= 6) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return "from-green-900/20 to-emerald-900/20 border-green-500/30";
    if (score >= 7) return "from-blue-900/20 to-cyan-900/20 border-blue-500/30";
    if (score >= 6) return "from-yellow-900/20 to-orange-900/20 border-yellow-500/30";
    return "from-red-900/20 to-rose-900/20 border-red-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h3 className="text-3xl font-bold text-white">📊 Candidats Analysés</h3>
        <motion.div className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold">
          {candidates.length} candidats
        </motion.div>
      </motion.div>

      {/* Candidates Grid */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 gap-4">
          {candidates.map((candidate, idx) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedCandidate(candidate)}
              className={`relative group rounded-xl border backdrop-blur-md bg-gradient-to-br p-6 cursor-pointer transition-all hover:border-white/30 ${getScoreBgColor(
                candidate.overallScore
              )}`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {candidate.name[0]}
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{candidate.name}</p>
                      <p className="text-sm text-gray-400">{candidate.email}</p>
                    </div>
                  </div>
                </div>

                {/* Score Circle */}
                <motion.div className="flex flex-col items-center gap-2">
                  <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getScoreColor(
                    candidate.overallScore
                  )} flex items-center justify-center shadow-lg`}>
                    <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{candidate.overallScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">/10</span>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-gray-400">
                    Frames: <span className="text-white font-semibold">{candidate.framesAnalyzed}</span>
                  </p>
                  <p className="text-gray-400">
                    Durée: <span className="text-white font-semibold">{candidate.duration}s</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Émotion dominante</p>
                  <p className="text-lg text-white font-semibold capitalize">{candidate.dominantEmotion}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-gray-900/80 to-gray-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedCandidate.name}</h3>
                  <p className="text-gray-400">{selectedCandidate.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCandidate(null)}
                  className="text-2xl text-gray-400 hover:text-white"
                >
                  ✕
                </motion.button>
              </div>

              {/* Overall Score */}
              <motion.div className={`rounded-xl border backdrop-blur-md bg-gradient-to-br p-6 mb-6 ${getScoreBgColor(
                selectedCandidate.overallScore
              )}`}>
                <p className="text-gray-300 mb-2">Score Global</p>
                <p className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(
                  selectedCandidate.overallScore
                )} bg-clip-text text-transparent`}>
                  {selectedCandidate.overallScore.toFixed(1)}/10
                </p>
              </motion.div>

              {/* Soft Skills */}
              <div className="space-y-3 mb-6">
                <h4 className="text-lg font-bold text-white">Soft Skills</h4>
                {Object.entries(selectedCandidate.softSkills).map(([skill, score], idx) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-end gap-4"
                  >
                    <span className="text-gray-300 capitalize min-w-[150px] text-sm font-medium">{skill.replace(/_/g, " ")}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
                    <span className="text-white font-bold min-w-[3rem] text-right">{(score * 10).toFixed(1)}</span>
                  </motion.div>
                ))}
              </div>

              {/* Analysis Info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                <p className="text-gray-400">
                  Frames analysées: <span className="text-white font-semibold">{selectedCandidate.framesAnalyzed}</span>
                </p>
                <p className="text-gray-400">
                  Durée: <span className="text-white font-semibold">{selectedCandidate.duration}s</span>
                </p>
                <p className="text-gray-400">
                  Analysé le: <span className="text-white font-semibold">{new Date(selectedCandidate.analyzedAt).toLocaleString('fr-FR')}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCandidate(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-600 transition-all"
                >
                  Fermer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
                >
                  📧 Contacter
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
