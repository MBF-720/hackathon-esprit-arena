import { getBackendOrigin } from "@/app/lib/backend-url";

// Next.js (ex. port 3001) → proxy vers Nest (voir getBackendOrigin / NEXT_PUBLIC_API_URL)

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

async function proxy(request: Request, { path }: { path: string[] }) {
  const backend = getBackendOrigin();
  const pathStr = path.length ? path.join("/") : "";
  const url = `${backend}/${pathStr}${new URL(request.url).search}`;

  const requestHost = request.headers.get("host") ?? "";
  const backendHost = new URL(backend).host;
  if (requestHost === backendHost) {
    return Response.json(
      {
        message:
          "Backend and frontend use the same port. The frontend is set to run on 3001 (npm run dev). Start the backend on 3000 in another terminal.",
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
  const timeout = setTimeout(() => controller.abort(), 60_000);

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
    const code = (err as { code?: string })?.code;
    // AggregateError (Node fetch) : erreurs dans .errors[]
    const agg = err as { errors?: Array<Error & { code?: string }> };
    const firstInner = agg?.errors?.[0];
    const innerCode = firstInner && "code" in firstInner ? firstInner.code : undefined;
    const innerMessage = firstInner instanceof Error ? firstInner.message : String(firstInner ?? "");
    const hasRefused =
      message.includes("ECONNREFUSED") ||
      innerMessage.includes("ECONNREFUSED") ||
      code === "ECONNREFUSED" ||
      innerCode === "ECONNREFUSED" ||
      (Array.isArray(agg?.errors) && agg.errors.some((e: unknown) => (e as { code?: string })?.code === "ECONNREFUSED"));
    const hasReset =
      message.includes("ECONNRESET") ||
      message.includes("socket hang up") ||
      innerMessage.includes("ECONNRESET") ||
      code === "ECONNRESET" ||
      innerCode === "ECONNRESET";
    const hint = hasRefused
      ? "Le backend NestJS n'est pas démarré. Démarrez-le : dans le dossier ArenaOfCoders-Backend-main\\ArenaOfCoders-Backend-main lancez « npm run start:dev » (port 3000). Puis rechargez cette page."
      : hasReset
        ? "La connexion au backend a été interrompue (crash ou redémarrage). Vérifiez le terminal du backend et relancez « npm run start:dev »."
        : "Vérifiez que le backend tourne sur le port 3000 (npm run start:dev dans le dossier backend).";
    return Response.json(
      { message: `Backend injoignable. ${hint}` },
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
  clearTimeout(timeout);

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
