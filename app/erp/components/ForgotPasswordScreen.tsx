"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuSunMedium } from "react-icons/lu";
import { apiForgotPassword } from "../api";
import Link from "next/link";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await apiForgotPassword(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reset email");
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

        <div className="auth-title">Forgot password</div>
        <div className="auth-sub">We’ll email you a reset link (Customer accounts only)</div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) void handleSubmit();
          }}
        >
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            value={email}
            type="text"
            inputMode="email"
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setSent(false);
            }}
            placeholder="Enter your email"
            aria-invalid={!!error}
          />

          {sent ? (
            <div style={{ marginTop: -16, marginBottom: 14, fontSize: 12, color: "var(--green)" }}>
              If an account exists for this email, a reset link has been sent.
            </div>
          ) : null}

          {error ? (
            <div className="form-error" style={{ marginTop: -16, marginBottom: 14 }}>
              {error}
            </div>
          ) : null}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-switch">
          Remembered it?{" "}
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
