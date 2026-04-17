import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../_lib/backend";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/tickets/${id}/installation-documents`, { requireAuth: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, `/api/tickets/${id}/installation-documents`, { requireAuth: true });
}

