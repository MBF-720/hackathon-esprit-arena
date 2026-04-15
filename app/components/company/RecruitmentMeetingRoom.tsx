"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SoftSkillsScore {
  communication: number;
  empathy: number;
  confidence: number;
  leadership: number;
  adaptability: number;
  stress_management: number;
}

interface MeetingResults {
  timestamp: string;
  soft_skills: SoftSkillsScore;
  overall_score: number;
}

interface RecruitmentMeetingRoomProps {
  candidateName?: string;
  onMeetingEnd?: (results: MeetingResults[]) => void;
}

export default function RecruitmentMeetingRoom({
  candidateName = "Candidat",
  onMeetingEnd,
}: RecruitmentMeetingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<MeetingResults[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const startWebcam = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log("Demande d'accès à la webcam...");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("API mediaDevices non disponible");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setHasPermission(true);
        console.log("Webcam opérationnelle");
      }
    } catch (err: any) {
      console.error("Erreur webcam:", err.message);
      setError(err.message || "Impossible d'accéder à la webcam");
    } finally {
      setIsLoading(false);
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setHasPermission(false);
  };

  const startMeeting = async () => {
    if (!hasPermission) {
      await startWebcam();
      return;
    }

    setMeetingDuration(0);
    setAnalysisResults([]);
    setIsMeetingActive(true);
  };

  const endMeeting = () => {
    setIsMeetingActive(false);
    onMeetingEnd?.(analysisResults);
  };

  // Analyze frame every 5 seconds during meeting
  useEffect(() => {
    if (!isMeetingActive || !videoRef.current) return;

    const analysisInterval = setInterval(async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current?.videoWidth || 1280;
        canvas.height = videoRef.current?.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (ctx && videoRef.current) {
          ctx.drawImage(videoRef.current, 0, 0);
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append("frame", blob, "frame.jpg");

            try {
              const response = await fetch("http://localhost:5001/api/analyze-frame", {
                method: "POST",
                body: formData,
              });

              if (response.ok) {
                const data = await response.json();
                console.log("Analysis received:", data);
                if (data.soft_skills) {
                  setAnalysisResults((prev) => [
                    ...prev,
                    {
                      timestamp: new Date().toISOString(),
                      soft_skills: data.soft_skills,
                      overall_score: data.overall_score || 0,
                    },
                  ]);
                }
              } else {
                console.error("❌ Erreur API:", response.status);
              }
            } catch (err) {
              console.error("❌ Erreur lors de l'envoi du frame:", err);
            }
          });
        }
      } catch (err) {
        console.error("❌ Erreur lors de la capture:", err);
      }
    }, 5000);

    return () => clearInterval(analysisInterval);
  }, [isMeetingActive]);

  useEffect(() => {
    if (!isMeetingActive) return;
    const interval = setInterval(() => {
      setMeetingDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isMeetingActive]);

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getAverageScore = (skillKey: keyof SoftSkillsScore) => {
    if (analysisResults.length === 0) return 0;
    const sum = analysisResults.reduce(
      (acc, result) => acc + (result.soft_skills[skillKey] || 0),
      0
    );
    return Math.round((sum / analysisResults.length) * 10) / 10;
  };

  const getOverallAverageScore = () => {
    if (analysisResults.length === 0) return 0;
    const sum = analysisResults.reduce(
      (acc, result) => acc + (result.overall_score || 0),
      0
    );
    return Math.round((sum / analysisResults.length) * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    return "from-blue-600 to-blue-400";
  };

  const getScoreBgColor = (score: number) => {
    return "bg-blue-600/10 border-blue-600/30";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Professional Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400/20 p-8 backdrop-blur-xl">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white">
            Salle de Recrutement
          </h2>
          <p className="text-blue-100 text-sm mt-2 tracking-wide">
            Évaluation intelligente des soft skills en temps réel
          </p>
        </div>
      </div>

      {/* Candidate Info Card - Premium Design */}
      {(hasPermission || isMeetingActive) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-600/30">
              <span className="text-blue-400 font-semibold">C</span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{candidateName}</p>
              <p className="text-gray-400 text-sm">Candidat en évaluation</p>
            </div>
          </div>
          {isMeetingActive && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-blue-400 font-semibold text-sm">EN COURS</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">{formatTime(meetingDuration)}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Area - Enhanced */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ display: hasPermission ? "block" : "none" }}
            />

            {!hasPermission && (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center border-2 border-blue-600/20"></div>
                <p className="text-white text-xl font-semibold text-center">Accès à la caméra requis</p>
                <p className="text-gray-400 text-sm text-center max-w-xs">
                  Veuillez autoriser l'accès à votre caméra pour l'évaluation
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startWebcam}
                  disabled={isLoading}
                  className="px-10 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all text-base"
                >
                  {isLoading ? "Chargement..." : "Activer la caméra"}
                </motion.button>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300 text-sm max-w-xs text-center"
                  >
                    Erreur: {error}
                  </motion.div>
                )}
              </div>
            )}

            {/* Recording Indicator */}
            <AnimatePresence>
              {isMeetingActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/80 text-white font-semibold text-sm backdrop-blur-md border border-gray-700"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                  <span>{formatTime(meetingDuration)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            {!isMeetingActive ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startMeeting}
                  disabled={!hasPermission}
                  className="flex-1 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Démarrer l'Évaluation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopWebcam}
                  disabled={!hasPermission}
                  className="flex-1 px-8 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all"
                >
                  Fermer la Caméra
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endMeeting}
                className="flex-1 px-8 py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-all"
              >
                Terminer l'Évaluation
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Sidebar - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {isMeetingActive ? (
            <>
              {/* Live Skills Analysis */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-700/50 backdrop-blur-md bg-gray-900/50 p-6 space-y-4"
              >
                <p className="text-sm font-semibold text-blue-300 uppercase tracking-widest">Soft Skills - En temps réel</p>
                <div className="space-y-4">
                  {[
                    { key: "communication" as const, label: "Communication" },
                    { key: "empathy" as const, label: "Empathie" },
                    { key: "confidence" as const, label: "Confiance" },
                    { key: "leadership" as const, label: "Leadership" },
                    { key: "adaptability" as const, label: "Adaptabilité" },
                    { key: "stress_management" as const, label: "Gestion du Stress" },
                  ].map(({ key, label }) => {
                    const score = getAverageScore(key);
                    const percentage = score * 10;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-300 font-medium">{label}</span>
                          <motion.span
                            key={score}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-bold text-blue-300"
                          >
                            {percentage > 0 ? `${percentage.toFixed(0)}%` : "--"}
                          </motion.span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-700 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Analysis Counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-700/50 backdrop-blur-md bg-gray-900/50 p-6"
              >
                <p className="text-xs text-gray-400 uppercase mb-2 font-semibold">Cadres analysés</p>
                <motion.p
                  key={analysisResults.length}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-black text-blue-400"
                >
                  {analysisResults.length}
                </motion.p>
              </motion.div>

              {/* Live Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-700/50 bg-blue-900/20 backdrop-blur-md p-6 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                  <p className="text-sm font-semibold text-blue-400">Analyse en cours</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Parlez naturellement pour une meilleure analyse.
                </p>
              </motion.div>
            </>
          ) : !hasPermission ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md p-6 space-y-4"
            >
              <h4 className="text-sm font-semibold text-blue-300">À propos</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cette salle évalue automatiquement les soft skills des candidats via webcam.
              </p>
              <div className="pt-2 border-t border-gray-700 space-y-2">
                <p className="text-xs font-semibold text-gray-300">Compétences évaluées:</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• Communication verbale</li>
                  <li>• Empathie et écoute</li>
                  <li>• Confiance et assurance</li>
                  <li>• Leadership</li>
                  <li>• Adaptabilité</li>
                  <li>• Gestion du stress</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-md p-6 space-y-3"
            >
              <p className="text-sm font-semibold text-blue-300">Instructions</p>
              <ol className="space-y-2 text-xs text-gray-400">
                <li>1. <span className="text-gray-300">Cliquez sur "Démarrer"</span></li>
                <li>2. <span className="text-gray-300">Parlez naturellement</span></li>
                <li>3. <span className="text-gray-300">Regardez vos scores en temps réel</span></li>
                <li>4. <span className="text-gray-300">Terminez quand vous avez fini</span></li>
              </ol>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">Les données sont sécurisées et confidentielles.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Enhanced Results Summary */}
      <AnimatePresence>
        {!isMeetingActive && analysisResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl p-8 space-y-8"
          >
            {/* Results Header */}
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-white">Résumé de l'Évaluation</h3>
              <p className="text-gray-400 text-sm">Analysé le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR")}</p>
            </div>

            {/* Overall Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-blue-600/30 to-blue-700/30 backdrop-blur-md p-8 flex items-center justify-between"
            >
              <div>
                <p className="text-gray-300 font-semibold text-sm uppercase">Score Global</p>
                <p className="text-5xl font-black mt-3 text-blue-300">{(getOverallAverageScore() * 10).toFixed(0)}</p>
                <p className="text-gray-400 text-sm mt-1">/100 points</p>
              </div>
            </motion.div>

            {/* Skills Breakdown Grid */}
            <div className="space-y-3">
              <p className="text-white font-semibold text-sm">Détail des Compétences</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "communication" as const, label: "Communication" },
                  { key: "empathy" as const, label: "Empathie" },
                  { key: "confidence" as const, label: "Confiance" },
                  { key: "leadership" as const, label: "Leadership" },
                  { key: "adaptability" as const, label: "Adaptabilité" },
                  { key: "stress_management" as const, label: "Gestion du Stress" },
                ].map(({ key, label }) => {
                  const score = getAverageScore(key);
                  const percentage = score * 10;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="rounded-lg border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">
                          {label}
                        </span>
                        <span className="font-bold text-lg text-blue-300">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-1"
              >
                <p className="text-2xl font-black text-blue-400">{analysisResults.length}</p>
                <p className="text-xs text-gray-400">Cadres analysés</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-1"
              >
                <p className="text-2xl font-black text-blue-400">{formatTime(meetingDuration)}</p>
                <p className="text-xs text-gray-400">Durée totale</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-1"
              >
                <p className="text-2xl font-black text-blue-400">Complété</p>
                <p className="text-xs text-gray-400">Statut</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
