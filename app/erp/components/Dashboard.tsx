"use client";

import { useEffect, useMemo, useState } from "react";
import type { Ticket, User } from "../types";
import { StatusBadge } from "./Badges";
import { STATUS_COLORS } from "../constants";
import {
  LuCircleCheck,
  LuShieldAlert,
  LuTicket,
  LuTruck,
  LuWrench,
} from "react-icons/lu";
import {
  apiDashboardTicketTrends,
  apiDashboardServicingStatus,
  apiDashboardClientDetailsDaily,
  apiDashboardClientDetailsList,
  apiJobCardsList,
  apiPendingDispatchApprovalsList,
  type ClientSummaryRow,
  type DashboardPeriodInput,
  type ServicingStatusDayRow,
  type JobCardListRow,
  type PendingDispatchApprovalTicket,
  type TicketTrendsPoint,
} from "../api";
import ComboBarLineChart from "./ComboBarLineChart";

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
  onOpenTickets: (preset?: {
    status?: string;
    priority?: string;
    tab?:
      | "open"
      | "all"
      | "inward"
      | "repaired"
      | "offline_booking"
      | "outward"
      | "approval_pending"
      | "approved_by_admin"
      | "closed";
  }) => void;
}) {
  const isCustomer = String(user.role || "").toUpperCase() === "CUSTOMER";
  const isAdmin = String(user.role || "").toUpperCase() === "ADMIN";
  const isSales = String(user.role || "").toUpperCase() === "SALES";
  const inwardCreated = tickets.filter((t) => String(t.status || "").toUpperCase() === "CREATED").length;
  const inwardUnderPickup = tickets.filter((t) =>
    ["PICKUP_SCHEDULED", "IN_TRANSIT"].includes(String(t.status || "").toUpperCase()),
  ).length;
  const inward = inwardCreated + inwardUnderPickup;

  const underDispatch = tickets.filter((t) => String(t.status || "").toUpperCase() === "UNDER_DISPATCH").length;
  const dispatched = tickets.filter((t) =>
    ["DISPATCHED", "INSTALLATION_DONE"].includes(String(t.status || "").toUpperCase()),
  ).length;

  const underRepairRaw = tickets.filter((t) => String(t.status || "").toUpperCase() === "UNDER_REPAIRED");
  const closed = tickets.filter((t) => t.status === "CLOSED").length;
  /*
  const breached = tickets.filter((t) => t.slaStatus === "BREACHED").length;
  const high = tickets.filter((t) => t.priority === "HIGH" && t.status !== "CLOSED").length;
  */

  const myTickets = tickets;

  const statusCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const [approvalPending, setApprovalPending] = useState<PendingDispatchApprovalTicket[]>([]);
  const [jobCards, setJobCards] = useState<JobCardListRow[]>([]);

  const showTrends = isAdmin || isSales;
  const [trendDays, setTrendDays] = useState(14);
  const [trends, setTrends] = useState<TicketTrendsPoint[]>([]);
  const [trendsErr, setTrendsErr] = useState("");
  const [selectedTrendDate, setSelectedTrendDate] = useState<string>("");
  const [showAllDashboardTickets, setShowAllDashboardTickets] = useState(false);

  const now = useMemo(() => new Date(), []);
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  const defaultFortnight = now.getDate() >= 16 ? 2 : 1;

  const [reportPeriod, setReportPeriod] = useState<DashboardPeriodInput["period"]>("fortnightly");
  const [reportYear, setReportYear] = useState(defaultYear);
  const [reportMonth, setReportMonth] = useState(defaultMonth);
  const [reportFortnight, setReportFortnight] = useState<1 | 2>(defaultFortnight as 1 | 2);

  const reportInput = useMemo<DashboardPeriodInput>(() => {
    return {
      period: reportPeriod,
      year: reportYear,
      ...(reportPeriod === "yearly" ? {} : { month: reportMonth }),
      ...(reportPeriod === "fortnightly" ? { fortnight: reportFortnight } : {}),
      tz: "Asia/Kolkata",
    };
  }, [reportPeriod, reportYear, reportMonth, reportFortnight]);

  const [svcLoading, setSvcLoading] = useState(false);
  const [svcErr, setSvcErr] = useState("");
  const [svcPeriodLabel, setSvcPeriodLabel] = useState<{ from: string; to: string } | null>(null);
  const [svcTotals, setSvcTotals] = useState<{ received: number; repaired: number; scrap: number; dispatched: number } | null>(null);
  const [svcDaily, setSvcDaily] = useState<ServicingStatusDayRow[]>([]);
  const [svcDetailsOpen, setSvcDetailsOpen] = useState(false);

  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsErr, setClientsErr] = useState("");
  const [clients, setClients] = useState<ClientSummaryRow[]>([]);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
  const [clientDetailsErr, setClientDetailsErr] = useState("");
  const [clientDetailsDaily, setClientDetailsDaily] = useState<ServicingStatusDayRow[]>([]);
  const [clientDetailsTotals, setClientDetailsTotals] = useState<{ received: number; repaired: number; scrap: number; dispatched: number } | null>(null);
  const [clientPicked, setClientPicked] = useState<{ name: string; address: string } | null>(null);

  useEffect(() => {
    if (!isAdmin && !isSales) return;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiPendingDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovalPending(r.tickets || []);
        })
        .catch(() => {
          if (cancelled) return;
          setApprovalPending([]);
        });
    };

    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAdmin, isSales]);

  useEffect(() => {
    if (isCustomer) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiJobCardsList()
        .then((rows) => {
          if (cancelled) return;
          setJobCards(rows || []);
        })
        .catch(() => {
          if (cancelled) return;
          setJobCards([]);
        });
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isCustomer]);

  const engineerFinalByTicketId = useMemo(() => {
    const latestByTicket = new Map<string, JobCardListRow>();
    (jobCards || []).forEach((r) => {
      const t = r?.ticket;
      const ticketId = String(t?.id || "");
      if (!ticketId) return;
      const prev = latestByTicket.get(ticketId);
      if (!prev || (r.updatedAtMs || 0) >= (prev.updatedAtMs || 0)) latestByTicket.set(ticketId, r);
    });
    const out = new Map<string, string>();
    latestByTicket.forEach((r, id) => {
      const final = String(r?.engineerFinalStatus || "").toUpperCase().trim();
      if (final) out.set(id, final);
    });
    return out;
  }, [jobCards]);

  const underProgressCounts = useMemo(() => {
    let underRepair = 0;
    let repaired = 0;
    let scrap = 0;
    (underRepairRaw || []).forEach((t) => {
      const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
      if (final === "REPAIRABLE") repaired++;
      else if (final === "NOT_REPAIRABLE") scrap++;
      else underRepair++;
    });
    return { underRepair, repaired, scrap, total: underRepair + repaired + scrap };
  }, [underRepairRaw, engineerFinalByTicketId]);

  const outwardCounts = useMemo(() => {
    return { underDispatch, dispatched, total: underDispatch + dispatched };
  }, [underDispatch, dispatched]);

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

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setSvcLoading(true);
    setSvcErr("");
    apiDashboardServicingStatus(reportInput)
      .then((r) => {
        if (cancelled) return;
        setSvcPeriodLabel({ from: r.period.from, to: r.period.to });
        setSvcTotals(r.totals);
        setSvcDaily(r.daily || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setSvcErr(e instanceof Error ? e.message : "Failed to load servicing status");
        setSvcPeriodLabel(null);
        setSvcTotals(null);
        setSvcDaily([]);
      })
      .finally(() => {
        if (cancelled) return;
        setSvcLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, reportInput]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setClientsLoading(true);
    setClientsErr("");
    apiDashboardClientDetailsList(reportInput)
      .then((r) => {
        if (cancelled) return;
        setClients(r.clients || []);
      })
      .catch((e) => {
        if (cancelled) return;
        setClientsErr(e instanceof Error ? e.message : "Failed to load client details");
        setClients([]);
      })
      .finally(() => {
        if (cancelled) return;
        setClientsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, reportInput]);

  const reportYears = useMemo(() => {
    const y = defaultYear;
    const out: number[] = [];
    for (let i = 0; i < 6; i += 1) out.push(y - i);
    return out;
  }, [defaultYear]);

  const reportMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  const formatRange = (fromYmd: string, toYmd: string) => {
    const fmt = (s: string) => {
      const d = new Date(`${s}T00:00:00`);
      if (Number.isNaN(d.getTime())) return s;
      return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(d);
    };
    const a = String(fromYmd || "").trim();
    const b = String(toYmd || "").trim();
    if (!a || !b) return "";
    return `${fmt(a)} → ${fmt(b)}`;
  };

  const PeriodControls = (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <select
        className="form-select"
        value={reportPeriod}
        onChange={(e) => setReportPeriod(e.target.value as DashboardPeriodInput["period"])}
        style={{ width: 150, fontFamily: "var(--mono)", fontSize: 12 }}
        aria-label="Select report period"
      >
        <option value="fortnightly">Fortnightly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      {reportPeriod !== "yearly" ? (
        <select
          className="form-select"
          value={String(reportMonth)}
          onChange={(e) => setReportMonth(Number(e.target.value) || defaultMonth)}
          style={{ width: 140, fontFamily: "var(--mono)", fontSize: 12 }}
          aria-label="Select month"
        >
          {reportMonths.map((m) => (
            <option key={m} value={String(m)}>
              {new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(2020, m - 1, 1))}
            </option>
          ))}
        </select>
      ) : null}

      <select
        className="form-select"
        value={String(reportYear)}
        onChange={(e) => setReportYear(Number(e.target.value) || defaultYear)}
        style={{ width: 110, fontFamily: "var(--mono)", fontSize: 12 }}
        aria-label="Select year"
      >
        {reportYears.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      {reportPeriod === "fortnightly" ? (
        <select
          className="form-select"
          value={String(reportFortnight)}
          onChange={(e) => setReportFortnight((Number(e.target.value) === 2 ? 2 : 1) as 1 | 2)}
          style={{ width: 110, fontFamily: "var(--mono)", fontSize: 12 }}
          aria-label="Select fortnight"
        >
          <option value="1">1–15</option>
          <option value="2">16–End</option>
        </select>
      ) : null}
    </div>
  );

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

  const trendTotals = useMemo(() => {
    const created = (trends || []).reduce((s, p) => s + (Number(p.created) || 0), 0);
    const closed = (trends || []).reduce((s, p) => s + (Number(p.closed) || 0), 0);
    const repaired = (trends || []).reduce((s, p) => s + (Number(p.repaired) || 0), 0);
    return { created, closed, repaired };
  }, [trends]);

  const selectedTrendSummary = useMemo(() => {
    const hit = (trends || []).find((p) => p.date === selectedTrendDate) || null;
    if (!hit) return null;
    return {
      date: hit.date,
      created: Number(hit.created || 0) || 0,
      closed: Number(hit.closed || 0) || 0,
      repaired: Number(hit.repaired || 0) || 0,
    };
  }, [trends, selectedTrendDate]);

  const trendsChartPoints = useMemo(() => {
    return (trends || []).map((p) => ({
      id: p.date,
      xLabel: formatTrendDate(p.date),
      xTooltip: formatTrendTooltip(p.date),
      bars: [
        { id: "created", label: "Created", value: Math.max(0, Number(p.created) || 0), color: "#0d9488" },
        { id: "repaired", label: "Repaired", value: Math.max(0, Number(p.repaired) || 0), color: "#2563eb" },
        { id: "closed", label: "Closed", value: Math.max(0, Number(p.closed) || 0), color: "#16a34a" },
      ],
    }));
  }, [trends]);

  const trendsCard = showTrends ? (
    <div className="table-card" style={{ marginBottom: 16 }}>
      <div className="table-header">
        <div className="table-title">Tickets Created vs Repaired vs Closed</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="form-select"
            value={String(trendDays)}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              setTrendDays(Number.isFinite(n) ? n : 14);
            }}
            aria-label="Select trend range"
            style={{ width: 150, fontFamily: "var(--mono)", fontSize: 12 }}
          >
            <option value="7">Weekly</option>
            <option value="14">Fortnightly</option>
            <option value="30">Monthly</option>
            <option value="365">Yearly</option>
          </select>
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
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text2)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#0d9488",
                        display: "inline-block",
                      }}
                    />
                    Created
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text2)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#2563eb",
                        display: "inline-block",
                      }}
                    />
                    Repaired
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--text2)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "#16a34a",
                        display: "inline-block",
                      }}
                    />
                    Closed
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    Total:{" "}
                    <span style={{ fontFamily: "var(--mono)" }}>
                      {trendTotals.created} created · {trendTotals.repaired} repaired · {trendTotals.closed} closed
                    </span>
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>Tap bars/points for details</div>
              </div>

              {selectedTrendSummary ? (
                <div style={{ marginBottom: 10, fontSize: 12, color: "var(--text2)" }}>
                  Selected:{" "}
                  <span className="tag" style={{ fontFamily: "var(--mono)" }}>
                    {formatTrendTooltip(selectedTrendSummary.date)}
                  </span>{" "}
                  <span style={{ fontFamily: "var(--mono)" }}>
                    {selectedTrendSummary.created} created · {selectedTrendSummary.repaired} repaired ·{" "}
                    {selectedTrendSummary.closed} closed
                  </span>
                </div>
              ) : null}

              <ComboBarLineChart
                points={trendsChartPoints}
                selectedId={selectedTrendDate}
                onSelect={setSelectedTrendDate}
                height={220}
                yLabel="Tickets"
                showBarValues
                showLine={false}
                ariaLabel="Tickets created vs repaired vs closed chart"
              />

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  fontSize: 12,
                  color: "var(--text3)",
                  marginTop: 8,
                }}
              >
                <span style={{ fontFamily: "var(--mono)" }}>
                  Tip: tap any point to see counts for that date.
                </span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "var(--text3)" }}>No data.</div>
        )}
      </div>
    </div>
  ) : null;

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
        <>
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Your Tickets</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowAllDashboardTickets((v) => !v)}
                >
                  {showAllDashboardTickets ? "Show Less" : "Show All"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
                  View All →
                </button>
              </div>
            </div>
            <div
              className="scroll-x"
              style={showAllDashboardTickets ? { maxHeight: 420, overflowY: "auto" } : undefined}
            >
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
                    (showAllDashboardTickets ? myTickets : myTickets.slice(0, 8)).map((t) => (
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

          {/* Trends chart intentionally hidden for customers */}
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
              View All →
            </button>
          </div>
          <div className="kpi-grid">
            {[
              {
                label: "Inward Stage",
                value: inward,
                sub: `Created: ${inwardCreated} · Under pickup: ${inwardUnderPickup}`,
                color: "#0d9488",
                Icon: LuTicket,
                onClick: () => onOpenTickets({ tab: "inward" }),
              },
              {
                label: "Under Progress",
                value: underProgressCounts.total,
                sub: `Under repair: ${underProgressCounts.underRepair} · Repaired: ${underProgressCounts.repaired} · Scrap: ${underProgressCounts.scrap}`,
                color: "#f97316",
                Icon: LuWrench,
                onClick: () => onOpenTickets({ tab: "repaired" }),
              },
              {
                label: "Outward",
                value: outwardCounts.total,
                sub: `Under dispatch: ${outwardCounts.underDispatch} · Dispatched: ${outwardCounts.dispatched}`,
                color: "#0ea5e9",
                Icon: LuTruck,
                onClick: () => onOpenTickets({ tab: "outward" }),
              },
              {
                label: "Under Approval",
                value: approvalPending.length,
                sub: "Waiting for Admin approval",
                color: "#7c3aed",
                Icon: LuShieldAlert,
                onClick: () => onOpenTickets({ tab: "approval_pending" }),
              },
              /*
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
              */
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

          {/* Keep the KPI tile for admins, but don’t show the full approval list on dashboard. */}

          {trendsCard}

          {isAdmin ? (
            <>
              <div className="table-card" style={{ marginBottom: 16 }}>
                <div className="table-header">
                  <div className="table-title">Servicing Status</div>
                  {PeriodControls}
                </div>
                <div className="scroll-x">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 220 }}>
                          {svcPeriodLabel ? formatRange(svcPeriodLabel.from, svcPeriodLabel.to) : "Period"}
                        </th>
                        <th>No of Inverters Received</th>
                        <th>No of Inverters Repaired</th>
                        <th>No of Inverters declared as SCRAP</th>
                        <th>No of Inverters Dispatched</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {svcErr ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            {svcErr}
                          </td>
                        </tr>
                      ) : svcLoading && !svcTotals ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            Loading…
                          </td>
                        </tr>
                      ) : svcTotals ? (
                        <tr>
                          <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>
                            {svcPeriodLabel ? `${svcPeriodLabel.from} → ${svcPeriodLabel.to}` : "—"}
                          </td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.received}</td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.repaired}</td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.scrap}</td>
                          <td style={{ fontFamily: "var(--mono)" }}>{svcTotals.dispatched}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSvcDetailsOpen(true)}
                              disabled={!svcDaily.length}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            No data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-card" style={{ marginBottom: 16 }}>
                <div className="table-header">
                  <div className="table-title">Client Details</div>
                  {PeriodControls}
                </div>
                <div className="scroll-x" style={{ maxHeight: 360, overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 260 }}>Client Name and Address</th>
                        <th>No of Inverters Received</th>
                        <th>No of Inverters Repaired</th>
                        <th>No of Inverters declared as SCRAP</th>
                        <th>No of Inverters Dispatched</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsErr ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            {clientsErr}
                          </td>
                        </tr>
                      ) : clientsLoading && !clients.length ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            Loading…
                          </td>
                        </tr>
                      ) : !clients.length ? (
                        <tr>
                          <td colSpan={6} style={{ padding: 18, color: "var(--text3)" }}>
                            No data.
                          </td>
                        </tr>
                      ) : (
                        clients.map((c) => (
                          <tr key={`${c.name}|||${c.address}`}>
                            <td>
                              <button
                                type="button"
                                className="table-link"
                                onClick={() => {
                                  setClientPicked({ name: c.name, address: c.address });
                                  setClientDetailsOpen(true);
                                  setClientDetailsLoading(true);
                                  setClientDetailsErr("");
                                  setClientDetailsDaily([]);
                                  setClientDetailsTotals(null);
                                  apiDashboardClientDetailsDaily({
                                    ...reportInput,
                                    clientName: c.name,
                                    clientAddress: c.address,
                                  })
                                    .then((r) => {
                                      setClientDetailsDaily(r.daily || []);
                                      setClientDetailsTotals(r.totals);
                                    })
                                    .catch((e) => setClientDetailsErr(e instanceof Error ? e.message : "Failed to load details"))
                                    .finally(() => setClientDetailsLoading(false));
                                }}
                                title="View client details"
                              >
                                {c.name || "—"}
                              </button>
                              {c.address ? (
                                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{c.address}</div>
                              ) : null}
                            </td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.received}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.repaired}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.scrap}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{c.dispatched}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => {
                                  setClientPicked({ name: c.name, address: c.address });
                                  setClientDetailsOpen(true);
                                  setClientDetailsLoading(true);
                                  setClientDetailsErr("");
                                  setClientDetailsDaily([]);
                                  setClientDetailsTotals(null);
                                  apiDashboardClientDetailsDaily({
                                    ...reportInput,
                                    clientName: c.name,
                                    clientAddress: c.address,
                                  })
                                    .then((r) => {
                                      setClientDetailsDaily(r.daily || []);
                                      setClientDetailsTotals(r.totals);
                                    })
                                    .catch((e) => setClientDetailsErr(e instanceof Error ? e.message : "Failed to load details"))
                                    .finally(() => setClientDetailsLoading(false));
                                }}
                                disabled={clientDetailsLoading}
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {svcDetailsOpen ? (
            <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSvcDetailsOpen(false)}>
              <div className="modal" style={{ width: 920, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header">
                  <div className="modal-title">
                    Servicing Status · {svcPeriodLabel ? formatRange(svcPeriodLabel.from, svcPeriodLabel.to) : ""}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSvcDetailsOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  <div className="scroll-x" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ minWidth: 120 }}>Date</th>
                          <th>No of Inverters Received</th>
                          <th>No of Inverters Repaired</th>
                          <th>No of Inverters declared as SCRAP</th>
                          <th>No of Inverters Dispatched</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!svcDaily.length ? (
                          <tr>
                            <td colSpan={5} style={{ padding: 18, color: "var(--text3)" }}>
                              No data.
                            </td>
                          </tr>
                        ) : (
                          svcDaily.map((r) => (
                            <tr key={r.date}>
                              <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>{r.date}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.received}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.repaired}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.scrap}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.dispatched}</td>
                            </tr>
                          ))
                        )}
                        {svcTotals ? (
                          <tr>
                            <td style={{ fontWeight: 700 }}>Total</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.received}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.repaired}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.scrap}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{svcTotals.dispatched}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {clientDetailsOpen ? (
            <div
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && setClientDetailsOpen(false)}
            >
              <div className="modal" style={{ width: 920, maxWidth: "95vw" }} role="dialog" aria-modal="true">
                <div className="modal-header">
                  <div className="modal-title">
                    Client · {clientPicked?.name || "—"}{" "}
                    {svcPeriodLabel ? `· ${formatRange(svcPeriodLabel.from, svcPeriodLabel.to)}` : ""}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setClientDetailsOpen(false)}>
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  {clientDetailsErr ? <div className="form-error" style={{ marginBottom: 10 }}>{clientDetailsErr}</div> : null}
                  <div className="scroll-x" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ minWidth: 120 }}>Date</th>
                          <th>No of Inverters Received</th>
                          <th>No of Inverters Repaired</th>
                          <th>No of Inverters declared as SCRAP</th>
                          <th>No of Inverters Dispatched</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientDetailsLoading ? (
                          <tr>
                            <td colSpan={5} style={{ padding: 18, color: "var(--text3)" }}>
                              Loading…
                            </td>
                          </tr>
                        ) : !clientDetailsDaily.length ? (
                          <tr>
                            <td colSpan={5} style={{ padding: 18, color: "var(--text3)" }}>
                              No data.
                            </td>
                          </tr>
                        ) : (
                          clientDetailsDaily.map((r) => (
                            <tr key={r.date}>
                              <td style={{ fontFamily: "var(--mono)", color: "var(--text3)" }}>{r.date}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.received}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.repaired}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.scrap}</td>
                              <td style={{ fontFamily: "var(--mono)" }}>{r.dispatched}</td>
                            </tr>
                          ))
                        )}
                        {clientDetailsTotals ? (
                          <tr>
                            <td style={{ fontWeight: 700 }}>Total</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.received}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.repaired}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.scrap}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{clientDetailsTotals.dispatched}</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
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
          </div>
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Recent Tickets</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowAllDashboardTickets((v) => !v)}
                >
                  {showAllDashboardTickets ? "Show Less" : "Show All"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav("tickets")}>
                  View All →
                </button>
              </div>
            </div>
            <div
              className="scroll-x"
              style={showAllDashboardTickets ? { maxHeight: 420, overflowY: "auto" } : undefined}
            >
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Inverter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllDashboardTickets ? myTickets : myTickets.slice(0, 5)).map((t) => (
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
                        <div className="status-sla">
                          <StatusBadge status={t.status} />
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
