"use client";

import { useEffect, useMemo, useState } from "react";
import { STATUS_ORDER } from "../constants";
import type { RoleDefinition, Ticket, TicketStatus, User } from "../types";
import { canAccess } from "../utils";
import { EngineerOutcomeBadge, PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { LuSearch, LuTicket } from "react-icons/lu";
import {
  apiApprovedDispatchApprovalsList,
  apiJobCardsList,
  apiPendingDispatchApprovalsList,
  type JobCardListRow,
} from "../api";

const INWARD_STATUSES: TicketStatus[] = ["CREATED", "PICKUP_SCHEDULED", "IN_TRANSIT"];
const OUTWARD_STATUSES: TicketStatus[] = ["UNDER_DISPATCH", "DISPATCHED", "INSTALLATION_DONE"];

function includesStatus(haystack: TicketStatus[], needle: string): needle is TicketStatus {
  return (haystack as readonly string[]).includes(String(needle || "").toUpperCase());
}

type DateFilter = "ALL" | "YESTERDAY" | "WEEK" | "MONTH" | "YEAR";

function toLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseLocalDateOnly(yyyyMmDd: string): Date | null {
  const raw = String(yyyyMmDd || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, day] = raw.split("-").map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return null;
  const d = new Date(y, m - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfWeekMonday(d: Date) {
  const dd = toLocalMidnight(d);
  const dow = dd.getDay(); // 0=Sun
  const daysSinceMonday = (dow + 6) % 7; // Mon=0 ... Sun=6
  dd.setDate(dd.getDate() - daysSinceMonday);
  return dd;
}

function matchesDateFilter(createdAtYmd: string, filter: DateFilter, now = new Date()): boolean {
  if (filter === "ALL") return true;
  const created = parseLocalDateOnly(createdAtYmd);
  if (!created) return false;

  const createdMid = toLocalMidnight(created);
  const todayMid = toLocalMidnight(now);

  if (filter === "YESTERDAY") {
    const y = new Date(todayMid);
    y.setDate(y.getDate() - 1);
    return createdMid.getTime() === y.getTime();
  }

  if (filter === "WEEK") {
    return createdMid.getTime() >= startOfWeekMonday(todayMid).getTime();
  }

  if (filter === "MONTH") {
    const start = new Date(todayMid.getFullYear(), todayMid.getMonth(), 1);
    return createdMid.getTime() >= start.getTime();
  }

  if (filter === "YEAR") {
    const start = new Date(todayMid.getFullYear(), 0, 1);
    return createdMid.getTime() >= start.getTime();
  }

  return true;
}

export default function TicketsList({
  user,
  roles,
  tickets,
  initialStatusFilter,
  initialPriorityFilter,
  onView,
  onNew,
}: {
  user: User;
  roles: RoleDefinition[];
  tickets: Ticket[];
  initialStatusFilter?: string;
  initialPriorityFilter?: string;
  onView: (
    t: Ticket,
    opts?: {
      tab?: "overview" | "jobcard" | "logistics" | "sla";
      logisticsStage?: "pickup" | "under_dispatch" | "dispatch";
      notify?: string;
    },
  ) => void;
  onNew: () => void;
}) {
  const roleNorm = String(user.role || "").toUpperCase();
  const isEngineer = roleNorm === "ENGINEER";
  const isAdmin = roleNorm === "ADMIN";
  const isSales = roleNorm === "SALES";
  const canSeeAllTab = (isAdmin || isSales) && !isEngineer;
  const normalizedInitialStatus = String(initialStatusFilter || "").toUpperCase().trim();

  const initialTab: "all" | "inward" | "repaired" | "outward" | "approval_pending" | "closed" =
    isEngineer
      ? "repaired"
      : canSeeAllTab && !normalizedInitialStatus
        ? "all"
      : normalizedInitialStatus === "APPROVAL_PENDING"
        ? "approval_pending"
      : normalizedInitialStatus === "CLOSED"
        ? "closed"
        : normalizedInitialStatus === "UNDER_REPAIRED"
          ? "repaired"
          : includesStatus(OUTWARD_STATUSES, normalizedInitialStatus)
            ? "outward"
            : "inward";

  const safeInitialStatusFilter =
    isEngineer
      ? "ALL"
      : normalizedInitialStatus &&
          normalizedInitialStatus !== "OPEN" &&
          normalizedInitialStatus !== "APPROVAL_PENDING" &&
          normalizedInitialStatus !== "CLOSED"
        ? normalizedInitialStatus
        : "ALL";

  const canLoadJobCards = canAccess(roles, user.role, "jobcard", "view") && roleNorm !== "CUSTOMER";

  const [ticketsTab, setTicketsTab] = useState<
    "all" | "inward" | "repaired" | "outward" | "approval_pending" | "approved_by_admin" | "closed"
  >(initialTab);
  const [repairedTab, setRepairedTab] = useState<"all" | "repairable" | "not_repairable">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(safeInitialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState(initialPriorityFilter || "ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [jobCards, setJobCards] = useState<JobCardListRow[]>([]);
  const [jobCardsError, setJobCardsError] = useState("");

  const [approvalPendingIds, setApprovalPendingIds] = useState<string[]>([]);
  const [approvalPendingError, setApprovalPendingError] = useState("");

  const [approvedByAdminIds, setApprovedByAdminIds] = useState<string[]>([]);
  const [approvedByAdminError, setApprovedByAdminError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiPendingDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovalPendingIds((r.tickets || []).map((x) => x.ticketDbId).filter(Boolean));
          setApprovalPendingError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setApprovalPendingIds([]);
          setApprovalPendingError(
            e instanceof Error ? e.message : "Failed to load approval pending tickets",
          );
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
    if (!isSales) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiApprovedDispatchApprovalsList()
        .then((r) => {
          if (cancelled) return;
          setApprovedByAdminIds((r.tickets || []).map((x) => x.ticketDbId).filter(Boolean));
          setApprovedByAdminError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setApprovedByAdminIds([]);
          setApprovedByAdminError(
            e instanceof Error ? e.message : "Failed to load approved tickets",
          );
        });
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isSales]);

  useEffect(() => {
    if (!canLoadJobCards) return;
    let cancelled = false;
    const fetchRows = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      apiJobCardsList()
        .then((rows) => {
          if (cancelled) return;
          setJobCards(rows);
          setJobCardsError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setJobCards([]);
          setJobCardsError(e instanceof Error ? e.message : "Failed to load repaired tickets");
        });
    };
    fetchRows();
    const interval = setInterval(fetchRows, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [canLoadJobCards]);

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

  const inwardTickets = useMemo(
    () => tickets.filter((t) => INWARD_STATUSES.includes(t.status)),
    [tickets],
  );
  const repairedTickets = useMemo(() => tickets.filter((t) => t.status === "UNDER_REPAIRED"), [tickets]);
  const outwardTickets = useMemo(
    () => tickets.filter((t) => OUTWARD_STATUSES.includes(t.status)),
    [tickets],
  );
  const approvalPendingTickets = useMemo(() => {
    const set = new Set(approvalPendingIds);
    return tickets.filter((t) => set.has(t.id));
  }, [tickets, approvalPendingIds]);
  const approvedByAdminTickets = useMemo(() => {
    const set = new Set(approvedByAdminIds);
    return tickets.filter((t) => set.has(t.id));
  }, [tickets, approvedByAdminIds]);
  const closedTickets = useMemo(() => tickets.filter((t) => t.status === "CLOSED"), [tickets]);

  const allCount = useMemo(
    () => tickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [tickets, dateFilter],
  );
  const inwardCount = useMemo(
    () => inwardTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [inwardTickets, dateFilter],
  );
  const repairedCount = useMemo(
    () => repairedTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [repairedTickets, dateFilter],
  );
  const outwardCount = useMemo(
    () => outwardTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [outwardTickets, dateFilter],
  );
  const approvalPendingCount = useMemo(
    () => approvalPendingTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [approvalPendingTickets, dateFilter],
  );
  const approvedByAdminCount = useMemo(
    () => approvedByAdminTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [approvedByAdminTickets, dateFilter],
  );
  const closedCount = useMemo(
    () => closedTickets.filter((t) => matchesDateFilter(t.createdAt, dateFilter)).length,
    [closedTickets, dateFilter],
  );

  const repairedTabCounts = useMemo(() => {
    if (!canLoadJobCards) return { repairable: 0, notRepairable: 0 };
    let repairable = 0;
    let notRepairable = 0;
    repairedTickets.forEach((t) => {
      if (!matchesDateFilter(t.createdAt, dateFilter)) return;
      const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
      if (final === "REPAIRABLE") repairable++;
      if (final === "NOT_REPAIRABLE") notRepairable++;
    });
    return { repairable, notRepairable };
  }, [canLoadJobCards, repairedTickets, engineerFinalByTicketId, dateFilter]);

  const baseTickets = useMemo(() => {
    if (ticketsTab === "all") return tickets;
    if (ticketsTab === "inward") return inwardTickets;
    if (ticketsTab === "repaired") return repairedTickets;
    if (ticketsTab === "outward") return outwardTickets;
    if (ticketsTab === "approval_pending") return approvalPendingTickets;
    if (ticketsTab === "approved_by_admin") return approvedByAdminTickets;
    return closedTickets;
  }, [
    ticketsTab,
    tickets,
    inwardTickets,
    repairedTickets,
    outwardTickets,
    approvalPendingTickets,
    approvedByAdminTickets,
    closedTickets,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseTickets.filter((t) => {
      const matchSearch =
        !q ||
        t.ticketId.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.faultDescription.toLowerCase().includes(q);
      const matchDate = matchesDateFilter(t.createdAt, dateFilter);
      const matchStatus = statusFilter === "ALL" ? true : t.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchSearch && matchDate && matchStatus && matchPriority;
    });
  }, [baseTickets, search, statusFilter, priorityFilter, dateFilter]);

  const filteredRepaired = useMemo(() => {
    if (ticketsTab !== "repaired" || !canLoadJobCards) return filtered;
    if (repairedTab === "all") return filtered;
    return filtered.filter((t) => {
      const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
      if (repairedTab === "repairable") return final === "REPAIRABLE";
      return final === "NOT_REPAIRABLE";
    });
  }, [filtered, ticketsTab, canLoadJobCards, repairedTab, engineerFinalByTicketId]);

  const rows = ticketsTab === "repaired" ? filteredRepaired : filtered;

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = rows.length ? startIndex + 1 : 0;
  const showingTo = Math.min(startIndex + PAGE_SIZE, rows.length);

  const statusFilterLabel =
    ticketsTab === "all"
      ? "All Status"
      : ticketsTab === "inward"
      ? "All Inward Status"
      : ticketsTab === "outward"
        ? "All Outward Status"
        : "All Status";

  const statusOptions: TicketStatus[] =
    ticketsTab === "all"
      ? STATUS_ORDER
      : ticketsTab === "inward"
      ? STATUS_ORDER.filter((s) => INWARD_STATUSES.includes(s))
      : ticketsTab === "outward"
        ? STATUS_ORDER.filter((s) => OUTWARD_STATUSES.includes(s))
        : [];

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div>
          <div className="page-title">Service Tickets</div>
          <div className="page-sub">
            {rows.length} tickets{" "}
            {user.role === "ENGINEER" ? "assigned to you or in Under Repaired" : "found"}
          </div>
        </div>
        <div className="page-header-actions">
          {canAccess(roles, user.role, "tickets", "create") && (
            <button className="btn btn-accent" onClick={onNew}>
              + New Ticket
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="tabs" style={{ marginBottom: 0 }}>
          {canSeeAllTab ? (
            <div
              className={`tab ${ticketsTab === "all" ? "active" : ""}`}
              onClick={() => {
                setTicketsTab("all");
                setStatusFilter("ALL");
                setRepairedTab("all");
                setPage(1);
              }}
            >
              All Tickets ({allCount})
            </div>
          ) : null}
          {!isEngineer ? (
            <div
              className={`tab ${ticketsTab === "inward" ? "active" : ""}`}
              onClick={() => {
                setTicketsTab("inward");
                setStatusFilter("ALL");
                setRepairedTab("all");
                setPage(1);
              }}
            >
              Inward Stage ({inwardCount})
            </div>
          ) : null}
          <div
            className={`tab ${ticketsTab === "repaired" ? "active" : ""}`}
            onClick={() => {
              setTicketsTab("repaired");
              setStatusFilter("ALL");
              setRepairedTab("all");
              setPage(1);
            }}
          >
            Under Progress ({repairedCount})
          </div>
          <div
            className={`tab ${ticketsTab === "outward" ? "active" : ""}`}
            onClick={() => {
              setTicketsTab("outward");
              setStatusFilter("ALL");
              setRepairedTab("all");
              setPage(1);
            }}
          >
            Outward ({outwardCount})
          </div>
          {isAdmin ? (
            <div
              className={`tab ${ticketsTab === "approval_pending" ? "active" : ""}`}
              onClick={() => {
                setTicketsTab("approval_pending");
                setStatusFilter("ALL");
                setRepairedTab("all");
                setPage(1);
              }}
              title={approvalPendingError ? approvalPendingError : undefined}
            >
              Approval Pending ({approvalPendingCount})
            </div>
          ) : null}
          {isSales ? (
            <div
              className={`tab ${ticketsTab === "approved_by_admin" ? "active" : ""}`}
              onClick={() => {
                setTicketsTab("approved_by_admin");
                setStatusFilter("ALL");
                setRepairedTab("all");
                setPage(1);
              }}
              title={approvedByAdminError ? approvedByAdminError : undefined}
            >
              Approved by Admin ({approvedByAdminCount})
            </div>
          ) : null}
          <div
            className={`tab ${ticketsTab === "closed" ? "active" : ""}`}
            onClick={() => {
              setTicketsTab("closed");
              setStatusFilter("ALL");
              setRepairedTab("all");
              setPage(1);
            }}
          >
            Closed Tickets ({closedCount})
          </div>
        </div>

        <div className="table-header">
          <div className="table-actions">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden>
                <LuSearch />
              </span>
              <input
                className="search-input"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {statusOptions.length ? (
              <select
                className="select-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">{statusFilterLabel}</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            ) : null}

            <select
              className="select-filter"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Priority</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <select
              className="select-filter"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as DateFilter);
                setPage(1);
              }}
            >
              <option value="ALL">All Dates</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
              <option value="YEAR">This Year</option>
            </select>
          </div>
        </div>

        {ticketsTab === "repaired" && canLoadJobCards && !isEngineer ? (
          <div style={{ padding: "16px 20px 0" }}>
            {jobCardsError ? (
              <div className="empty-state" style={{ marginTop: 10, marginBottom: 16 }}>
                <div className="empty-icon" aria-hidden>
                  <LuTicket />
                </div>
                <div className="empty-text">{jobCardsError}</div>
              </div>
            ) : (
              <div className="tabs" style={{ marginBottom: 14 }}>
                <div
                  className={`tab ${repairedTab === "all" ? "active" : ""}`}
                  onClick={() => {
                    setRepairedTab("all");
                    setPage(1);
                  }}
                >
                  All ({repairedCount})
                </div>
                <div
                  className={`tab ${repairedTab === "repairable" ? "active" : ""}`}
                  onClick={() => {
                    setRepairedTab("repairable");
                    setPage(1);
                  }}
                >
                  Repairable ({repairedTabCounts.repairable})
                </div>
                <div
                  className={`tab ${repairedTab === "not_repairable" ? "active" : ""}`}
                  onClick={() => {
                    setRepairedTab("not_repairable");
                    setPage(1);
                  }}
                >
                  Non-Repairable ({repairedTabCounts.notRepairable})
                </div>
              </div>
            )}
          </div>
        ) : null}
        {ticketsTab === "approved_by_admin" ? (
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              These tickets are approved by Admin for dispatch. Click Ticket ID to open Logistics → Dispatch.
            </div>
            {approvedByAdminError ? (
              <div className="form-error" style={{ marginTop: 10 }}>
                {approvedByAdminError}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Sr No.</th>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Inverter</th>
                <th>Fault</th>
                <th>Priority</th>
                <th>Status / SLA</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuTicket />
                      </div>
                      <div className="empty-text">No tickets found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((t, idx) => {
                  const final = String(engineerFinalByTicketId.get(t.id) || "").toUpperCase().trim();
                  const showOutcome = ticketsTab === "repaired" && canLoadJobCards && !!final;
                  const outcome =
                    final === "NOT_REPAIRABLE" ? "SCRAP" : final === "REPAIRABLE" ? "REPAIRED" : null;

                  return (
                    <tr key={t.id}>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          fontFamily: "var(--mono)",
                        }}
                      >
                        {startIndex + idx + 1}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="td-mono table-link"
                          onClick={() =>
                            onView(
                              t,
                              ticketsTab === "approval_pending"
                                ? { tab: "logistics" }
                                : ticketsTab === "approved_by_admin"
                                  ? {
                                      tab: "logistics",
                                      logisticsStage: "dispatch",
                                      notify: "Admin approved dispatch. Dispatch tab opened.",
                                    }
                                : ticketsTab === "repaired" && canLoadJobCards
                                  ? { tab: "jobcard" }
                                  : undefined,
                            )
                          }
                          title="View ticket"
                        >
                          {t.ticketId}
                        </button>
                      </td>
                      <td style={{ fontWeight: 500 }}>{t.customer}</td>
                      <td>
                        <span className="tag">
                          {t.inverterMake} {t.inverterModel}
                        </span>
                      </td>
                      <td
                        style={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "var(--text2)",
                          fontSize: 12,
                        }}
                      >
                        {t.faultDescription}
                      </td>
                      <td>
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td>
                        <div className="status-sla">
                          <StatusBadge status={t.status} />
                          <SlaBadge status={t.slaStatus} />
                          {showOutcome && outcome ? <EngineerOutcomeBadge outcome={outcome} /> : null}
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          fontFamily: "var(--mono)",
                        }}
                      >
                        {t.createdAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {rows.length > PAGE_SIZE ? (
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              borderTop: "1px solid var(--border2)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--text3)" }}>
              Showing {showingFrom}-{showingTo} of {rows.length}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, Math.min(totalPages, p - 1)))}
              >
                Prev
              </button>
              <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                Page {currentPage}/{totalPages}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.max(1, Math.min(totalPages, p + 1)))}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
