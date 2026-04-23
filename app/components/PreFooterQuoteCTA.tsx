"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { WHATSAPP_NUMBER } from "./GlobalContact";

function isValidEmail(email: string) {
  const v = email.trim();
  if (!v) return false;
  // Reasonable client-side check (backend isn't involved here).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function PreFooterQuoteCTA() {
  const pathname = usePathname() || "";
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const placeholder = "Your Email Address";
  const valid = useMemo(() => isValidEmail(email), [email]);
  const showError = touched && !valid && email.trim().length > 0;

  const handleSend = () => {
    setTouched(true);
    if (!valid) return;

    const cleanEmail = email.trim();
    const text =
      `Hello Sunce Renewables,\n\n` +
      `I’d like to get a free quote for solar inverter services.\n\n` +
      `Email: ${cleanEmail}\n` +
      (pathname ? `Page: ${pathname}\n` : "") +
      `\nPlease contact me with the next steps.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section style={{ padding: "44px 6vw 0" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          background: "var(--navy)",
          borderRadius: 14,
          padding: "28px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          boxShadow: "0 18px 45px rgba(35,62,153,0.22)",
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
              lineHeight: 1.25,
              maxWidth: 560,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Don&apos;t let a faulty solar inverter disrupt your savings. Contact us for fast, reliable
            repair services for solar inverters.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ minWidth: 240, flex: "0 1 320px" }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={placeholder}
              inputMode="email"
              autoComplete="email"
              style={{
                width: "100%",
                height: 42,
                padding: "0 14px",
                borderRadius: 10,
                border: showError ? "2px solid rgba(255,179,179,0.9)" : "1.5px solid rgba(15,46,130,0.25)",
                outline: "none",
                background: "#fff",
                color: "#0b1220",
                fontSize: "0.88rem",
                fontFamily: "'Outfit', sans-serif",
              }}
            />
            {showError ? (
              <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,220,220,0.95)" }}>
                Please enter a valid email.
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSend}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 10,
              border: "none",
              background: "#0f2e82",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
              whiteSpace: "nowrap",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Get a Free Quote
          </button>
        </div>
      </div>
    </section>
  );
}
