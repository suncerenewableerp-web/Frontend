import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_lib/backend";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/tickets/${id}/installation-done`, { requireAuth: true });
}

