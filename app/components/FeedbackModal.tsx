"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  X, 
  Send, 
  MessageSquare, 
  Lightbulb, 
  AlertTriangle 
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getProfile } from "../lib/api";

type Rating = "POOR" | "NEUTRAL" | "GOOD" | "EXCELLENT";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [problemType, setProblemType] = useState("");
  const [message, setMessage] = useState("");
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    setLoading(true);
    try {
      // Try to get profile but don't wait forever (max 2s)
      const profilePromise = getProfile().catch(() => null);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
      
      const profile = await Promise.race([profilePromise, timeoutPromise]) as any;
      
      await addDoc(collection(db, "feedbacks"), {
        userId: profile?.id || "anonymous",
        userName: profile ? `${profile.firstName} ${profile.lastName}` : "Anonymous",
        userEmail: profile?.email || "N/A",
        rating,
        problemType,
        message,
        solution,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Error sending feedback:", error);
      alert("Erreur lors de l'envoi du feedback. Vérifiez votre configuration Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(null);
    setProblemType("");
    setMessage("");
    setSolution("");
    setSuccess(false);
  };

  const ratings = [
    { id: "POOR", icon: Frown, label: "Pas top", color: "text-red-400" },
    { id: "NEUTRAL", icon: Meh, label: "Moyen", color: "text-amber-400" },
    { id: "GOOD", icon: Smile, label: "Bien", color: "text-emerald-400" },
    { id: "EXCELLENT", icon: Heart, label: "Excellent", color: "text-pink-400" },
  ];

  const problemTypes = [
    "Interface (UI/UX)",
    "Bugs / Erreurs",
    "Performance (Lenteur)",
    "Fonctionnalité manquante",
    "Autre",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-[#0d1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                  Share Your <span className="text-cyan-400">Feedback</span>
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Help us improve the Arena experience</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="p-12 text-center flex flex-col items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"
                >
                  <Send className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Merci !</h3>
                  <p className="text-white/60">Votre feedback a été transmis avec succès.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Rating selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Smile className="w-3 h-3" /> Que pensez-vous de l&apos;app ?
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {ratings.map((item) => {
                      const Icon = item.icon;
                      const isActive = rating === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRating(item.id as Rating)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                            isActive
                              ? `bg-white/10 border-white/20 scale-105 ${item.color}`
                              : "bg-white/5 border-transparent text-white/20 hover:text-white/40 hover:bg-white/[0.07]"
                          }`}
                        >
                          <Icon className={`w-8 h-8 ${isActive ? "animate-bounce" : ""}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Problem Type */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-cyan-400" /> Type de problème rencontré <span className="opacity-50 font-normal italic">(Optionnel)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {problemTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProblemType(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          problemType === type
                            ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                            : "bg-white/5 text-white/50 border border-white/5 hover:border-white/10"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-cyan-400" /> Description détaillée <span className="opacity-50 font-normal italic">(Optionnel)</span>
                  </h4>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Qu&apos;est-ce qui ne va pas ? Qu&apos;est-ce que vous aimez ?"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none placeholder:text-white/20"
                  />
                </div>

                {/* Solution */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3 text-cyan-400" /> Exemple de solution <span className="opacity-50 font-normal italic">(Optionnel)</span>
                  </h4>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Comment pourrions-nous rendre l&apos;app plus sympa et fiable ?"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none placeholder:text-white/20 border-dashed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !rating}
                  className="w-full relative group overflow-hidden py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
