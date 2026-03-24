import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/roles/${id}`, { requireAuth: true });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyToBackend(request, `/api/roles/${id}`, { requireAuth: true });
}

