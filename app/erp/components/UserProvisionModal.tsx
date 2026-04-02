"use client";

import { useMemo, useState } from "react";
import type { RoleDefinition, User } from "../types";
import { apiUserChangePassword, apiUserCreate, apiUserResetPassword } from "../api";
import { getPasswordStrength } from "../utils";

function normalizeRoleId(roleId: string) {
  return String(roleId || "").trim().toUpperCase();
}

function generatePassword(length: number = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function UserProvisionModal({
  mode,
  roles,
  user,
  allowReset = false,
  onClose,
  onDone,
}: {
  mode: "create" | "password";
  roles: RoleDefinition[];
  user?: User;
  allowReset?: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const selectableRoles = useMemo(() => {
    const internal = roles.filter((r) => r.id !== "CUSTOMER");
    return internal.length ? internal : roles;
  }, [roles]);

  const targetRole = useMemo(() => normalizeRoleId(user?.role || ""), [user?.role]);
  const isCustomerTarget = targetRole === "CUSTOMER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState(() => {
    const preferred =
      selectableRoles.find((r) => r.id === "ENGINEER")?.id ||
      selectableRoles.find((r) => r.id === "SALES")?.id ||
      selectableRoles[0]?.id ||
      "ENGINEER";
    return normalizeRoleId(preferred);
  });
  const [password, setPassword] = useState(() => generatePassword(10));
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const pw = getPasswordStrength(password);

  const title =
    mode === "create"
      ? "Create Internal User"
      : `Set Password — ${user?.name || "User"}`;

  const handleSubmit = async () => {
    setError("");
    setSuccessMsg("");

    if (mode === "create") {
      const nameNorm = name.trim();
      const emailNorm = email.trim().toLowerCase();
      const phoneNorm = phone.trim();
      const roleNorm = normalizeRoleId(roleId);

      if (!nameNorm) return setError("Name is required");
      if (!emailNorm.includes("@")) return setError("Valid email is required");
      if (!phoneNorm) return setError("Phone is required");
      if (password.length < 6) return setError("Password must be at least 6 characters");
      if (!roleNorm) return setError("Role is required");

      setLoading(true);
      try {
        await apiUserCreate({
          name: nameNorm,
          email: emailNorm,
          phone: phoneNorm,
          password,
          role: roleNorm,
        });
        setSuccessMsg("User created. Share the username + password with the user.");
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create user");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!user?.id) return setError("User not found");
    if (password.length < 6) return setError("New password must be at least 6 characters");

    setLoading(true);
    try {
      if (isCustomerTarget) {
        if (!oldPassword.trim()) return setError("Old password is required");
        await apiUserChangePassword(user.id, oldPassword, password);
        setSuccessMsg("Password updated.");
      } else {
        if (!allowReset) {
          setError("Only Super Admin can reset password for internal users.");
          return;
        }
        await apiUserResetPassword(user.id, password);
        setSuccessMsg("Password reset.");
      }
      onDone();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : isCustomerTarget
            ? "Failed to update password"
            : "Failed to reset password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ marginBottom: 12, fontSize: 12, color: "var(--green)" }}>
              {successMsg}
            </div>
          )}

          {mode === "create" && (
            <>
              <div className="form-section">User</div>
              <div className="form-grid" style={{ marginBottom: 18 }}>
                <div className="form-group full">
                  <label className="form-label">Full name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Username (Email) *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. engineer@sunce.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. +919999988888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                  >
                    {selectableRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label} ({r.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-section">Password</div>
          <div className="form-grid">
            {mode === "password" && isCustomerTarget && (
              <div className="form-group full">
                <label className="form-label">Old password *</label>
                <input
                  className="form-input"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password"
                />
              </div>
            )}
            <div className="form-group full">
              <label className="form-label">
                {mode === "create" ? "Temporary password *" : "New password *"}
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ flex: 1, fontFamily: "var(--mono)" }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPassword(generatePassword(10))}
                >
                  Generate
                </button>
                {mode === "create" && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      const userNorm = email.trim();
                      const text = `Username: ${userNorm}\nPassword: ${password}`;
                      if (navigator?.clipboard?.writeText) {
                        void navigator.clipboard.writeText(text);
                      }
                    }}
                    disabled={!email.trim() || !password.trim()}
                    title="Copy username + password"
                  >
                    Copy
                  </button>
                )}
              </div>
              {pw.label && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)" }}>
                  Strength: <span style={{ color: pw.color, fontWeight: 700 }}>{pw.label}</span>
                </div>
              )}
              {mode === "password" && !isCustomerTarget && !allowReset ? (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
                  Internal user passwords can only be reset by Super Admin.
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          {mode === "password" && !isCustomerTarget ? (
            <button
              className="btn btn-danger"
              onClick={() => {
                if (!allowReset) {
                  setError("Only Super Admin can reset password for internal users.");
                  return;
                }
                if (password.length < 6) {
                  setError("New password must be at least 6 characters");
                  return;
                }
                const ok = confirm(
                  "Reset password without old password? This will immediately invalidate the user's current password.",
                );
                if (!ok) return;
                void handleSubmit();
              }}
              disabled={loading || !allowReset}
              title="Super Admin reset (no old password)"
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>
          ) : (
            <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create User" : "Update Password"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
