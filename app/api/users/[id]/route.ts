import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../_lib/backend";

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return proxyToBackend(request, `/api/users/${encodeURIComponent(id)}`, {
    requireAuth: true,
  });
}

