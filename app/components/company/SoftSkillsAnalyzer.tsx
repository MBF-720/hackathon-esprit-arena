"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SoftSkillsAnalysisProps {
  candidateName?: string;
  onAnalysisComplete?: (results: any) => void;
}

export default function SoftSkillsAnalyzer({ candidateName, onAnalysisComplete }: SoftSkillsAnalysisProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const softSkillsConfig = [
    { name: "Communication", icon: "💬", color: "from-blue-500 to-cyan-500" },
    { name: "Empathy", icon: "❤️", color: "from-pink-500 to-rose-500" },
    { name: "Confidence", icon: "💪", color: "from-yellow-500 to-orange-500" },
    { name: "Leadership", icon: "👑", color: "from-purple-500 to-pink-500" },
    { name: "Adaptability", icon: "🔄", color: "from-green-500 to-emerald-500" },
    { name: "Stress Management", icon: "🧘", color: "from-indigo-500 to-blue-500" },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleVideoFile = (file: File) => {
    const validTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"];
    if (!validTypes.includes(file.type)) {
      setError("Format vidéo non supporté. Utilisez MP4, MOV, AVI, MKV ou WEBM");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("Fichier trop volumineux. Max 500MB");
      return;
    }
    setVideoFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!videoFile) {
      setError("Veuillez sélectionner une vidéo");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("name", candidateName || "Candidate");

      // Appel à l'API de soft skills
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const results = await response.json();
      setAnalysisResults(results);
      onAnalysisComplete?.(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] p-8"
      >
        <h3 className="text-2xl font-bold text-white mb-6">📹 Analyser une Vidéo</h3>

        {/* Drop Zone */}
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-cyan-400 bg-cyan-500/10"
              : "border-gray-700/50 bg-gray-800/30 hover:border-cyan-500/50"
          }`}
        >
          <input
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files && handleVideoFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-3">
            <div className="text-5xl">🎬</div>
            <p className="text-lg font-semibold text-white">
              {videoFile ? videoFile.name : "Déposez votre vidéo ou cliquez"}
            </p>
            <p className="text-sm text-gray-400">MP4, MOV, AVI, MKV ou WEBM (Max 500MB)</p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Analyze Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAnalyze}
          disabled={!videoFile || isAnalyzing}
          className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? "🔄 Analyse en cours..." : "✨ Analyser la vidéo"}
        </motion.button>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <motion.div className="rounded-2xl border border-cyan-500/30 backdrop-blur-md bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-2">Score Global</p>
                  <p className="text-5xl font-bold text-white">
                    {analysisResults.overall_score || analysisResults.soft_skills ? 
                      ((Object.values(analysisResults.soft_skills as any || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) / (Object.keys(analysisResults.soft_skills || {}).length || 1)) * 10).toFixed(1)
                      : "N/A"}
                    /10
                  </p>
                </div>
                <div className="text-6xl opacity-50">🎯</div>
              </div>
            </motion.div>

            {/* Soft Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {softSkillsConfig.map((skill, idx) => {
                const skillScore = (analysisResults.soft_skills?.[skill.name.toLowerCase()] || 0) * 10;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{skill.icon}</span>
                        <p className="font-semibold text-white text-sm">{skill.name}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-2 rounded-full bg-gray-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skillScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                        />
                      </div>
                      <p className="text-right text-lg font-bold text-white">{skillScore.toFixed(1)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Emotion Breakdown */}
            {analysisResults.emotion_breakdown && (
              <motion.div className="rounded-2xl border border-white/10 backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] p-8">
                <h4 className="text-xl font-bold text-white mb-6">😊 Analyse des Émotions</h4>
                <div className="space-y-3">
                  {Object.entries(analysisResults.emotion_breakdown).map(([emotion, value]: [string, any], idx: number) => (
                    <motion.div
                      key={emotion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-300 capitalize font-medium">{emotion}</span>
                      <div className="flex items-center gap-3 flex-1 max-w-xs ml-4">
                        <div className="w-full h-2 rounded-full bg-gray-800">
                          <div
                            style={{ width: `${value * 100}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          />
                        </div>
                        <span className="text-white font-bold min-w-[3rem]">{(value * 100).toFixed(0)}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAnalysisResults(null);
                  setVideoFile(null);
                }}
                className="flex-1 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all font-medium"
              >
                ↻ Nouvelle analyse
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 transition-all"
              >
                💾 Sauvegarder
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
