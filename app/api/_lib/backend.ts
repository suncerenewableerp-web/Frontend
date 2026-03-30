import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MISSING_MAIN_URL_MESSAGE =
  "Missing MAIN_URL in environment. Set it in .env.local (e.g. MAIN_URL=http://localhost:5000).";
const DEFAULT_BACKEND_TIMEOUT_MS = 25_000;

function isAbortError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: unknown }).name === "AbortError",
  );
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number = DEFAULT_BACKEND_TIMEOUT_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function getBaseUrl() {
  const baseUrl = process.env.MAIN_URL || process.env.NEXT_PUBLIC_MAIN_URL;
  if (!baseUrl) return null;
  return baseUrl.replace(/\/+$/, "");
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  opts?: { requireAuth?: boolean },
) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: MISSING_MAIN_URL_MESSAGE },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
  const url = `${baseUrl}${backendPath}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.Authorization = authHeader;

  if (opts?.requireAuth && !headers.Authorization) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.text() : undefined;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method: request.method,
      headers,
      body: body && body.length ? body : undefined,
      cache: "no-store",
    });
  } catch (err) {
    if (isAbortError(err)) {
      return NextResponse.json(
        {
          success: false,
          message: "Backend request timed out. Please try again or check MAIN_URL connectivity.",
        },
        { status: 504, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { success: false, message: "Backend is unreachable. Is it running on MAIN_URL?" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const text = await res.text();
  const resContentType = res.headers.get("content-type") ?? "application/json";

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": resContentType,
      "Cache-Control": "no-store",
    },
  });
}
