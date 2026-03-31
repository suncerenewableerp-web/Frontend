"use client";

import { useMemo, useState } from "react";
import type { Ticket } from "../types";
import DatePicker from "./DatePicker";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function SchedulePickupModal({
  tickets,
  onClose,
  onSchedule,
}: {
  tickets: Ticket[];
  onClose: () => void;
  onSchedule: (input: {
    ticketId: string;
    pickupDate: string;
    courierName: string;
    lrNumber: string;
    pickupLocation: string;
  }) => Promise<void>;
}) {
  const eligible = useMemo(
    () => tickets.filter((t) => t.status === "CREATED"),
    [tickets],
  );

  const [ticketId, setTicketId] = useState(eligible[0]?.id || "");
  const [pickupDate, setPickupDate] = useState(() =>
    toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );
  const [courierName, setCourierName] = useState("BlueDart");
  const [lrNumber, setLrNumber] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eligibleIds = useMemo(() => new Set(eligible.map((t) => t.id)), [eligible]);
  const selectedTicketId = eligibleIds.has(ticketId) ? ticketId : eligible[0]?.id || "";

  const handleSubmit = () => {
    if (!selectedTicketId) {
      setError("Please select a ticket");
      return;
    }

    setLoading(true);
    setError("");
    onSchedule({
      ticketId: selectedTicketId,
      pickupDate,
      courierName,
      lrNumber,
      pickupLocation,
    })
      .then(() => onClose())
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to schedule pickup"),
      )
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Schedule Pickup</div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
              {error}
            </div>
          )}

          <div className="form-section">Ticket</div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Select ticket *</label>
              <select
                className="form-select"
                value={selectedTicketId}
                onChange={(e) => setTicketId(e.target.value)}
                disabled={eligible.length === 0}
              >
                {eligible.length === 0 ? (
                  <option value="">No tickets available for pickup</option>
                ) : (
                  eligible.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ticketId} — {t.customer}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="form-section">Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Pickup date</label>
              <DatePicker
                value={pickupDate}
                onChange={setPickupDate}
                placeholder="Select pickup date"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Courier</label>
              <input
                className="form-input"
                placeholder="e.g. BlueDart"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">LR number</label>
              <input
                className="form-input"
                placeholder="e.g. BD2026..."
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value)}
              />
            </div>
            <div className="form-group full">
              <label className="form-label">Pickup location</label>
              <input
                className="form-input"
                placeholder="Customer site / warehouse"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>
            Scheduling will move the ticket status to{" "}
            <span className="tag">PICKUP SCHEDULED</span>.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={loading || !ticketId}
          >
            {loading ? "Scheduling..." : "Schedule Pickup →"}
          </button>
        </div>
      </div>
    </div>
  );
}
