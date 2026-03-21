"use client";

import type { Ticket } from "../types";
import { PriorityBadge, SlaBadge, StatusBadge } from "./Badges";

export default function SLAMonitor({ tickets }: { tickets: Ticket[] }) {
  const breached = tickets.filter((t) => t.slaStatus === "BREACHED");
  const atRisk = tickets.filter((t) => t.slaStatus === "AT_RISK");
  const met = tickets.filter((t) => t.slaStatus === "MET");

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">SLA Monitor</div>
        <div className="page-sub">Service Level Agreement tracking</div>
      </div>
      <div className="kpi-grid">
        {[
          {
            label: "SLA Met",
            value: met.length,
            sub: "On track",
            color: "#16a34a",
            icon: "✅",
          },
          {
            label: "At Risk",
            value: atRisk.length,
            sub: "Approaching limit",
            color: "#d97706",
            icon: "⚠️",
          },
          {
            label: "Breached",
            value: breached.length,
            sub: "Exceeded SLA",
            color: "#c0392b",
            icon: "🚨",
          },
          {
            label: "Compliance",
            value: `${Math.round((met.length / tickets.length) * 100)}%`,
            sub: "Overall SLA rate",
            color: "#6b3a1f",
            icon: "📊",
          },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-accent-bar" style={{ background: k.color }} />
            <div className="kpi-icon">{k.icon}</div>
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
                <th>Status</th>
                <th>Created</th>
                <th>SLA</th>
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
                    <StatusBadge status={t.status} />
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>
                    {t.createdAt}
                  </td>
                  <td>
                    <SlaBadge status={t.slaStatus} />
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
