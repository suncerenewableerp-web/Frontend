import { ALL_MODULES } from "./constants";
import type { ModulePermission, Role, RoleDefinition } from "./types";

export const canAccess = (
  roles: RoleDefinition[],
  userRole: Role,
  module: string,
  action: keyof ModulePermission = "view",
): boolean => {
  const roleDef = roles.find((r) => r.id === userRole);
  if (!roleDef) return false;
  return roleDef.permissions[module]?.[action] ?? false;
};

export const getNavItems = (roles: RoleDefinition[], userRole: Role) => {
  return ALL_MODULES.filter((m) => canAccess(roles, userRole, m.id, "view"));
};

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

