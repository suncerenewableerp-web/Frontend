import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/logistics/approve-dispatch", {
    requireAuth: true,
  });
}

