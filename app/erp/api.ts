"use client";

import type {
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

const STORAGE_KEY = "sunce_erp_auth_v1";

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
    return { user: parsed.user, tokens: parsed.tokens };
  } catch {
    return null;
  }
}

function writeAuthStorage(user: User, tokens: Tokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAuth() {
  return readAuthStorage();
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
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const env = await parseJsonEnvelope<{ accessToken: string; refreshToken: string }>(res);
  if (!env.success) return null;
  return { accessToken: env.data.accessToken, refreshToken: env.data.refreshToken };
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { auth?: Tokens | null },
): Promise<ApiEnvelope<T>> {
  const auth = init?.auth ?? readAuthStorage()?.tokens ?? null;
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);

  const res = await fetch(path, { ...init, headers });
  if (res.status !== 401 || !auth?.refreshToken) return parseJsonEnvelope<T>(res);

  const newTokens = await refreshToken(auth.refreshToken);
  if (!newTokens) return parseJsonEnvelope<T>(res);

  const stored = readAuthStorage();
  if (stored) writeAuthStorage(stored.user, newTokens);

  const retryHeaders = new Headers(headers);
  retryHeaders.set("Authorization", `Bearer ${newTokens.accessToken}`);
  const retryRes = await fetch(path, { ...init, headers: retryHeaders });
  return parseJsonEnvelope<T>(retryRes);
}

type BackendRole = {
  _id: string;
  name: string;
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
  customer?: { name?: string; company?: string };
  inverter?: {
    make?: string;
    model?: string;
    serialNo?: string;
    capacity?: string;
    warrantyEnd?: string | Date;
  };
  issue?: { description?: string; priority?: string; errorCode?: string };
  status?: TicketStatus;
  assignedTo?: Array<{ name?: string }> | { name?: string };
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
    name,
    label: ui.label,
    color: ui.color,
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

function toTicket(t: BackendTicket): Ticket {
  const assignedEngineer =
    (Array.isArray(t?.assignedTo) ? t.assignedTo[0]?.name : undefined) ||
    (!Array.isArray(t?.assignedTo) && typeof t?.assignedTo === "object"
      ? t.assignedTo?.name
      : undefined) ||
    "-";

  return {
    id: String(t?._id || t?.id || ""),
    ticketId: String(t?.ticketId || ""),
    customer: String(t?.customer?.company || t?.customer?.name || "—"),
    inverterMake: String(t?.inverter?.make || t?.inverterMake || "—"),
    inverterModel: String(t?.inverter?.model || t?.inverterModel || "—"),
    capacity: String(t?.inverter?.capacity || t?.capacity || "—"),
    serialNumber: String(t?.inverter?.serialNo || t?.serialNumber || "—"),
    faultDescription: String(t?.issue?.description || t?.faultDescription || "—"),
    errorCode: String(t?.issue?.errorCode || t?.errorCode || ""),
    priority: toPriority(t?.issue?.priority || t?.priority),
    status: (t?.status || "CREATED") as TicketStatus,
    warrantyStatus: isInWarranty(t?.inverter?.warrantyEnd) || Boolean(t?.warrantyStatus),
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

export type TicketCreateInput = {
  customer: string;
  inverterMake?: string;
  inverterModel: string;
  capacity?: string;
  serialNumber?: string;
  faultDescription: string;
  errorCode?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  warrantyStatus?: boolean;
};

export async function apiCreateTicket(input: TicketCreateInput): Promise<Ticket> {
  const payload = {
    ticketId: `SR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    customer: { company: input.customer, name: input.customer },
    inverter: {
      make: input.inverterMake,
      model: input.inverterModel,
      serialNo: input.serialNumber,
      capacity: input.capacity,
    },
    issue: {
      description: input.faultDescription,
      priority: input.priority,
      errorCode: input.errorCode,
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

export async function apiUsersList(): Promise<User[]> {
  const env = await apiFetch<{ users: BackendUser[]; pagination: Json }>("/api/users", {
    method: "GET",
  });
  if (!env.success) throw new Error(env.message || "Failed to fetch users");
  return env.data.users.map(toUser);
}
