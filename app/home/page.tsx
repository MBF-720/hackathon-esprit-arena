"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PlatformNavbar from "../components/PlatformNavbar";
import CreatePost from "../components/feed/CreatePost";
import Post from "../components/feed/Post";
import FeedSidebar from "../components/feed/FeedSidebar";
import { getToken, getProfile } from "../lib/api";

interface PostData {
  id: string;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  category: "news" | "achievement" | "challenge";
  reactions: Record<string, any>;
  comments: any[];
}

const DEMO_POSTS: PostData[] = [
  {
    id: "1",
    author: {
      name: "Arena Team",
      avatar: "/api/placeholder/48/48",
      role: "🚀 Équipe Officielle",
    },
    content:
      "Bienvenue dans votre nouveau feed communautaire! 🎉 Partagerez vos réussites, défis et actualités avec la communauté Arena of Coders.",
    timestamp: "Il y a 2 heures",
    category: "news",
    reactions: {
      "👍": { emoji: "👍", count: 24, userReacted: false },
      "❤️": { emoji: "❤️", count: 12, userReacted: true },
    },
    comments: [
      {
        id: "c1",
        author: { name: "Développeur X", avatar: "/api/placeholder/32/32" },
        content: "Superbe initiative! 💪",
        timestamp: "Il y a 1 heure",
      },
    ],
  },
  {
    id: "2",
    author: {
      name: "Sarah Dupont",
      avatar: "/api/placeholder/48/48",
      role: "Full Stack Developer",
    },
    content:
      "Vient de terminer ma première hackathon Arena of Coders! J'ai créé une app IA pour détecter les bugs. Le parcours a été incroyable et j'ai appris tellement de nouvelles compétences! Merci à toute l'équipe 🙏",
    image: "/api/placeholder/600/400",
    timestamp: "Il y a 4 heures",
    category: "achievement",
    reactions: {
      "🔥": { emoji: "🔥", count: 18, userReacted: false },
      "🎯": { emoji: "🎯", count: 8, userReacted: false },
      "👍": { emoji: "👍", count: 32, userReacted: true },
    },
    comments: [
      {
        id: "c2",
        author: { name: "Coach Tech", avatar: "/api/placeholder/32/32" },
        content: "Bravo! Ton projet a beaucoup impressionné le jury 🌟",
        timestamp: "Il y a 2 heures",
      },
      {
        id: "c3",
        author: { name: "Dev Community", avatar: "/api/placeholder/32/32" },
        content: "Peux-tu partager ton code sur GitHub?",
        timestamp: "Il y a 1 heure",
      },
    ],
  },
  {
    id: "3",
    author: {
      name: "Marc Development",
      avatar: "/api/placeholder/48/48",
      role: "Backend Developer",
    },
    content:
      "⚡ Défi du jour: Optimiser les performances d'une API REST en réduisant le temps de réponse de 50%. Qui veut relever le défi et partager sa solution? Les meilleures approches seront partagées avec la communauté!",
    timestamp: "Il y a 6 heures",
    category: "challenge",
    reactions: {
      "⚡": { emoji: "⚡", count: 15, userReacted: false },
      "🎯": { emoji: "🎯", count: 22, userReacted: false },
    },
    comments: [
      {
        id: "c4",
        author: { name: "Optimisation Expert", avatar: "/api/placeholder/32/32" },
        content: "Intéressant! Je vais essayer une approche avec Redis 🚀",
        timestamp: "Il y a 3 heures",
      },
    ],
  },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<PostData[]>(DEMO_POSTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    getProfile()
      .then((profile) => {
        setUser(profile);
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  const handleCreatePost = (content: string, category: string) => {
    const newPost: PostData = {
      id: `${Date.now()}`,
      author: {
        name: user?.firstName + " " + user?.lastName || "Utilisateur",
        avatar: user?.avatar || "/api/placeholder/48/48",
        role: user?.speciality || "Développeur",
      },
      content,
      timestamp: "À l'instant",
      category: category as "news" | "achievement" | "challenge",
      reactions: {},
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <PlatformNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl opacity-50" />
          <div className="relative bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-3xl border border-cyan-500/20 backdrop-blur-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  Bienvenue {user?.firstName}! 👋
                </h1>
                <p className="text-cyan-300 text-lg font-medium">
                  Connecté en tant que <span className="font-bold text-cyan-200">{user?.speciality || "Développeur"}</span>
                </p>
              </div>
              <div className="hidden md:block text-6xl opacity-20">🚀</div>
            </div>
          </div>
        </motion.div>

        {/* Create Post Section */}
        <div className="mb-12">
          <CreatePost
            userAvatar={user?.avatar}
            userName={user?.firstName}
            onPostCreate={handleCreatePost}
          />
        </div>

        {/* Posts Feed with Animation */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Post {...post} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4"
          >
            <div className="text-7xl mb-4">📭</div>
            <p className="text-2xl font-bold text-gray-300">Aucun post pour le moment</p>
            <p className="text-gray-500 text-lg">
              Sois le premier à partager une actualité ou une réussite!
            </p>
          </motion.div>
        )}
      </main>

      {/* Sidebar */}
      <FeedSidebar />
    </div>
  );
}
