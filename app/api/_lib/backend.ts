import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MISSING_MAIN_URL_MESSAGE =
  "Missing MAIN_URL in environment. Set it in .env.local (e.g. MAIN_URL=http://localhost:5000).";
const DEFAULT_BACKEND_TIMEOUT_MS = 25_000;
const ACCESS_TOKEN_COOKIE = "sunce_access_token";
const REFRESH_TOKEN_COOKIE = "sunce_refresh_token";
const ACCESS_TOKEN_MAX_AGE_S = 60 * 15; // 15m (should match backend JWT access expiry)
const REFRESH_TOKEN_MAX_AGE_S = 60 * 60 * 24 * 7; // 7d (should match backend JWT refresh expiry)

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

function getAuthHeaderFromRequest(request: NextRequest): string | null {
  const header =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (header?.trim()) return header;

  const altHeader =
    request.headers.get("x-authorization") ||
    request.headers.get("X-Authorization") ||
    request.headers.get("x-access-token") ||
    request.headers.get("X-Access-Token");
  if (altHeader?.trim()) {
    const v = altHeader.trim();
    return v.toLowerCase().startsWith("bearer ") ? v : `Bearer ${v}`;
  }

  const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value?.trim();
  if (!cookieToken) return null;
  return cookieToken.toLowerCase().startsWith("bearer ")
    ? cookieToken
    : `Bearer ${cookieToken}`;
}

function setAuthCookies(res: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_S,
  });
  res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_S,
  });
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

  const authHeader = getAuthHeaderFromRequest(request);
  if (authHeader) headers.Authorization = authHeader;

  if (opts?.requireAuth && !headers.Authorization) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method: request.method,
      headers,
      body: body && body.byteLength ? body : undefined,
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

export async function proxyFileToBackend(
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

  const headers: Record<string, string> = {};

  const authHeader = getAuthHeaderFromRequest(request);
  if (authHeader) headers.Authorization = authHeader;

  if (opts?.requireAuth && !headers.Authorization) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method: request.method,
      headers,
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

  const buf = await res.arrayBuffer();
  const outHeaders: Record<string, string> = {
    "Cache-Control": "no-store",
  };
  const contentType = res.headers.get("content-type");
  if (contentType) outHeaders["Content-Type"] = contentType;
  const contentDisposition = res.headers.get("content-disposition");
  if (contentDisposition) outHeaders["Content-Disposition"] = contentDisposition;

  return new NextResponse(buf, { status: res.status, headers: outHeaders });
}

export async function proxyToBackendAndSetAuthCookies(
  request: NextRequest,
  backendPath: string,
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

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method: request.method,
      headers,
      body: body && body.byteLength ? body : undefined,
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
  const out = new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": resContentType,
      "Cache-Control": "no-store",
    },
  });

  if (res.ok && resContentType.includes("application/json") && text) {
    try {
      const parsed = JSON.parse(text) as {
        success?: unknown;
        data?: { accessToken?: unknown; refreshToken?: unknown };
      };
      const accessToken =
        typeof parsed?.data?.accessToken === "string" ? parsed.data.accessToken : "";
      const refreshToken =
        typeof parsed?.data?.refreshToken === "string" ? parsed.data.refreshToken : "";
      if (parsed?.success === true && accessToken && refreshToken) {
        setAuthCookies(out, { accessToken, refreshToken });
      }
    } catch {
      // Ignore parse errors; response is still returned to the client.
    }
  }

  return out;
}
