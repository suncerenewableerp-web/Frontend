import type { NextRequest } from "next/server";
import { proxyToBackendAndSetAuthCookies } from "../../_lib/backend";

export async function POST(request: NextRequest) {
  return proxyToBackendAndSetAuthCookies(request, "/api/auth/signup");
}
