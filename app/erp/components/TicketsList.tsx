"use client";

import { useEffect, useMemo, useState } from "react";
import { STATUS_ORDER } from "../constants";
import type { RoleDefinition, Ticket, User } from "../types";
import { canAccess } from "../utils";
import { EngineerOutcomeBadge, PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { LuSearch, LuTicket } from "react-icons/lu";
import { apiJobCardsList, type JobCardListRow } from "../api";

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
  onView: (t: Ticket, opts?: { tab?: "overview" | "jobcard" | "logistics" | "sla" }) => void;
  onNew: () => void;
}) {
  const normalizedInitialStatus = String(initialStatusFilter || "").toUpperCase().trim();
  const initialTab: "open" | "updates" | "closed" =
    normalizedInitialStatus === "CLOSED" ? "closed" : "open";
  const safeInitialStatusFilter =
    normalizedInitialStatus &&
    normalizedInitialStatus !== "OPEN" &&
    normalizedInitialStatus !== "CLOSED"
      ? normalizedInitialStatus
      : "ALL";

  const [search, setSearch] = useState("");
  const roleNorm = String(user.role || "").toUpperCase();
  const canSeeUpdatesTab = roleNorm === "SALES" || roleNorm === "ADMIN";
  const [ticketsTab, setTicketsTab] = useState<"open" | "updates" | "closed">(initialTab);
  const [updatesTab, setUpdatesTab] = useState<"repairable" | "not_repairable">("repairable");
  const [statusFilter, setStatusFilter] = useState(safeInitialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState(initialPriorityFilter || "ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const [jobCards, setJobCards] = useState<JobCardListRow[]>([]);
  const [jobCardsError, setJobCardsError] = useState("");

  useEffect(() => {
    if (!canSeeUpdatesTab) return;
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
  }, [canSeeUpdatesTab]);

  const engineerUpdateRows = useMemo(() => {
    if (!canSeeUpdatesTab) return [];
    const latestByTicket = new Map<string, JobCardListRow>();
    (jobCards || []).forEach((r) => {
      const t = r?.ticket;
      const ticketId = String(t?.id || "");
      if (!ticketId) return;
      const prev = latestByTicket.get(ticketId);
      if (!prev || (r.updatedAtMs || 0) >= (prev.updatedAtMs || 0)) latestByTicket.set(ticketId, r);
    });
    return Array.from(latestByTicket.values());
  }, [canSeeUpdatesTab, jobCards]);

  const repairableRows = useMemo(() => {
    return engineerUpdateRows.filter((r) => {
      const st = String(r?.ticket?.status || "").toUpperCase();
      const final = String(r?.engineerFinalStatus || "").toUpperCase().trim();
      // Show only after engineer finalizes.
      return st === "UNDER_REPAIRED" && final === "REPAIRABLE";
    });
  }, [engineerUpdateRows]);

  const notRepairableRows = useMemo(() => {
    return engineerUpdateRows.filter((r) => {
      const final = String(r?.engineerFinalStatus || "").toUpperCase().trim();
      return final === "NOT_REPAIRABLE";
    });
  }, [engineerUpdateRows]);

  const repairableTickets = useMemo(() => repairableRows.map((r) => r.ticket), [repairableRows]);
  const notRepairableTickets = useMemo(
    () => notRepairableRows.map((r) => r.ticket),
    [notRepairableRows],
  );
  const updatesTicketIds = useMemo(
    () => new Set([...repairableTickets, ...notRepairableTickets].map((t) => t.id)),
    [repairableTickets, notRepairableTickets],
  );

  const openCount = useMemo(
    () =>
      tickets.filter((t) => {
        if (t.status === "CLOSED") return false;
        if (canSeeUpdatesTab && updatesTicketIds.has(t.id)) return false;
        return true;
      }).length,
    [tickets, canSeeUpdatesTab, updatesTicketIds],
  );
  const closedCount = useMemo(
    () =>
      tickets.filter((t) => {
        if (t.status !== "CLOSED") return false;
        if (canSeeUpdatesTab && updatesTicketIds.has(t.id)) return false;
        return true;
      }).length,
    [tickets, canSeeUpdatesTab, updatesTicketIds],
  );
  const updatesCount = useMemo(
    () => repairableTickets.length + notRepairableTickets.length,
    [repairableTickets, notRepairableTickets],
  );

  const myTickets = useMemo(() => {
    if (ticketsTab === "closed") return tickets.filter((t) => t.status === "CLOSED");
    if (ticketsTab === "updates") return [];
    return tickets.filter((t) => {
      if (t.status === "CLOSED") return false;
      if (canSeeUpdatesTab && updatesTicketIds.has(t.id)) return false;
      return true;
    });
  }, [tickets, ticketsTab, canSeeUpdatesTab, updatesTicketIds]);

  const filteredRepairable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return repairableTickets.filter((t) => {
      const matchSearch =
        !q ||
        t.ticketId.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.faultDescription.toLowerCase().includes(q);
      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [repairableTickets, search, priorityFilter]);

  const filteredNotRepairable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notRepairableTickets.filter((t) => {
      const matchSearch =
        !q ||
        t.ticketId.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.faultDescription.toLowerCase().includes(q);
      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [notRepairableTickets, search, priorityFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myTickets.filter((t) => {
      const matchSearch =
        !q ||
        t.ticketId.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.faultDescription.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" ? true : t.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [myTickets, search, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const showingFrom = filtered.length ? startIndex + 1 : 0;
  const showingTo = Math.min(startIndex + PAGE_SIZE, filtered.length);

  const foundCount =
    ticketsTab === "updates"
      ? filteredRepairable.length + filteredNotRepairable.length
      : filtered.length;

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div>
          <div className="page-title">Service Tickets</div>
          <div className="page-sub">
            {foundCount} tickets{" "}
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
          <div
            className={`tab ${ticketsTab === "open" ? "active" : ""}`}
            onClick={() => {
              setTicketsTab("open");
              setStatusFilter("ALL");
              setPage(1);
            }}
          >
            Open Tickets ({openCount})
          </div>
          {canSeeUpdatesTab ? (
            <div
              className={`tab ${ticketsTab === "updates" ? "active" : ""}`}
              onClick={() => {
                setTicketsTab("updates");
                setStatusFilter("ALL");
                setPage(1);
                setUpdatesTab("repairable");
              }}
            >
              Engineer Updates ({updatesCount})
            </div>
          ) : null}
          <div
            className={`tab ${ticketsTab === "closed" ? "active" : ""}`}
            onClick={() => {
              setTicketsTab("closed");
              setStatusFilter("ALL");
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
            {ticketsTab === "open" ? (
              <select
                className="select-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Open Status</option>
                {STATUS_ORDER.filter((s) => s !== "CLOSED").map((s) => (
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
          </div>
        </div>
        {ticketsTab === "updates" ? (
          <div style={{ padding: "16px 20px" }}>
            {jobCardsError ? (
              <div className="empty-state" style={{ marginTop: 10 }}>
                <div className="empty-icon" aria-hidden>
                  <LuTicket />
                </div>
                <div className="empty-text">{jobCardsError}</div>
              </div>
            ) : (
              <>
                <div className="tabs" style={{ marginBottom: 14 }}>
                  <div
                    className={`tab ${updatesTab === "repairable" ? "active" : ""}`}
                    onClick={() => setUpdatesTab("repairable")}
                  >
                    Repairable ({filteredRepairable.length})
                  </div>
                  <div
                    className={`tab ${updatesTab === "not_repairable" ? "active" : ""}`}
                    onClick={() => setUpdatesTab("not_repairable")}
                  >
                    Not Repairable ({filteredNotRepairable.length})
                  </div>
                </div>
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
                      {(
                        updatesTab === "repairable" ? filteredRepairable : filteredNotRepairable
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <div className="empty-state">
                              <div className="empty-icon" aria-hidden>
                                <LuTicket />
                              </div>
                              <div className="empty-text">
                                {updatesTab === "repairable"
                                  ? "No repairable tickets found"
                                  : "No not-repairable tickets found"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        (updatesTab === "repairable" ? filteredRepairable : filteredNotRepairable).map(
                          (t, idx) => (
                            <tr key={t.id}>
                              <td
                                style={{
                                  fontSize: 12,
                                  color: "var(--text3)",
                                  fontFamily: "var(--mono)",
                                }}
                              >
                                {idx + 1}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="td-mono table-link"
                                  onClick={() => onView(t, { tab: "jobcard" })}
                                  title="View job card"
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
                                  <EngineerOutcomeBadge
                                    outcome={updatesTab === "repairable" ? "REPAIRED" : "SCRAP"}
                                  />
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
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
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
                {filtered.length === 0 ? (
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
                  pageRows.map((t, idx) => (
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
                          onClick={() => onView(t)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {ticketsTab !== "updates" && filtered.length > PAGE_SIZE ? (
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
              Showing {showingFrom}-{showingTo} of {filtered.length}
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
