"use client";

import type { Ticket, User } from "../types";
import { PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import { STATUS_COLORS } from "../constants";
import { LuCircleCheck, LuSiren, LuTicket, LuTriangleAlert } from "react-icons/lu";

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
  onViewTicket: (t: Ticket) => void;
  onOpenTickets: (preset?: { status?: string; priority?: string }) => void;
}) {
  const isCustomer = String(user.role || "").toUpperCase() === "CUSTOMER";
  const open = tickets.filter((t) => t.status !== "CLOSED").length;
  const closed = tickets.filter((t) => t.status === "CLOSED").length;
  const breached = tickets.filter((t) => t.slaStatus === "BREACHED").length;
  const high = tickets.filter((t) => t.priority === "HIGH" && t.status !== "CLOSED").length;

  const myTickets = tickets;

  const statusCounts: Record<string, number> = {};
  tickets.forEach((t) => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(statusCounts), 1);

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
                label: "Open Tickets",
                value: open,
                sub: "Active service requests",
                color: "#6b3a1f",
                Icon: LuTicket,
                onClick: () => onOpenTickets({ status: "OPEN" }),
              },
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
