import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_lib/backend";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await context.params;
  return proxyToBackend(request, `/api/logistics/ticket/${ticketId}`, { requireAuth: true });
}

