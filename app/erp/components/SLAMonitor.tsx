"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ticket } from "../types";
import type { RoleDefinition, User } from "../types";
import { apiSlaSettingsGet, apiSlaSettingsUpdate, type SlaSettings } from "../api";
import { canAccess } from "../utils";
import { PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { LuChartBar, LuCircleCheck, LuSiren, LuTriangleAlert } from "react-icons/lu";

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

export default function SLAMonitor({
  tickets,
  user,
  roles,
}: {
  tickets: Ticket[];
  user: User;
  roles: RoleDefinition[];
}) {
  const breached = tickets.filter((t) => t.slaStatus === "BREACHED");
  const atRisk = tickets.filter((t) => t.slaStatus === "AT_RISK");
  const met = tickets.filter((t) => t.slaStatus === "MET");

  const canEditSla = useMemo(
    () => canAccess(roles, user.role, "sla", "edit"),
    [roles, user.role],
  );

  const [showSettings, setShowSettings] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  const [critical, setCritical] = useState("24h");
  const [high, setHigh] = useState("48h");
  const [normal, setNormal] = useState("72h");

  useEffect(() => {
    if (!canEditSla || !showSettings) return;
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      setLoadingSettings(true);
      setSettingsError("");
    });
    apiSlaSettingsGet()
      .then((s) => {
        if (!mounted) return;
        setCritical(formatHours(s.criticalHours));
        setHigh(formatHours(s.highHours));
        setNormal(formatHours(s.normalHours));
      })
      .catch((e) => {
        if (!mounted) return;
        setSettingsError(e instanceof Error ? e.message : "Failed to load SLA settings");
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingSettings(false);
      });
    return () => {
      mounted = false;
    };
  }, [canEditSla, showSettings]);

  const parsed = useMemo(() => {
    const criticalHours = parseHours(critical);
    const highHours = parseHours(high);
    const normalHours = parseHours(normal);
    const ok = criticalHours !== null && highHours !== null && normalHours !== null;
    return { ok, criticalHours, highHours, normalHours };
  }, [critical, high, normal]);

  const handleSaveSettings = async () => {
    if (!parsed.ok) {
      setSettingsError("Please enter valid hours like 24h, 48h, 72h");
      return;
    }
    const payload: SlaSettings = {
      criticalHours: parsed.criticalHours!,
      highHours: parsed.highHours!,
      normalHours: parsed.normalHours!,
    };
    setSavingSettings(true);
    setSettingsError("");
    try {
      const saved = await apiSlaSettingsUpdate(payload);
      setCritical(formatHours(saved.criticalHours));
      setHigh(formatHours(saved.highHours));
      setNormal(formatHours(saved.normalHours));
    } catch (e) {
      setSettingsError(e instanceof Error ? e.message : "Failed to save SLA settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="content">
      <div
        className="page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
      >
        <div>
          <div className="page-title">SLA Monitor</div>
          <div className="page-sub">Service Level Agreement tracking</div>
        </div>
        {canEditSla ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings((v) => !v)}>
            {showSettings ? "Hide SLA Settings" : "Edit SLA Settings"}
          </button>
        ) : null}
      </div>

      {canEditSla && showSettings ? (
        <div className="table-card" style={{ marginBottom: 16 }}>
          <div className="table-header">
            <div className="table-title">SLA Configuration</div>
          </div>
          <div style={{ padding: "20px" }}>
            {[
              { label: "Critical Priority SLA", value: critical, onChange: setCritical },
              { label: "High Priority SLA", value: high, onChange: setHigh },
              { label: "Normal Priority SLA", value: normal, onChange: setNormal },
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
                  disabled={loadingSettings || savingSettings}
                  inputMode="numeric"
                  aria-label={`${item.label} in hours`}
                  style={{
                    width: 72,
                    textAlign: "center",
                    fontFamily: "var(--mono)",
                    opacity: loadingSettings ? 0.75 : 1,
                  }}
                />
              </div>
            ))}
            {settingsError ? (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "#c0392b",
                  fontFamily: "var(--mono)",
                }}
              >
                {settingsError}
              </div>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <button
                className="btn btn-accent"
                onClick={handleSaveSettings}
                disabled={loadingSettings || savingSettings || !parsed.ok}
              >
                {savingSettings ? "Saving..." : "Save SLA Settings"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="kpi-grid">
        {[
          {
            label: "SLA Met",
            value: met.length,
            sub: "On track",
            color: "#16a34a",
            Icon: LuCircleCheck,
          },
          {
            label: "At Risk",
            value: atRisk.length,
            sub: "Approaching limit",
            color: "#d97706",
            Icon: LuTriangleAlert,
          },
          {
            label: "Breached",
            value: breached.length,
            sub: "Exceeded SLA",
            color: "#c0392b",
            Icon: LuSiren,
          },
          {
            label: "Compliance",
            value: tickets.length ? `${Math.round((met.length / tickets.length) * 100)}%` : "—",
            sub: "Overall SLA rate",
            color: "#6b3a1f",
            Icon: LuChartBar,
          },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-accent-bar" style={{ background: k.color }} />
            <div className="kpi-icon" style={{ color: k.color }} aria-hidden>
              <k.Icon />
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">All Ticket SLA Status</div>
        </div>
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status / SLA</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="td-mono">{t.ticketId}</span>
                  </td>
                  <td>{t.customer}</td>
                  <td>
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td>
                    <div className="status-sla">
                      <StatusBadge status={t.status} />
                      <SlaBadge status={t.slaStatus} />
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>
                    {t.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
