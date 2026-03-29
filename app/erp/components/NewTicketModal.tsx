"use client";

import { useRef, useState } from "react";
import type { TicketCreateInput } from "../api";

const INVERTER_BRANDS = ["ABB", "SMA", "Huawei", "Fronius", "Sungrow", "Delta"] as const;
type InverterBrandOption = (typeof INVERTER_BRANDS)[number] | "OTHER" | "";

export default function NewTicketModal({
  onClose,
  onSubmit,
  userRole,
}: {
  onClose: () => void;
  onSubmit: (t: TicketCreateInput) => Promise<void>;
  userRole?: string;
}) {
  const [form, setForm] = useState({
    customerName: "",
    customerCompany: "",
    inverterMake: "",
    inverterModel: "",
    capacity: "",
    serialNumber: "",
    inverterLocation: "",
    faultDescription: "",
    errorCode: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    warrantyStatus: false,
    warrantyEndDate: "",
  });
  const [brandOption, setBrandOption] = useState<InverterBrandOption>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const capacityRef = useRef<HTMLInputElement | null>(null);
  const faultRef = useRef<HTMLTextAreaElement | null>(null);

  const canSetPriorityAndWarranty =
    String(userRole || "").toUpperCase() === "ADMIN" ||
    String(userRole || "").toUpperCase() === "SALES";

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const capacity = form.capacity.trim();
    const faultDescription = form.faultDescription.trim();
    const missing: string[] = [];
    if (!capacity) missing.push("Capacity");
    if (!faultDescription) missing.push("Fault Description");
    if (canSetPriorityAndWarranty && form.warrantyStatus && !form.warrantyEndDate.trim()) {
      missing.push("Warranty end date");
    }
    if (missing.length) {
      setError(`Please fill required field(s): ${missing.join(", ")}.`);
      if (!capacity) capacityRef.current?.focus();
      else faultRef.current?.focus();
      return;
    }
    setLoading(true);
    setError("");
    onSubmit({
      capacity,
      faultDescription,
      customerName: form.customerName.trim() || undefined,
      customerCompany: form.customerCompany.trim() || undefined,
      inverterMake: form.inverterMake.trim() || undefined,
      inverterModel: form.inverterModel.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
      inverterLocation: form.inverterLocation.trim() || undefined,
      errorCode: form.errorCode.trim() || undefined,
      ...(canSetPriorityAndWarranty ? { priority: form.priority || undefined } : {}),
      ...(canSetPriorityAndWarranty
        ? {
            warrantyStatus: form.warrantyStatus,
            warrantyEndDate: form.warrantyStatus ? form.warrantyEndDate.trim() || undefined : undefined,
          }
        : {}),
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
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                className="form-input"
                placeholder="Company name"
                value={form.customerCompany}
                onChange={(e) => set("customerCompany", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Complaint Raised By</label>
              <input
                className="form-input"
                placeholder="Customer name"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
              />
            </div>
          </div>
          <div className="form-section">Inverter Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <select
                className="form-select"
                value={brandOption}
                onChange={(e) => {
                  const next = e.target.value as InverterBrandOption;
                  setBrandOption(next);
                  if (next === "OTHER") {
                    set("inverterMake", "");
                  } else {
                    set("inverterMake", next);
                  }
                }}
              >
                <option value="">Select brand (optional)</option>
                {INVERTER_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                className="form-input"
                placeholder="Model number"
                onChange={(e) => set("inverterModel", e.target.value)}
              />
            </div>
            {brandOption === "OTHER" ? (
              <div className="form-group full">
                <label className="form-label">Other Brand</label>
                <input
                  className="form-input"
                  placeholder="Enter brand name"
                  value={form.inverterMake}
                  onChange={(e) => set("inverterMake", e.target.value)}
                />
              </div>
            ) : null}
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input
                className="form-input"
                placeholder="e.g. 50kW"
                ref={capacityRef}
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
            <div className="form-group full">
              <label className="form-label">Inverter Location</label>
              <input
                className="form-input"
                placeholder="Pickup/installation location (Full Address)"
                onChange={(e) => set("inverterLocation", e.target.value)}
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
                ref={faultRef}
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
            {canSetPriorityAndWarranty ? (
              <>
                <div className="form-group">
                  <label className="form-label">Priority</label>
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
                    onChange={(e) => {
                      const under = e.target.value === "true";
                      set("warrantyStatus", under);
                      if (!under) set("warrantyEndDate", "");
                    }}
                  >
                    <option value="true">Under Warranty</option>
                    <option value="false">Out of Warranty</option>
                  </select>
                </div>
                {form.warrantyStatus ? (
                  <div className="form-group">
                    <label className="form-label">Warranty End Date</label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.warrantyEndDate}
                      onChange={(e) => set("warrantyEndDate", e.target.value)}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Ticket →"}
          </button>
        </div>
      </div>
    </div>
  );
}
