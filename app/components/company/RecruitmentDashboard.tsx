"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecruitmentMeetingRoom from "./RecruitmentMeetingRoom";

interface Developer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mainSpecialty: string;
  skillTags: string[];
  totalChallenges: number;
  totalWins: number;
  winRate: number;
  avgScore: number;
  avatarUrl?: string;
}

interface RecruitmentDashboardProps {
  developers?: Developer[];
  onSelectDeveloper?: (developer: Developer) => void;
}

type RecruitmentView = "TALENTS" | "MEETING";

const SPECIALTIES = ["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DATA", "DEVOPS", "DESIGN", "CYBERSECURITY", "BI"];

const SPECIALTY_ICONS: Record<string, string> = {
  FRONTEND: "🎨",
  BACKEND: "⚙️",
  FULLSTACK: "🚀",
  MOBILE: "📱",
  DATA: "📊",
  DEVOPS: "🛠️",
  DESIGN: "✨",
  CYBERSECURITY: "🔒",
  BI: "📈",
};

const SPECIALTY_GRADIENT: Record<string, string> = {
  FRONTEND: "from-blue-600 to-blue-400",
  BACKEND: "from-blue-600 to-blue-400",
  FULLSTACK: "from-blue-600 to-blue-400",
  MOBILE: "from-blue-600 to-blue-400",
  DATA: "from-blue-600 to-blue-400",
  DEVOPS: "from-blue-600 to-blue-400",
  DESIGN: "from-blue-600 to-blue-400",
  CYBERSECURITY: "from-blue-600 to-blue-400",
  BI: "from-blue-600 to-blue-400",
};

export default function RecruitmentDashboard({ developers: initialDevelopers = [], onSelectDeveloper }: RecruitmentDashboardProps) {
  const [recruitmentView, setRecruitmentView] = useState<RecruitmentView>("TALENTS");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("");
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [meetingCandidate, setMeetingCandidate] = useState<Developer | null>(null);
  const [sortBy, setSortBy] = useState<"avgScore" | "totalWins" | "winRate">("avgScore");
  const [developers, setDevelopers] = useState<Developer[]>(initialDevelopers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (specialtyFilter) params.append("specialty", specialtyFilter);
        const response = await fetch(`/api/analytics/developers?${params}`);
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setDevelopers(data.developers || []);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, [specialtyFilter]);

  const mockDevelopers: Developer[] = [
    { id: "1", firstName: "Ahmed", lastName: "Mohammed", email: "ahmed@example.com", mainSpecialty: "FULLSTACK", skillTags: ["React", "Node.js", "PostgreSQL", "Docker"], totalChallenges: 45, totalWins: 32, winRate: 71, avgScore: 8.7, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" },
    { id: "2", firstName: "Fatima", lastName: "Al-Zahra", email: "fatima@example.com", mainSpecialty: "FRONTEND", skillTags: ["Vue.js", "Tailwind CSS", "TypeScript", "Figma"], totalChallenges: 38, totalWins: 28, winRate: 74, avgScore: 8.4, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima" },
    { id: "3", firstName: "Mohammed", lastName: "Hassan", email: "mohammed@example.com", mainSpecialty: "BACKEND", skillTags: ["Python", "FastAPI", "MongoDB", "AWS"], totalChallenges: 52, totalWins: 38, winRate: 73, avgScore: 8.9, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed" },
    { id: "4", firstName: "Sara", lastName: "Ibrahim", email: "sara@example.com", mainSpecialty: "DATA", skillTags: ["Python", "TensorFlow", "SQL", "Tableau"], totalChallenges: 33, totalWins: 22, winRate: 67, avgScore: 8.1, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" },
    { id: "5", firstName: "Karim", lastName: "Khaled", email: "karim@example.com", mainSpecialty: "DEVOPS", skillTags: ["Kubernetes", "CI/CD", "Linux", "Terraform"], totalChallenges: 28, totalWins: 21, winRate: 75, avgScore: 8.6, avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim" },
  ];

  const displayDevelopers = developers.length > 0 ? developers : mockDevelopers;

  const filteredDevelopers = useMemo(() => {
    return displayDevelopers
      .filter((dev) => {
        const matchSearch = `${dev.firstName} ${dev.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSpecialty = !specialtyFilter || dev.mainSpecialty === specialtyFilter;
        return matchSearch && matchSpecialty;
      })
      .sort((a, b) => {
        if (sortBy === "avgScore") return b.avgScore - a.avgScore;
        if (sortBy === "totalWins") return b.totalWins - a.totalWins;
        return b.winRate - a.winRate;
      });
  }, [displayDevelopers, searchTerm, specialtyFilter, sortBy]);

  const stats = {
    totalDevelopers: displayDevelopers.length,
    avgScore: (displayDevelopers.reduce((sum, dev) => sum + dev.avgScore, 0) / displayDevelopers.length).toFixed(1),
    topSpecialty: SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)],
    topWinRate: Math.max(...displayDevelopers.map((d) => d.winRate)),
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Header with Tabs */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-800/50 via-gray-800/50 to-gray-800/50 border border-gray-700 p-12 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[150px]"></div>
          <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[140px] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">Talent Pool</span>
            </h2>
            <p className="text-white/60 font-mono text-sm mt-2 uppercase tracking-widest">Discover Your Next Top Performer</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRecruitmentView("TALENTS");
                setMeetingCandidate(null);
              }}
              className={`px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest transition-all ${
                recruitmentView === "TALENTS"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "bg-white/10 text-blue-300 hover:bg-white/15 border border-blue-500/30"
              }`}
            >
              Talents
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRecruitmentView("MEETING")}
              className={`px-6 py-3 rounded-lg font-black text-sm uppercase tracking-widest transition-all ${
                recruitmentView === "MEETING"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "bg-white/10 text-blue-300 hover:bg-white/15 border border-blue-500/30"
              }`}
            >
              Meeting Room
            </motion.button>
          </div>
        </div>
      </div>

      {/* Talents View */}
      {recruitmentView === "TALENTS" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="space-y-10"
        >
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Total Talent", value: stats.totalDevelopers, color: "from-blue-600 to-blue-400" },
              { label: "Avg Score", value: `${stats.avgScore}/10`, color: "from-blue-600 to-blue-400" },
              { label: "Top Specialty", value: stats.topSpecialty, color: "from-blue-600 to-blue-400" },
              { label: "Best Win Rate", value: `${stats.topWinRate}%`, color: "from-blue-600 to-blue-400" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, translateY: -5 }}
                className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 border border-white/20 backdrop-blur-md cursor-default group overflow-hidden relative`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                <div className="relative z-10 space-y-3">
                  <p className="text-[11px] font-black text-white/70 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-white italic">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest block mb-3">Search</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Find by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 backdrop-blur-md rounded-2xl px-5 py-3.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest block mb-3">Role</label>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 backdrop-blur-md rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                >
                  <option value="">All Roles</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest block mb-3">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/15 backdrop-blur-md rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                >
                  <option value="avgScore">By Score</option>
                  <option value="totalWins">By Wins</option>
                  <option value="winRate">By Rate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Developers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="col-span-full flex justify-center py-12">
                <div className="space-y-4 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"></motion.div>
                  <p className="text-white/40 text-sm font-mono">Loading premium talent...</p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredDevelopers.map((dev, idx) => (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.04, translateY: -8 }}
                    onClick={() => {
                      setSelectedDeveloper(dev);
                      onSelectDeveloper?.(dev);
                    }}
                    className="cursor-pointer group"
                  >
                      <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-0.5 overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white blur pointer-events-none"></div>
                      <div className="relative bg-[#0f172a] rounded-3xl p-4 space-y-4">
                        <div className="flex items-start gap-2">
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={dev.avatarUrl}
                            alt={dev.firstName}
                            className="w-12 h-12 rounded-xl border-2 border-white/20 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-blue-400`}>
                              {dev.mainSpecialty}
                            </span>
                            </div>
                            <h3 className="text-base font-black text-white italic">{dev.firstName} {dev.lastName}</h3>
                            <p className="text-[10px] text-white/40 font-mono">{dev.email}</p>
                          </div>
                        </div>

                          <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Score", value: dev.avgScore.toFixed(1), unit: "/10", color: "text-blue-400" },
                            { label: "Wins", value: dev.totalWins, unit: "", color: "text-blue-300" },
                            { label: "Rate", value: dev.winRate, unit: "%", color: "text-blue-400" },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 hover:bg-white/10 rounded-lg p-2 text-center transition-all border border-white/5 hover:border-white/15">
                              <p className={`text-xl font-black italic ${stat.color}`}>{stat.value}{stat.unit}</p>
                              <p className="text-[7px] text-white/40 uppercase tracking-wider mt-0.5 font-bold">{stat.label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Tech Stack</p>
                          <div className="flex flex-wrap gap-1">
                            {dev.skillTags.slice(0, 3).map((skill) => (
                              <span key={skill} className="text-[9px] bg-white/10 text-white/80 px-2.5 py-1 rounded-lg font-mono border border-white/10 hover:bg-white/20 transition-all">
                                {skill}
                              </span>
                            ))}
                            {dev.skillTags.length > 3 && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg font-bold">+{dev.skillTags.length - 3}</span>
                            )}
                          </div>
                        </div>

                          <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black uppercase text-xs py-2 rounded-lg transition-all shadow-lg hover:shadow-2xl border border-white/20`}
                        >
                          View Profile
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Detail Modal */}
          <AnimatePresence>
            {selectedDeveloper && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDeveloper(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotateX: -10 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full max-w-2xl bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-1 overflow-hidden shadow-2xl`}
                >
                  <div className="bg-slate-950 rounded-3xl p-6 space-y-4 relative">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img src={selectedDeveloper.avatarUrl} alt={selectedDeveloper.firstName} className="w-14 h-14 rounded-xl border-2 border-white/30 flex-shrink-0" />
                        <div>
                          <h2 className="text-lg font-black text-white italic">{selectedDeveloper.firstName} {selectedDeveloper.lastName}</h2>
                          <p className="text-[11px] text-white/50 font-mono">{selectedDeveloper.email}</p>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-black text-white bg-gradient-to-r from-blue-600 to-blue-400`}>
                            {selectedDeveloper.mainSpecialty}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        onClick={() => setSelectedDeveloper(null)}
                        className="text-white/40 hover:text-white transition-colors text-2xl font-bold"
                      >
                        ✕
                      </motion.button>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Avg Score", value: selectedDeveloper.avgScore.toFixed(1), unit: "/10" },
                        { label: "Challenges", value: selectedDeveloper.totalChallenges, unit: "" },
                        { label: "Wins", value: selectedDeveloper.totalWins, unit: "" },
                        { label: "Win Rate", value: selectedDeveloper.winRate, unit: "%" },
                      ].map((stat) => (
                        <motion.div key={stat.label} whileHover={{ scale: 1.08 }} className="bg-white/10 rounded-lg p-3 text-center border border-white/15 hover:border-white/25 transition-all">
                          <p className="text-xl font-black text-white italic">{stat.value}{stat.unit}</p>
                          <p className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5 font-bold">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Full Technology Stack</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDeveloper.skillTags.map((skill) => (
                          <motion.span key={skill} whileHover={{ scale: 1.08, y: -2 }} className="text-[11px] bg-white/15 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-white/25 transition-all border border-white/20 cursor-default">
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setMeetingCandidate(selectedDeveloper);
                          setSelectedDeveloper(null);
                          setRecruitmentView("MEETING");
                        }}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black uppercase text-xs py-2 rounded-lg transition-all shadow-lg hover:shadow-2xl border border-white/20 hover:from-blue-500 hover:to-blue-300`}
                      >
                        Start Meeting
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black uppercase text-xs py-2 rounded-lg transition-all shadow-lg hover:shadow-2xl border border-white/20`}
                      >
                        Recruit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-white/10 text-white font-black uppercase text-xs py-2 rounded-lg transition-all hover:bg-white/20 border border-white/30"
                      >
                        Resume
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!loading && filteredDevelopers.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
              <p className="text-white/40 text-lg font-mono">No developers match your criteria</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSearchTerm("");
                  setSpecialtyFilter("");
                }}
                className="mx-auto block bg-blue-500/20 text-blue-300 font-bold px-6 py-2 rounded-xl border border-blue-500/50 hover:bg-blue-500/30 transition-all"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Meeting View */}
      {recruitmentView === "MEETING" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <RecruitmentMeetingRoom
            candidateName={meetingCandidate ? `${meetingCandidate.firstName} ${meetingCandidate.lastName}` : "Candidat"}
            onMeetingEnd={(results) => {
              console.log("Meeting ended with results:", results);
              setMeetingCandidate(null);
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
