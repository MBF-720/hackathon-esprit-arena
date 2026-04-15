"use client";

import { motion, AnimatePresence } from "framer-motion";
import SoftSkillsAnalyzer from "./SoftSkillsAnalyzer";
import CandidatesResults from "./CandidatesResults";

interface CompanySoftSkillsTabProps {
  companyId?: string;
}

export default function CompanySoftSkillsTab({ companyId }: CompanySoftSkillsTabProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-white">
          🧠 Analyse des Soft Skills
        </h1>
        <p className="text-gray-400">
          Analysez les compétences douces de vos candidats grâce à l'IA. Évaluez la communication,
          l'empathie, la confiance, le leadership et bien plus.
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-blue-500/30 backdrop-blur-md bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-6"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-blue-300">✨ Comment ça marche?</h3>
          <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
            <li>Uploadez une vidéo du candidat (45sec - 5min recommandé)</li>
            <li>L'IA analyse les émotions faciales et vocales en temps réel</li>
            <li>Génération d'un rapport détaillé des soft skills</li>
            <li>Stockage automatique et comparaison avec d'autres candidats</li>
          </ol>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analyzer - 2 colonnes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <SoftSkillsAnalyzer />
        </motion.div>

        {/* Quick Stats - 1 colonne */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Stats Card */}
          <div className="rounded-xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
            <h3 className="text-lg font-bold text-white mb-4">📊 Statistiques</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Candidats Analysés</p>
                <p className="text-3xl font-bold text-cyan-400">2</p>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-gray-400 text-sm">Score Moyen</p>
                <p className="text-3xl font-bold text-green-400">8.1</p>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-gray-400 text-sm">Total d'Analyses</p>
                <p className="text-3xl font-bold text-purple-400">2</p>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="rounded-xl border border-yellow-500/30 backdrop-blur-md bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6">
            <h3 className="text-sm font-bold text-yellow-300 mb-3">💡 Conseils</h3>
            <ul className="text-xs text-gray-300 space-y-2">
              <li>✓ Bonne lumière (face caméra)</li>
              <li>✓ Pas de bruit ambiant</li>
              <li>✓ Durée: 45sec à 5 min</li>
              <li>✓ Format: MP4, MOV, AVI</li>
            </ul>
          </div>

          {/* Skills Legend */}
          <div className="rounded-xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
            <h3 className="text-sm font-bold text-white mb-3">🎯 Soft Skills</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="text-gray-400">Communication</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">❤️</span>
                <span className="text-gray-400">Empathy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💪</span>
                <span className="text-gray-400">Confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <span className="text-gray-400">Leadership</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <span className="text-gray-400">Adaptability</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🧘</span>
                <span className="text-gray-400">Stress Mgmt</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border-t-2 border-white/10 pt-12"
      >
        <CandidatesResults />
      </motion.div>
    </div>
  );
}
