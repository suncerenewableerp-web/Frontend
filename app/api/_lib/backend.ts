import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getBaseUrl() {
  const baseUrl = process.env.MAIN_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing MAIN_URL in environment. Set it in .env.local (e.g. MAIN_URL=http://localhost:5000).",
    );
  }
  return baseUrl.replace(/\/+$/, "");
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  opts?: { requireAuth?: boolean },
) {
  const baseUrl = getBaseUrl();
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

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: body && body.length ? body : undefined,
    cache: "no-store",
  });

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

