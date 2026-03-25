"use client";

import { useEffect, useMemo, useState } from "react";
import { apiSlaSettingsGet, apiSlaSettingsUpdate, type SlaSettings } from "../api";

function formatHours(v: number) {
  return `${v}h`;
}

function parseHours(input: string): number | null {
  const raw = String(input || "").trim().toLowerCase();
  const m = raw.match(/^(\d+)\s*h?$/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function Settings({ onNotify }: { onNotify?: (msg: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [critical, setCritical] = useState("24h");
  const [high, setHigh] = useState("48h");
  const [normal, setNormal] = useState("72h");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    apiSlaSettingsGet()
      .then((s) => {
        if (!mounted) return;
        setCritical(formatHours(s.criticalHours));
        setHigh(formatHours(s.highHours));
        setNormal(formatHours(s.normalHours));
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load SLA settings");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const parsed = useMemo(() => {
    const criticalHours = parseHours(critical);
    const highHours = parseHours(high);
    const normalHours = parseHours(normal);
    const ok = criticalHours !== null && highHours !== null && normalHours !== null;
    return { ok, criticalHours, highHours, normalHours };
  }, [critical, high, normal]);

  const handleSave = async () => {
    if (!parsed.ok) {
      setError("Please enter valid hours like 24h, 48h, 72h");
      return;
    }
    const payload: SlaSettings = {
      criticalHours: parsed.criticalHours!,
      highHours: parsed.highHours!,
      normalHours: parsed.normalHours!,
    };
    setSaving(true);
    setError("");
    try {
      const saved = await apiSlaSettingsUpdate(payload);
      setCritical(formatHours(saved.criticalHours));
      setHigh(formatHours(saved.highHours));
      setNormal(formatHours(saved.normalHours));
      onNotify?.("SLA settings saved!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save SLA settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">System Settings</div>
        <div className="page-sub">
          Configure SLA thresholds and system parameters
        </div>
      </div>
      <div className="two-col">
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">SLA Configuration</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              {
                label: "Critical Priority SLA",
                value: critical,
                onChange: setCritical,
              },
              {
                label: "High Priority SLA",
                value: high,
                onChange: setHigh,
              },
              {
                label: "Normal Priority SLA",
                value: normal,
                onChange: setNormal,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13 }}>{item.label}</span>
                <input
                  className="form-input"
                  value={item.value}
                  onChange={(e) => item.onChange(e.target.value)}
                  disabled={loading || saving}
                  inputMode="numeric"
                  aria-label={`${item.label} in hours`}
                  style={{
                    width: 72,
                    textAlign: "center",
                    fontFamily: "var(--mono)",
                    opacity: loading ? 0.75 : 1,
                  }}
                />
              </div>
            ))}
            {error ? (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#c0392b",
                  fontFamily: "var(--mono)",
                }}
              >
                {error}
              </div>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <button
                className="btn btn-accent"
                onClick={handleSave}
                disabled={loading || saving || !parsed.ok}
              >
                {saving ? "Saving..." : "Save SLA Settings"}
              </button>
            </div>
          </div>
        </div>
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">System Info</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              ["System", "Sunce ERP v1.0.0"],
              ["Stack", "Next.js + MongoDB"],
              ["Deployment", "Vercel"],
              ["Database", "MongoDB Atlas"],
            ].map(([k, v]) => (
              <div key={k} className="info-row">
                <span style={{ color: "var(--text2)" }}>{k}</span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
