import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search || "";
  return proxyToBackend(request, `/api/dashboard/inventory-summary${qs}`, { requireAuth: true });
}
