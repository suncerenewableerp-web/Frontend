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
            SNet – LoRa
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / SNet – LoRa
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60, alignItems: "center" }}>
          
          <div className="rv">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>SNet – LoRa</h2>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "#444", marginBottom: 20 }}>Reliable Wireless Data Acquisition and Transmission</div>
            
            <div style={{ marginBottom: 32 }}>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Advanced LoRa Technology (wireless) for Reliable Data Acquisition and Transmission.",
                  "The SNet LoRa series is designed for seamless data acquisition through LoRa technology, supporting wireless sensors and wireless RS485 serial data conversion.",
                  "This versatile solution finds applications in various industries, including energy, chemical plants, water pipelines, hospitals, and more."
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: "0.92rem", color: "#555" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>{i + 1}.</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Working voltage design, supports 5-12VDC power supply.",
                  "Local SSH and remote access for easy parameter setting.",
                  "Compatible with Modbus TCP and Modbus RTU protocols.",
                  "Supports up to 250 Device collecting points with low interference.",
                  "Secure data encryption during transmission.",
                  "Communication distance up to 12Km in open areas.",
                  "High speed bidirectional communication.",
                  "RS485 anti-surge and ESD protection."
                ].map((s, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: "0.9rem", color: "#666", alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--navy)", marginTop: 7, flexShrink: 0 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rv prod-img-wrap">
            <div className="prod-img-arc" />
            <img src="/2.png" alt="SNet – LoRa" style={{ width: "100%", height: "auto", display: "block", position: "relative", zIndex: 1 }} />
          </div>

        </div>
      </section>
    </main>
  );
}
