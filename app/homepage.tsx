"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useModal } from "./components/ModalContext";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  LuChartBar,
  LuChartColumn,
  LuGlobe,
  LuMapPin,
  LuPhone,
  LuStar,
  LuSunMedium,
  LuTicket,
  LuTruck,
  LuWrench,
} from "react-icons/lu";


const GLOBAL_CSS = `
  .gi { font-style: normal; color: var(--gold-warm); }
  .slabel { display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold-site); margin-bottom: 12px; }
  .sc { background: #fff; border: 1px solid var(--border-site); border-radius: 14px; overflow: hidden; transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s; }
  .sc:hover { transform: translateY(-8px); box-shadow: 0 20px 45px rgba(44,26,14,0.1); }
  .sc-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(.22,1,.36,1); }
  .sc:hover .sc-img { transform: scale(1.06); }
  .mi { border-radius: 14px; overflow: hidden; border: 1px solid var(--border-site); background: var(--cream-dark); }
  .mi img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(.22,1,.36,1); }
  .mi:hover img { transform: scale(1.05); }
  .wc { background: #fff; border: 1px solid var(--border-site); border-radius: 14px; padding: 32px 28px; transition: all 0.3s; }
  .wc:hover { border-color: var(--gold-warm); transform: translateY(-4px); box-shadow: 0 12px 30px rgba(44,26,14,0.06); }

  @media (max-width:900px) {
    .dn-m { display:none!important; }
    .hg,.sg,.ag,.cg { grid-template-columns:1fr!important; }
    .mg { grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important; }
    .pg { grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important; }
    .wg { grid-template-columns:1fr 1fr!important; }
    .hi { display:none!important; }
    .mb { padding:28px 20px; }
  }
  @media (max-width:540px) {
    .wg { grid-template-columns:1fr!important; }
    .sb-inner { flex-wrap:wrap!important; }
    .sb-item { width:50%!important;border-right:none!important;border-bottom:1px solid var(--border)!important; }
    .nv { padding: 0 14px !important; height: 62px !important; }
    .nv-r { gap: 8px !important; }
    .nv-erp { padding: 8px 12px !important; font-size: 0.75rem !important; }
    .nv-qt { padding: 9px 14px !important; font-size: 0.75rem !important; }
  }
`;

function useReveal() {
  useEffect(() => {
    const observed = new WeakSet<Element>();

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.dataset.rv = "in";
          obs.unobserve(el);
        });
      },
      { threshold: 0.1 }
    );

    const ensureObserved = (el: HTMLElement) => {
      if (observed.has(el)) return;
      observed.add(el);
      obs.observe(el);
    };

    document.querySelectorAll<HTMLElement>(".rv").forEach(ensureObserved);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.classList.contains("rv")) ensureObserved(n);
          n.querySelectorAll?.<HTMLElement>(".rv").forEach(ensureObserved);
        });
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      obs.disconnect();
    };
  }, []);
}

function Hero() {
  const { openWAModal } = useModal();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = (d: number): CSSProperties => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "none" : "translateY(28px)",
    transition: `opacity 0.9s cubic-bezier(.22,1,.36,1) ${d}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${d}s`,
  });

  const stats: Array<{ Icon: IconType; val: string; label: string }> = [
    { Icon: LuTicket, val: "500+", label: "Plants Serviced" },
    { Icon: LuStar, val: "5.0", label: "Google Rating" },
    { Icon: LuWrench, val: "7+", label: "Years of Service" },
    { Icon: LuGlobe, val: "Pan India", label: "Coverage" },
  ];

  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        padding: "90px 6vw 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/hero.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: "scale(1.02)",
          filter: "contrast(1.1) saturate(1.08) brightness(1.03)",
          willChange: "transform",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(240,235,224,0.92) 0%, rgba(240,235,224,0.72) 48%, rgba(240,235,224,0.12) 74%, rgba(240,235,224,0) 100%)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <div
        className="hg"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          alignItems: "center",
          width: "100%",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <div style={{ zIndex: 2 }}>
          <div style={fade(0.08)}>
            <span className="slabel">
              Solar Inverter Specialists · NOIDA, India
            </span>
          </div>
          <h1
            style={{
              ...fade(0.22),
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem, 5.5vw, 5.2rem)",
              fontWeight: 700,
              color: "var(--brown)",
              lineHeight: 1.06,
              margin: "0 0 24px",
            }}
          >
            India&apos;s Trusted
            <br />
            Solar Inverter <em className="gi">Doctors.</em>
          </h1>
          <p
            style={{
              ...fade(0.38),
              fontSize: "clamp(0.93rem, 1.4vw, 1.08rem)",
              color: "var(--brown-light)",
              lineHeight: 1.82,
              maxWidth: "480px",
              margin: "0 0 40px",
            }}
          >
            Sunce Renewables is the end-to-end solar service company — covering
            PCB-level inverter repair, SCADA monitoring, O&amp;M contracts, and
            full project management from a single expert team.
          </p>
          <div
            style={{
              ...fade(0.52),
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 52,
            }}
          >
            <button onClick={openWAModal} className="btn-dark">
              Get a Free Quote →
            </button>
          </div>
          <div
            style={{
              ...fade(0.66),
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: "22px 0",
              boxShadow: "0 4px 24px rgba(44,26,14,0.07)",
            }}
          >
            <div
              className="sb-inner"
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              {stats.map((s, i, arr) => (
                <div
                  key={i}
                  className="sb-item"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    borderRight:
                      i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    padding: "4px 10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 6,
                      opacity: 0.85,
                    }}
                  >
                    <s.Icon size={16} />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.55rem",
                      fontWeight: 700,
                      color: "var(--brown)",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: "0.62rem",
                      color: "var(--brown-light)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CuttingEdgeIntro() {
  const navy = "#233E99";

  return (
    <section style={{ background: "#fff", padding: "96px 6vw 0", overflow: "hidden" }}>
      <div className="rv" style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1.85rem, 3.2vw, 2.6rem)",
            fontWeight: 800,
            color: navy,
            lineHeight: 1.2,
            margin: "0 auto",
          }}
        >
          Sunce&apos;s Cutting-Edge Solutions: Elevating Human Life and Industry
          with Expert Solar Inverter Services
        </h2>
        <p
          style={{
            margin: "18px auto 0",
            maxWidth: 980,
            fontSize: "1rem",
            lineHeight: 1.9,
            color: "rgba(44,26,14,0.72)",
          }}
        >
          At Sunce, we provide expert services like{" "}
          <em>Solar Inverter Maintenance</em>, <em>Solar Inverter Repair</em>, and{" "}
          <em>Solar Inverter AMC</em> to enhance industries and improve lives. With
          a focus on innovation and technology, our skilled Solar Inverter
          Technicians deliver reliable solutions for{" "}
          <em>Solar Inverter Breakdown</em> and other needs. Trust us for
          cutting-edge Solar Inverter Repair &amp; Services in India designed to
          drive progress and ensure long-term value.
        </p>
      </div>

      <div
        className="cg"
        style={{
          display: "grid",
          gridTemplateColumns: "1.08fr 0.92fr",
          gap: "70px",
          alignItems: "start",
          maxWidth: 1200,
          margin: "70px auto 0",
          paddingBottom: 96,
        }}
      >
        <div className="rv" style={{ position: "relative" }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-76px",
              top: "-6px",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(4.2rem, 6vw, 6.2rem)",
              letterSpacing: "0.14em",
              color: "rgba(44,26,14,0.06)",
              userSelect: "none",
              pointerEvents: "none",
              lineHeight: 1,
            }}
          >
            SUNCE
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 0,
              overflow: "hidden",
              boxShadow: "0 18px 55px rgba(44,26,14,0.12)",
              border: "1px solid rgba(44,26,14,0.08)",
            }}
          >
            <img
              src="/findmoreaboutus.webp"
              alt="Find out more about us"
              style={{ width: "100%", height: "auto", display: "block" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div style={{ height: 10, background: navy }} />
          </div>
        </div>

        <div className="rv" style={{ paddingTop: 10 }}>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: navy,
              marginBottom: 10,
            }}
          >
            Get to know us
          </div>
          <h3
            style={{
              fontSize: "clamp(2rem, 3.1vw, 2.8rem)",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#0b1220",
              lineHeight: 1.12,
              margin: "0 0 16px",
            }}
          >
            Find Out More About Us
          </h3>
          <p style={{ fontSize: "0.98rem", color: "rgba(44,26,14,0.62)", lineHeight: 1.9, marginBottom: 18 }}>
            At Sunce, established in 2016 by three visionary technocrats, we
            believe in redefining the way businesses and products are developed.
            Our unique approach focuses on a market-pull orientation rather than
            a technology-push model. By gaining in-depth market insights before
            creating technology solutions, we ensure customer satisfaction and
            market readiness for our products.
          </p>
          <p style={{ fontSize: "0.98rem", color: "rgba(44,26,14,0.62)", lineHeight: 1.9, marginBottom: 26 }}>
            Whether it&apos;s Solar Inverter Maintenance, Solar Inverter Repair,
            or handling a sudden Solar Inverter Breakdown, our services are
            tailored to meet market demands effectively.
          </p>
          <p style={{ fontSize: "0.98rem", color: "rgba(44,26,14,0.62)", lineHeight: 1.9, marginBottom: 26 }}>
            Our commercial mindset drives our mission at Sunce. We bring together
            entrepreneurial thinkers with exceptional technical expertise and
            business acumen. With over 350 skilled professionals, we&apos;ve
            developed comprehensive capabilities in product development and
            business growth.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/about"
              className="btn-dark"
              style={{
                padding: "14px 28px",
                borderRadius: 10,
                background: "var(--brown)",
                color: "#fff",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 900,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                boxShadow: "0 10px 22px rgba(44,26,14,0.20)",
                transition: "transform .2s, box-shadow .2s, background .2s",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "rgba(44,26,14,0.96)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px rgba(44,26,14,0.26)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "var(--brown)";
                e.currentTarget.style.boxShadow =
                  "0 10px 22px rgba(44,26,14,0.20)";
              }}
            >
              Explore Now
            </Link>
            <Link
              href="/login"
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: "1.5px solid rgba(44,26,14,0.22)",
                background: "transparent",
                color: "rgba(44,26,14,0.86)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                transition: "all .2s",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(44,26,14,0.42)";
                e.currentTarget.style.background = "rgba(44,26,14,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(44,26,14,0.22)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#6b3a1f,#8B4513)",
                color: "#fff",
                border: "none",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 6px 18px rgba(107,58,31,.22)",
                transition: "transform .2s, box-shadow .2s",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 22px rgba(107,58,31,.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(107,58,31,.22)";
              }}
            >
              Raise a Ticket <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const PRODUCT_CARDS = [
  { title: "SNet Portable String Monitoring", img: "/1.png" },
  { title: "SNet Lora", img: "/2.png" },
  { title: "SNet IoT Gateway", img: "/3.png" },
] as const;

type ProductCardItem = (typeof PRODUCT_CARDS)[number];

function ProductsShowcaseCard({
  item,
  variant,
  onClick,
  navy,
}: {
  item: ProductCardItem;
  variant: "left" | "center" | "right";
  onClick: () => void;
  navy: string;
}) {
  const isCenter = variant === "center";
  return (
    <button
      type="button"
      onClick={onClick}
      className="rv"
      aria-label={isCenter ? item.title : `Focus ${item.title}`}
      style={{
        width: "100%",
        display: "block",
        border: "none",
        padding: 0,
        background: "transparent",
        color: "inherit",
        textAlign: "left",
        cursor: isCenter ? "default" : "pointer",
      }}
    >
      <div
        style={{
          borderRadius: 0,
          overflow: "hidden",
          border: isCenter ? "none" : "1px solid rgba(12,59,92,0.12)",
          background: isCenter ? navy : "#f6f8fb",
          boxShadow: isCenter
            ? "0 26px 70px rgba(12,59,92,0.28)"
            : "0 14px 40px rgba(44,26,14,0.10)",
          transform: isCenter ? "translateY(-6px)" : "none",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <div
          style={{
            height: 210,
            display: "grid",
            placeItems: "center",
            background: "#fff",
            margin: isCenter ? "28px 28px 0" : "22px 22px 0",
            border: "1px solid rgba(44,26,14,0.08)",
          }}
        >
          <img
            src={item.img}
            alt={item.title}
            style={{
              maxWidth: "86%",
              maxHeight: "86%",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div
          style={{
            padding: isCenter ? "18px 28px 24px" : "16px 22px 22px",
            color: isCenter ? "#fff" : "#0b1220",
            minHeight: 66,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.02em",
              opacity: isCenter ? 0.95 : 0.78,
            }}
          >
            {item.title}
          </div>
        </div>
      </div>
    </button>
  );
}

function ProductsShowcase() {
  const { openWAModal } = useModal();
  const products = PRODUCT_CARDS;

  const [active, setActive] = useState(1);
  const len = products.length;
  const prev = (active - 1 + len) % len;
  const next = (active + 1) % len;

  const navy = "#0c3b5c";

  return (
    <section
      id="products"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #ffffff 44%, #f2f7fb 100%)",
        padding: "0 0 110px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #14181e 0%, #0c0f14 100%)",
          color: "#fff",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="rv"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "22px 6vw",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 0,
          }}
        >
          {[
            { val: "15+", label: "Team Experience" },
            { val: "500 MW+", label: "Utility Size Capacity" },
            { val: "200 MW+", label: "Rooftop Capacity" },
            { val: "40+", label: "Customer Service Base" },
            { val: "25+", label: "Team Size" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                borderRight:
                  i < 4 ? "1px solid rgba(255,255,255,0.14)" : "none",
                padding: "4px 10px",
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.01em" }}>
                {s.val}
              </div>
              <div
                style={{
                  fontSize: "0.62rem",
                  opacity: 0.7,
                  marginTop: 3,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "92px 6vw 0" }}>
        <div className="rv" style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(12,59,92,0.75)",
              marginBottom: 10,
            }}
          >
            Latest Products
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2rem, 3.4vw, 2.9rem)",
              fontWeight: 900,
              color: "#0b1220",
              lineHeight: 1.1,
              margin: "0 0 34px",
            }}
          >
            Our Products &amp; Services
          </h2>
        </div>

        <div
          className="rv sg"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr 1fr",
            gap: 26,
            alignItems: "stretch",
          }}
        >
          <ProductsShowcaseCard
            item={products[prev]}
            variant="left"
            onClick={() => setActive(prev)}
            navy={navy}
          />
          <ProductsShowcaseCard
            item={products[active]}
            variant="center"
            onClick={() => setActive(active)}
            navy={navy}
          />
          <ProductsShowcaseCard
            item={products[next]}
            variant="right"
            onClick={() => setActive(next)}
            navy={navy}
          />
        </div>

        <div
          className="wg"
          style={{
            marginTop: 74,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 36,
            alignItems: "center",
          }}
        >
          <div
            className="rv"
            style={{
              background: navy,
              color: "#fff",
              padding: "34px 34px 30px",
              boxShadow: "0 28px 70px rgba(12,59,92,0.25)",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.85 }}>
              Why choose us
            </div>
            <h3 style={{ margin: "10px 0 8px", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1.12 }}>
              Solar Inverter Repair Service
            </h3>
            <p style={{ margin: "0 0 18px", opacity: 0.9, fontSize: "0.86rem", lineHeight: 1.75 }}>
              We do all makes &amp; out of warranty. Experience unmatched expertise in inverter repairs for all leading brands, ensuring optimal performance and extended longevity.
            </p>
            <div style={{ marginTop: 16, fontSize: "0.78rem", fontWeight: 800, opacity: 0.95 }}>
              Package Includes:
            </div>
            <ul style={{ margin: "10px 0 22px 18px", padding: 0, lineHeight: 1.85, opacity: 0.9, fontSize: "0.84rem" }}>
              <li>All kinds of string inverter</li>
              <li>Central inverter</li>
              <li>SCADA System</li>
              <li>Expert Guidance</li>
            </ul>
            <button
              type="button"
              onClick={openWAModal}
              style={{
                background: "#1f3f8f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 18px",
                fontWeight: 800,
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Contact Us
            </button>
          </div>

	          <div className="rv" style={{ display: "flex", justifyContent: "center" }}>
	            <div
	              style={{
	                width: "100%",
	                maxWidth: 520,
	                background: "#fff",
	                border: "1px solid rgba(44,26,14,0.1)",
	                boxShadow: "0 16px 50px rgba(44,26,14,0.10)",
	                overflow: "hidden",
	                aspectRatio: "16/9",
	              }}
	            >
	              <img
	                src="/4.webp"
	                alt="Sunce repair workshop"
	                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
	                onError={(e) => {
	                  (e.currentTarget as HTMLImageElement).style.display = "none";
	                }}
	              />
	            </div>
	          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [
    "Solar Inverter Repair",
    "PCB Card-Level Diagnostics",
    "Remote Monitoring · SCADA",
    "Operation & Maintenance",
    "Design / PMC",
    "IoT Solutions",
    "Out-of-Warranty Services",
    "Pan India Coverage",
  ];

  const dbl = [...items, ...items];
  return (
    <div style={{ background: "var(--brown)", padding: "12px 0", overflow: "hidden" }}>
      <div className="tk-track">
        {dbl.map((item, i) => (
          <span
            key={i}
            style={{
              padding: "0 36px",
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "var(--cream)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <LuSunMedium size={14} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const SERVICES: Array<{
  Icon: IconType;
  title: string;
  sub: string;
  desc: string;
  img: string;
  tag: string | null;
  fit?: "cover" | "contain";
  pos?: string;
}> = [
  {
    Icon: LuWrench,
    title: "Solar Inverter Repair",
    sub: "PCB & Card-Level Diagnostics",
    desc: "Deep component-level repair for all major brands — Sungrow, Solax, ABB, Delta. We restore out-of-warranty inverters that others would replace.",
    img: "/sunce1.jpeg",
    tag: "Most Popular",
    fit: "contain",
    pos: "center",
  },
  {
    Icon: LuChartBar,
    title: "Remote Monitoring / SCADA",
    sub: "IoT-Enabled Plant Intelligence",
    desc: "Real-time performance dashboards with automated alerts and analytics. Full plant visibility from anywhere, 24/7.",
    img: "/sunce2.jpg",
    tag: null,
    fit: "cover",
    pos: "center 35%",
  },
  {
    Icon: LuTruck,
    title: "Operation & Maintenance",
    sub: "Preventive & Corrective O&M",
    desc: "Annual maintenance contracts with rapid-response field teams across India. Minimise downtime, maximise ROI.",
    img: "/sunce4.jpg",
    tag: null,
    fit: "cover",
    pos: "center",
  },
  {
    Icon: LuChartColumn,
    title: "Design / PMC",
    sub: "End-to-End Project Management",
    desc: "From DPR and tendering through construction supervision to final commissioning — one trusted partner for your entire solar journey.",
    img: "/design.png.webp",
    tag: null,
    fit: "contain",
    pos: "center",
  },
];

function Services() {
  return (
    <section id="services" style={{ background: "var(--cream-mid)", padding: "110px 6vw" }}>
      <div className="rv" style={{ textAlign: "center", marginBottom: 60 }}>
        <span className="slabel">What We Do</span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
            fontWeight: 700,
            color: "var(--brown)",
            lineHeight: 1.08,
          }}
        >
          Complete Solar Energy <em className="gi">Services</em>
        </h2>
      </div>
      <div className="sg" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22 }}>
        {SERVICES.map((s, i) => (
          <div key={i} className="rv sc" style={{ transitionDelay: `${i * 0.09}s` }}>
            <div style={{ height: "clamp(190px, 22vw, 240px)", overflow: "hidden", background: "var(--cream-dark)", position: "relative" }}>
              <img
                className={`sc-img ${s.fit === "contain" ? "contain" : ""}`}
                src={s.img}
                alt={s.title}
                style={{
                  objectFit: s.fit ?? "cover",
                  objectPosition: s.pos ?? "center",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(44,26,14,0.35) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(240,235,224,0.88)", backdropFilter: "blur(6px)", border: "1px solid var(--border-mid)", borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brown)" }}>
                <s.Icon size={18} />
              </div>
              {s.tag && <div style={{ position: "absolute", top: 14, right: 14, background: "var(--gold-warm)", color: "var(--brown)", padding: "3px 11px", borderRadius: 50, fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.tag}</div>}
            </div>
            <div style={{ padding: "24px 24px 28px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{s.sub}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.45rem", fontWeight: 700, color: "var(--brown)", marginBottom: 11 }}>{s.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--brown-light)", lineHeight: 1.72 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  const sp = ["Design / PMC", "SCADA Monitoring", "O&M Services", "IoT Solutions", "PCB Card Repair", "Pan India Coverage"];
  return (
    <section style={{ background: "var(--cream)", padding: "110px 6vw" }}>
      <div className="ag" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "center" }}>
        <div className="rv mg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "250px 200px", gap: 14, position: "relative" }}>
          <div className="mi" style={{ gridRow: "1/3" }}><img src="/sunce2.jpg" alt="About" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></div>
          <div className="mi"><img src="/sunce4.jpg" alt="Repair" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></div>
          <div className="mi"><img src="/sunce1.jpeg" alt="Solar" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></div>
          <div style={{ position: "absolute", bottom: -22, right: -22, zIndex: 3, background: "var(--brown)", color: "var(--cream)", borderRadius: 16, padding: "18px 22px", textAlign: "center", boxShadow: "0 12px 36px rgba(44,26,14,0.22)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 700, lineHeight: 1 }}>7+</div>
            <div style={{ fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: "var(--gold-warm)", marginTop: 3 }}>Years of<br />Excellence</div>
          </div>
        </div>
        <div className="rv" style={{ transitionDelay: "0.15s" }}>
          <span className="slabel">Who We Are</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "var(--brown)", lineHeight: 1.1, marginBottom: 20 }}>Powering India&apos;s Clean <em className="gi">Energy Future</em></h2>
          <p style={{ fontSize: "0.96rem", color: "var(--brown-light)", lineHeight: 1.82, marginBottom: 16 }}>Founded in 2017, Sunce Renewables Pvt. Ltd. is headquartered in Sector 63, NOIDA. We provide innovative products and service solutions — delivering expert consultancy from project conception all the way to commissioning.</p>
          <p style={{ fontSize: "0.96rem", color: "var(--brown-light)", lineHeight: 1.82, marginBottom: 34 }}>Our certified <strong style={{ color: "var(--brown)", fontWeight: 600 }}>&quot;Solar Inverter Doctors&quot;</strong> bring PCB-level card repair expertise that most service providers simply don&apos;t offer — restoring out-of-warranty inverters and preventing costly replacements.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 36 }}>
            {sp.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.88rem", color: "var(--brown-mid)", fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const WHY: Array<{ Icon: IconType; title: string; desc: string }> = [
  { Icon: LuWrench, title: "Card-Level PCB Repair", desc: "Deep component diagnostics most providers skip. We repair what others replace." },
  { Icon: LuGlobe, title: "Pan India Reach", desc: "Remote monitoring + nationwide field teams for rapid on-site support." },
  { Icon: LuStar, title: "Multi-Brand Certified", desc: "Sungrow, Solax, ABB, Delta and all major inverter brands serviced." },
  { Icon: LuChartColumn, title: "IoT-Enabled SCADA", desc: "Predictive analytics dashboards maximising plant uptime and ROI." },
  { Icon: LuStar, title: "5-Star Rated", desc: "8 Google reviews, all 5-star. Client trust built over 7+ years." },
  { Icon: LuTicket, title: "Single-Partner Approach", desc: "Design to decommission — one team, one point of contact, zero gaps." },
];

function WhyUs() {
  return (
    <section style={{ background: "var(--cream-mid)", padding: "110px 6vw" }}>
      <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
        <span className="slabel">Why Sunce</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "var(--brown)", lineHeight: 1.08 }}>The Sunce <em className="gi">Advantage</em></h2>
      </div>
      <div className="wg" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
        {WHY.map((w, i) => (
          <div key={i} className="rv wc" style={{ transitionDelay: `${i * 0.07}s` }}>
            <div style={{ marginBottom: 14, color: "var(--brown)", opacity: 0.85 }}>
              <w.Icon size={28} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.18rem", fontWeight: 700, color: "var(--brown)", marginBottom: 9 }}>{w.title}</h3>
            <p style={{ fontSize: "0.86rem", color: "var(--brown-light)", lineHeight: 1.72 }}>{w.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Projects() {
  const IMGS: Array<{
    src: string;
    label: string;
    fit?: "cover" | "contain";
    pos?: string;
  }> = [
    { src: "/sunce1.jpeg", label: "Inverter PCB Repair Lab" },
    { src: "/sunce2.jpg", label: "Solar Farm O&M" },
    { src: "/sunce4.jpg", label: "SCADA Control Room" },
    {
      src: "/design.png.webp",
      label: "Rooftop Installation",
      fit: "contain",
      pos: "center",
    },
  ];
  return (
    <section style={{ background: "var(--cream)", padding: "110px 6vw" }}>
      <div className="rv" style={{ marginBottom: 52 }}>
        <span className="slabel">Our Work</span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "var(--brown)", lineHeight: 1.08 }}>Projects &amp; <em className="gi">Installations</em></h2>
      </div>
      <div className="pg" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "270px 270px", gap: 16 }}>
        <div className="rv mi" style={{ gridRow: "1/3", position: "relative" }}>
          <img src={IMGS[0].src} alt={IMGS[0].label} style={{ width: "100%", height: "100%", objectFit: IMGS[0].fit ?? "cover", objectPosition: IMGS[0].pos ?? "center" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(44,26,14,0.65), transparent)", padding: "20px 18px 15px", borderRadius: "0 0 14px 14px" }}><span style={{ fontSize: "0.75rem", color: "var(--cream)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{IMGS[0].label}</span></div>
        </div>
        {IMGS.slice(1, 3).map((img, i) => (
          <div key={i} className="rv mi" style={{ position: "relative", transitionDelay: `${(i + 1) * 0.1}s` }}>
            <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: img.fit ?? "cover", objectPosition: img.pos ?? "center" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(44,26,14,0.65), transparent)", padding: "16px 14px 12px", borderRadius: "0 0 14px 14px" }}><span style={{ fontSize: "0.7rem", color: "var(--cream)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{img.label}</span></div>
          </div>
        ))}
        <div className="rv mi" style={{ gridColumn: "2/4", position: "relative", transitionDelay: "0.3s" }}>
          <img src={IMGS[3].src} alt={IMGS[3].label} style={{ width: "100%", height: "100%", objectFit: IMGS[3].fit ?? "cover", objectPosition: IMGS[3].pos ?? "center" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(44,26,14,0.65), transparent)", padding: "16px 14px 12px", borderRadius: "0 0 14px 14px" }}><span style={{ fontSize: "0.7rem", color: "var(--cream)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{IMGS[3].label}</span></div>
        </div>
      </div>
    </section>
  );
}




function CTA() {
  const { openWAModal } = useModal();
  return (
    <section style={{ padding: "80px 6vw", background: "#f0ebe0" }}>
      <div className="rv" style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center", background: "var(--brown)", padding: "60px 40px", borderRadius: 24, boxShadow: "0 20px 50px rgba(44,26,14,0.2)" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff", marginBottom: 20 }}>Ready to get started?</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto 32px" }}>Contact our expert team today for a free consultation and quote for your solar inverter needs.</p>
        <button onClick={openWAModal} className="btn-light" style={{ padding: "16px 36px", fontSize: "1rem" }}>Contact Us Now</button>
      </div>
    </section>
  );
}

export default function HomePage() {
  useReveal();

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Hero />
      <Ticker />
      <CuttingEdgeIntro />
      <ProductsShowcase />
      <About />
      <WhyUs />
      <CTA />
    </main>
  );
}
