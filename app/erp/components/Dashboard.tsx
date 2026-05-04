"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ticket, User } from "../types";
import { PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { STATUS_COLORS } from "../constants";
import { LuCircleCheck, LuShieldAlert, LuSiren, LuTicket, LuTriangleAlert } from "react-icons/lu";
import {
  apiDashboardTicketTrends,
  apiPendingDispatchApprovalsList,
  type PendingDispatchApprovalTicket,
  type TicketTrendsPoint,
} from "../api";

export default function Dashboard({
  user,
  tickets,
  onNav,
  onViewTicket,
  onOpenTickets,
}: {
  user: User;
  tickets: Ticket[];
  onNav: (p: string) => void;
  onViewTicket: (
    t: Ticket,
    opts?: { tab?: "overview" | "jobcard" | "logistics" | "sla"; logisticsStage?: "pickup" | "under_dispatch" | "dispatch" },
  ) => void;
  onOpenTickets: (preset?: { status?: string; priority?: string }) => void;
}) {
  const isCustomer = String(user.role || "").toUpperCase() === "CUSTOMER";
  const isAdmin = String(user.role || "").toUpperCase() === "ADMIN";
  const isSales = String(user.role || "").toUpperCase() === "SALES";
  const inward = tickets.filter((t) =>
    ["CREATED", "PICKUP_SCHEDULED", "IN_TRANSIT"].includes(String(t.status || "").toUpperCase()),
  ).length;
  const closed = tickets.filter((t) => t.status === "CLOSED").length;
  const breached = tickets.filter((t) => t.slaStatus === "BREACHED").length;
  const high = tickets.filter((t) => t.priority === "HIGH" && t.status !== "CLOSED").length;

  const myTickets = tickets;

  const statusCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const [approvalPending, setApprovalPending] = useState<PendingDispatchApprovalTicket[]>([]);
  const [approvalErr, setApprovalErr] = useState("");

  const showTrends = isAdmin || isSales;
  const [trendDays, setTrendDays] = useState(14);
  const [trends, setTrends] = useState<TicketTrendsPoint[]>([]);
  const [trendsErr, setTrendsErr] = useState("");
  const [selectedTrendDate, setSelectedTrendDate] = useState<string>("");

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiPendingDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovalPending(r.tickets || []);
          setApprovalErr("");
        })
        .catch((e) => {
          if (cancelled) return;
          setApprovalPending([]);
          setApprovalErr(e instanceof Error ? e.message : "Failed to load approval pending tickets");
        });
    };

    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!showTrends) return;
    let cancelled = false;
    apiDashboardTicketTrends(trendDays)
      .then((r) => {
        if (cancelled) return;
        const series = Array.isArray(r.series) ? r.series : [];
        setTrends(series);
        setSelectedTrendDate((prev) => {
          if (prev && series.some((p) => p.date === prev)) return prev;
          return series.length ? String(series[series.length - 1]!.date || "") : "";
        });
        setTrendsErr("");
      })
      .catch((e) => {
        if (cancelled) return;
        setTrends([]);
        setTrendsErr(e instanceof Error ? e.message : "Failed to load ticket trends");
      });
    return () => {
      cancelled = true;
    };
  }, [showTrends, trendDays]);

  const maxTrendCount = useMemo(() => {
    const max = (trends || []).reduce((best, p) => Math.max(best, p.created || 0, p.closed || 0), 0);
    return Math.max(max, 1);
  }, [trends]);

  const formatTrendDate = (raw: string) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    const d = new Date(`${s}T00:00:00`);
    if (Number.isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(d);
  };

  const formatTrendTooltip = (raw: string) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    const d = new Date(`${s}T00:00:00`);
    if (Number.isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "2-digit", month: "short" }).format(d);
  };

  const trendLabelStep = useMemo(() => {
    const n = trends.length || 0;
    if (!n) return 1;
    return Math.max(1, Math.ceil(n / 7));
  }, [trends.length]);

  const trendTotals = useMemo(() => {
    const created = (trends || []).reduce((s, p) => s + (Number(p.created) || 0), 0);
    const closed = (trends || []).reduce((s, p) => s + (Number(p.closed) || 0), 0);
    return { created, closed };
  }, [trends]);

  const selectedTrendSummary = useMemo(() => {
    const hit = (trends || []).find((p) => p.date === selectedTrendDate) || null;
    if (!hit) return null;
    return {
      date: hit.date,
      created: Number(hit.created || 0) || 0,
      closed: Number(hit.closed || 0) || 0,
    };
  }, [trends, selectedTrendDate]);

  const approvalPendingTickets = useMemo(() => {
    const byId = new Map<string, Ticket>();
    tickets.forEach((t) => byId.set(t.id, t));
    return (approvalPending || [])
      .map((p) => ({ p, t: byId.get(p.ticketDbId) || null }))
      .filter((x) => x.t);
  }, [approvalPending, tickets]);

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">
          Good morning, {user.name.split(" ")[0]} 
        </div>
        <div className="page-sub">
          Here&apos;s what&apos;s happening with your service operations today
        </div>
      </div>

      {isCustomer ? (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Your Tickets</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
              View All →
            </button>
          </div>
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Inverter</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 22, color: "var(--text3)" }}>
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  myTickets.slice(0, 8).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <button
                          type="button"
                          className="td-mono table-link"
                          onClick={() => onViewTicket(t)}
                          title="View ticket"
                        >
                          {t.ticketId}
                        </button>
                      </td>
                      <td>
                        <span className="tag">
                          {t.inverterMake} {t.capacity}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>
                        {t.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            {[
              {
                label: "Inward Stage",
                value: inward,
                sub: "Created / Pickup / In transit",
                color: "#6b3a1f",
                Icon: LuTicket,
                onClick: () => onOpenTickets({ status: "OPEN" }),
              },
              ...(isAdmin
                ? [
                    {
                      label: "Approval Pending",
                      value: approvalPending.length,
                      sub: "Dispatch approvals waiting",
                      color: "#7c3aed",
                      Icon: LuShieldAlert,
                      onClick: () => onOpenTickets({ status: "APPROVAL_PENDING" }),
                    },
                  ]
                : []),
              {
                label: "High Priority",
                value: high,
                sub: "Needs immediate attention",
                color: "#d97706",
                Icon: LuTriangleAlert,
                onClick: () => onOpenTickets({ status: "OPEN", priority: "HIGH" }),
              },
              {
                label: "SLA Breached",
                value: breached,
                sub: "Exceeding deadline",
                color: "#c0392b",
                Icon: LuSiren,
                onClick: () => onNav("sla"),
              },
              {
                label: "Resolved",
                value: closed,
                sub: "Tickets closed this month",
                color: "#16a34a",
                Icon: LuCircleCheck,
                onClick: () => onOpenTickets({ status: "CLOSED" }),
              },
            ].map((k) => (
              <button
                key={k.label}
                type="button"
                className="kpi-card"
                onClick={k.onClick}
                title={`Go to ${k.label}`}
              >
                <div className="kpi-accent-bar" style={{ background: k.color }} />
                <div className="kpi-icon" style={{ color: k.color }} aria-hidden>
                  <k.Icon />
                </div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value" style={{ color: k.color }}>
                  {k.value}
                </div>
                <div className="kpi-sub">{k.sub}</div>
              </button>
            ))}
          </div>

          {isAdmin ? (
            <div className="table-card" style={{ marginBottom: 16 }}>
              <div className="table-header">
                <div className="table-title">Approval Pending</div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onOpenTickets({ status: "APPROVAL_PENDING" })}
                >
                  View All →
                </button>
              </div>
              <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text3)" }}>
                {approvalErr
                  ? approvalErr
                  : approvalPending.length
                    ? `${approvalPending.length} tickets waiting for dispatch approval`
                    : "No approvals pending."}
              </div>
              {approvalPendingTickets.length ? (
                <div className="scroll-x">
                  <table>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Customer</th>
                        <th>Invoice</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvalPendingTickets.slice(0, 8).map(({ p, t }) => (
                        <tr key={p.ticketDbId}>
                          <td>
                            <button
                              type="button"
                              className="td-mono table-link"
                              onClick={() =>
                                onViewTicket(t as Ticket, { tab: "logistics", logisticsStage: "under_dispatch" })
                              }
                              title="Open under-dispatch logistics"
                            >
                              {p.ticketId}
                            </button>
                          </td>
                          <td>{p.customer}</td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                            {p.invoiceGenerated ? "YES" : "NO"}
                          </td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                            {p.paymentDone ? "YES" : "NO"}
                          </td>
                          <td>
                            <StatusBadge status={(t as Ticket).status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}

          {showTrends ? (
            <div className="table-card" style={{ marginBottom: 16 }}>
              <div className="table-header">
                <div className="table-title">Tickets Created vs Closed</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setTrendDays(d)}
                      aria-pressed={trendDays === d}
                      title={`Show last ${d} days`}
                      style={
                        trendDays === d
                          ? {
                              background: "#6b3a1f",
                              borderColor: "#6b3a1f",
                              color: "white",
                            }
                          : undefined
                      }
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                {trendsErr ? (
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{trendsErr}</div>
                ) : trends.length ? (
                  <>
                    <div
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: 14,
                        background: "var(--bg2)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--text2)" }}>
                            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#6b3a1f", display: "inline-block" }} />
                            Created
                          </span>
                          <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--text2)" }}>
                            <span style={{ width: 10, height: 10, borderRadius: 999, background: "#16a34a", display: "inline-block" }} />
                            Closed
                          </span>
                          <span style={{ fontSize: 12, color: "var(--text3)" }}>
                            Total:{" "}
                            <span style={{ fontFamily: "var(--mono)" }}>
                              {trendTotals.created} created · {trendTotals.closed} closed
                            </span>
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>
                          Hover bars for details
                        </div>
                      </div>

                      {selectedTrendSummary ? (
                        <div style={{ marginBottom: 10, fontSize: 12, color: "var(--text2)" }}>
                          Selected:{" "}
                          <span className="tag" style={{ fontFamily: "var(--mono)" }}>
                            {formatTrendTooltip(selectedTrendSummary.date)}
                          </span>{" "}
                          <span style={{ fontFamily: "var(--mono)" }}>
                            {selectedTrendSummary.created} created · {selectedTrendSummary.closed} closed
                          </span>
                        </div>
                      ) : null}

                      <div className="bar-chart" style={{ height: 160 }}>
                        {(trends || []).map((p, idx) => {
                          const created = Math.max(0, Number(p.created) || 0);
                          const closed = Math.max(0, Number(p.closed) || 0);
                          const hCreated = Math.round((created / maxTrendCount) * 110);
                          const hClosed = Math.round((closed / maxTrendCount) * 110);
                          const isSelected = selectedTrendDate === p.date;
                          const showLabel =
                            isSelected || idx === 0 || idx === trends.length - 1 || idx % trendLabelStep === 0;
                          const title = `${formatTrendTooltip(p.date)} • Created ${created} • Closed ${closed}`;
                          return (
                            <button
                              key={p.date}
                              type="button"
                              className="bar-col"
                              title={title}
                              onClick={() => setSelectedTrendDate(p.date)}
                              style={{
                                gap: 6,
                                border: isSelected ? "1px solid var(--accent-mid)" : "1px solid transparent",
                                borderRadius: 10,
                                padding: "6px 6px",
                                background: isSelected ? "var(--surface)" : "transparent",
                                boxShadow: isSelected ? "0 0 0 3px var(--accent-soft)" : "none",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: 4,
                                  width: "100%",
                                  alignItems: "flex-end",
                                  height: 120,
                                }}
                              >
                                <div
                                  className="bar"
                                  style={{
                                    height: `${Math.max(2, hCreated)}px`,
                                    background: created ? "#6b3a1f" : "var(--surface3)",
                                    width: "48%",
                                  }}
                                  aria-label={`Created ${created}`}
                                />
                                <div
                                  className="bar"
                                  style={{
                                    height: `${Math.max(2, hClosed)}px`,
                                    background: closed ? "#16a34a" : "var(--surface3)",
                                    width: "48%",
                                  }}
                                  aria-label={`Closed ${closed}`}
                                />
                              </div>
                              <div className="bar-label" style={{ fontFamily: "var(--mono)" }}>
                                {showLabel ? formatTrendDate(p.date) : ""}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          fontSize: 12,
                          color: "var(--text3)",
                          marginTop: 6,
                        }}
                      >
                        <span style={{ fontFamily: "var(--mono)" }}>Tip: hover any day to see counts.</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>No data.</div>
                )}
              </div>
            </div>
          ) : null}

          <div className="two-col">
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Ticket Status Distribution</div>
              </div>
              <div style={{ padding: "20px" }}>
                <div className="bar-chart">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="bar-col">
                      <div className="bar-val">{count}</div>
                      <div
                        className="bar"
                        style={{
                          height: `${(count / maxCount) * 80}px`,
                          background: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                        }}
                      />
                      <div className="bar-label">
                        {status.replace("_", " ").substring(0, 7)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Priority Breakdown</div>
              </div>
              <div style={{ padding: "20px" }}>
                {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                  const count = tickets.filter((t) => t.priority === p).length;
                  return (
                    <div key={p} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text2)",
                            fontWeight: 500,
                          }}
                        >
                          {p}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: "var(--mono)",
                            fontWeight: 700,
                          }}
                        >
                          {count}
                        </span>
                      </div>
                      <div className="sla-bar">
                        <div
                          className="sla-fill"
                          style={{
                            width: `${(count / tickets.length) * 100}%`,
                            background: p === "LOW" ? "#16a34a" : p === "MEDIUM" ? "#d97706" : "#dc2626",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Recent Tickets</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
                View All →
              </button>
            </div>
            <div className="scroll-x">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Inverter</th>
                    <th>Priority</th>
                    <th>Status / SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {myTickets.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <button
                          type="button"
                          className="td-mono table-link"
                          onClick={() => onViewTicket(t)}
                          title="View ticket"
                        >
                          {t.ticketId}
                        </button>
                      </td>
                      <td>{t.customer}</td>
                      <td>
                        <span className="tag">
                          {t.inverterMake} {t.capacity}
                        </span>
                      </td>
                      <td>
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td>
                        <div className="status-sla">
                          <StatusBadge status={t.status} />
                          <SlaBadge status={t.slaStatus} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
