"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../lib/api";
import Link from "next/link";
import PlatformNavbar from "../components/PlatformNavbar";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mainSpecialty, setMainSpecialty] = useState("");
  const [skillTags, setSkillTags] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((u) => {
        if (mounted) {
          setFirstName(u.firstName ?? "");
          setLastName(u.lastName ?? "");
          setMainSpecialty(u.mainSpecialty ?? "");
          setSkillTags(Array.isArray(u.skillTags) ? u.skillTags.join(", ") : "");
          setGithubUrl(u.githubUrl ?? "");
          setLinkedinUrl(u.linkedinUrl ?? "");
        }
      })
      .catch(() => { if (mounted) setMessage({ type: "error", text: "Erreur de chargement." }); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile({
        firstName,
        lastName,
        mainSpecialty,
        skillTags: skillTags.split(",").map((s) => s.trim()).filter(Boolean),
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      });
      setMessage({ type: "success", text: "Profil mis à jour." });
    } catch (err: unknown) {
      const text = err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string"
        ? (err as { message: string }).message
        : "Échec de la mise à jour.";
      setMessage({ type: "error", text });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans relative">
      <PlatformNavbar />

      <main className="max-w-2xl mx-auto p-6 md:p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"}`}>
            {message.text}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-6 text-cyan-500">Paramètres</h1>
        <form onSubmit={handleSave} className="space-y-6 rounded-2xl border bg-white/5 border-white/10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Prénom</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Nom</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Spécialité</label>
            <select value={mainSpecialty} onChange={(e) => setMainSpecialty(e.target.value)} className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="">Sélectionner</option>
              {["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DATA", "CYBERSECURITY", "DEVOPS"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Compétences (séparées par des virgules)</label>
            <input value={skillTags} onChange={(e) => setSkillTags(e.target.value)} placeholder="REACT, NODE, TYPESCRIPT..." className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Lien GitHub (optionnel)</label>
            <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold">Lien LinkedIn (optionnel)</label>
            <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/username/" className="w-full border border-white/10 rounded-xl px-4 py-3 bg-white/5 text-white placeholder:text-white/30 focus:ring-2 focus:ring-cyan-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-cyan-500 text-black py-4 rounded-xl font-bold hover:bg-cyan-400 transition-colors">
            Enregistrer
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/profile" className="text-cyan-400 hover:underline">Retour au profil</Link>
        </p>
      </main>
    </div>
  );
}
