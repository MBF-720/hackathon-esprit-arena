/**
 * Origine du backend NestJS (sans slash final).
 *
 * - Navigateur : préfixe relatif `/api` → relayé par `app/api/[...path]/route.ts` vers le Nest
 *   (évite CORS et garde une seule config côté client).
 * - Serveur (RSC, route handlers, etc.) : URL absolue vers le Nest.
 *
 * Variables :
 * - `API_URL` — prioritaire côté serveur (proxy, SSR)
 * - `NEXT_PUBLIC_API_URL` — même URL ; requis au build pour le bundle client
 * - `BACKEND_URL` — alias optionnel
 *
 * En production (Railway, Vercel, etc.), sans ces variables, on ne retombe plus sur localhost
 * (sinon le proxy tente 127.0.0.1 dans le conteneur → injoignable).
 *
 * Développement local : sans variable → `http://127.0.0.1:3000` (Nest sur le port 3000).
 *
 * Railway (service frontend) : si `API_URL` / `NEXT_PUBLIC_API_URL` ne sont pas définis dans le
 * dashboard, on utilise l’URL publique du Nest ci-dessous (sinon le proxy tente localhost → erreur).
 * Surcharge possible avec les variables ci-dessus ou `RAILWAY_BACKEND_PUBLIC_URL`.
 */
const DEFAULT_DEV_BACKEND_ORIGIN = "http://127.0.0.1:3000";

/** Nest déployé sur Railway (API publique) — même projet que le front, autre service */
const RAILWAY_DEFAULT_NEST_ORIGIN = "https://hackathon-esprit-arena-production.up.railway.app";

function isProductionLike(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    !!process.env.RAILWAY_ENVIRONMENT ||
    !!process.env.RAILWAY_STATIC_URL
  );
}

/** Railway injecte parfois peu de variables selon l’image ; on élargit la détection. */
function isRailwayRuntime(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  const e = process.env;
  if (e.RAILWAY_ENVIRONMENT || e.RAILWAY_STATIC_URL) return true;
  if (e.RAILWAY === "true" || e.RAILWAY === "1") return true;
  if (e.RAILWAY_PUBLIC_DOMAIN || e.RAILWAY_PRIVATE_DOMAIN) return true;
  if (e.RAILWAY_PROJECT_ID || e.RAILWAY_SERVICE_ID || e.RAILWAY_REPLICA_ID) return true;
  return false;
}

export function getBackendOrigin(): string {
  if (typeof process === "undefined" || !process.env) {
    return DEFAULT_DEV_BACKEND_ORIGIN;
  }
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    process.env.RAILWAY_BACKEND_PUBLIC_URL?.trim() ||
    "";
  if (raw) {
    return raw.replace(/\/+$/, "");
  }
  // next dev : localhost. next start / Railway : sans .env le conteneur ne doit pas utiliser 127.0.0.1:3000
  if (process.env.NODE_ENV === "production" || isRailwayRuntime()) {
    return RAILWAY_DEFAULT_NEST_ORIGIN;
  }
  if (isProductionLike()) {
    return RAILWAY_DEFAULT_NEST_ORIGIN;
  }
  return DEFAULT_DEV_BACKEND_ORIGIN;
}

/** Base utilisée par `fetch` : relatif `/api` dans le navigateur, origine directe sur le serveur. */
export function getFetchBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return getBackendOrigin();
}
