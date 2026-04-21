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


export default function CareerPage() {
  useReveal();

  const perks = [
    { icon: "💰", title: "Competitive Salary", desc: "Industry-leading compensation packages with performance bonuses." },
    { icon: "📈", title: "Growth Path", desc: "Clear career progression with regular skill development programs." },
    { icon: "🏥", title: "Health Benefits", desc: "Comprehensive health insurance for you and your family." },
    { icon: "🎓", title: "Learning & Development", desc: "Sponsored certifications, workshops, and training programs." },
    { icon: "🏖️", title: "Work-Life Balance", desc: "Flexible schedules and generous leave policies." },
    { icon: "🤝", title: "Team Culture", desc: "Collaborative environment with regular team-building activities." },
  ];

  const openings = [
    {
      title: "Senior Solar Inverter Technician",
      location: "NOIDA / Pan-India (Field)",
      type: "Full-Time",
      dept: "Service Engineering",
      desc: "Diagnose and repair solar inverters at PCB level. Minimum 3 years experience in solar inverter servicing required.",
    },
    {
      title: "SCADA Engineer",
      location: "NOIDA",
      type: "Full-Time",
      dept: "SCADA & Monitoring",
      desc: "Design, configure, and maintain SCADA systems for solar plant monitoring. Experience with major inverter brands preferred.",
    },
    {
      title: "Project Manager — Solar O&M",
      location: "NOIDA / Remote",
      type: "Full-Time",
      dept: "Project Management",
      desc: "Lead end-to-end O&M projects for large-scale solar installations. PMP certification is a plus.",
    },
    {
      title: "Business Development Executive",
      location: "NOIDA",
      type: "Full-Time",
      dept: "Sales & Growth",
      desc: "Drive growth by acquiring new solar plant O&M contracts and expanding service partnerships across India.",
    },
    {
      title: "PCB Repair Specialist",
      location: "NOIDA (Lab)",
      type: "Full-Time",
      dept: "R&D Lab",
      desc: "Perform component-level repair and diagnostics of inverter PCBs. Electronics engineering background required.",
    },
  ];

  return (
    <main>

      {/* Hero */}
      <section style={{
        minHeight: "55vh", background: "linear-gradient(135deg, #233E99 0%, #1a2d6d 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "120px 6vw 80px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 80%, rgba(232,169,23,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ zIndex: 2, maxWidth: 800 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "5px 14px", borderRadius: 50, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-warm)", display: "inline-block" }} />
            Careers
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
            Build Your Career at Sunce
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto" }}>
            Join 350+ professionals powering India&apos;s solar revolution. Grow with a team that values innovation, expertise, and impact.
          </p>
        </div>
      </section>

      {/* Why Sunce */}
      <section style={{ padding: "96px 6vw", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--navy)", marginBottom: 10 }}>Why Sunce?</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "var(--brown)" }}>
              Perks & Benefits
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
            {perks.map((p, i) => (
              <div key={i} className="rv" style={{
                background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 14, padding: "30px 24px",
                transition: "transform 0.3s, box-shadow 0.3s, border-color 0.25s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(44,26,14,0.1)"; e.currentTarget.style.borderColor = "rgba(181,130,26,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--brown)", marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(44,26,14,0.6)", lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section style={{ padding: "96px 6vw", background: "var(--cream)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--navy)", marginBottom: 10 }}>Opportunities</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "var(--brown)" }}>
              Current Openings
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {openings.map((o, i) => (
              <div key={i} className="rv" style={{
                background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 30px",
                transition: "transform 0.3s, box-shadow 0.3s, border-color 0.25s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(44,26,14,0.1)"; e.currentTarget.style.borderColor = "rgba(35,62,153,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 700, color: "var(--brown)", marginBottom: 6 }}>{o.title}</h3>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ background: "rgba(35,62,153,0.08)", color: "var(--navy)", padding: "3px 10px", borderRadius: 50, fontSize: "0.7rem", fontWeight: 600 }}>{o.dept}</span>
                      <span style={{ background: "rgba(181,130,26,0.1)", color: "var(--gold)", padding: "3px 10px", borderRadius: 50, fontSize: "0.7rem", fontWeight: 600 }}>{o.type}</span>
                      <span style={{ background: "rgba(44,26,14,0.06)", color: "var(--brown-light)", padding: "3px 10px", borderRadius: 50, fontSize: "0.7rem", fontWeight: 600 }}>📍 {o.location}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "0.9rem", color: "rgba(44,26,14,0.6)", lineHeight: 1.7, marginBottom: 18 }}>{o.desc}</p>
                <a href={`https://wa.me/916361991349?text=${encodeURIComponent(`Hi Sunce! I'm interested in the "${o.title}" position. I'd like to apply.`)}`} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--navy)", color: "#fff", padding: "10px 22px",
                  borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                  transition: "background 0.2s, transform 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "#1a2d6d"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "var(--navy)"; }}
                >
                  Apply via WhatsApp →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 6vw", background: "linear-gradient(135deg, #233E99 0%, #1a2d6d 100%)", textAlign: "center" }}>
        <div className="rv" style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>
            Don&apos;t See Your Role?
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 28 }}>
            We&apos;re always looking for talented professionals. Send us your resume and we&apos;ll reach out when we have a matching opportunity.
          </p>
          <a href={`https://wa.me/916361991349?text=${encodeURIComponent("Hi Sunce! I'd like to submit my resume for future opportunities.")}`} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--gold-warm)", color: "var(--brown)", padding: "14px 32px",
            borderRadius: 8, fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem", fontWeight: 600,
            textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 16px rgba(232,169,23,0.35)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
          >
            Send Your Resume →
          </a>
        </div>
      </section>
    </main>
  );
}
