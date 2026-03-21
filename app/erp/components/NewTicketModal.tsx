"use client";

import { useState } from "react";
import type { TicketCreateInput } from "../api";

export default function NewTicketModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (t: TicketCreateInput) => Promise<void>;
}) {
  const [form, setForm] = useState({
    customer: "",
    inverterMake: "",
    inverterModel: "",
    capacity: "",
    serialNumber: "",
    faultDescription: "",
    errorCode: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    warrantyStatus: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setLoading(true);
    setError("");
    onSubmit({
      customer: form.customer || "New Customer",
      inverterMake: form.inverterMake || undefined,
      inverterModel: form.inverterModel,
      capacity: form.capacity || undefined,
      serialNumber: form.serialNumber || undefined,
      faultDescription: form.faultDescription,
      errorCode: form.errorCode || undefined,
      priority: form.priority,
      warrantyStatus: form.warrantyStatus,
    })
      .then(() => onClose())
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to create ticket"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Create New Service Ticket</div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="form-error" style={{ marginBottom: 12, marginTop: -6 }}>
              {error}
            </div>
          )}
          <div className="form-section">Customer Information</div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Customer Name *</label>
              <input
                className="form-input"
                placeholder="Enter customer name"
                onChange={(e) => set("customer", e.target.value)}
              />
            </div>
          </div>
          <div className="form-section">Inverter Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Make / Brand *</label>
              <input
                className="form-input"
                placeholder="e.g. ABB, SMA"
                onChange={(e) => set("inverterMake", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                className="form-input"
                placeholder="Model number"
                onChange={(e) => set("inverterModel", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input
                className="form-input"
                placeholder="e.g. 50kW"
                onChange={(e) => set("capacity", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                className="form-input"
                placeholder="Equipment serial"
                onChange={(e) => set("serialNumber", e.target.value)}
              />
            </div>
          </div>
          <div className="form-section">Fault Details</div>
          <div className="form-grid">
            <div className="form-group full">
              <label className="form-label">Fault Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the issue..."
                onChange={(e) => set("faultDescription", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Error Code</label>
              <input
                className="form-input"
                placeholder="e.g. F001"
                onChange={(e) => set("errorCode", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) =>
                  set("priority", e.target.value as "LOW" | "MEDIUM" | "HIGH")
                }
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warranty</label>
              <select
                className="form-select"
                value={form.warrantyStatus ? "true" : "false"}
                onChange={(e) => set("warrantyStatus", e.target.value === "true")}
              >
                <option value="false">Out of Warranty</option>
                <option value="true">In Warranty</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Ticket →"}
          </button>
        </div>
      </div>
    </div>
  );
}
