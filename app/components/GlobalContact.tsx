"use client";

import { useState, useEffect } from "react";

export const WHATSAPP_NUMBER = "916361991349";

const WA_SVG = (size = 24, color = "white") => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type WAFormState = { name: string; phone: string; message: string };

export function WAModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<WAFormState>({
    name: "",
    phone: "",
    message: "",
  });

  const valid = form.name.trim() && form.phone.trim() && form.message.trim();

  const handleSend = () => {
    const text = `Hello Sunce Renewables! 👋\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Message:* ${form.message}`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    onClose();
  };

  return (
    <div
      className="mo"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(44,26,14,0.35)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="mb"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 24,
          padding: 32,
          position: "relative",
          boxShadow: "0 24px 60px rgba(44,26,14,0.18)",
        }}
      >
        <button
          className="mc"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "#f5f5f5",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {WA_SVG(26)}
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "var(--brown)",
                lineHeight: 1.15,
              }}
            >
              Chat on WhatsApp
            </h3>
            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--brown-light)",
                marginTop: 2,
              }}
            >
              Fill your details — WhatsApp opens instantly
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Your Name", key: "name", placeholder: "Enter your full name", type: "text" },
            { label: "Phone Number", key: "phone", placeholder: "+91 XXXXX XXXXX", type: "tel" },
          ].map((f) => (
            <div key={f.key}>
              <label
                style={{
                  fontSize: "0.68rem",
                  color: "var(--gold)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {f.label} *
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border-mid)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key as keyof WAFormState]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label
              style={{
                fontSize: "0.68rem",
                color: "var(--gold)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Your Message *
            </label>
            <textarea
              style={{
                width: "100%",
                padding: "13px 16px",
                borderRadius: 10,
                border: "1.5px solid var(--border-mid)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.88rem",
                outline: "none",
                height: 100,
                resize: "none",
              }}
              placeholder="Tell us about your solar project..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!valid}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              background: "#25D366",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: "0.94rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: valid ? "pointer" : "not-allowed",
              opacity: valid ? 1 : 0.6,
            }}
          >
            {WA_SVG(20)}
            Send on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export function FloatingWA({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "#25D366",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
        border: "none",
        cursor: "pointer",
        zIndex: 998,
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1) rotate(5deg)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {WA_SVG(32)}
    </button>
  );
}
