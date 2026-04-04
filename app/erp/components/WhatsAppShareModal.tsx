"use client";

import { useMemo } from "react";

function normalizeWhatsAppNumber(raw: string) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  // Heuristic: if it's a plain 10-digit Indian mobile number, assume +91.
  if (digits.length === 10) return `91${digits}`;
  // Otherwise use as-is (should already include country code).
  return digits;
}

export default function WhatsAppShareModal({
  open,
  title,
  phone,
  onPhoneChange,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  phone: string;
  onPhoneChange: (v: string) => void;
  message: string;
  onClose: () => void;
}) {
  const waUrl = useMemo(() => {
    const n = normalizeWhatsAppNumber(phone);
    if (!n) return "";
    const text = encodeURIComponent(message || "");
    return `https://wa.me/${n}?text=${text}`;
  }, [phone, message]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 760, maxWidth: "92vw" }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input
                className="form-input"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="e.g. +919999988888"
              />
            </div>
            <div className="form-group" style={{ justifyContent: "flex-end" }}>
              <div style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.4 }}>
                Tip: Number should include country code.
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Message Preview</label>
            <textarea className="form-textarea" value={message} readOnly rows={7} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <a
            className="btn btn-accent"
            href={waUrl || undefined}
            target="_blank"
            rel="noreferrer noopener"
            aria-disabled={!waUrl}
            onClick={(e) => {
              if (!waUrl) e.preventDefault();
            }}
            style={!waUrl ? { opacity: 0.6, pointerEvents: "none" } : undefined}
          >
            Share on WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}

