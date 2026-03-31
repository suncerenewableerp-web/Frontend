import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_lib/backend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/tickets/${id}/pickup-documents`, { requireAuth: true });
}

