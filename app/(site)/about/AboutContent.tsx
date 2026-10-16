"use client";

import { useEffect, useState } from "react";


const GLOBAL_CSS = `
  .rv { opacity: 0; transform: translateY(32px); transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1); }
  .rv.in, .rv[data-rv="in"] { opacity: 1; transform: translateY(0); }

  /* Company Values Circle */
  .values-circle-wrap {
    position: relative;
    width: 340px;
    height: 340px;
    margin: 0 auto;
  }
  .values-center {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 150px; height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--navy), #1a2d6d);
    display: flex; align-items: center; justify-content: center;
    z-index: 2;
    box-shadow: 0 8px 32px rgba(35,62,153,0.25);
  }
  .values-center span {
    color: #fff;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.15rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.3;
  }
  .values-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 22px solid transparent;
    border-top-color: var(--navy);
    border-right-color: var(--gold-warm);
    border-bottom-color: #5a8fd4;
    border-left-color: #7ab648;
    animation: valuesRotate 20s linear infinite;
  }
  @keyframes valuesRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .values-item {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    z-index: 3;
  }
  .values-item-icon {
    width: 48px; height: 48px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }
  .values-item-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--brown);
    letter-spacing: 0.02em;
  }

  /* Brochure buttons */
  .brochure-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 18px 32px;
    background: var(--navy);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background 0.25s, transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(35,62,153,0.18);
    gap: 10px;
  }
  .brochure-btn:hover {
    background: #1a2d6d;
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 14px 36px rgba(35,62,153,0.35);
  }

  /* Value Cards */
  .value-card {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s;
    cursor: default;
  }
  .value-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(44,26,14,0.12);
  }
  .value-card img {
    width: 100%; height: 200px; object-fit: cover; display: block;
    transition: transform 0.55s cubic-bezier(.22,1,.36,1);
  }
  .value-card:hover img {
    transform: scale(1.05);
  }
  .value-card-body {
    padding: 20px 22px 24px;
  }

  @media (max-width: 900px) {
    .about-grid { grid-template-columns: 1fr !important; }
    .our-why-grid { grid-template-columns: 1fr !important; }
    .values-circle-wrap { width: 280px; height: 280px; }
    .values-center { width: 120px; height: 120px; }
    .values-center span { font-size: 0.95rem; }
    .brochure-grid { grid-template-columns: 1fr !important; }
    .core-values-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 540px) {
    .core-values-grid { grid-template-columns: 1fr !important; }
  }
`;

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
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.classList.contains("rv")) { if (!observed.has(n)) { observed.add(n); obs.observe(n); } }
          n.querySelectorAll?.<HTMLElement>(".rv").forEach((el) => {
            if (!observed.has(el)) { observed.add(el); obs.observe(el); }
          });
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { obs.disconnect(); mo.disconnect(); };
  }, []);
}


function CompanyValuesCircle() {
  const items = [
    { label: "Imagination", icon: "⭐", color: "var(--navy)", top: "-30px", left: "50%", transform: "translateX(-50%)" },
    { label: "Innovation", icon: "🔧", color: "var(--gold-warm)", top: "50%", right: "-50px", transform: "translateY(-50%)" },
    { label: "Implementation", icon: "👍", color: "#5a8fd4", bottom: "-30px", left: "50%", transform: "translateX(-50%)" },
    { label: "Integration", icon: "🎯", color: "#7ab648", top: "50%", left: "-50px", transform: "translateY(-50%)" },
  ];

  return (
    <div className="values-circle-wrap">
      <div className="values-ring" />
      <div className="values-center">
        <span>Company<br />values</span>
      </div>
      {items.map((item, i) => {
        const pos: Record<string, string> = {};
        if (item.top) pos.top = item.top;
        if (item.bottom) pos.bottom = item.bottom;
        if (item.left) pos.left = item.left;
        if (item.right) pos.right = item.right;
        if (item.transform) pos.transform = item.transform;
        return (
          <div key={i} className="values-item" style={pos}>
            <div className="values-item-icon" style={{ background: item.color, color: "#fff" }}>
              {item.icon}
            </div>
            <span className="values-item-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPage() {
  useReveal();

  const coreValues = [
    { img: "/collaboration.png", subtitle: "Team up, down & across; Be a trustworthy partner", title: "Collaboration" },
    { img: "/effectiveness.png", subtitle: "Get things done; Achieve results", title: "Effectiveness" },
    { img: "/commitment.png", subtitle: "Continually give your best; Drive excellence", title: "Commitment" },
    { img: "/integrity.png", subtitle: "Be ethical; Be accountable", title: "Integrity" },
  ];

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ====== Section 1: Why Sunce ====== */}
      <section style={{ padding: "120px 6vw 80px", background: "#fff" }}>
        <div className="about-grid rv" style={{
          display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 60,
          maxWidth: 1100, margin: "0 auto", alignItems: "center",
        }}>
          {/* Left: Image with blue bracket */}
          <div style={{ position: "relative" }}>
            {/* Blue L-bracket decoration */}
            <div style={{
              position: "absolute", left: -16, bottom: -16, width: 80, height: 80,
              borderLeft: "4px solid var(--navy)", borderBottom: "4px solid var(--navy)",
              zIndex: 2, pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", right: -16, top: -16, width: 80, height: 80,
              borderRight: "4px solid var(--navy)", borderTop: "4px solid var(--navy)",
              zIndex: 2, pointerEvents: "none",
            }} />
            <div style={{
              overflow: "hidden", borderRadius: 0,
              boxShadow: "0 18px 55px rgba(44,26,14,0.12)",
            }}>
              <img
                src="/about-meeting.png"
                alt="Team meeting with charts"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div style={{
              fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--navy)", marginBottom: 10,
            }}>
              GET TO KNOW US
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700,
              color: "var(--brown)", lineHeight: 1.12, margin: "0 0 28px",
            }}>
              Why Sunce?
            </h1>
            <p style={{ fontSize: "0.98rem", color: "rgba(44,26,14,0.65)", lineHeight: 1.9, marginBottom: 20 }}>
              Sunce, was formed in 2016 by Three experienced Technocrats who knew there was a better way to develop products and grow businesses.{" "}
              <strong style={{ color: "var(--brown)" }}>Our approach involves a &apos;market-pull&apos; orientation rather than &apos;technology-push&apos;.</strong>{" "}
              By gathering deep market insight before building the technology solutions, we ensure there is both a customer and a market willingness to embrace the products and businesses we develop.
            </p>
            <p style={{ fontSize: "0.98rem", color: "rgba(44,26,14,0.65)", lineHeight: 1.9 }}>
              Our strong commercial mindset is a key aspect of Sunce&apos;s approach to build products and build businesses. It all starts with associating entrepreneurial thinkers who possess both technical expertise and business acumen.
            </p>
          </div>
        </div>

        {/* Brochure Buttons */}
        <div className="brochure-grid rv" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
          maxWidth: 1100, margin: "60px auto 0",
        }}>
          {[
            { href: "/Sunce-Profile.pdf", label: "Sunce Profile" },
            { href: "/Brochure-Sunce-Product.pdf", label: "Brochure Sunce Product" },
            { href: "/Brochure-Sunce-Services.pdf", label: "Brochure Sunce Services" },
          ].map((b, i) => (
            <a
              key={i}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="brochure-btn"
              style={{ borderRadius: 12, gap: 10, transitionDelay: `${i * 0.06}s` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 14px 36px rgba(35,62,153,0.35)";
                e.currentTarget.style.background = "#1a2d6d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.background = "";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
              {b.label}
            </a>
          ))}
        </div>
      </section>

      {/* ====== Section 2: Our Why + Company Values Circle ====== */}
      <section style={{ padding: "96px 6vw", background: "var(--cream)" }}>
        <div className="our-why-grid rv" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 70,
          maxWidth: 1100, margin: "0 auto", alignItems: "center",
        }}>
          {/* Left: Text content */}
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 2.5vw, 2rem)", fontWeight: 700,
              color: "var(--brown)", lineHeight: 1.2, marginBottom: 18,
            }}>
              Our Why
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(44,26,14,0.62)", lineHeight: 1.85, marginBottom: 28 }}>
              We know the old saying &ldquo;do what you love and you&apos;ll never work a day in your life&rdquo; but we truly believe it and live it. Our firm with its team of consultants genuinely loves helping clients solve some of their toughest challenges. We L-O-V-E tackling businesses that need to re-imagine how they will compete in the future. We enjoy getting in the trenches with our clients to take on tough problems like improving culture, enhancing the customer experience or redesigning process.
            </p>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.4rem, 2.2vw, 1.8rem)", fontWeight: 700,
              color: "var(--brown)", lineHeight: 1.2, marginBottom: 14,
            }}>
              What&apos;s it like working at Sunce?
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(44,26,14,0.62)", lineHeight: 1.85, marginBottom: 28 }}>
              Our team is passionate about personal and professional development, this is why we made Capacity and Resource Building core to our business model. We believe everyone can become a stronger leader, just as important, we believe that teamwork makes the dream work. Building capabilities within our client&apos;s own team is how to create sustainable organizations.
            </p>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.4rem, 2.2vw, 1.8rem)", fontWeight: 700,
              color: "var(--brown)", lineHeight: 1.2, marginBottom: 10,
            }}>
              Our Mission
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(44,26,14,0.62)", lineHeight: 1.85 }}>
              To be a responsible leader in providing clean energy solutions for sustaining the Earth
            </p>
          </div>

          {/* Right: Company Values Circle */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CompanyValuesCircle />
          </div>
        </div>
      </section>

      {/* ====== Section 3: Core Values Cards ====== */}
      <section style={{ padding: "96px 6vw", background: "var(--cream-dark)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="core-values-grid rv" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          }}>
            {coreValues.map((v, i) => (
              <div key={i} className="value-card">
                <div style={{ overflow: "hidden", height: 200 }}>
                  <img src={v.img} alt={v.title} />
                </div>
                <div className="value-card-body">
                  <p style={{ fontSize: "0.84rem", color: "rgba(44,26,14,0.5)", lineHeight: 1.55, marginBottom: 8 }}>
                    {v.subtitle}
                  </p>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.35rem", fontWeight: 700, color: "var(--brown)",
                  }}>
                    {v.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
