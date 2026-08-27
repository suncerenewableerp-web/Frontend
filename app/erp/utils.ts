import { ALL_MODULES } from "./constants";
import type { ModulePermission, Role, RoleDefinition } from "./types";

// "SUPER ADMIN" / "super-admin" / "Super_Admin" all normalize to SUPER_ADMIN.
export const normalizeRoleName = (role: Role | undefined | null): string =>
  String(role || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

// The admin tier: privileges reserved for Admin and Super Admin. Kept separate from
// `canAccess` because these are role-tier checks, not per-module RBAC permissions.
export const isAdminTierRole = (role: Role | undefined | null): boolean => {
  const norm = normalizeRoleName(role);
  return norm === "ADMIN" || norm === "SUPER_ADMIN";
};

export const canAccess = (
  roles: RoleDefinition[],
  userRole: Role,
  module: string,
  action: keyof ModulePermission = "view",
): boolean => {
  const roleNorm = String(userRole || "").toUpperCase();
  if (roleNorm === "ADMIN") return true;
  if (roleNorm === "SALES" && module === "tickets" && action !== "delete") return true;
  if (roleNorm === "SALES" && module === "logistics" && action !== "delete") return true;
  if (roleNorm === "SALES" && module === "jobcard" && action === "view") return true;
  const roleDef = roles.find((r) => r.id === userRole);
  if (!roleDef) return false;
  return roleDef.permissions[module]?.[action] ?? false;
};

export const getNavItems = (roles: RoleDefinition[], userRole: Role) => {
  return ALL_MODULES.filter((m) => canAccess(roles, userRole, m.id, "view"));
};

export function formatTicketStatusLabel(status: string): string {
  const raw = String(status || "").trim().toUpperCase();
  if (!raw) return "";
  // The UNDER_REPAIRED status covers every ticket in the workshop, which the Tickets
  // list and the dashboard counters both call "Under Progress". "Under Repair" is the
  // narrower sub-tab inside it (tickets whose engineer has not finalised the job card
  // as REPAIRABLE / SCRAP yet), so labelling the whole status that way overstated the
  // Under Repair count wherever a raw status was rendered.
  if (raw === "UNDER_REPAIRED") return "UNDER PROGRESS";
  // Synthetic bucket the dashboard reports for on-site (offline booking) tickets under
  // repair. They share the UNDER_REPAIRED status but are counted and listed separately,
  // under the same name the Tickets list gives their tab.
  if (raw === "ONSITE_REPAIR") return "ON-SITE REPAIRING";
  return raw.replace(/_/g, " ");
}

export function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pwd) return { score: 0, label: "", color: "var(--border2)" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#c0392b", "#d97706", "#2563eb", "#16a34a"];
  return {
    score,
    label: labels[score] || "Weak",
    color: colors[score] || "#c0392b",
  };
}
