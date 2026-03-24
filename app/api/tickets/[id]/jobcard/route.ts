import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_lib/backend";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/tickets/${id}/jobcard`, { requireAuth: true });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/tickets/${id}/jobcard`, { requireAuth: true });
}

