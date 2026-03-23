"use client";

import { useState } from "react";
import { STATUS_ORDER } from "../constants";
import type { RoleDefinition, Ticket, User } from "../types";
import { canAccess } from "../utils";
import { PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { LuSearch, LuTicket } from "react-icons/lu";

export default function TicketsList({
  user,
  roles,
  tickets,
  onView,
  onNew,
}: {
  user: User;
  roles: RoleDefinition[];
  tickets: Ticket[];
  onView: (t: Ticket) => void;
  onNew: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const myTickets = tickets;

  const filtered = myTickets.filter((t) => {
    const matchSearch =
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.faultDescription.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchPriority =
      priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="content">
      <div className="page-header page-header-row">
        <div>
          <div className="page-title">Service Tickets</div>
          <div className="page-sub">
            {filtered.length} tickets{" "}
            {user.role === "ENGINEER" ? "assigned to you" : "found"}
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className="select-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
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
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Inverter</th>
                <th>Fault</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA</th>
                {user.role !== "CUSTOMER" && <th>Engineer</th>}
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-icon" aria-hidden>
                        <LuTicket />
                      </div>
                      <div className="empty-text">No tickets found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="td-mono">{t.ticketId}</span>
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
                      <StatusBadge status={t.status} />
                    </td>
                    <td>
                      <SlaBadge status={t.slaStatus} />
                    </td>
                    {user.role !== "CUSTOMER" && (
                      <td style={{ fontSize: 12, color: "var(--text2)" }}>
                        {t.assignedEngineer}
                      </td>
                    )}
                    <td
                      style={{
                        fontSize: 12,
                        color: "var(--text3)",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {t.createdAt}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => onView(t)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
