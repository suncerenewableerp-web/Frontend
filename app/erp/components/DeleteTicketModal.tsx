"use client";

import { useMemo } from "react";
import type { Ticket } from "../types";

export default function DeleteTicketModal({
  open,
  ticket,
  confirmId,
  onConfirmIdChange,
  busy,
  error,
  onClose,
  onDelete,
}: {
  open: boolean;
  ticket: Ticket | null;
  confirmId: string;
  onConfirmIdChange: (v: string) => void;
  busy: boolean;
  error: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  const match = useMemo(() => {
    if (!ticket) return false;
    const raw = String(confirmId || "").trim();
    if (!raw) return false;
    if (raw === ticket.id) return true;
    return raw.toUpperCase() === String(ticket.ticketId || "").trim().toUpperCase();
  }, [confirmId, ticket]);

  if (!open || !ticket) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 640, maxWidth: "92vw" }}>
        <div className="modal-header">
          <div className="modal-title">Delete Ticket</div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
            This action permanently deletes the ticket and its linked jobcards/logistics.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>
              Ticket ID: <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{ticket.ticketId}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>
              DB ID: <span style={{ fontFamily: "var(--mono)" }}>{ticket.id}</span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Type Ticket ID (or DB ID) to confirm</label>
            <input
              className="form-input"
              value={confirmId}
              onChange={(e) => onConfirmIdChange(e.target.value)}
              placeholder={ticket.ticketId}
              autoFocus
            />
          </div>

          {error ? (
            <div className="form-error" style={{ marginTop: 10 }}>
              {error}
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={!match || busy}
            onClick={onDelete}
            title={!match ? "Enter matching Ticket ID to enable delete" : "Delete ticket"}
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

