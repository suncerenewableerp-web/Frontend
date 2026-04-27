import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_lib/backend";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  return proxyToBackend(request, `/api/settings/jobcard-repair-actions/${encodeURIComponent(key)}`, {
    requireAuth: true,
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  return proxyToBackend(request, `/api/settings/jobcard-repair-actions/${encodeURIComponent(key)}`, {
    requireAuth: true,
  });
}

