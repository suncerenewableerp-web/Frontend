"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuSunMedium } from "react-icons/lu";
import { apiResetPassword } from "../api";
import { getPasswordStrength } from "../utils";
import Link from "next/link";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = String(sp.get("token") || "").trim();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pw = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Reset token is missing");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      if (password !== confirm) throw new Error("Passwords do not match");
      await apiResetPassword(token, password);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Link href="/" className="auth-logo" aria-label="Go to home">
          <div className="auth-logo-icon" aria-hidden>
            <LuSunMedium />
          </div>
          <div>
            <div className="auth-logo-text">Sunce ERP</div>
            <div className="auth-logo-sub">Renewables · Service Platform</div>
          </div>
        </Link>
        <div className="auth-divider" />

        <div className="auth-title">Reset password</div>
        <div className="auth-sub">Set a new password for your customer account</div>

        {done ? (
          <>
            <div style={{ fontSize: 12, color: "var(--green)", marginBottom: 14 }}>
              Password reset successfully. You can sign in now.
            </div>
            <button
              className="btn-primary"
              type="button"
              onClick={() => router.push("/login")}
            >
              Go to Sign In →
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) void handleSubmit();
            }}
          >
            <label className="auth-label">New password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter new password"
              aria-invalid={!!error}
            />
            {pw.label ? (
              <div style={{ marginTop: -16, marginBottom: 14, fontSize: 12, color: "var(--text3)" }}>
                Strength: <span style={{ color: pw.color, fontWeight: 700 }}>{pw.label}</span>
              </div>
            ) : (
              <div style={{ marginTop: -16, marginBottom: 14 }} />
            )}

            <label className="auth-label">Confirm password</label>
            <input
              className="auth-input"
              type="password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
              placeholder="Re-enter new password"
              aria-invalid={!!error}
            />

            {error ? (
              <div className="form-error" style={{ marginTop: -16, marginBottom: 14 }}>
                {error}
              </div>
            ) : null}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="auth-switch">
          <a
            href="/login"
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              router.push("/login");
            }}
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
