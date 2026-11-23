import type { NextRequest } from "next/server";
import { proxyToBackend } from "../../../../_lib/backend";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ serialNo: string }> },
) {
  const { serialNo } = await context.params;
  return proxyToBackend(
    request,
    `/api/tickets/inverter/${encodeURIComponent(serialNo)}/history`,
    { requireAuth: true },
  );
}
