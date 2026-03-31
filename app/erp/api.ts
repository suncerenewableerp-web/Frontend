"use client";

import type {
  JobCard,
  JobCardFinalTestingActivity,
  JobCardServiceJob,
  ModulePermission,
  RoleDefinition,
  Ticket,
  TicketStatus,
  User,
} from "./types";

type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

type ApiOk<T> = { success: true; data: T };
type ApiErr = { success: false; message?: string; errors?: unknown };
type ApiEnvelope<T> = ApiOk<T> | ApiErr;

export type Tokens = { accessToken: string; refreshToken: string };
export type SlaSettings = { criticalHours: number; highHours: number; normalHours: number };
export type ReportsData = {
  totalTickets: number;
  closedTickets: number;
  breachedSLA: number;
  priorityBreakdown: Array<{ priority: string; count: number }>;
  monthlyTicketVolume: Array<{ month: string; count: number }>;
  warranty: { inWarranty: number; outOfWarranty: number };
  slaBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  avgResolutionHours: number | null;
};

const STORAGE_KEY = "sunce_erp_auth_v1";
const DEFAULT_TIMEOUT_MS = 25_000;
let memoryAuth: { user: User; tokens: Tokens } | null = null;

function isAbortError(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === "object" &&
      "name" in err &&
      (err as { name?: unknown }).name === "AbortError",
  );
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  // Older browsers (or very old embedded webviews) may not have AbortController.
  // In that case, we fall back to a normal fetch (no timeout).
  if (typeof AbortController === "undefined" || init.signal) {
    return fetch(input, init);
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export class ApiRequestError extends Error {
  errors?: unknown;
  constructor(message: string, errors?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.errors = errors;
  }
}

function readAuthStorage():
  | { user: User; tokens: Tokens }
  | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: User; tokens?: Tokens };
    if (!parsed?.user || !parsed?.tokens?.accessToken || !parsed?.tokens?.refreshToken) {
      return null;
    }
    memoryAuth = { user: parsed.user, tokens: parsed.tokens };
    return memoryAuth;
  } catch {
    return null;
  }
}

function writeAuthStorage(user: User, tokens: Tokens) {
  if (typeof window === "undefined") return;
  memoryAuth = { user, tokens };
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  memoryAuth = null;
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAuth() {
  return memoryAuth || readAuthStorage();
}

async function parseJsonEnvelope<T>(res: Response): Promise<ApiEnvelope<T>> {
  const text = await res.text();
  if (!text) return { success: false, message: "Empty response" };
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return { success: false, message: text };
  }
}

async function refreshToken(refreshToken: string): Promise<Tokens | null> {
  let res: Response;
  try {
    res = await fetchWithTimeout("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return null;
  }
  const env = await parseJsonEnvelope<{ accessToken: string; refreshToken: string }>(res);
  if (!env.success) return null;
  return { accessToken: env.data.accessToken, refreshToken: env.data.refreshToken };
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: Tokens | null },
): Promise<ApiEnvelope<T>> {
  const auth =
    init && "auth" in init
      ? (init.auth ?? null)
      : memoryAuth?.tokens ?? readAuthStorage()?.tokens ?? null;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init?.body) {
    const body = init.body;
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const isUrlEncoded =
      typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
    if (!isFormData && !isUrlEncoded) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (auth?.accessToken) {
    const bearer = `Bearer ${auth.accessToken}`;
    headers.set("Authorization", bearer);
    // Some reverse proxies strip `Authorization` by default; keep a fallback header for our Next proxy.
    headers.set("X-Authorization", bearer);
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(path, { ...init, headers });
  } catch (err) {
    return {
      success: false,
      message: isAbortError(err)
        ? "Request timed out. Please check your internet connection and try again."
        : err instanceof Error
          ? err.message
          : "Network request failed",
    };
  }
  if (res.status !== 401 || !auth?.refreshToken) return parseJsonEnvelope<T>(res);

  const newTokens = await refreshToken(auth.refreshToken);
  if (!newTokens) return parseJsonEnvelope<T>(res);

  const stored = readAuthStorage();
  if (stored) writeAuthStorage(stored.user, newTokens);
  else if (memoryAuth) memoryAuth = { user: memoryAuth.user, tokens: newTokens };

  const retryHeaders = new Headers(headers);
  retryHeaders.set("Authorization", `Bearer ${newTokens.accessToken}`);
  retryHeaders.set("X-Authorization", `Bearer ${newTokens.accessToken}`);
  try {
    const retryRes = await fetchWithTimeout(path, { ...init, headers: retryHeaders });
    return parseJsonEnvelope<T>(retryRes);
  } catch (err) {
    return {
      success: false,
      message: isAbortError(err)
        ? "Request timed out. Please check your internet connection and try again."
        : err instanceof Error
          ? err.message
          : "Network request failed",
    };
  }
}

type BackendRole = {
  _id: string;
  name: string;
  label?: string;
  color?: string;
  description?: string;
  permissions: Record<string, ModulePermission>;
  isSystem?: boolean;
};

type BackendUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string | { name?: string } | BackendRole;
};

type BackendTicket = {
  _id?: string;
  id?: string;
  ticketId?: string;
  customer?: { name?: string; company?: string; phone?: string; address?: string };
  inverter?: {
    make?: string;
    model?: string;
    serialNo?: string;
    capacity?: string;
    warrantyEnd?: string | Date;
  };
  issue?: { description?: string; priority?: string; errorCode?: string };
  status?: string;
  assignedTo?: Array<{ name?: string }> | { name?: string };
  logistics?:
    | string
    | {
        pickupDetails?: { scheduledDate?: string | Date };
        courierDetails?: { courierName?: string; lrNumber?: string };
      };
  createdAt?: string | Date;
  slaStatus?: string;
  warrantyStatus?: boolean;
  inverterMake?: string;
  inverterModel?: string;
  capacity?: string;
  serialNumber?: string;
  faultDescription?: string;
  errorCode?: string;
  priority?: string;
};

export type BackendLogistics = {
  _id?: string;
  id?: string;
  ticket?: string;
  type?: string;
  status?: string;
  pickupDetails?: {
    scheduledDate?: string | Date;
    actualPickupDate?: string | Date;
    pickupBy?: string;
    pickupLocation?: string;
  };
  courierDetails?: {
    courierName?: string;
    trackingId?: string;
    lrNumber?: string;
    awbNumber?: string;
  };
  documents?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type BackendJobCardServiceJob = {
  sn?: number;
  jobName?: string;
  specification?: string;
  componentsUsed?: unknown;
  qty?: number;
  reason?: string;
  date?: string | Date;
  doneBy?: string;
};

type BackendJobCardFinalTestingActivity = {
  sr?: number;
  activity?: string;
  result?: string;
  remarks?: string;
};

type BackendJobCard = {
  _id?: string;
  id?: string;
  ticket?: string | { _id?: string; id?: string };
  diagnosis?: string;
  repairActionsByName?: string;
  repairNotes?: string;
  testResults?: string;
  jobNo?: string;
  item?: string;
  itemAndSiteDetails?: string;
  customerName?: string;
  inDate?: string | Date;
  outDate?: string | Date;
  currentStatus?: string;
  remarks?: string;
  checkedByName?: string;
  checkedByDate?: string | Date;
  serviceJobs?: BackendJobCardServiceJob[];
  finalTestingActivities?: BackendJobCardFinalTestingActivity[];
  finalStatus?: string;
  finalRemarks?: string;
  finalCheckedByName?: string;
  finalCheckedByDate?: string | Date;
};

const ROLE_UI: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Administrator", color: "#8B4513" },
  SALES: { label: "Sales / BD", color: "#B8860B" },
  ENGINEER: { label: "Service Engineer", color: "#4682B4" },
  CUSTOMER: { label: "Customer", color: "#2E8B57" },
};

function toRoleDefinition(role: BackendRole): RoleDefinition {
  const name = String(role?.name || "").toUpperCase();
  const ui = ROLE_UI[name] || { label: name || "ROLE", color: "#8B4513" };
  return {
    id: name,
    dbId: String(role?._id || ""),
    name,
    label: String(role?.label || ui.label),
    color: String(role?.color || ui.color),
    permissions: role?.permissions || ({} as Record<string, ModulePermission>),
    isSystem: role?.isSystem ?? true,
  };
}

function toUser(user: BackendUser): User {
  const roleName =
    typeof user?.role === "string"
      ? user.role
      : String(user?.role?.name || "CUSTOMER");
  return {
    id: String(user?._id || user?.id || ""),
    name: String(user?.name || ""),
    email: String(user?.email || ""),
    role: roleName.toUpperCase(),
  };
}

function toSlaStatus(slaStatus: unknown): "MET" | "BREACHED" | "AT_RISK" {
  const s = String(slaStatus || "").toUpperCase();
  if (s === "BREACHED") return "BREACHED";
  if (s === "WARNING" || s === "AT_RISK") return "AT_RISK";
  return "MET";
}

function toPriority(p: unknown): "LOW" | "MEDIUM" | "HIGH" {
  const s = String(p || "").toUpperCase();
  if (s === "LOW") return "LOW";
  if (s === "MEDIUM") return "MEDIUM";
  return "HIGH";
}

function isInWarranty(warrantyEnd?: string | Date | null) {
  if (!warrantyEnd) return false;
  const end = new Date(warrantyEnd).getTime();
  if (Number.isNaN(end)) return false;
  return Date.now() <= end;
}

function toDateInput(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  const t = d.getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function toYesNo(v: unknown): "YES" | "NO" | "" {
  const s = String(v || "").toUpperCase();
  if (s === "YES") return "YES";
  if (s === "NO") return "NO";
  return "";
}

function toServiceJob(j: BackendJobCardServiceJob, idx: number): JobCardServiceJob {
  const componentsUsed = Array.isArray(j?.componentsUsed)
    ? (j.componentsUsed as unknown[]).map((x) => String(x || "").trim()).filter(Boolean)
    : undefined;
  return {
    sn: typeof j?.sn === "number" ? j.sn : idx + 1,
    jobName: String(j?.jobName || ""),
    specification: String(j?.specification || ""),
    ...(componentsUsed ? { componentsUsed } : {}),
    qty: typeof j?.qty === "number" ? j.qty : "",
    reason: String(j?.reason || ""),
    date: toDateInput(j?.date),
    doneBy: String(j?.doneBy || ""),
  };
}

function toFinalTestingActivity(
  a: BackendJobCardFinalTestingActivity,
  idx: number,
): JobCardFinalTestingActivity {
  return {
    sr: typeof a?.sr === "number" ? a.sr : idx + 1,
    activity: String(a?.activity || ""),
    result: toYesNo(a?.result),
    remarks: String(a?.remarks || ""),
  };
}

function toJobCard(jc: BackendJobCard, ticketId: string): JobCard {
  return {
    id: String(jc?._id || jc?.id || ""),
    ticketId,
    diagnosis: String(jc?.diagnosis || ""),
    repairActionsByName: String(jc?.repairActionsByName || ""),
    repairNotes: String(jc?.repairNotes || ""),
    testResults: String(jc?.testResults || ""),
    jobNo: String(jc?.jobNo || ""),
    item: String(jc?.item || ""),
    itemAndSiteDetails: String(jc?.itemAndSiteDetails || ""),
    customerName: String(jc?.customerName || ""),
    inDate: toDateInput(jc?.inDate),
    outDate: toDateInput(jc?.outDate),
    currentStatus: String(jc?.currentStatus || ""),
    remarks: String(jc?.remarks || ""),
    checkedByName: String(jc?.checkedByName || ""),
    checkedByDate: toDateInput(jc?.checkedByDate),
    serviceJobs: (jc?.serviceJobs || []).map(toServiceJob),
    finalTestingActivities: (jc?.finalTestingActivities || []).map(toFinalTestingActivity),
    finalStatus: String(jc?.finalStatus || ""),
    finalRemarks: String(jc?.finalRemarks || ""),
    finalCheckedByName: String(jc?.finalCheckedByName || ""),
    finalCheckedByDate: toDateInput(jc?.finalCheckedByDate),
  };
}

function toTicket(t: BackendTicket): Ticket {
  const normalizeTicketStatus = (raw: unknown): TicketStatus => {
    const s = String(raw || "CREATED").toUpperCase();
    if (s === "CREATED") return "CREATED";
    if (s === "PICKUP_SCHEDULED") return "PICKUP_SCHEDULED";
    if (s === "IN_TRANSIT") return "IN_TRANSIT";
    if (s === "UNDER_REPAIRED") return "UNDER_REPAIRED";
    if (s === "DISPATCHED") return "DISPATCHED";
    if (s === "CLOSED") return "CLOSED";

    // Legacy backend statuses (collapse into the single "Under repaired" stage)
    if (["RECEIVED", "DIAGNOSIS", "REPAIR", "TESTING"].includes(s)) return "UNDER_REPAIRED";

    return "CREATED";
  };

  const assignedEngineer =
    (Array.isArray(t?.assignedTo) ? t.assignedTo[0]?.name : undefined) ||
    (!Array.isArray(t?.assignedTo) && typeof t?.assignedTo === "object"
      ? t.assignedTo?.name
      : undefined) ||
    "-";

  const pickupDate =
    t?.logistics && typeof t.logistics === "object"
      ? toDateInput(t.logistics?.pickupDetails?.scheduledDate)
      : "";
  const courierName =
    t?.logistics && typeof t.logistics === "object"
      ? String(t.logistics?.courierDetails?.courierName || "")
      : "";
  const lrNumber =
    t?.logistics && typeof t.logistics === "object"
      ? String(t.logistics?.courierDetails?.lrNumber || "")
      : "";

  const customerName = t?.customer?.name ? String(t.customer.name).trim() : "";
  const customerCompany = t?.customer?.company ? String(t.customer.company).trim() : "";
  const customerDisplay =
    customerName && customerCompany
      ? `${customerName} / ${customerCompany}`
      : customerName || customerCompany || "—";

  return {
    id: String(t?._id || t?.id || ""),
    ticketId: String(t?.ticketId || ""),
    customer: customerDisplay,
    customerName,
    customerCompany,
    customerPhone: t?.customer?.phone ? String(t.customer.phone) : "",
    customerAddress: t?.customer?.address ? String(t.customer.address) : "",
    pickupDate: pickupDate || undefined,
    courierName: courierName || undefined,
    lrNumber: lrNumber || undefined,
    inverterMake: String(t?.inverter?.make || t?.inverterMake || "—"),
    inverterModel: String(t?.inverter?.model || t?.inverterModel || "—"),
    capacity: String(t?.inverter?.capacity || t?.capacity || "—"),
    serialNumber: String(t?.inverter?.serialNo || t?.serialNumber || "—"),
    faultDescription: String(t?.issue?.description || t?.faultDescription || "—"),
    errorCode: String(t?.issue?.errorCode || t?.errorCode || ""),
    priority: toPriority(t?.issue?.priority || t?.priority),
    status: normalizeTicketStatus(t?.status),
    warrantyStatus: isInWarranty(t?.inverter?.warrantyEnd) || Boolean(t?.warrantyStatus),
    warrantyEndDate: toDateInput(t?.inverter?.warrantyEnd),
    assignedEngineer: String(assignedEngineer),
    createdAt: String(t?.createdAt ? String(t.createdAt).slice(0, 10) : ""),
    slaStatus: toSlaStatus(t?.slaStatus),
  };
}

export async function apiRolesPublic(): Promise<RoleDefinition[]> {
  const env = await apiFetch<BackendRole[]>("/api/roles/public", { method: "GET" });
  if (!env.success) throw new Error(env.message || "Failed to fetch roles");
  return env.data.map(toRoleDefinition);
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<{ user: User; roles?: RoleDefinition[]; tokens: Tokens }> {
  const env = await apiFetch<{
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
    role?: BackendRole;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Login failed", env.errors);
  }
  const user = toUser(env.data.user);
  const tokens = { accessToken: env.data.accessToken, refreshToken: env.data.refreshToken };
  writeAuthStorage(user, tokens);
  return { user, tokens };
}

export async function apiSignup(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  company?: string;
}): Promise<{ user: User; tokens: Tokens }> {
  const env = await apiFetch<{
    user: BackendUser;
    accessToken: string;
    refreshToken: string;
    role?: BackendRole;
  }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Signup failed", env.errors);
  }
  const user = toUser(env.data.user);
  const tokens = { accessToken: env.data.accessToken, refreshToken: env.data.refreshToken };
  writeAuthStorage(user, tokens);
  return { user, tokens };
}

export async function apiForgotPassword(email: string): Promise<void> {
  const env = await apiFetch<{ message?: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Failed to send reset email", env.errors);
  }
}

export async function apiResetPassword(token: string, password: string): Promise<void> {
  const env = await apiFetch<{ message?: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Failed to reset password", env.errors);
  }
}

export async function apiTicketsList(params?: {
  status?: string;
  priority?: string;
  slaStatus?: string;
  search?: string;
}): Promise<Ticket[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.priority) qs.set("priority", params.priority);
  if (params?.slaStatus) qs.set("slaStatus", params.slaStatus);
  if (params?.search) qs.set("search", params.search);

  const env = await apiFetch<{ tickets: BackendTicket[]; pagination: Json }>(
    `/api/tickets${qs.toString() ? `?${qs.toString()}` : ""}`,
    { method: "GET" },
  );
  if (!env.success) throw new Error(env.message || "Failed to fetch tickets");
  return env.data.tickets.map(toTicket);
}

export async function apiTicketGet(id: string): Promise<Ticket> {
  const env = await apiFetch<BackendTicket>(`/api/tickets/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  if (!env.success) throw new Error(env.message || "Failed to fetch ticket");
  return toTicket(env.data);
}

export type TicketCreateInput = {
  // Client requirement: only these two are mandatory
  capacity: string;
  faultDescription: string;
  customerName?: string;
  customerCompany?: string;
  inverterLocation?: string;
  inverterMake?: string;
  inverterModel?: string;
  serialNumber?: string;
  errorCode?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  warrantyStatus?: boolean;
  warrantyEndDate?: string; // YYYY-MM-DD (only when under warranty)
};

export async function apiCreateTicket(input: TicketCreateInput): Promise<Ticket> {
  const customerName = String(input.customerName || "").trim();
  const customerCompany = String(input.customerCompany || "").trim();
  const inverterLocation = String(input.inverterLocation || "").trim();
  const inverterMake = String(input.inverterMake || "").trim();
  const inverterModel = String(input.inverterModel || "").trim();
  const capacity = String(input.capacity || "").trim();
  const serialNumber = String(input.serialNumber || "").trim();
  const faultDescription = String(input.faultDescription || "").trim();
  const errorCode = String(input.errorCode || "").trim();

  let warrantyEnd: string | undefined;
  if (input.warrantyEndDate) {
    const d = new Date(`${input.warrantyEndDate}T00:00:00.000Z`);
    const t = d.getTime();
    if (!Number.isNaN(t)) warrantyEnd = new Date(t).toISOString();
  } else if (typeof input.warrantyStatus === "boolean" && input.warrantyStatus) {
    // Fallback (if date not provided): assume 6 months coverage.
    warrantyEnd = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
  }

  const payload = {
    ticketId: `SR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    ...(customerName || customerCompany || inverterLocation
      ? {
          customer: {
            ...(customerName ? { name: customerName } : {}),
            ...(customerCompany ? { company: customerCompany } : {}),
            ...(inverterLocation ? { address: inverterLocation } : {}),
          },
        }
      : {}),
    inverter: {
      ...(inverterMake ? { make: inverterMake } : {}),
      ...(inverterModel ? { model: inverterModel } : {}),
      ...(serialNumber ? { serialNo: serialNumber } : {}),
      ...(warrantyEnd ? { warrantyEnd } : {}),
      capacity,
    },
    issue: {
      description: faultDescription,
      ...(input.priority ? { priority: input.priority } : {}),
      ...(errorCode ? { errorCode } : {}),
    },
  };

  const env = await apiFetch<BackendTicket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!env.success) throw new Error(env.message || "Failed to create ticket");
  return toTicket(env.data);
}

export async function apiUpdateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  const env = await apiFetch<BackendTicket>(`/api/tickets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  if (!env.success) throw new Error(env.message || "Failed to update ticket");
  return toTicket(env.data);
}

export type TicketEditInput = {
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  customerAddress: string;
  inverterMake: string;
  inverterModel: string;
  capacity: string;
  serialNumber: string;
  faultDescription: string;
  errorCode: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  warrantyStatus: boolean;
  warrantyEndDate?: string; // YYYY-MM-DD (only when under warranty)
};

export async function apiUpdateTicketDetails(
  id: string,
  input: TicketEditInput,
): Promise<Ticket> {
  let warrantyEnd: string | null | undefined = undefined;
  if (!input.warrantyStatus) {
    warrantyEnd = null;
  } else if (input.warrantyEndDate) {
    const d = new Date(`${input.warrantyEndDate}T00:00:00.000Z`);
    const t = d.getTime();
    if (!Number.isNaN(t)) warrantyEnd = new Date(t).toISOString();
  }

  const payload = {
    customer: {
      name: String(input.customerName || "").trim(),
      company: String(input.customerCompany || "").trim(),
      phone: String(input.customerPhone || "").trim(),
      address: String(input.customerAddress || "").trim(),
    },
    inverter: {
      make: String(input.inverterMake || "").trim(),
      model: String(input.inverterModel || "").trim(),
      serialNo: String(input.serialNumber || "").trim(),
      capacity: String(input.capacity || "").trim(),
      ...(warrantyEnd !== undefined ? { warrantyEnd } : {}),
    },
    issue: {
      description: String(input.faultDescription || "").trim(),
      errorCode: String(input.errorCode || "").trim(),
      priority: input.priority,
    },
  };

  const env = await apiFetch<BackendTicket>(`/api/tickets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!env.success) throw new Error(env.message || "Failed to update ticket");
  return toTicket(env.data);
}

export async function apiUpdateTicketFaultDescription(
  id: string,
  faultDescription: string,
): Promise<Ticket> {
  const payload = {
    issue: { description: String(faultDescription || "").trim() },
  };
  const env = await apiFetch<BackendTicket>(`/api/tickets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!env.success) throw new Error(env.message || "Failed to update ticket");
  return toTicket(env.data);
}

export async function apiUsersList(): Promise<User[]> {
  const env = await apiFetch<{ users: BackendUser[]; pagination: Json }>("/api/users", {
    method: "GET",
  });
  if (!env.success) throw new Error(env.message || "Failed to fetch users");
  return env.data.users.map(toUser);
}

export async function apiUserCreate(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  company?: string;
}): Promise<User> {
  const env = await apiFetch<{ user: BackendUser }>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Failed to create user", env.errors);
  }
  return toUser(env.data.user);
}

export async function apiUserChangePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const env = await apiFetch<{ message?: string }>(`/api/users/${encodeURIComponent(userId)}/password`, {
    method: "PUT",
    body: JSON.stringify({ oldPassword, password: newPassword }),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Failed to update password", env.errors);
  }
}

export async function apiUserResetPassword(userId: string, newPassword: string): Promise<void> {
  const env = await apiFetch<{ message?: string }>(`/api/users/${encodeURIComponent(userId)}/password/reset`, {
    method: "POST",
    body: JSON.stringify({ password: newPassword }),
  });
  if (!env.success) {
    throw new ApiRequestError(env.message || "Failed to reset password", env.errors);
  }
}

export async function apiSlaSettingsGet(): Promise<SlaSettings> {
  const env = await apiFetch<SlaSettings>("/api/settings/sla", { method: "GET" });
  if (!env.success) throw new Error(env.message || "Failed to fetch SLA settings");
  return env.data;
}

export async function apiSlaSettingsUpdate(input: SlaSettings): Promise<SlaSettings> {
  const env = await apiFetch<SlaSettings>("/api/settings/sla", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!env.success) throw new Error(env.message || "Failed to update SLA settings");
  return env.data;
}

export async function apiSchedulePickup(input: {
  ticketId: string;
  pickupDate: string; // YYYY-MM-DD
  courierName: string;
  lrNumber: string;
  pickupLocation: string;
}): Promise<void> {
  const payload = {
    ticketId: input.ticketId,
    pickupDate: `${input.pickupDate}T00:00:00.000Z`,
    courierName: input.courierName,
    lrNumber: input.lrNumber,
    pickupLocation: input.pickupLocation,
  };
  const env = await apiFetch<unknown>("/api/logistics/schedule-pickup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!env.success) throw new Error(env.message || "Failed to schedule pickup");
}

export async function apiScheduleDispatch(input: {
  ticketId: string;
  dispatchDate: string; // YYYY-MM-DD
  courierName: string;
  lrNumber: string;
  dispatchLocation: string;
}): Promise<void> {
  const payload = {
    ticketId: input.ticketId,
    dispatchDate: `${input.dispatchDate}T00:00:00.000Z`,
    courierName: input.courierName,
    lrNumber: input.lrNumber,
    dispatchLocation: input.dispatchLocation,
  };
  const env = await apiFetch<unknown>("/api/logistics/schedule-dispatch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!env.success) throw new Error(env.message || "Failed to schedule dispatch");
}

export async function apiTicketPickupDetailsGet(ticketId: string): Promise<{
  pickupDate: string; // YYYY-MM-DD or ""
  pickupLocation: string;
  documents: string[];
}> {
  const env = await apiFetch<{
    pickupDate: string | Date | null;
    pickupLocation: string;
    documents?: unknown;
  }>(
    `/api/tickets/${encodeURIComponent(ticketId)}/pickup-details`,
    { method: "GET" },
  );
  if (!env.success) throw new Error(env.message || "Failed to fetch pickup details");
  return {
    pickupDate: toDateInput(env.data?.pickupDate),
    pickupLocation: String(env.data?.pickupLocation || ""),
    documents: Array.isArray(env.data?.documents)
      ? (env.data.documents as unknown[]).map((x) => String(x || "")).filter(Boolean)
      : [],
  };
}

export async function apiTicketPickupDetailsSave(
  ticketId: string,
  input: { pickupDate: string; pickupLocation: string },
): Promise<void> {
  const payload = {
    pickupDate: `${input.pickupDate}T00:00:00.000Z`,
    pickupLocation: input.pickupLocation,
  };
  const env = await apiFetch<unknown>(
    `/api/tickets/${encodeURIComponent(ticketId)}/pickup-details`,
    { method: "POST", body: JSON.stringify(payload) },
  );
  if (!env.success) throw new Error(env.message || "Failed to save pickup details");
}

export async function apiTicketPickupDocumentUpload(
  ticketId: string,
  file: File,
): Promise<{ url: string; documents: string[] }> {
  const fd = new FormData();
  fd.append("file", file);
  const env = await apiFetch<{ url?: unknown; documents?: unknown }>(
    `/api/tickets/${encodeURIComponent(ticketId)}/pickup-documents`,
    { method: "POST", body: fd },
  );
  if (!env.success) throw new Error(env.message || "Failed to upload document");
  return {
    url: String(env.data?.url || ""),
    documents: Array.isArray(env.data?.documents)
      ? (env.data.documents as unknown[]).map((x) => String(x || "")).filter(Boolean)
      : [],
  };
}

export async function apiLogisticsByTicket(ticketId: string): Promise<BackendLogistics[]> {
  const env = await apiFetch<BackendLogistics[]>(
    `/api/logistics/ticket/${encodeURIComponent(ticketId)}`,
    { method: "GET" },
  );
  if (!env.success) throw new Error(env.message || "Failed to fetch logistics");
  return Array.isArray(env.data) ? env.data : [];
}

export async function apiReportsGet(params?: { months?: number }): Promise<ReportsData> {
  const qs = new URLSearchParams();
  if (params?.months) qs.set("months", String(params.months));
  const env = await apiFetch<ReportsData>(`/api/reports${qs.toString() ? `?${qs.toString()}` : ""}`, {
    method: "GET",
  });
  if (!env.success) throw new Error(env.message || "Failed to fetch reports");
  return env.data;
}

export async function apiRoleCreate(input: {
  name: string;
  label: string;
  color: string;
  permissions: Record<string, ModulePermission>;
  description?: string;
}): Promise<RoleDefinition> {
  const env = await apiFetch<BackendRole>("/api/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!env.success) throw new Error(env.message || "Failed to create role");
  return toRoleDefinition(env.data);
}

export async function apiRoleUpdate(
  dbId: string,
  input: Partial<{
    name: string;
    label: string;
    color: string;
    permissions: Record<string, ModulePermission>;
    description: string;
  }>,
): Promise<RoleDefinition> {
  const env = await apiFetch<BackendRole>(`/api/roles/${encodeURIComponent(dbId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!env.success) throw new Error(env.message || "Failed to update role");
  return toRoleDefinition(env.data);
}

export async function apiRoleDelete(dbId: string): Promise<void> {
  const env = await apiFetch<{ message?: string }>(`/api/roles/${encodeURIComponent(dbId)}`, {
    method: "DELETE",
  });
  if (!env.success) throw new Error(env.message || "Failed to delete role");
}

export type JobCardUpdateInput = Partial<{
  jobNo: string;
  item: string;
  itemAndSiteDetails: string;
  customerName: string;
  inDate: string;
  outDate: string;
  currentStatus: string;
  remarks: string;
  checkedByName: string;
  checkedByDate: string;
  serviceJobs: Array<{
    sn?: number;
    jobName?: string;
    specification?: string;
    componentsUsed?: string[];
    qty?: number | null;
    reason?: string;
    date?: string;
    doneBy?: string;
  }>;
  finalTestingActivities: Array<{
    sr?: number;
    activity?: string;
    result?: "YES" | "NO" | "";
    remarks?: string;
  }>;
  finalStatus: string;
  finalRemarks: string;
  finalCheckedByName: string;
  finalCheckedByDate: string;
  // Legacy fields (optional)
  diagnosis: string;
  repairActionsByName: string;
  repairNotes: string;
  testResults: string;
  warrantyGiven: number;
}>;

export async function apiTicketJobCardGet(ticketId: string): Promise<JobCard> {
  const env = await apiFetch<BackendJobCard>(`/api/tickets/${encodeURIComponent(ticketId)}/jobcard`, {
    method: "GET",
  });
  if (!env.success) throw new Error(env.message || "Failed to fetch job card");
  return toJobCard(env.data, ticketId);
}

export async function apiTicketJobCardUpdate(
  ticketId: string,
  input: JobCardUpdateInput,
): Promise<JobCard> {
  const env = await apiFetch<BackendJobCard>(`/api/tickets/${encodeURIComponent(ticketId)}/jobcard`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!env.success) throw new Error(env.message || "Failed to update job card");
  return toJobCard(env.data, ticketId);
}
