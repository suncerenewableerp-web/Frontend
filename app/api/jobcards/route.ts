import type { NextRequest } from "next/server";
import { proxyToBackend } from "../_lib/backend";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString();
  return proxyToBackend(request, `/api/jobcards${qs ? `?${qs}` : ""}`, {
    requireAuth: true,
  });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/jobcards", { requireAuth: true });
}

