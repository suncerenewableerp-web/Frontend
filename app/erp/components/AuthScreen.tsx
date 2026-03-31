"use client";

import { useState } from "react";
import type { RoleDefinition } from "../types";
import { LuSunMedium } from "react-icons/lu";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthScreen({
  onLogin,
  onGoSignup,
  roles,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoSignup: () => void;
  roles: RoleDefinition[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");
    onLogin(email, password)
      .catch((e) => setError(e instanceof Error ? e.message : "Login failed"))
      .finally(() => setLoading(false));
  };

  const DEMO_CREDS: Record<string, { email: string; password: string }> = {
    CUSTOMER: { email: "customer@example.com", password: "customer123" },
  };

  const roleLabelById = Object.fromEntries(roles.map((r) => [r.id, r.label]));

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Link href="/" className="auth-logo" aria-label="Go to home">
          <div className="auth-logo-icon" aria-hidden>
            <LuSunMedium />
          </div>
          <div>
            <div className="auth-logo-text">Sunce ERP</div>
            <div className="auth-logo-sub">
              Renewables · Service Platform
            </div>
          </div>
        </Link>
        <div className="auth-divider" />
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">
          Sign in to your service management portal
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleLogin();
          }}
        >
          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            value={email}
            type="text"
            inputMode="email"
            autoComplete="username"
            enterKeyHint="next"
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter your email address"
            aria-invalid={!!error}
          />

          <label className="auth-label">Password</label>
          <div className="input-row">
            <input
              className="auth-input has-action"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              enterKeyHint="done"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              aria-invalid={!!error}
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div
            style={{
              marginTop: 4,
              marginBottom: 12,
              display: "flex",
              justifyContent: "flex-end",
              fontSize: 12,
            }}
          >
            <a
              href="/forgot-password"
              className="auth-link"
              onClick={(e) => {
                e.preventDefault();
                router.push("/forgot-password");
              }}
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <div className="form-error" style={{ marginTop: -16, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="demo-users">
          <div className="demo-title">Demo Accounts</div>
          <div className="demo-chips">
            {Object.keys(DEMO_CREDS).map((roleId) => (
              <div
                key={roleId}
                className="demo-chip"
                onClick={() => {
                  setEmail(DEMO_CREDS[roleId].email);
                  setPassword(DEMO_CREDS[roleId].password);
                  setError("");
                }}
              >
                {roleLabelById[roleId] || roleId}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-switch">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="auth-link"
            onClick={() => onGoSignup()}
          >
            Create one here
          </a>
        </div>
      </div>
    </div>
  );
}
