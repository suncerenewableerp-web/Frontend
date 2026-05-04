import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search || "";
  return proxyToBackend(request, `/api/settings/inverter-models${qs}`, { requireAuth: true });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/settings/inverter-models", { requireAuth: true });
}

