"use client";

import { useState } from "react";
import { ROLE_DESCRIPTIONS } from "../constants";
import type { RoleDefinition, User } from "../types";
import { getPasswordStrength } from "../utils";
import { Badge } from "./Badges";
import { ApiRequestError } from "../api";
import { LuSunMedium } from "react-icons/lu";

export default function SignupScreen({
  roles,
  onCreateAccount,
  onFinish,
  onGoLogin,
}: {
  roles: RoleDefinition[];
  onCreateAccount: (input: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    company?: string;
  }) => Promise<User>;
  onFinish: (user: User) => void;
  onGoLogin: () => void;
}) {
  const CUSTOMER_ROLE_ID = "CUSTOMER";
  const [step, setStep] = useState<1 | 2>(2);
  const [selectedRole, setSelectedRole] = useState<string>(CUSTOMER_ROLE_ID);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const rolesReady = roles.length > 0;

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const pwStrength = getPasswordStrength(form.password);

  const toFieldErrors = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return null;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      const maybeMsg =
        v && typeof v === "object" && "message" in v
          ? (v as { message?: unknown }).message
          : undefined;
      if (typeof maybeMsg === "string" && maybeMsg.trim().length) {
        out[k] = maybeMsg;
      }
    }
    return Object.keys(out).length ? out : null;
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!rolesReady) e.role = "Loading roles from server...";
    else if (!selectedRole) e.role = "Please select a role to continue";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email address";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    const e = validateStep2();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setErrors((prev) => ({ ...prev, form: "" }));
    onCreateAccount({
      name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: CUSTOMER_ROLE_ID,
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
    })
      .then((u) => {
        setCreatedUser(u);
        setSuccess(true);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Signup failed";
        const field = err instanceof ApiRequestError ? toFieldErrors(err.errors) : null;
        setErrors((prev) => ({ ...prev, ...(field || {}), form: msg }));
      })
      .finally(() => setLoading(false));
  };

  const selectedRoleDef = roles.find((r) => r.id === selectedRole);

  if (success && createdUser) {
    const roleDef = roles.find((r) => r.id === createdUser.role);
    return (
      <div className="auth-screen">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="signup-success">
            <div className="success-icon">✓</div>
            <div className="success-title">Account Created!</div>
            <div className="success-desc">
              Welcome to Sunce ERP,{" "}
              <strong>{createdUser.name.split(" ")[0]}</strong>! Your account
              has been registered as <strong>{roleDef?.label}</strong>. You can
              now sign in to access your dashboard.
            </div>
            <div className="success-user-card">
              <div className="success-user-row">
                <div
                  className="success-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${roleDef?.color || "#8B4513"}, ${(roleDef?.color || "#a0522d") + "cc"})`,
                  }}
                >
                  {createdUser.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {createdUser.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text2)",
                      marginTop: 2,
                    }}
                  >
                    {createdUser.email}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Badge
                      label={roleDef?.label || createdUser.role}
                      color={roleDef?.color || "#8B4513"}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ maxWidth: 320 }}
              onClick={() => onFinish(createdUser)}
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="signup-card">
        <div className="signup-left">
          <div className="signup-left-content">
            <div className="signup-left-logo">
              <div className="signup-left-icon" aria-hidden>
                <LuSunMedium />
              </div>
              <div>
                <div className="signup-left-brand">Sunce ERP</div>
                <div className="signup-left-sub">Service Platform</div>
              </div>
            </div>
            <div className="signup-left-heading">
              Join the solar service network
            </div>
            <div className="signup-left-desc">
              Create your account and get instant access to service tickets, SLA
              tracking, job cards, and real-time logistics.
            </div>

            {rolesReady
              ? roles
                  .filter((r) => r.id === CUSTOMER_ROLE_ID)
                  .map((r) => (
                  <div
                    key={r.id}
                    className="signup-role-preview"
                    style={{
                      cursor: "default",
                      borderColor: "rgba(255,255,255,0.4)",
                      background: "rgba(255,255,255,0.14)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      className="signup-role-dot"
                      style={{ background: r.color }}
                    />
                    <div>
                      <div className="signup-role-name">{r.label}</div>
                      <div className="signup-role-desc">
                        {ROLE_DESCRIPTIONS[r.id] || "Custom role access"}
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: 16,
                      }}
                    >
                      ✓
                    </div>
                  </div>
                ))
              : Array.from({ length: 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="signup-role-preview"
                    style={{ opacity: 0.7 }}
                  >
                    <div
                      className="signup-role-dot"
                      style={{ background: "rgba(255,255,255,0.35)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="signup-role-name"
                        style={{
                          background: "rgba(255,255,255,0.16)",
                          borderRadius: 6,
                          height: 14,
                          width: "70%",
                        }}
                      />
                      <div
                        className="signup-role-desc"
                        style={{
                          background: "rgba(255,255,255,0.10)",
                          borderRadius: 6,
                          height: 10,
                          width: "85%",
                          marginTop: 8,
                        }}
                      />
                    </div>
                  </div>
                ))}
          </div>

          <div className="signup-left-footer">
            <div className="signup-left-signin">
              Already have an account?{" "}
              <a href="/login" onClick={() => onGoLogin()}>
                Sign In here
              </a>
            </div>
          </div>
        </div>

        <div className="signup-right">
          <div className="signup-right-header">
            <div className="signup-right-title">
              Create Customer Account
            </div>
            <div className="signup-right-sub">
              Fill in your details to create your customer login.
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="role-selector-grid">
                {rolesReady
                  ? roles
                      .filter((r) => r.id === CUSTOMER_ROLE_ID)
                      .map((r) => (
                      <div
                        key={r.id}
                        className={`role-selector-item ${selectedRole === r.id ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedRole(r.id);
                          setErrors({});
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedRole(r.id);
                            setErrors({});
                          }
                        }}
                      >
                        <div
                          className="role-selector-dot"
                          style={{ background: r.color }}
                        />
                        <div>
                          <div className="role-selector-label">{r.label}</div>
                          <div className="role-selector-sub">
                            {ROLE_DESCRIPTIONS[r.id] || "Custom role"}
                          </div>
                        </div>
                        <span className="role-selector-check">✓</span>
                      </div>
                    ))
                  : Array.from({ length: 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="role-selector-item"
                        style={{ cursor: "default", opacity: 0.7 }}
                      >
                        <div
                          className="role-selector-dot"
                          style={{ background: "var(--border2)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            className="role-selector-label"
                            style={{
                              background: "var(--surface3)",
                              height: 12,
                              width: "70%",
                              borderRadius: 6,
                            }}
                          />
                          <div
                            className="role-selector-sub"
                            style={{
                              background: "var(--surface3)",
                              height: 9,
                              width: "85%",
                              borderRadius: 6,
                              marginTop: 6,
                            }}
                          />
                        </div>
                      </div>
                    ))}
              </div>

              {errors.role && (
                <div
                  className="form-error"
                  style={{ marginBottom: 16, marginTop: -4 }}
                >
                  {errors.role}
                </div>
              )}

              {selectedRole && (
                <div
                  style={{
                    background: "var(--accent-soft)",
                    border: "1px solid var(--accent-mid)",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px 16px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: selectedRoleDef?.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--accent)",
                      }}
                    >
                      {selectedRoleDef?.label} selected
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text2)",
                        marginTop: 2,
                      }}
                    >
                      {ROLE_DESCRIPTIONS[selectedRole] || "Custom role access"}
                    </div>
                  </div>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!rolesReady || !selectedRole}
              >
                Continue with {selectedRoleDef?.label || "selected role"} →
              </button>

              <div className="auth-switch" style={{ marginTop: 18 }}>
                Already registered?{" "}
                <a
                  href="/login"
                  className="auth-link"
                  onClick={() => onGoLogin()}
                >
                  Sign in
                </a>
              </div>
            </>
          )}

          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) handleSubmit();
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 22,
                }}
              >
                <Badge
                  label={selectedRoleDef?.label || "Customer"}
                  color={selectedRoleDef?.color || "#2E8B57"}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: 4 }}>
                <div className="form-group full">
                  <label className="auth-label">Full Name *</label>
                  <input
                    className={`auth-input ${errors.fullName ? "error" : ""}`}
                    style={{ marginBottom: errors.fullName ? 4 : 18 }}
                    placeholder="Arjun Sharma"
                    value={form.fullName}
                    autoComplete="name"
                    enterKeyHint="next"
                    aria-invalid={!!errors.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                  {errors.fullName && (
                    <div className="form-error">{errors.fullName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="auth-label">Email Address *</label>
                  <input
                    className={`auth-input ${errors.email ? "error" : ""}`}
                    style={{ marginBottom: errors.email ? 4 : 18 }}
                    placeholder="you@sunce.in"
                    value={form.email}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="next"
                    aria-invalid={!!errors.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  {errors.email && (
                    <div className="form-error">{errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="auth-label">Phone</label>
                  <input
                    className="auth-input"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>

                {(selectedRole === "CUSTOMER" || selectedRole === "SALES") && (
                  <div className="form-group full">
                    <label className="auth-label">Company / Organization</label>
                    <input
                      className="auth-input"
                      placeholder="e.g. Vikram Solar Pvt Ltd"
                      value={form.company}
                      autoComplete="organization"
                      enterKeyHint="next"
                      onChange={(e) => set("company", e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="auth-label">Password *</label>
                  <div className="input-row">
                    <input
                      className={`auth-input has-action ${errors.password ? "error" : ""}`}
                      style={{ marginBottom: 4 }}
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      minLength={6}
                      autoComplete="new-password"
                      enterKeyHint="next"
                      aria-invalid={!!errors.password}
                      onChange={(e) => set("password", e.target.value)}
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
                  {form.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="strength-seg"
                            style={{
                              background:
                                n <= pwStrength.score
                                  ? pwStrength.color
                                  : "var(--border2)",
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="strength-label"
                        style={{ color: pwStrength.color }}
                      >
                        {pwStrength.label}
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <div className="form-error">{errors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="auth-label">Confirm Password *</label>
                  <div className="input-row">
                    <input
                      className={`auth-input has-action ${errors.confirmPassword ? "error" : ""}`}
                      style={{ marginBottom: errors.confirmPassword ? 4 : 18 }}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      autoComplete="new-password"
                      enterKeyHint="done"
                      aria-invalid={!!errors.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      className="input-action"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="form-error">{errors.confirmPassword}</div>
                  )}
                </div>
              </div>

              <button
                className="btn-primary"
                type="submit"
                style={{ marginTop: 8 }}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account →"}
              </button>

              {errors.form && (
                <div className="form-error" style={{ marginTop: 14 }}>
                  {errors.form}
                </div>
              )}

              <div className="auth-switch" style={{ marginTop: 18 }}>
                Already registered?{" "}
                <a
                  href="/login"
                  className="auth-link"
                  onClick={() => onGoLogin()}
                >
                  Sign in
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
