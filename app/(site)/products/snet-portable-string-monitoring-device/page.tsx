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
            SNet Portable String Monitoring Device
          </h1>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</a> / SNet Portable String Monitoring Device
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60, alignItems: "center" }}>
          
          <div className="rv prod-img-wrap">
            <div className="prod-img-arc" />
            <img src="/1.png" alt="SNet Portable String Monitoring Device" style={{ width: "100%", height: "auto", display: "block", position: "relative", zIndex: 1 }} />
          </div>

          <div className="rv">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>SNet Portable String Monitoring Device</h2>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "#444", marginBottom: 20 }}>Efficiently Monitor and Optimize Your Solar Power Plant</div>
            <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.8, marginBottom: 28 }}>
              The SNet Portable String Monitoring Device is a cutting-edge PV string monitoring system designed to precisely detect abnormal conditions within a solar power plant. It monitors all strings within a Combiner Box without disrupting power generation.
            </p>
            
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brown)", marginBottom: 16 }}>Product Features:</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Seamless 4G Internet Communication",
                  "Easy Retrofit Installation",
                  "Compact Design with Integrated Power Supply",
                  "Safe and Effortless Current Measurement",
                  "Seamless Integration with Modbus/RTU Communication"
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: "0.92rem", color: "#555" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>{i + 1}.</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--brown)", marginBottom: 16 }}>Specifications:</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "12 to 24-channel current measurement, supporting up to 35 A DC.",
                  "Detection of reverse currents of up to -5 A.",
                  "The SNet unit is powered directly from the solar string.",
                  "Voltage measurement up to 1500 V DC in any grounded PV system."
                ].map((s, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: "0.9rem", color: "#666", alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--navy)", marginTop: 7, flexShrink: 0 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
