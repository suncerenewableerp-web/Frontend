import type { NextRequest } from "next/server";
import { proxyFileToBackend } from "../../api/_lib/backend";

function safeJoin(segments: string[] | undefined) {
  const parts = Array.isArray(segments) ? segments : [];
  for (const p of parts) {
    if (!p || p === "." || p === ".." || p.includes("..")) return null;
  }
  return parts.join("/");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joined = safeJoin(path);
  if (!joined) {
    return new Response("Not Found", { status: 404 });
  }
  return proxyFileToBackend(request, `/uploads/${joined}`, { requireAuth: true });
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joined = safeJoin(path);
  if (!joined) {
    return new Response(null, { status: 404 });
  }
  return proxyFileToBackend(request, `/uploads/${joined}`, { requireAuth: true });
}

