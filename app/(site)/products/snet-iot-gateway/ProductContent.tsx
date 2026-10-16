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
            SNet IoT Gateway
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / SNet IoT Gateway
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60, alignItems: "center" }}>
          
          <div className="rv prod-img-wrap">
            <div className="prod-img-arc" />
            <img src="/3.png" alt="SNet IoT Gateway" style={{ width: "100%", height: "auto", display: "block", position: "relative", zIndex: 1 }} />
          </div>

          <div className="rv">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>SNet IoT Gateway</h2>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "#444", marginBottom: 20 }}>Unlock the Power of Real-Time Information</div>
            
            <div style={{ marginBottom: 32 }}>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Digital Inputs for remote monitoring",
                  "Digital Outputs for remote controls",
                  "RS232 and RS485 Ports for data acquisition",
                  "Supports HTTP, TCP/IP, FTP, and MQTT",
                  "Programmable Automation Logic",
                  "Built-In Real-Time Clock (RTC)",
                  "Ultra-Low Consumption Energy-efficient design",
                  "Wide Operating Temperature: -40~+85°C"
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: "0.92rem", color: "#555", alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", marginTop: 7, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brown)", marginBottom: 16 }}>Specifications:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "GSM", v: "850/900/1800/1900MHz" },
                  { l: "Inputs", v: "2 Digital Inputs" },
                  { l: "Outputs", v: "2 Digital Outputs" },
                  { l: "UART", v: "RS232/RS485/TTL" },
                  { l: "Power", v: "9-24V DC" },
                  { l: "Sensitivity", v: "-109dBm" }
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
