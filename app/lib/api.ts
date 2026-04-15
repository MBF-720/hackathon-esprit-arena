import { getBackendOrigin, getFetchBaseUrl } from "./backend-url";

export type SignUpPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

function unreachableHint(): string {
  return "Backend unreachable or returned an error. Check that the backend is running (e.g. on port 3000) and that NEXT_PUBLIC_API_URL matches the Nest URL.";
}

async function parseBackendJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text?.trim() ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) throw { message: text || res.statusText || "Server error" };
    throw { message: "Invalid response from server" };
  }
  if (!res.ok) {
    const isHtml =
      text.trimStart().toLowerCase().startsWith("<!doctype") ||
      text.trimStart().toLowerCase().startsWith("<html");
    const message = isHtml
      ? unreachableHint()
      : json && typeof json === "object" && "message" in json && typeof (json as { message?: string }).message === "string"
        ? (json as { message: string }).message
        : text || res.statusText;
    throw { message };
  }
  return json;
}

async function request(path: string, init: RequestInit) {
  if (typeof window === "undefined" && !getBackendOrigin()) {
    throw {
      message:
        "Variables API_URL / NEXT_PUBLIC_API_URL manquantes (production). Ajoutez-les sur Railway ou dans .env pour l’URL du backend Nest.",
    };
  }
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const url = `${getFetchBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw {
      message: `Cannot reach backend (${msg}). Start the Nest backend and set NEXT_PUBLIC_API_URL in .env.local if it uses another host or port.`,
    };
  }
  return parseBackendJsonResponse(res);
}

/** Inscription avec formulaire JSON (legacy). Le backend attend en fait multipart + CV .docx → utiliser signUpWithResume. */
export async function signUp(payload: SignUpPayload) {
  return request('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Inscription avec CV .docx (multipart/form-data) — conforme au backend NestJS. */
export async function signUpWithResume(formData: FormData) {
  if (typeof window === "undefined" && !getBackendOrigin()) {
    throw {
      message:
        "Variables API_URL / NEXT_PUBLIC_API_URL manquantes (production). Ajoutez-les sur Railway ou dans .env pour l’URL du backend Nest.",
    };
  }
  const url = `${getFetchBaseUrl()}/auth/signup`;
  const headers: HeadersInit = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers, body: formData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw {
      message: `Cannot reach backend (${msg}). Start the Nest backend and set NEXT_PUBLIC_API_URL in .env.local if it uses another host or port.`,
    };
  }
  return parseBackendJsonResponse(res);
}

export async function signIn(payload: SignInPayload) {
  return request('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function saveToken(accessToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aoc_access_token', accessToken);
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aoc_access_token');
}

export async function verifyEmail(email: string, code: string) {
  return request('/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
}

export async function resendVerification(email: string) {
  return request('/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function forgotPassword(email: string) {
  return request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  return request('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
}

/** Profil utilisateur renvoyé par `GET /auth/me`. */
export type UserProfile = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  mainSpecialty?: string | null;
  skillTags?: string[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  /** USER | ADMIN | COMPANY */
  role?: string;
  avatarUrl?: string | null;
};

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  mainSpecialty?: string;
  skillTags?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
};

export async function getProfile(): Promise<UserProfile> {
  const res = await request('/auth/me', { method: 'GET' });
  return res as UserProfile;
}

/** Statistiques plateforme (réservé admin). */
export async function getAdminDashboardStats(): Promise<{
  users: { total: number; verified: number; banned: number; noSpecialty: number; byRole: Record<string, number> };
  specialties: { list: string[]; bySpecialty: Record<string, number> };
  rooms: { total: number; description: string };
}> {
  const res = await request('/admin/dashboard/stats', { method: 'GET' });
  return res as Awaited<ReturnType<typeof getAdminDashboardStats>>;
}

export type AdminUserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  mainSpecialty: string | null;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
};

/** Derniers utilisateurs inscrits (admin). */
export async function getAdminRecentUsers(limit?: number): Promise<AdminUserRow[]> {
  const url = limit ? `/admin/users/recent?limit=${limit}` : '/admin/users/recent';
  const res = await request(url, { method: 'GET' });
  return res as unknown as AdminUserRow[];
}

/** Liste utilisateurs avec recherche et pagination (admin). */
export async function getAdminUsers(params: { 
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
}): Promise<{
  users: AdminUserRow[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sp = new URLSearchParams();
  if (params.limit != null) sp.set('limit', String(params.limit));
  if (params.offset != null) sp.set('offset', String(params.offset));
  if (params.search) sp.set('search', params.search);
  if (params.role) sp.set('role', params.role);
  const q = sp.toString();
  const res = await request(`/admin/users${q ? `?${q}` : ''}`, { method: 'GET' });
  return res as Awaited<ReturnType<typeof getAdminUsers>>;
}

/** Top participants (présélectionnés par score) — même logique que l’API publique. */
export async function getTopParticipants(
  competitionId: string,
  limit?: number,
): Promise<{
  competitionId: string;
  topN: number;
  winnerId: string | null;
  preselected: Array<{
    rank: number;
    participantId: string;
    score: number;
    user: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null; mainSpecialty?: string | null };
  }>;
}> {
  const q = limit != null ? `?limit=${limit}` : '';
  const res = await request(`/competitions/${competitionId}/top-participants${q}`, { method: 'GET' });
  return res as {
    competitionId: string;
    topN: number;
    winnerId: string | null;
    preselected: Array<{
      rank: number;
      participantId: string;
      score: number;
      user: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string | null; mainSpecialty?: string | null };
    }>;
  };
}

/** Envoie un e-mail HTML aux présélectionnés (admin). Placeholders : {{firstName}}, {{competitionTitle}} */
export async function adminSendPreselectedEmail(
  competitionId: string,
  payload: { subject: string; htmlBody: string; limit?: number },
): Promise<{ sent: number; total: number; failedEmails: string[] }> {
  const res = await request(`/admin/competitions/${competitionId}/preselected/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res as { sent: number; total: number; failedEmails: string[] };
}

const N8N_WEBHOOK_TIMEOUT_MS = 120_000;

function mergeAbortSignals(a: AbortSignal, b?: AbortSignal): AbortSignal {
  if (!b) return a;
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.any === "function") {
    return AbortSignal.any([a, b]);
  }
  return b;
}

/** Déclenche le webhook n8n (test) via le backend (évite CORS). Timeout 2 min. */
export async function triggerN8nWebhookTest(signal?: AbortSignal): Promise<{ success: boolean; message?: string }> {
  const token = getToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let fetchSignal: AbortSignal | undefined = signal;
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    const timeoutSignal = AbortSignal.timeout(N8N_WEBHOOK_TIMEOUT_MS);
    fetchSignal = mergeAbortSignals(timeoutSignal, signal);
  }
  const res = await fetch(`${getFetchBaseUrl()}/admin/n8n/webhook-test`, {
    method: "POST",
    headers,
    body: "{}",
    ...(fetchSignal ? { signal: fetchSignal } : {}),
  });
  const text = await res.text();
  let json: { success?: boolean; message?: string } = {};
  try {
    json = (text && text.trim()) ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) return { success: false, message: text || res.statusText };
    return { success: false, message: 'Invalid response from server' };
  }
  if (!res.ok) {
    const msg = (json && typeof json.message === 'string') ? json.message : text || res.statusText;
    return { success: false, message: msg };
  }
  return { success: Boolean(json.success), message: json.message };
}

/** Get Stream Chat/Video user token from backend (requires auth). */
export async function getStreamToken(userId?: string): Promise<{ token: string; apiKey?: string }> {
  const body = userId ? { userId } : {};
  const res = await request('/stream/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res as { token: string; apiKey?: string };
}

/** Rejoindre le canal Arena Live côté serveur (requis pour pouvoir envoyer des messages). */
export async function ensureArenaJoin(): Promise<{ ok: boolean }> {
  const res = await request('/stream/arena/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { ok: boolean };
}

/** Liste de toutes les salles hackathon avec indicateur canParticipate selon la spécialité. */
export async function getHackathonRooms(): Promise<{
  rooms: { id: string; name: string; description: string; specialty?: string; canParticipate: boolean }[];
}> {
  const res = await request('/stream/rooms', { method: 'GET' });
  return res as { rooms: { id: string; name: string; description: string; specialty?: string; canParticipate: boolean }[] };
}

/** Rejoindre une salle hackathon côté serveur (chat + visio + partage d'écran). */
export async function ensureRoomJoin(roomId: string): Promise<{ ok: boolean }> {
  const res = await request(`/stream/room/${encodeURIComponent(roomId)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { ok: boolean };
}

export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aoc_access_token');
  }
}

export async function updateProfile(dto: UpdateProfilePayload) {
  return request("/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

/** Récupère le classement public de tous les utilisateurs (leaderboard). */
export type LeaderboardUser = {
  id: string;
  rank: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mainSpecialty: string;
  xp: number;
  skillTags: string[];
};

export async function getLeaderboard(signal?: AbortSignal): Promise<{ total: number; users: LeaderboardUser[] }> {
  const res = await request("/user/leaderboard", {
    method: "GET",
    ...(signal ? { signal } : {}),
  });
  return res as { total: number; users: LeaderboardUser[] };
}

/** Résultat du mint de certificat NFT. */
export type CertificateResult = {
  user: { firstName: string; lastName: string };
  imageIpfsUrl: string;
  metadataIpfsUrl: string;
  tokenId: string;
  serial: number;
};

/** Génère un certificat NFT sur Hedera pour l'utilisateur et le hackathon donnés. */
export async function generateCertificate(
  userId: string,
  hackathonName: string,
): Promise<CertificateResult> {
  const res = await request('/certificate/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, hackathonName }),
  });
  return res as CertificateResult;
}

// ─────────────────────────────────────────────────────────────────
// COMPETITIONS / HACKATHONS
// ─────────────────────────────────────────────────────────────────

export type CompetitionStatus =
  | 'SCHEDULED'
  | 'OPEN_FOR_ENTRY'
  | 'RUNNING'
  | 'SUBMISSION_CLOSED'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'ARCHIVED';

export type CompetitionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type Specialty =
  | 'FRONTEND'
  | 'BACKEND'
  | 'FULLSTACK'
  | 'MOBILE'
  | 'DATA'
  | 'BI'
  | 'CYBERSECURITY'
  | 'DESIGN'
  | 'DEVOPS';

export type Competition = {
  id: string;
  title: string;
  description: string;
  difficulty: CompetitionDifficulty;
  specialty: Specialty | null;
  status: CompetitionStatus;
  startDate: string;
  endDate: string;
  rewardPool: number;
  maxParticipants: number | null;
  antiCheatEnabled: boolean;
  topN: number;
  createdAt: string;
  _count?: { participants: number };
};

export type CreateCompetitionPayload = {
  title: string;
  description: string;
  difficulty: CompetitionDifficulty;
  specialty?: Specialty;
  startDate: string;
  endDate: string;
  rewardPool?: number;
  maxParticipants?: number;
  antiCheatEnabled?: boolean;
  antiCheatThreshold?: number;
  topN?: number;
};

/** Liste les compétitions (admin : toutes, user : filtrées). */
export async function getCompetitions(params?: {
  status?: CompetitionStatus;
  specialty?: Specialty;
  onlyActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ data: Competition[]; total: number; page: number; limit: number }> {
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.specialty) sp.set('specialty', params.specialty);
  if (params?.onlyActive != null) sp.set('onlyActive', String(params.onlyActive));
  if (params?.page) sp.set('page', String(params.page));
  if (params?.limit) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const res = await request(`/competitions${q ? `?${q}` : ''}`, { method: 'GET' });
  return res as { data: Competition[]; total: number; page: number; limit: number };
}

export async function getCompetitionById(id: string): Promise<Competition> {
  const res = await request(`/competitions/${id}`, { method: 'GET' });
  return res as Competition;
}

/** Crée un hackathon (admin uniquement). */
export async function createCompetition(payload: CreateCompetitionPayload): Promise<Competition> {
  const res = await request('/competitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res as Competition;
}

/** Change le statut d'une compétition (admin uniquement). */
export async function changeCompetitionStatus(
  id: string,
  status: CompetitionStatus,
): Promise<Competition> {
  const res = await request(`/competitions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res as Competition;
}

/** Rejoindre une compétition (utilisateur connecté). */
export async function joinCompetition(id: string): Promise<{ message: string }> {
  const res = await request(`/competitions/${id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { message: string };
}

/** Participant hackathon (vue admin / entreprise). */
export type CompetitionParticipantAdmin = {
  id: string;
  user: { firstName: string; lastName: string; email: string; avatarUrl?: string };
  score: number;
  antiCheatConfidenceLevel: number;
  antiCheatFlagged: boolean;
  repoLink?: string;
  hasSubmittedCheckpoints: boolean;
  isWinner: boolean;
};

/** Liste tous les participants avec scores et rapports (Admin/Company). */
export async function getCompetitionParticipantsForAdmin(id: string): Promise<{
  participants: CompetitionParticipantAdmin[];
  totalParticipants: number;
}> {
  const res = await request(`/competitions/${id}/participants/all`, { method: "GET" });
  return res as { participants: CompetitionParticipantAdmin[]; totalParticipants: number };
}

/** Sélectionner un gagnant pour un hackathon (Admin/Company). */
export async function selectWinner(
  competitionId: string,
  participantId: string,
): Promise<Record<string, unknown>> {
  const res = await request(`/competitions/${competitionId}/winner/${participantId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res as Record<string, unknown>;
}

/** Récupère le statut de participation de l'utilisateur actuel pour un hackathon donné. */
export async function getMyParticipation(competitionId: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await request(`/competitions/${competitionId}/my-participation`, { method: "GET" });
    return res as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Demande le rôle d'entreprise (Company) pour l'utilisateur actuel. */
export async function requestCompanyRole(payload: {
  companyName: string;
  description: string;
}): Promise<Record<string, unknown>> {
  return request("/user/request-company-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Soumet le travail final (lien GitHub) pour un hackathon. */
export async function submitWork(
  competitionId: string,
  githubUrl: string,
): Promise<Record<string, unknown>> {
  return request(`/competitions/${competitionId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ githubUrl }),
  });
}

export type CompanyRequestRow = {
  id: string;
  status: string;
  companyName?: string;
  description?: string;
  createdAt?: string;
};

/** Liste les demandes de rôle entreprise (Admin). */
export async function getCompanyRequests(
  status?: "PENDING" | "APPROVED" | "REJECTED",
): Promise<CompanyRequestRow[]> {
  const url = status ? `/admin/company-requests?status=${status}` : "/admin/company-requests";
  const res = await request(url, { method: "GET" });
  return res as unknown as CompanyRequestRow[];
}

/** Accepter ou refuser une demande de rôle entreprise (Admin). */
export async function reviewCompanyRequest(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<Record<string, unknown>> {
  return request(`/admin/company-requests/${id}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

// ─────────────────────────────────────────────────────────────────
// EQUIPES (TEAMS)
// ─────────────────────────────────────────────────────────────────

/** Effectif total (leader inclus) pour valider une équipe manuelle. */
export const TEAM_SIZE_MIN = 4;
export const TEAM_SIZE_MAX = 6;

export type EquipeMember = {
  id: string;
  equipeId: string;
  userId: string;
  role: 'LEADER' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
    mainSpecialty?: string | null;
  };
};

export type EquipeInvitation = {
  id: string;
  equipeId: string;
  inviterId: string;
  inviteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
  invitee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
  };
  inviter?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  equipe?: Equipe;
};

export type Equipe = {
  id: string;
  name: string;
  competitionId: string;
  status: 'FORMING' | 'READY' | 'PARTICIPATING';
  isAutoFormed: boolean;
  members: EquipeMember[];
  invitations?: EquipeInvitation[];
  competition?: {
    id: string;
    title: string;
    status: string;
    specialty?: string | null;
  };
  myRole?: 'LEADER' | 'MEMBER';
  githubUrl?: string | null;
  score?: number | null;
  submittedAt?: string | null;
  isWinner?: boolean;
  createdAt: string;
};

export type SearchUserResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  mainSpecialty?: string | null;
  alreadyInTeam?: boolean;
  inSoloQueue?: boolean;
};

export async function createEquipe(
  competitionId: string,
  name: string,
): Promise<Equipe> {
  const res = await request('/equipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ competitionId, name }),
  });
  return res as unknown as Equipe;
}

export async function getMyEquipe(
  competitionId: string,
): Promise<Equipe | null> {
  try {
    const res = await request(`/equipes/my-equipe/${competitionId}`, {
      method: 'GET',
    });
    return (res as unknown as Equipe) || null;
  } catch {
    return null;
  }
}

export async function getEquipeById(equipeId: string): Promise<Equipe> {
  const res = await request(`/equipes/${equipeId}`, { method: 'GET' });
  return res as unknown as Equipe;
}

export async function getCompetitionEquipes(
  competitionId: string,
): Promise<{ competitionId: string; equipes: Equipe[]; total: number }> {
  const res = await request(`/equipes/competition/${competitionId}`, {
    method: 'GET',
  });
  return res as unknown as {
    competitionId: string;
    equipes: Equipe[];
    total: number;
  };
}

export async function inviteToEquipe(
  equipeId: string,
  email: string,
): Promise<{ message: string }> {
  const res = await request(`/equipes/${equipeId}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res as { message: string };
}

export async function getMyInvitations(): Promise<{
  invitations: EquipeInvitation[];
  total: number;
}> {
  const res = await request('/equipe-invitations/my-invitations', {
    method: 'GET',
  });
  return res as unknown as { invitations: EquipeInvitation[]; total: number };
}

export async function acceptInvitation(
  invitationId: string,
): Promise<Equipe> {
  const res = await request(`/equipe-invitations/${invitationId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as unknown as Equipe;
}

export async function declineInvitation(
  invitationId: string,
): Promise<{ message: string }> {
  const res = await request(`/equipe-invitations/${invitationId}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { message: string };
}

/** Leader uniquement : fige l’équipe en READY (4 à 6 membres). */
export async function markEquipeReady(equipeId: string): Promise<Equipe> {
  const res = await request(`/equipes/${equipeId}/mark-ready`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as unknown as Equipe;
}

export async function joinSolo(
  competitionId: string,
): Promise<{ message: string }> {
  const res = await request(`/competitions/${competitionId}/join-solo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res as { message: string };
}

export async function searchUsersForInvite(
  query: string,
  competitionId?: string,
): Promise<SearchUserResult[]> {
  const params = new URLSearchParams({ query });
  if (competitionId) params.set('competitionId', competitionId);
  const res = await request(`/equipes/search-users?${params.toString()}`, {
    method: 'GET',
  });
  return res as unknown as SearchUserResult[];
}

// ─────────────────────────────────────────────────────────────────
// TEAM CHAT
// ─────────────────────────────────────────────────────────────────

/** Rejoindre le canal de chat privé de son équipe pour un hackathon donné. */
export async function joinTeamChat(
  equipeId: string,
  competitionId: string,
): Promise<{ ok: boolean }> {
  const res = await request(
    `/stream/team/${encodeURIComponent(equipeId)}/comp/${encodeURIComponent(competitionId)}/join`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
  );
  return res as { ok: boolean };
}
