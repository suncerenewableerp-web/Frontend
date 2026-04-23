"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ERP_ICON = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);


export default function Navbar({ onOpen }: { onOpen?: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const products = [
    { name: "SNet Portable String Monitoring", img: "/1.png", href: "/products/snet-portable-string-monitoring-device" },
    { name: "SNet - LoRa", img: "/2.png", href: "/products/snet-lora" },
    { name: "SNet Monitoring Box", img: "/SNet String Monitoring Box.webp", href: "/products/snet-string-monitoring-box" },
    { name: "RS485 to Ethernet", img: "/2.png", href: "/products/snet-rs485-to-ethernet-convertor" },
    { name: "SNet IoT Gateway", img: "/3.png", href: "/products/snet-iot-gateway" },
  ];

  return (
    <>
      <nav
        className="nv"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5vw",
          background: scrolled
            ? "rgba(240,235,224,0.94)"
            : "rgba(240,235,224,0.8)",
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid ${
            scrolled ? "rgba(44,26,14,0.12)" : "transparent"
          }`,
          transition: "border-color 0.4s,background 0.4s",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "#f0ebe0",
              border: "1.5px solid rgba(44,26,14,0.15)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src="/logo.jpg"
              alt="Sunce"
              style={{ width: 32, height: 32, objectFit: "contain" }}
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                if (t.parentElement)
                  t.parentElement.innerHTML = `<span style="font-size:0.82rem;font-weight:800;letter-spacing:.06em">SR</span>`;
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--brown)",
                lineHeight: 1.15,
              }}
            >
              Sunce Renewables
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                color: "var(--brown-light)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Solar Energy Solutions
            </div>
          </div>
        </Link>

        <div className="nv-r" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "0.83rem", color: "var(--brown-mid)", fontWeight: 600, textDecoration: "none", padding: "9px 16px", borderRadius: 8 }}>Home</Link>
          <div className="nv-dropdown">
            <button className="nv-dropdown-trigger">
              Products
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <div className="nv-dropdown-menu">
              {products.map((p, i) => (
                <Link key={i} href={p.href}>
                  {p.img && <img src={p.img} alt="" onError={(e) => e.currentTarget.style.display = 'none'} />}
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="nv-dropdown">
            <button className="nv-dropdown-trigger">
              Company
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <div className="nv-dropdown-menu">
              <Link href="/about">About</Link>
              <Link href="/management">Management</Link>
              <Link href="/career">Career</Link>
            </div>
          </div>
          <Link href="/contact" style={{ fontSize: "0.83rem", color: "var(--brown-mid)", fontWeight: 600, textDecoration: "none", padding: "9px 16px", borderRadius: 8 }}>Contact</Link>
          <Link
            href="/login"
            className="nv-erp"
            style={{
              fontSize: "0.83rem",
              color: "var(--brown-mid)",
              fontWeight: 600,
              textDecoration: "none",
              padding: "9px 18px",
              border: "1.5px solid var(--border-mid)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "border-color 0.2s,color 0.2s",
            }}
          >
            {ERP_ICON} Solar Inverter Services
          </Link>
          {onOpen && (
            <button
              onClick={onOpen}
              className="btn-dark nv-qt"
              style={{ padding: "10px 22px", fontSize: "0.83rem" }}
            >
              Get a Quote →
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
