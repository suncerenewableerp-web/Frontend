"use client";

import type { Ticket, User } from "../types";
import { StatusBadge } from "./Badges";

export default function JobCards({ tickets, user }: { tickets: Ticket[]; user: User }) {
  const myTickets =
    user.role === "ENGINEER"
      ? tickets.filter(
          (t) =>
            t.assignedEngineer === user.name &&
            ["DIAGNOSIS", "REPAIR", "TESTING"].includes(t.status),
        )
      : tickets.filter((t) => ["DIAGNOSIS", "REPAIR", "TESTING"].includes(t.status));

  return (
    <div className="content">
      <div className="page-header">
        <div className="page-title">Job Cards</div>
        <div className="page-sub">{myTickets.length} active jobs</div>
      </div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Active Job Cards</div>
        </div>
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>Job Card</th>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Stage</th>
                <th>Engineer</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon">🔧</div>
                      <div className="empty-text">No active job cards</div>
                    </div>
                  </td>
                </tr>
              ) : (
                myTickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="td-mono">
                        JC-{t.ticketId.replace("SR-", "")}
                      </span>
                    </td>
                    <td>
                      <span className="td-mono">{t.ticketId}</span>
                    </td>
                    <td>{t.customer}</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>{t.assignedEngineer}</td>
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
