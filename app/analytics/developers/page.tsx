"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PlatformNavbar from "../../components/PlatformNavbar";
import DeveloperCard from "../../components/DeveloperCard";

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
  cvUrl?: string;
}

const SPECIALTY_COLORS: Record<string, string> = {
  FRONTEND: "from-blue-500 to-cyan-500",
  BACKEND: "from-purple-500 to-pink-500",
  FULLSTACK: "from-green-500 to-emerald-500",
  DEVOPS: "from-orange-500 to-red-500",
  MOBILE: "from-indigo-500 to-purple-500",
  DATASCIENCE: "from-yellow-500 to-orange-500",
};

export default function DevelopersPage() {
  const [tier, setTier] = useState<"BASIC" | "PRO">("PRO");
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score" | "wins" | "rate">("score");

  useEffect(() => {
    const userTier = localStorage.getItem("userPlan") || "PRO";
    setTier(userTier as "BASIC" | "PRO");

    const fetchDevelopers = async () => {
      try {
        const res = await fetch(
          `/api/analytics/developers?tier=${userTier}&specialty=${selectedSpecialty}`
        );
        const data = await res.json();
        setDevelopers(data.developers);
      } catch (error) {
        console.error("Error fetching developers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, [selectedSpecialty]);

  useEffect(() => {
    let filtered = developers;

    if (searchTerm) {
      filtered = filtered.filter(
        (dev) =>
          `${dev.firstName} ${dev.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          dev.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.avgScore - a.avgScore;
        case "wins":
          return b.totalWins - a.totalWins;
        case "rate":
          return b.winRate - a.winRate;
        default:
          return 0;
      }
    });

    setFilteredDevelopers(filtered);
  }, [searchTerm, developers, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <>
        <PlatformNavbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <PlatformNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Talent Pool
                </h1>
                <p className="text-slate-400">
                  {filteredDevelopers.length} developers found ({tier} access)
                </p>
              </div>
              {tier === "BASIC" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50"
                >
                  <p className="text-sm text-amber-200">
                    Limited to 10 developers. Upgrade to PRO for full access.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">All Specialties</option>
              {Object.keys(SPECIALTY_COLORS).map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="score">Sort by Score</option>
              <option value="wins">Sort by Wins</option>
              <option value="rate">Sort by Win Rate</option>
            </select>
          </motion.div>

          {/* Developers Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDevelopers.map((dev) => (
              <motion.div key={dev.id} variants={itemVariants}>
                <DeveloperCard
                  id={dev.id}
                  firstName={dev.firstName}
                  lastName={dev.lastName}
                  email={dev.email}
                  mainSpecialty={dev.mainSpecialty}
                  skillTags={dev.skillTags}
                  totalChallenges={dev.totalChallenges}
                  totalWins={dev.totalWins}
                  winRate={dev.winRate}
                  avgScore={dev.avgScore}
                  cvUrl={dev.cvUrl}
                  tier={tier}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredDevelopers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-slate-400 text-lg mb-2">
                No developers found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("");
                }}
                className="mt-4 px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
