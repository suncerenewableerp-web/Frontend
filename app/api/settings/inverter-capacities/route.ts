import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/settings/inverter-capacities", { requireAuth: true });
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/settings/inverter-capacities", { requireAuth: true });
}

