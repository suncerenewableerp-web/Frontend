"use client";

import { useState } from "react";
import { STATUS_ORDER } from "../constants";
import type { RoleDefinition, Ticket, TicketStatus, User } from "../types";
import { canAccess } from "../utils";
import { Badge, PriorityBadge, SlaBadge, StatusBadge } from "./Badges";
import TicketTimeline from "./TicketTimeline";

export default function TicketDetail({
  ticket,
  user,
  roles,
  onBack,
  onUpdateStatus,
}: {
  ticket: Ticket;
  user: User;
  roles: RoleDefinition[];
  onBack: () => void;
  onUpdateStatus: (status: TicketStatus) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [updating, setUpdating] = useState(false);
  const currentIdx = STATUS_ORDER.indexOf(ticket.status);

  return (
    <div className="content">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {ticket.ticketId}
            </span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <SlaBadge status={ticket.slaStatus} />
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
            {ticket.customer} · {ticket.inverterMake} {ticket.inverterModel} ({ticket.capacity})
          </div>
        </div>
      </div>

      <TicketTimeline currentStatus={ticket.status} />

      <div className="tabs">
        {["overview", "jobcard", "logistics", "sla"].map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="detail-grid">
            {[
              ["Inverter Make", ticket.inverterMake],
              ["Model", ticket.inverterModel],
              ["Capacity", ticket.capacity],
              ["Serial Number", ticket.serialNumber],
              ["Error Code", ticket.errorCode || "—"],
            ].map(([label, val]) => (
              <div key={label} className="detail-card">
                <div className="detail-label">{label}</div>
                <div className="detail-value">{val}</div>
              </div>
            ))}
            <div className="detail-card">
              <div className="detail-label">Warranty</div>
              <div className="detail-value">
                <Badge
                  label={ticket.warrantyStatus ? "In Warranty" : "Out of Warranty"}
                  color={ticket.warrantyStatus ? "#16a34a" : "#c0392b"}
                />
              </div>
            </div>
          </div>

          <div className="table-card" style={{ marginBottom: 16 }}>
            <div className="table-header">
              <div className="table-title">Fault Description</div>
            </div>
            <div style={{ padding: "16px 20px", fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>
              {ticket.faultDescription}
            </div>
          </div>

          {canAccess(roles, user.role, "tickets", "edit") && ticket.status !== "CLOSED" && (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Update Status</div>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", gap: 10, alignItems: "center" }}>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  style={{ flex: 1 }}
                >
                  {STATUS_ORDER.map((s) => (
                    <option
                      key={s}
                      value={s}
                      disabled={STATUS_ORDER.indexOf(s) < currentIdx}
                    >
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-accent"
                  disabled={updating}
                  onClick={() => {
                    setUpdating(true);
                    onUpdateStatus(newStatus)
                      .catch(() => {})
                      .finally(() => setUpdating(false));
                  }}
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "jobcard" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Job Card — {ticket.ticketId}</div>
          </div>
          <div style={{ padding: "20px" }}>
            <div className="form-section">Diagnosis</div>
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-label">Error Code</div>
                <div className="detail-value" style={{ fontFamily: "var(--mono)", color: "var(--red)" }}>
                  {ticket.errorCode}
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Root Cause</div>
                <div className="detail-value" style={{ color: "var(--text2)" }}>
                  Under Analysis
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Diagnosed By</div>
                <div className="detail-value">{ticket.assignedEngineer}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "logistics" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">Logistics & Pickup</div>
          </div>
          <div style={{ padding: "20px" }}>
            <div className="detail-grid">
              <div className="detail-card">
                <div className="detail-label">Pickup Date</div>
                <div className="detail-value">2026-03-16</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Courier</div>
                <div className="detail-value">BlueDart Express</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">LR Number</div>
                <div className="detail-value" style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: 12 }}>
                  BD2026031600123
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sla" && (
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">SLA Monitoring</div>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 20 }}>
              <SlaBadge status={ticket.slaStatus} />
            </div>
            {[
              { label: "Response Time", limit: "24h", taken: "6h", pct: 25, color: "#16a34a" },
              { label: "Pickup Time", limit: "48h", taken: "36h", pct: 75, color: "#d97706" },
              { label: "Diagnosis Time", limit: "24h", taken: "28h", pct: 117, color: "#c0392b" },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: item.color }}>
                    {item.taken} / {item.limit}
                  </span>
                </div>
                <div className="sla-bar">
                  <div className="sla-fill" style={{ width: `${Math.min(item.pct, 100)}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
