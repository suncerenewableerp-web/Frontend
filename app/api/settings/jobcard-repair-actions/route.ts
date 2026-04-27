import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/settings/jobcard-repair-actions", { requireAuth: true });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/settings/jobcard-repair-actions", { requireAuth: true });
}

