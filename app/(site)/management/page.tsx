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


export default function ManagementPage() {
  useReveal();

  const leaders = [
    {
      name: "Ajeet Mishra",
      role: "Founder & CEO",
      img: "/ajeet.webp",
      bio: "More Than 10 Years Experience In Solar Industry. Leading Multiple Business Ventures Successfully In Solar And Human Resourcing. Worked With Hero Future Energies & Azure Power. Has Executed Projects Of More Than 100MW In Rooftop And 1GW In Ground Mount Solar. Expertise In Design, Engineering And Construction. Graduate In Electrical Engineering.",
      expertise: ["Design & Engineering", "Business Development", "Solar Project Execution"],
    },
    {
      name: "Divy Tiwari",
      role: "Founder & COO",
      img: "/DIVY-TIWARI-min.png.webp",
      bio: "More Than 8 Years Of Experience In Solar Industry. Have Executed More Than 100MW. Expertise In Project Execution And Site Management. Worked With TCS, Suryaday And Suntrap. Graduate In Electrical Engineering.",
      expertise: ["Project Execution", "Site Management", "Operations"],
    },
    {
      name: "Vedansh Shrivastava",
      role: "Founder & CTO",
      img: "/VEDANSH-SHRIVASTAVA-min.png.webp",
      bio: "More Than 18 Years Of Experience In Solar Industry. Has Executed More Than 500MW. Expertise In Technology And O&M Of Solar Project. Worked With Moser-Baer, Indosolar, RPG. Leadership Experience Of Handling More Team Of More Than 100 At Site And Office. Graduate In Electrical Engineering.",
      expertise: ["Technology & O&M", "Inverter Engineering", "Team Leadership"],
    },
  ];

  const departments = [
    { icon: "🔧", name: "Service Engineering", count: "120+", desc: "Expert technicians for on-site repairs and maintenance" },
    { icon: "📊", name: "SCADA & Monitoring", count: "40+", desc: "Real-time monitoring and data analytics specialists" },
    { icon: "🏗️", name: "Project Management", count: "60+", desc: "End-to-end project delivery and coordination" },
    { icon: "🔬", name: "R&D Lab", count: "30+", desc: "PCB-level diagnostics and repair innovation" },
    { icon: "📞", name: "Customer Success", count: "50+", desc: "24/7 support and relationship management" },
    { icon: "📋", name: "Quality & Compliance", count: "50+", desc: "Standards enforcement and audit management" },
  ];

  return (
    <main>

      {/* Hero */}
      <section style={{
        minHeight: "55vh", background: "linear-gradient(135deg, #233E99 0%, #1a2d6d 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "120px 6vw 80px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 50%, rgba(181,130,26,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ zIndex: 2, maxWidth: 800 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "5px 14px", borderRadius: 50, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-warm)", display: "inline-block" }} />
            Leadership
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
            Our Management Team
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
            Led by three visionary technocrats, our leadership team combines entrepreneurial thinking with deep technical expertise.
          </p>
        </div>
      </section>

      {/* Leadership Cards */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--navy)", marginBottom: 10 }}>Founders</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "var(--brown)" }}>
              The Visionaries Behind Sunce
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {leaders.map((l, i) => (
              <div key={i} className="rv" style={{
                background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden",
                transition: "transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(44,26,14,0.14)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ height: 6, background: `linear-gradient(90deg, var(--navy), var(--gold-warm))` }} />
                {/* Photo */}
                <div style={{
                  width: "100%", height: 400, overflow: "hidden", background: "var(--cream-dark)",
                }}>
                  <img
                    src={l.img}
                    alt={l.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block", transition: "transform 0.5s cubic-bezier(.22,1,.36,1)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div style={{ padding: "24px 28px 32px" }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--brown)", marginBottom: 4 }}>{l.name}</h3>
                  <div style={{ fontSize: "0.78rem", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>{l.role}</div>
                  <p style={{ fontSize: "0.9rem", color: "rgba(44,26,14,0.6)", lineHeight: 1.75, marginBottom: 20 }}>{l.bio}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {l.expertise.map((e, j) => (
                      <span key={j} style={{
                        background: "rgba(35,62,153,0.08)", color: "var(--navy)", padding: "4px 12px",
                        borderRadius: 50, fontSize: "0.72rem", fontWeight: 600,
                      }}>{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section style={{ padding: "96px 6vw", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--navy)", marginBottom: 10 }}>Our Teams</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "var(--brown)" }}>
              350+ Professionals Across 6 Departments
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {departments.map((d, i) => (
              <div key={i} className="rv" style={{
                background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 22px",
                textAlign: "center", transition: "transform 0.3s, box-shadow 0.3s, border-color 0.25s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(44,26,14,0.1)"; e.currentTarget.style.borderColor = "rgba(181,130,26,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{d.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--brown)", marginBottom: 4 }}>{d.name}</h3>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>{d.count}</div>
                <p style={{ fontSize: "0.82rem", color: "rgba(44,26,14,0.55)", lineHeight: 1.6 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
