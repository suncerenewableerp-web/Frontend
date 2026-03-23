"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  LuArrowRight,
  LuBriefcase,
  LuChartBar,
  LuChartColumn,
  LuCircleCheck,
  LuClock,
  LuCrown,
  LuHeadphones,
  LuMapPin,
  LuShieldCheck,
  LuSunMedium,
  LuTicket,
  LuTruck,
  LuUser,
  LuWrench,
  LuZap,
} from "react-icons/lu";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const logoBoxSize = scrolled ? 42 : 48;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("hp-visible");
        }),
      { threshold: 0.08 }
    );
    document
      .querySelectorAll(".hp-reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features: { icon: IconType; title: string; desc: string; tag: string }[] =
    [
      {
        icon: LuTicket,
        title: "Service Tickets",
        tag: "Core",
        desc: "Raise and track inverter faults with full details, error codes, priority levels, and warranty status from one dashboard.",
      },
      {
        icon: LuClock,
        title: "SLA Monitoring",
        tag: "Live",
        desc: "Never miss a deadline. Real-time colour-coded alerts for at-risk and breached service level agreements.",
      },
      {
        icon: LuWrench,
        title: "Job Cards",
        tag: "Engineer",
        desc: "Engineers get structured digital job cards covering diagnosis, root cause, parts used, and final sign-off.",
      },
      {
        icon: LuTruck,
        title: "Logistics",
        tag: "Tracking",
        desc: "Schedule pickups, assign couriers, track LR numbers, and monitor in-transit inverters in real time.",
      },
      {
        icon: LuChartColumn,
        title: "Reports",
        tag: "Analytics",
        desc: "Monthly volume trends, warranty breakdown, and engineer performance — exportable management dashboards.",
      },
      {
        icon: LuShieldCheck,
        title: "Role Access",
        tag: "Security",
        desc: "Granular CRUD permissions per module for Admin, Sales, Engineer, and Customer — fully configurable.",
      },
    ];

  const steps: { n: string; icon: IconType; title: string; desc: string }[] = [
    {
      n: "01",
      icon: LuTicket,
      title: "Raise Ticket",
      desc: "Customer or sales logs a fault with inverter details, error code, and priority level.",
    },
    {
      n: "02",
      icon: LuTruck,
      title: "Pickup & Transit",
      desc: "Logistics schedules courier pickup and tracks the unit every step of the way.",
    },
    {
      n: "03",
      icon: LuWrench,
      title: "Diagnose & Repair",
      desc: "Engineer opens job card, diagnoses root cause, and completes repair with documentation.",
    },
    {
      n: "04",
      icon: LuZap,
      title: "Dispatch & Close",
      desc: "Unit dispatched back, SLA verified, ticket closed, and full report generated instantly.",
    },
  ];

  const roles: {
    color: string;
    bg: string;
    icon: IconType;
    name: string;
    tag: string;
    desc: string;
    perms: string[];
  }[] = [
    {
      color: "#8B4513",
      bg: "rgba(139,69,19,0.08)",
      icon: LuCrown,
      name: "Administrator",
      tag: "Full Access",
      desc: "Complete visibility and control over all modules, users, roles, and system settings.",
      perms: ["All Modules", "Role Builder", "User Management", "System Config"],
    },
    {
      color: "#B8860B",
      bg: "rgba(184,134,11,0.08)",
      icon: LuBriefcase,
      name: "Sales / BD",
      tag: "Customer-Facing",
      desc: "Create service tickets, manage customers, and track logistics and SLA compliance.",
      perms: ["Dashboard", "Tickets", "Logistics", "SLA Monitor"],
    },
    {
      color: "#4682B4",
      bg: "rgba(70,130,180,0.08)",
      icon: LuWrench,
      name: "Service Engineer",
      tag: "Field",
      desc: "Access assigned job cards and update repair status — a clean, focused workflow.",
      perms: ["Job Cards", "Tickets (edit)", "Logistics view", "Dashboard"],
    },
    {
      color: "#2E8B57",
      bg: "rgba(46,139,87,0.08)",
      icon: LuUser,
      name: "Customer",
      tag: "Self-Service",
      desc: "Track service requests, shipment status, and SLA timelines in real time.",
      perms: ["My Tickets", "Logistics", "SLA Status", "Dashboard"],
    },
  ];

  const stats: { num: string; label: string; icon: IconType }[] = [
    { num: "500+", label: "Tickets Resolved", icon: LuTicket },
    { num: "98%", label: "SLA Compliance", icon: LuCircleCheck },
    { num: "4", label: "Role Levels", icon: LuShieldCheck },
    { num: "9", label: "Ticket Stages", icon: LuChartBar },
    { num: "48h", label: "Avg Resolution", icon: LuClock },
    { num: "100%", label: "Digital Job Cards", icon: LuWrench },
  ];

  const whyUs: { icon: IconType; title: string; desc: string }[] = [
    {
      icon: LuZap,
      title: "Built for Solar",
      desc: "Designed specifically for inverter service ops — not a generic CRM bolted onto solar workflows.",
    },
    {
      icon: LuMapPin,
      title: "India-First",
      desc: "Optimised for Indian service chains, courier partners, and multi-state field engineer networks.",
    },
    {
      icon: LuHeadphones,
      title: "24/7 Support",
      desc: "Dedicated onboarding and ongoing support so your team is never stuck.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #d6cfc3; border-radius: 10px; }

        .hp-root { font-family:'DM Sans',sans-serif; background:#faf9f7; color:#1a1612; -webkit-font-smoothing:antialiased; overflow-x:hidden; }

        .hp-reveal { opacity:0; transform:translateY(36px); transition:opacity .7s ease, transform .7s ease; }
        .hp-visible { opacity:1 !important; transform:translateY(0) !important; }

        @keyframes hp-fadeup  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hp-blink   { 0%,100%{opacity:1} 50%{opacity:.15} }
        @keyframes hp-line    { to{transform:scaleX(1)} }
        @keyframes hp-spin    { to{transform:rotate(360deg)} }
        @keyframes hp-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes hp-pulse   { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.5);opacity:0} }
        @keyframes hp-float   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }

        .hp-tag {
          display:inline-flex; align-items:center;
          padding:2px 9px; border-radius:20px;
          font-family:'DM Mono',monospace; font-size:10px; font-weight:500;
          letter-spacing:.5px; text-transform:uppercase;
        }

        .hp-card-hover {
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .hp-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(26,22,18,.1);
          border-color: rgba(107,58,31,.22) !important;
        }

        /* Responsive helpers (override inline styles with !important) */
        .hp-grid { display: grid; }
        .hp-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .hp-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

        @media (max-width: 1024px) {
          .hp-nav { padding-left: 24px !important; padding-right: 24px !important; }
          #features, #how-it-works, #roles, #why-us { padding-left: 24px !important; padding-right: 24px !important; }
          .hp-band { padding-left: 24px !important; padding-right: 24px !important; }
          .hp-cta-wrap { margin-left: 24px !important; margin-right: 24px !important; }
          .hp-cta { padding: 56px 44px !important; flex-direction: column !important; align-items: flex-start !important; }
          .hp-cta-decor { display: none !important; }
          .hp-band-grid { grid-template-columns: 1fr !important; }
          .hp-band-cards { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .hp-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .hp-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .hp-footer { padding-left: 24px !important; padding-right: 24px !important; }
          .hp-footer-top { flex-direction: column !important; gap: 28px !important; }
          .hp-footer-cols { gap: 36px !important; flex-wrap: wrap !important; }
        }

        @media (max-width: 640px) {
          .hp-nav { padding-left: 16px !important; padding-right: 16px !important; }
          .hp-nav-links { display: none !important; }
          .hp-nav-actions a { padding: 8px 14px !important; }
          .hp-hero-inner { padding: 64px 16px !important; }
          .hp-hero-actions { flex-direction: column !important; align-items: stretch !important; }
          .hp-hero-actions a { justify-content: center !important; }
          .hp-stats-row { padding: 18px 16px !important; gap: 12px !important; }
          .hp-stat-sep { display: none !important; }
          .hp-hero-decor { display: none !important; }
          .hp-band { padding: 56px 16px !important; }
          .hp-band-cards { grid-template-columns: 1fr !important; }
          #features, #how-it-works, #roles, #why-us { padding: 72px 16px !important; }
          .hp-grid-3, .hp-grid-4 { grid-template-columns: 1fr !important; }
          .hp-steps-line { display: none !important; }
          .hp-cta-wrap { margin: 0 16px 72px !important; }
          .hp-cta { padding: 56px 18px !important; }
          .hp-footer { padding: 32px 16px !important; }
          .hp-footer-cols { flex-direction: column !important; gap: 24px !important; }
          .hp-footer-bottom { flex-direction: column !important; gap: 10px !important; align-items: flex-start !important; }
        }
      `}</style>

      <div className="hp-root">
        {/* ══════════════ NAVBAR ══════════════ */}
        <nav
          className="hp-nav"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: scrolled ? "60px" : "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 60px",
            background: "rgba(250,249,247,0.94)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(232,226,216,0.9)",
            boxShadow: scrolled ? "0 4px 24px rgba(26,22,18,0.08)" : "none",
            transition: "all .3s ease",
          }}
        >
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: logoBoxSize,
                height: logoBoxSize,
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(232,226,216,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 12px rgba(107,58,31,.32)",
                transition: "transform .22s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src="/logo.jpg"
                alt="Sunce ERP"
                fill
                priority
                sizes="48px"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 21,
                  fontWeight: 700,
                  color: "#1a1612",
                  lineHeight: 1,
                }}
              >
                Sunce ERP
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#9c8e80",
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Renewables · Service Platform
              </div>
            </div>
          </a>

          <div className="hp-nav-links" style={{ display: "flex", gap: 36 }}>
            {[
              ["#features", "Features"],
              ["#how-it-works", "How It Works"],
              ["#roles", "Roles"],
              ["#why-us", "Why Us"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#5c5044",
                  textDecoration: "none",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6b3a1f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5c5044")}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hp-nav-actions" style={{ display: "flex", gap: 10 }}>
            <Link
              href="/login"
              style={{
                padding: "8px 22px",
                borderRadius: 8,
                border: "1.5px solid #d6cfc3",
                background: "transparent",
                color: "#5c5044",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6b3a1f";
                e.currentTarget.style.color = "#6b3a1f";
                e.currentTarget.style.background = "rgba(107,58,31,0.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d6cfc3";
                e.currentTarget.style.color = "#5c5044";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "8px 22px",
                borderRadius: 8,
                background: "linear-gradient(135deg,#6b3a1f,#8B4513)",
                color: "#fff",
                border: "none",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 3px 12px rgba(107,58,31,.30)",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(107,58,31,.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 3px 12px rgba(107,58,31,.3)";
              }}
            >
              Get Started →
            </Link>
          </div>
        </nav>

        {/* ══════════════ HERO ══════════════ */}
        <section
          className="hp-hero"
          style={{
            minHeight: "100vh",
            paddingTop: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Layered background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg,#faf9f7 0%,#f5f0e8 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle,rgba(107,58,31,.09) 1px,transparent 1px)",
              backgroundSize: "36px 36px",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 1000,
              height: 1000,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(184,134,11,.08) 0%,transparent 60%)",
              top: -400,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(107,58,31,.06) 0%,transparent 65%)",
              bottom: -200,
              right: -100,
              pointerEvents: "none",
            }}
          />
          {/* Decorative floating circles */}
          <div
            className="hp-hero-decor"
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: "1px solid rgba(184,134,11,.12)",
              top: 120,
              left: "8%",
              animation: "hp-float 7s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            className="hp-hero-decor"
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              border: "1px solid rgba(107,58,31,.10)",
              bottom: 160,
              right: "10%",
              animation: "hp-float 9s ease-in-out infinite 2s",
              pointerEvents: "none",
            }}
          />

          <div
            className="hp-hero-inner"
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: 860,
              padding: "80px 40px",
            }}
          >
            {/* Live badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 18px",
                borderRadius: 24,
                background: "rgba(184,134,11,.10)",
                border: "1px solid rgba(184,134,11,.24)",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#B8860B",
                letterSpacing: "1.3px",
                textTransform: "uppercase",
                fontFamily: "'DM Mono',monospace",
                marginBottom: 36,
                animation: "hp-fadeup .6s .05s ease both",
              }}
            >
              <span style={{ position: "relative", width: 8, height: 8 }}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#B8860B",
                    animation: "hp-pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#B8860B",
                  }}
                />
              </span>
              Solar Inverter Service ERP · India
            </div>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(52px,6.5vw,88px)",
                fontWeight: 700,
                lineHeight: 1.04,
                color: "#1a1612",
                marginBottom: 28,
                animation: "hp-fadeup .65s .15s ease both",
              }}
            >
              Manage every solar
              <br />
              service,{" "}
              <span
                style={{
                  fontStyle: "italic",
                  color: "#6b3a1f",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                effortlessly.
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 1,
                    height: 4,
                    background: "linear-gradient(90deg,#6b3a1f,#B8860B)",
                    borderRadius: 2,
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    animation: "hp-line .55s .9s ease forwards",
                    display: "block",
                  }}
                />
              </span>
            </h1>

            <p
              style={{
                fontSize: 19,
                color: "#5c5044",
                lineHeight: 1.78,
                maxWidth: 600,
                margin: "0 auto 48px",
                fontWeight: 300,
                animation: "hp-fadeup .65s .25s ease both",
              }}
            >
              Sunce ERP is the all-in-one service management platform built for
              solar inverter companies — covering tickets, job cards, SLA
              tracking, logistics, and team access from a single dashboard.
            </p>

            <div
              className="hp-hero-actions"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                marginBottom: 72,
                animation: "hp-fadeup .65s .35s ease both",
              }}
            >
              <Link
                href="/signup"
                style={{
                  padding: "16px 42px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#6b3a1f,#8B4513)",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 6px 20px rgba(107,58,31,.35)",
                  transition: "all .22s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 30px rgba(107,58,31,.42)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(107,58,31,.35)";
                }}
              >
                Start for Free <LuArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/login"
                style={{
                  padding: "15px 34px",
                  borderRadius: 12,
                  border: "1.5px solid #d6cfc3",
                  background: "rgba(255,255,255,0.7)",
                  color: "#5c5044",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all .2s",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6b3a1f";
                  e.currentTarget.style.color = "#6b3a1f";
                  e.currentTarget.style.background = "rgba(107,58,31,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d6cfc3";
                  e.currentTarget.style.color = "#5c5044";
                  e.currentTarget.style.background = "rgba(255,255,255,0.7)";
                }}
              >
                Sign In to Dashboard
              </Link>
            </div>

            {/* Stats row */}
            <div
              className="hp-stats-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                flexWrap: "wrap",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(232,226,216,0.9)",
                borderRadius: 16,
                padding: "24px 40px",
                maxWidth: 720,
                margin: "0 auto",
                boxShadow: "0 8px 32px rgba(26,22,18,0.06)",
                animation: "hp-fadeup .65s .45s ease both",
              }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 && (
                      <div
                        className="hp-stat-sep"
                        style={{
                          width: 1,
                          height: 36,
                          background: "#e8e2d8",
                          margin: "0 28px",
                        }}
                      />
                    )}
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          marginBottom: 3,
                        }}
                      >
                        <Icon size={13} color="#B8860B" aria-hidden />
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#1a1612",
                            lineHeight: 1,
                          }}
                        >
                          {s.num}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "#9c8e80",
                          textTransform: "uppercase",
                          letterSpacing: "0.7px",
                          fontWeight: 500,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════ MARQUEE STRIP ══════════════ */}
        <div
          style={{
            background: "#1a1612",
            padding: "14px 0",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <style>{`
            @keyframes hp-marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
            .hp-marquee-track { display:flex; animation:hp-marquee 28s linear infinite; width:max-content; }
          `}</style>
          <div className="hp-marquee-track">
            {[...Array(2)].map((_, rep) => (
              <div key={rep} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {[
                  "Ticket Management",
                  "SLA Tracking",
                  "Job Cards",
                  "Logistics",
                  "Role-Based Access",
                  "Reports & Analytics",
                  "Inverter Service",
                  "Field Engineers",
                  "Warranty Tracking",
                  "Customer Portal",
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        padding: "0 28px",
                      }}
                    >
                      {t}
                    </span>
                    <LuSunMedium size={12} color="rgba(184,134,11,0.6)" aria-hidden />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ FEATURES ══════════════ */}
        <section id="features" style={{ padding: "100px 72px" }}>
          <div className="hp-reveal" style={{ marginBottom: 60 }}>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#B8860B",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 14,
              }}
            >
              Platform Capabilities
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(36px,3.8vw,58px)",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  color: "#1a1612",
                }}
              >
                Everything your team needs,
                <br />
                in one place.
              </h2>
              <p
                style={{
                  fontSize: 15.5,
                  color: "#5c5044",
                  lineHeight: 1.75,
                  maxWidth: 380,
                  fontWeight: 300,
                }}
              >
                Built for solar inverter service companies — covering the full
                lifecycle from customer complaint to closed ticket.
              </p>
            </div>
          </div>

          <div className="hp-grid hp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="hp-reveal hp-card-hover"
                  style={{ transitionDelay: `${i * 0.07}s` }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e2d8",
                      borderRadius: 16,
                      padding: "32px 28px",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top gradient bar */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background:
                          "linear-gradient(90deg,#6b3a1f,#B8860B,#6b3a1f)",
                        backgroundSize: "200% 100%",
                        animation: "hp-shimmer 3s linear infinite",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 13,
                          background: "#f5f3ef",
                          border: "1px solid #e8e2d8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b3a1f",
                        }}
                      >
                        <Icon size={22} aria-hidden />
                      </div>
                      <span
                        className="hp-tag"
                        style={{
                          background: "rgba(184,134,11,0.09)",
                          color: "#B8860B",
                          border: "1px solid rgba(184,134,11,0.18)",
                        }}
                      >
                        {f.tag}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1a1612",
                        marginBottom: 10,
                      }}
                    >
                      {f.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: "#5c5044", lineHeight: 1.7 }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ STATS DARK BAND ══════════════ */}
        <div
          style={{
            background: "linear-gradient(135deg,#1a0e08,#2d1810,#1a0e08)",
            padding: "72px 72px",
          }}
          className="hp-reveal hp-band"
        >
          <div className="hp-band-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "rgba(184,134,11,0.8)",
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 14,
                }}
              >
                By the numbers
              </span>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(32px,3.5vw,52px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "#fff",
                  marginBottom: 20,
                }}
              >
                Trusted by solar service
                <br />
                teams across India.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.75,
                  fontWeight: 300,
                  maxWidth: 380,
                }}
              >
                From small service centres to pan-India solar companies, Sunce ERP
                powers mission-critical workflows every day.
              </p>
              <Link
                href="/signup"
                style={{
                  marginTop: 32,
                  padding: "13px 28px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
              >
                Join now <LuArrowRight size={15} aria-hidden />
              </Link>
            </div>
            <div className="hp-band-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { val: "500+", label: "Tickets Closed", sub: "This year" },
                { val: "98%", label: "SLA Met", sub: "On average" },
                { val: "<48h", label: "Avg Resolution", sub: "Per ticket" },
                { val: "4", label: "User Roles", sub: "Fully granular" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 14,
                    padding: "24px 20px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 40,
                      fontWeight: 700,
                      color: "#B8860B",
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {s.val}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)", marginBottom: 3 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono',monospace" }}>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ HOW IT WORKS ══════════════ */}
        <section id="how-it-works" style={{ padding: "100px 72px", background: "#f5f0e8" }}>
          <div className="hp-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#B8860B",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 14,
              }}
            >
              Workflow
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(36px,3.8vw,58px)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#1a1612",
                marginBottom: 16,
              }}
            >
              From fault to fix — four steps.
            </h2>
            <p
              style={{
                fontSize: 15.5,
                color: "#5c5044",
                lineHeight: 1.75,
                maxWidth: 500,
                margin: "0 auto",
                fontWeight: 300,
              }}
            >
              A clear, structured process that keeps every stakeholder informed
              and every SLA on track.
            </p>
          </div>

          <div className="hp-grid hp-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, position: "relative" }}>
            {/* connecting line */}
            <div
              className="hp-steps-line"
              style={{
                position: "absolute",
                top: 52,
                left: "calc(12.5% + 28px)",
                right: "calc(12.5% + 28px)",
                height: 2,
                background: "linear-gradient(90deg,#6b3a1f,#B8860B,#6b3a1f)",
                backgroundSize: "200%",
                animation: "hp-shimmer 4s linear infinite",
                zIndex: 0,
                borderRadius: 2,
              }}
            />

            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="hp-reveal" style={{ transitionDelay: `${i * 0.1}s`, position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e2d8",
                      borderRadius: 16,
                      padding: "32px 24px",
                      textAlign: "center",
                      transition: "all .25s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 20px 50px rgba(26,22,18,.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#6b3a1f,#8B4513)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 6px 18px rgba(107,58,31,.3)",
                        color: "#fff",
                      }}
                    >
                      <Icon size={26} aria-hidden />
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 10,
                        color: "#B8860B",
                        letterSpacing: "1px",
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      STEP {s.n}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1612", marginBottom: 10 }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 13, color: "#5c5044", lineHeight: 1.65 }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ ROLES ══════════════ */}
        <section id="roles" style={{ padding: "100px 72px" }}>
          <div className="hp-reveal" style={{ marginBottom: 60 }}>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#B8860B",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 14,
              }}
            >
              Role-Based Access
            </span>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(36px,3.8vw,58px)",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  color: "#1a1612",
                }}
              >
                Right access for
                <br />
                every team member.
              </h2>
              <p style={{ fontSize: 15.5, color: "#5c5044", lineHeight: 1.75, maxWidth: 380, fontWeight: 300 }}>
                Each role sees only what they need — no clutter, no confusion,
                complete control at every level.
              </p>
            </div>
          </div>

          <div className="hp-grid hp-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={r.name} className="hp-reveal hp-card-hover" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e2d8",
                      borderTop: `4px solid ${r.color}`,
                      borderRadius: 16,
                      padding: "28px 24px",
                      height: "100%",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          background: r.bg,
                          border: `1px solid ${r.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: r.color,
                        }}
                      >
                        <Icon size={20} aria-hidden />
                      </div>
                      <span className="hp-tag" style={{ background: r.bg, color: r.color, border: `1px solid ${r.color}20` }}>
                        {r.tag}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1612", marginBottom: 8 }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#5c5044", lineHeight: 1.65, marginBottom: 20 }}>
                      {r.desc}
                    </div>
                    <div style={{ borderTop: "1px solid #f0ebe3", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                      {r.perms.map((p) => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#5c5044" }}>
                          <LuCircleCheck size={13} color={r.color} aria-hidden />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ WHY US ══════════════ */}
        <section id="why-us" style={{ padding: "100px 72px", background: "#f5f0e8" }}>
          <div className="hp-reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#B8860B",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 14,
              }}
            >
              Why Sunce ERP
            </span>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(36px,3.8vw,58px)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#1a1612",
              }}
            >
              Not just software.
              <br />A service partner.
            </h2>
          </div>

          <div className="hp-grid hp-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {whyUs.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="hp-reveal hp-card-hover" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div style={{ background: "#fff", border: "1px solid #e8e2d8", borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background:
                          "linear-gradient(135deg,rgba(107,58,31,0.1),rgba(184,134,11,0.1))",
                        border: "1px solid rgba(107,58,31,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 22px",
                        color: "#6b3a1f",
                      }}
                    >
                      <Icon size={28} aria-hidden />
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1612", marginBottom: 12 }}>
                      {w.title}
                    </div>
                    <div style={{ fontSize: 14, color: "#5c5044", lineHeight: 1.72 }}>
                      {w.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════ CTA BANNER ══════════════ */}
        <div style={{ margin: "0 72px 100px" }} className="hp-reveal hp-cta-wrap">
          <div
            className="hp-cta"
            style={{
              background:
                "linear-gradient(135deg,#1a0e08 0%,#3d1e0a 35%,#6b3a1f 70%,#8B4513 100%)",
              borderRadius: 24,
              padding: "80px 88px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 48,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="hp-cta-decor"
              style={{
                position: "absolute",
                width: 600,
                height: 600,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(184,134,11,.14) 0%,transparent 65%)",
                top: -250,
                right: -50,
                pointerEvents: "none",
              }}
            />
            <div
              className="hp-cta-decor"
              style={{
                position: "absolute",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(255,255,255,.03) 0%,transparent 65%)",
                bottom: -100,
                left: 200,
                pointerEvents: "none",
              }}
            />
            {/* decorative sun rings */}
            <div
              className="hp-cta-decor"
              style={{
                position: "absolute",
                right: 88,
                top: "50%",
                transform: "translateY(-50%)",
                width: 220,
                height: 220,
                borderRadius: "50%",
                border: "1px solid rgba(184,134,11,.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  border: "1px solid rgba(184,134,11,.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(184,134,11,.12)",
                    border: "1px solid rgba(184,134,11,.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(184,134,11,0.7)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src="/logo.jpg"
                    alt=""
                    fill
                    sizes="80px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
              <div
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10.5,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  color: "rgba(184,134,11,.85)",
                  marginBottom: 14,
                }}
              >
                Ready to get started?
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(36px,4vw,52px)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.08,
                  marginBottom: 18,
                }}
              >
                Power your solar
                <br />
                service operations today.
              </div>
              <div
                style={{
                  fontSize: 15.5,
                  color: "rgba(255,255,255,.62)",
                  lineHeight: 1.75,
                  fontWeight: 300,
                }}
              >
                Join service teams already managing inverter repairs, SLA
                compliance, and customer communication on Sunce ERP.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flexShrink: 0, position: "relative", zIndex: 1 }}>
              <Link
                href="/signup"
                style={{
                  padding: "16px 38px",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#6b3a1f",
                  border: "none",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 20px rgba(0,0,0,.2)",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,.28)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.2)";
                }}
              >
                Create Free Account <LuArrowRight size={15} aria-hidden />
              </Link>
              <Link
                href="/login"
                style={{
                  padding: "15px 34px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,.25)",
                  background: "transparent",
                  color: "rgba(255,255,255,.82)",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.09)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,.25)";
                }}
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer className="hp-footer" style={{ borderTop: "1px solid #e8e2d8", padding: "40px 72px" }}>
          <div className="hp-footer-top" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#6b3a1f,#a0522d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: "#fff",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/logo.jpg"
                      alt="Sunce ERP"
                      fill
                      sizes="28px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#1a1612" }}>
                  Sunce ERP
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#9c8e80", lineHeight: 1.65 }}>
                India's service management platform built for solar inverter
                companies.
              </p>
            </div>
            <div className="hp-footer-cols" style={{ display: "flex", gap: 64 }}>
              {[
                { heading: "Product", links: ["Features", "How It Works", "Roles", "Pricing"] },
                { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                { heading: "Legal", links: ["Privacy", "Terms", "Security", "Support"] },
              ].map((col) => (
                <div key={col.heading}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#1a1612",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      marginBottom: 14,
                      fontFamily: "'DM Mono',monospace",
                    }}
                  >
                    {col.heading}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {col.links.map((l) => (
                      <a
                        key={l}
                        href="#"
                        style={{
                          fontSize: 13,
                          color: "#9c8e80",
                          textDecoration: "none",
                          transition: "color .2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#6b3a1f")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9c8e80")}
                      >
                        {l}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hp-footer-bottom" style={{ borderTop: "1px solid #f0ebe3", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, color: "#9c8e80" }}>
              © 2026 Sunce ERP. All rights reserved.
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {["Privacy", "Terms", "Cookies"].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{ fontSize: 12, color: "#9c8e80", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#6b3a1f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9c8e80")}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
