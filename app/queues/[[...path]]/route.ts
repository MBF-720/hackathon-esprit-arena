import { getBackendOrigin } from "@/app/lib/backend-url";

/** Proxy Bull Board UI (`/queues` on Nest) — same origin as Next in dev (ex. :3001 → Nest :3000). */

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyQueues(request, await params);
}
export async function POST(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyQueues(request, await params);
}
export async function PUT(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyQueues(request, await params);
}
export async function PATCH(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyQueues(request, await params);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxyQueues(request, await params);
}

async function proxyQueues(request: Request, { path }: { path?: string[] }) {
  const backend = getBackendOrigin();
  if (!backend) {
    return Response.json(
      {
        message:
          "Backend non configuré : définissez API_URL et NEXT_PUBLIC_API_URL (URL du Nest) dans l’environnement, puis redéployez ou redémarrez Next.",
      },
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
  const pathStr = path?.length ? path.join("/") : "";
  const url = `${backend}/queues${pathStr ? `/${pathStr}` : ""}${new URL(request.url).search}`;

  const requestHost = request.headers.get("host") ?? "";
  const backendHost = new URL(backend).host;
  if (requestHost === backendHost) {
    return Response.json(
      {
        message:
          "Backend and frontend use the same port. Run the frontend on 3001 (npm run dev) and the backend on 3000.",
      },
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection") return;
    headers.set(key, value);
  });

  let body: ArrayBuffer | undefined;
  try {
    body = await request.arrayBuffer();
  } catch {
    // no body
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: request.method,
      headers,
      body: body?.byteLength ? body : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { message: `Backend injoignable (${message}). Démarrez Nest sur le port configuré (ex. 3000).` },
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
  clearTimeout(timeout);

  const out = new Headers();
  res.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "connection" || lower === "transfer-encoding" || lower === "keep-alive") return;
    out.set(key, value);
  });

  const buf = await res.arrayBuffer();
  return new Response(buf.byteLength ? buf : null, {
    status: res.status,
    statusText: res.statusText,
    headers: out,
  });
}
