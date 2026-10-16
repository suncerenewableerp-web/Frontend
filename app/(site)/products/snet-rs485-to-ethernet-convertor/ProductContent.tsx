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
            SNet RS485 to Ethernet Convertor
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / SNet RS485 to Ethernet Convertor
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60, alignItems: "center" }}>
          
          <div className="rv">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>SNet RS485 to Ethernet Convertor</h2>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "#444", marginBottom: 20 }}>High Performance Industrial Protocol Conversion</div>
            
            <div style={{ marginBottom: 32 }}>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Acts as MODBUS TCP Slave and MODBUS RTU Master",
                  "Supports standard MODBUS commands",
                  "Embedded HTTP module to configure static IP and Port number",
                  "Up to ten TCP masters can connect to the device",
                  "No limit for number of RTU clients",
                  "Optional RS485/RS232 Isolation",
                  "RS232/RS485 configurable Baud rate (1200-230400)",
                  "Highly Reliable and Low cost"
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: "0.92rem", color: "#555", alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", marginTop: 7, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rv prod-img-wrap">
            <div className="prod-img-arc" />
            <img src="/2.png" alt="SNet RS485 to Ethernet Convertor" style={{ width: "100%", height: "auto", display: "block", position: "relative", zIndex: 1 }} />
          </div>

        </div>
      </section>
    </main>
  );
}
