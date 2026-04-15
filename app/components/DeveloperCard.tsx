"use client";

import { motion } from "framer-motion";

interface DeveloperCardProps {
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
  tier?: "BASIC" | "PRO";
}





export default function DeveloperCard({
  id,
  firstName,
  lastName,
  email,
  mainSpecialty,
  skillTags,
  totalWins,
  winRate,
  avgScore,
  cvUrl,
  tier = "PRO",
}: DeveloperCardProps) {
  const winPercentage = (winRate * 100).toFixed(0);

  return (
    <motion.div className="rounded-lg bg-slate-700/30 border border-slate-600 p-5 h-full hover:bg-slate-700/50 transition-colors duration-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white text-sm">
              {firstName} {lastName}
            </h3>
            {tier === "PRO" && (
              <p className="text-xs text-slate-400 mt-1">{email}</p>
            )}
          </div>
        </div>
        <div className="mt-2 inline-block px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs font-medium text-blue-300">
          {mainSpecialty}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-600/30 rounded p-2">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-lg font-semibold text-white">{avgScore.toFixed(1)}</p>
        </div>
        <div className="bg-slate-600/30 rounded p-2">
          <p className="text-xs text-slate-400">Wins</p>
          <p className="text-lg font-semibold text-white">{totalWins}</p>
        </div>
        <div className="bg-slate-600/30 rounded p-2">
          <p className="text-xs text-slate-400">Rate</p>
          <p className="text-lg font-semibold text-white">{winPercentage}%</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 font-medium mb-2">Skills</p>
        <div className="flex flex-wrap gap-1">
          {skillTags.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded bg-slate-600/50 text-slate-200"
            >
              {skill}
            </span>
          ))}
          {skillTags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded bg-slate-600/50 text-slate-300 font-medium">
              +{skillTags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {tier === "PRO" && cvUrl && (
          <button className="flex-1 px-3 py-2 text-xs font-medium rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            View CV
          </button>
        )}
        <button className="flex-1 px-3 py-2 text-xs font-medium rounded border border-blue-500 text-blue-300 hover:bg-blue-500/10 transition-colors">
          Contact
        </button>
      </div>
    </motion.div>
  );
}
