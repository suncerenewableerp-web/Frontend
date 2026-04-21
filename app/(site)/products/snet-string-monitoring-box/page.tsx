"use client";

import { useEffect, useState } from "react";


function useReveal() {
  useEffect(() => {
    const observed = new WeakSet<Element>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.rv = "in";
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll<HTMLElement>(".rv").forEach((el) => {
      if (!observed.has(el)) { observed.add(el); obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);
}


export default function ProductPage() {
  useReveal();

  return (
    <main>

      {/* Hero */}
      <section style={{
        minHeight: "40vh", background: "#1a1c23",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "120px 6vw 60px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 10px" }}>
            SNet String Monitoring Box
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / SNet String Monitoring Box
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60, alignItems: "center" }}>
          
          <div className="rv prod-img-wrap">
            <div className="prod-img-arc" />
            <img src="/SNet String Monitoring Box.webp" alt="SNet String Monitoring Box" style={{ width: "100%", height: "auto", display: "block", position: "relative", zIndex: 1 }} />
          </div>

          <div className="rv">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>SNet String Monitoring Box</h2>
            <p style={{ fontSize: "1rem", color: "#444", lineHeight: 1.7, marginBottom: 24 }}>
              We are the only Indian manufacturer to offer a String Monitoring Box with our own proprietary monitoring card featuring LoRa technology for data communication.
            </p>
            
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brown)", marginBottom: 16 }}>Key Benefits:</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { t: "Maximize Energy Production", d: "Ensure each solar string is performing at its peak." },
                  { t: "Reduce Downtime", d: "Instantly detect issues and take corrective action." },
                  { t: "Cost-Efficiency", d: "Improve system ROI with increased energy production and reduced maintenance costs." },
                  { t: "Remote Access", d: "Monitor your solar installation from anywhere." },
                  { t: "Proven Reliability", d: "Rely on a product designed by experts with deep industry knowledge." }
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: "0.92rem", color: "#555" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", marginTop: 7, flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "var(--brown)" }}>{f.t}:</strong> {f.d}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brown)", marginBottom: 16 }}>Specifications:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "Technology", v: "LoRa (Wireless)" },
                  { l: "Input Voltage", v: "1000-1500VDC" },
                  { l: "No. of Strings", v: "8/12/16/24" },
                  { l: "Protection", v: "IP65" },
                  { l: "Certifications", v: "CE, ROHS, ISO" }
                ].map((s, i) => (
                  <div key={i} style={{ padding: "10px 14px", background: "#f8f9fa", borderRadius: 8 }}>
                    <div style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", fontWeight: 700 }}>{s.l}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--navy)", fontWeight: 600 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
