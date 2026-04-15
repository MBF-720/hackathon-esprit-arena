import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chemin absolu évite les bugs Turbopack / « Failed to fetch » en dev (Windows)
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "hackathon-esprit-arena-production.up.railway.app",
        pathname: "/**",
      },
    ],
  },
  // Les appels `/api/*` sont relayés vers Nest par `app/api/[...path]/route.ts` (une seule couche, évite les doublons avec rewrites).
  // Allow dev origins to prevent CORS warnings
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.0/16", // Local network range
  ],
};

export default nextConfig;
