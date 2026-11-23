"use client";

import { useEffect, useState } from "react";
import { apiGetInverterHistory, type InverterHistoryTicket } from "../api";
import { StatusBadge } from "./Badges";

export default function InverterHistoryModal({
  open,
  serialNo,
  currentTicketId,
  onClose,
  onSelectTicket,
}: {
  open: boolean;
  serialNo: string;
  currentTicketId?: string;
  onClose: () => void;
  onSelectTicket?: (ticketId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<InverterHistoryTicket[]>([]);

  useEffect(() => {
    if (!open || !serialNo || serialNo.trim().toUpperCase() === "NA") {
      setTickets([]);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    apiGetInverterHistory(serialNo)
      .then((res) => {
        if (!active) return;
        setTickets(res.tickets || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load inverter history");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, serialNo]);

  if (!open) return null;

  const firstTicket = tickets[0];
  const inverterInfo = firstTicket?.inverter;

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 1200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ width: 880, maxWidth: "96vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="modal-title">Inverter Service History</div>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 13,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(139, 69, 19, 0.1)",
                color: "var(--accent)",
                fontWeight: 600,
              }}
            >
              {serialNo}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "16px 22px" }}>
          {inverterInfo && (
            <div
              style={{
                padding: "10px 14px",
                marginBottom: 16,
                borderRadius: 8,
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                fontSize: 13,
              }}
            >
              <div>
                <span style={{ color: "var(--text3)", marginRight: 6 }}>Make:</span>
                <strong>{inverterInfo.make || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text3)", marginRight: 6 }}>Model:</span>
                <strong>{inverterInfo.model || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text3)", marginRight: 6 }}>Capacity:</span>
                <strong>{inverterInfo.capacity || "—"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text3)", marginRight: 6 }}>Total Lifetime Tickets:</span>
                <strong style={{ color: "var(--accent)" }}>{tickets.length}</strong>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text3)" }}>
              Loading inverter history...
            </div>
          ) : error ? (
            <div className="form-error" style={{ marginBottom: 14 }}>
              {error}
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text3)" }}>
              No service tickets found for serial number &quot;{serialNo}&quot;.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tickets.map((t, idx) => {
                const isCurrent = currentTicketId && (t.ticketId === currentTicketId || t._id === currentTicketId);
                const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—";
                const jobs = t.jobCard?.serviceJobs || [];

                return (
                  <div
                    key={t._id || idx}
                    style={{
                      border: isCurrent ? "2px solid var(--accent)" : "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      background: isCurrent ? "rgba(139, 69, 19, 0.03)" : "var(--bg)",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15, color: "var(--accent)" }}>
                          {t.ticketId}
                        </span>
                        {isCurrent && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background: "var(--accent)",
                              color: "#fff",
                              padding: "1px 6px",
                              borderRadius: 4,
                            }}
                          >
                            Current
                          </span>
                        )}
                        <StatusBadge status={t.status as any} />
                        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                          {dateStr}
                        </span>
                      </div>

                      {onSelectTicket && !isCurrent && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "3px 10px", fontSize: 12 }}
                          onClick={() => {
                            onSelectTicket(t._id || t.ticketId);
                            onClose();
                          }}
                        >
                          View Ticket →
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <div>
                        <span style={{ color: "var(--text3)" }}>Customer: </span>
                        <span>{t.customer?.name || t.customer?.company || "—"}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text3)" }}>Fault: </span>
                        <span>{t.issue?.description || "—"}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text3)" }}>Error Code: </span>
                        <span style={{ fontFamily: "var(--mono)" }}>{t.issue?.errorCode || "—"}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text3)" }}>Service Type: </span>
                        <span>{t.serviceType || "STANDARD"}</span>
                      </div>
                    </div>

                    {/* Job Card & Parts History */}
                    {t.jobCard && (
                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: "1px dashed var(--border)",
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: "var(--text2)" }}>
                            Job Card: {t.jobCard.jobNo || "—"}
                          </span>
                          {t.jobCard.currentStatus && (
                            <span style={{ fontSize: 11, color: "var(--text3)" }}>
                              ({t.jobCard.currentStatus})
                            </span>
                          )}
                        </div>

                        {jobs.length > 0 ? (
                          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {jobs.map((j, jIdx) => (
                              <span
                                key={jIdx}
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "var(--bg2)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                🔧 {j.jobName || "Repair"}
                                {j.componentsUsed && j.componentsUsed.length > 0
                                  ? `: ${j.componentsUsed.map((c) => c.name).join(", ")}`
                                  : ""}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>
                            No spare parts recorded on this jobcard.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: "12px 20px" }}>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
