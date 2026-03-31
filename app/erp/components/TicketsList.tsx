"use client";

import { useMemo, useState } from "react";
import { STATUS_ORDER } from "../constants";
import type { RoleDefinition, Ticket, User } from "../types";
import { canAccess } from "../utils";
import { PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { LuSearch, LuTicket } from "react-icons/lu";

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
  onView: (t: Ticket) => void;
  onNew: () => void;
}) {
  const normalizedInitialStatus = String(initialStatusFilter || "").toUpperCase().trim();
  const initialTab: "open" | "closed" =
    normalizedInitialStatus === "CLOSED" ? "closed" : "open";
  const safeInitialStatusFilter =
    normalizedInitialStatus &&
    normalizedInitialStatus !== "OPEN" &&
    normalizedInitialStatus !== "CLOSED"
      ? normalizedInitialStatus
      : "ALL";

  const [search, setSearch] = useState("");
  const [ticketsTab, setTicketsTab] = useState<"open" | "closed">(initialTab);
  const [statusFilter, setStatusFilter] = useState(safeInitialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState(initialPriorityFilter || "ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const openCount = useMemo(
    () => tickets.filter((t) => t.status !== "CLOSED").length,
    [tickets],
  );
  const closedCount = useMemo(
    () => tickets.filter((t) => t.status === "CLOSED").length,
    [tickets],
  );

  const myTickets = useMemo(() => {
    return ticketsTab === "closed"
      ? tickets.filter((t) => t.status === "CLOSED")
      : tickets.filter((t) => t.status !== "CLOSED");
  }, [tickets, ticketsTab]);

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

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div>
          <div className="page-title">Service Tickets</div>
          <div className="page-sub">
            {filtered.length} tickets{" "}
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

        {filtered.length > PAGE_SIZE ? (
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
