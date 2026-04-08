"use client";

import { useEffect, useState, type CSSProperties } from "react";
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

const WHATSAPP_NUMBER = "916361991349";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --cream: #f0ebe0; --cream-dark: #e8e0d0; --cream-mid: #ede5d6;
    --brown: #2c1a0e; --brown-mid: #4a2e18; --brown-light: #7a5c3e;
    --gold: #b5821a; --gold-light: #d4a043; --gold-warm: #e8a917;
    --border: rgba(44,26,14,0.1); --border-mid: rgba(44,26,14,0.18);
    --wa: #25D366;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--cream); color: var(--brown); font-family: 'Outfit', sans-serif; overflow-x: hidden; }
  ::selection { background: var(--gold-warm); color: var(--brown); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--cream-dark); }
  ::-webkit-scrollbar-thumb { background: var(--brown-light); border-radius: 3px; }

  .rv { opacity: 0; transform: translateY(32px); transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1); }
  .rv.in { opacity: 1; transform: translateY(0); }

  .btn-dark { display:inline-flex;align-items:center;gap:8px;background:var(--brown);color:var(--cream);padding:13px 28px;border-radius:8px;font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:600;letter-spacing:0.03em;text-decoration:none;border:none;cursor:pointer;transition:background 0.2s,transform 0.18s,box-shadow 0.2s;box-shadow:0 2px 12px rgba(44,26,14,0.18); }
  .btn-dark:hover { background:var(--brown-mid);transform:translateY(-1px);box-shadow:0 6px 20px rgba(44,26,14,0.22); }
  .btn-outline-dark { display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--brown);padding:12px 26px;border-radius:8px;font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:500;letter-spacing:0.03em;text-decoration:none;border:1.5px solid var(--border-mid);cursor:pointer;transition:border-color 0.2s,background 0.2s; }
  .btn-outline-dark:hover { border-color:var(--brown-light);background:rgba(44,26,14,0.04); }
  .btn-wa { display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--wa);color:#fff;padding:14px 32px;border-radius:8px;font-family:'Outfit',sans-serif;font-size:0.92rem;font-weight:600;border:none;cursor:pointer;transition:background 0.2s,transform 0.18s,box-shadow 0.2s;box-shadow:0 4px 16px rgba(37,211,102,0.35);text-decoration:none; }
  .btn-wa:hover { background:#1ebe5d;transform:translateY(-1px);box-shadow:0 8px 24px rgba(37,211,102,0.4); }
  .btn-wa:disabled { opacity:0.45;cursor:not-allowed;transform:none; }

  .slabel { display:inline-flex;align-items:center;gap:7px;background:rgba(181,130,26,0.1);border:1px solid rgba(181,130,26,0.28);color:var(--gold);padding:5px 14px;border-radius:50px;font-size:0.72rem;font-weight:600;letter-spacing:0.13em;text-transform:uppercase;margin-bottom:16px; }
  .slabel::before { content:'';width:6px;height:6px;border-radius:50%;background:var(--gold-warm);display:inline-block; }
  .gi { font-style:italic;color:var(--gold);font-weight:600;text-decoration:underline;text-decoration-color:rgba(181,130,26,0.4);text-underline-offset:5px; }

  .sc { background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform 0.35s cubic-bezier(.22,1,.36,1),box-shadow 0.35s,border-color 0.25s; }
  .sc:hover { transform:translateY(-6px);box-shadow:0 20px 50px rgba(44,26,14,0.12);border-color:rgba(181,130,26,0.3); }
  .sc:hover .sc-img { transform:scale(1.05); }
  .sc-img { width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform 0.55s cubic-bezier(.22,1,.36,1); }
  .sc-img.contain { object-fit:contain; transform:none!important; }
  .wc { padding:28px 24px;border-radius:14px;border:1px solid var(--border);background:#fff;transition:box-shadow 0.3s,border-color 0.25s,transform 0.3s; }
  .wc:hover { box-shadow:0 10px 32px rgba(44,26,14,0.09);border-color:rgba(181,130,26,0.25);transform:translateY(-3px); }
  .mi { border-radius:14px;overflow:hidden;background:var(--cream-dark); }
  .mi img { width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform 0.55s cubic-bezier(.22,1,.36,1),filter 0.3s;filter:sepia(0.1) saturate(0.9); }
  .mi:hover img { transform:scale(1.06);filter:sepia(0) saturate(1); }

  @keyframes tick { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
  .tk-track { display:flex;animation:tick 30s linear infinite;white-space:nowrap; }

  .fi { width:100%;background:var(--cream);border:1px solid var(--border-mid);border-radius:10px;padding:13px 16px;color:var(--brown);font-family:'Outfit',sans-serif;font-size:0.92rem;outline:none;transition:border-color 0.2s,background 0.2s; }
  .fi:focus { border-color:var(--gold);background:#fff; }
  .fi::placeholder { color:rgba(44,26,14,0.3); }
  textarea.fi { resize:vertical;min-height:100px; }

  /* Modal */
  .mo { position:fixed;inset:0;z-index:1100;background:rgba(44,26,14,0.6);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:20px;animation:mofade 0.2s ease; }
  .mb { background:var(--cream);border-radius:22px;border:1px solid var(--border-mid);padding:40px 36px;width:100%;max-width:460px;box-shadow:0 30px 80px rgba(44,26,14,0.28);position:relative;animation:moup 0.26s cubic-bezier(.22,1,.36,1); }
  @keyframes mofade { from{opacity:0} to{opacity:1} }
  @keyframes moup { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  .mc { position:absolute;top:14px;right:16px;background:rgba(44,26,14,0.07);border:none;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--brown-light);transition:background 0.2s,color 0.2s; }
  .mc:hover { background:rgba(44,26,14,0.14);color:var(--brown); }

  /* Floating WA */
  .waf { position:fixed;bottom:28px;right:28px;z-index:1000;width:58px;height:58px;border-radius:50%;background:var(--wa);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(37,211,102,0.45);cursor:pointer;border:none;transition:transform 0.2s,box-shadow 0.2s;animation:wapulse 2.5s infinite; }
  .waf:hover { transform:scale(1.1);box-shadow:0 10px 32px rgba(37,211,102,0.55); }
  @keyframes wapulse { 0%,100%{box-shadow:0 6px 24px rgba(37,211,102,0.45)} 50%{box-shadow:0 6px 34px rgba(37,211,102,0.7)} }

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
  }
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rv");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const WA_SVG = (size = 24, color = "white") => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

type WAFormState = { name: string; phone: string; message: string };

function WAModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<WAFormState>({
    name: "",
    phone: "",
    message: "",
  });

  const valid = form.name.trim() && form.phone.trim() && form.message.trim();

  const handleSend = () => {
    const text = `Hello Sunce Renewables! 👋\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n*Message:* ${form.message}`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    onClose();
  };

  const fields: Array<{
    label: string;
    key: keyof Pick<WAFormState, "name" | "phone">;
    placeholder: string;
    type: string;
  }> = [
    {
      label: "Your Name",
      key: "name",
      placeholder: "Enter your full name",
      type: "text",
    },
    {
      label: "Phone Number",
      key: "phone",
      placeholder: "+91 XXXXX XXXXX",
      type: "tel",
    },
  ];

  return (
    <div
      className="mo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mb">
        <button className="mc" onClick={onClose}>
          ✕
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {WA_SVG(26)}
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.45rem",
                fontWeight: 700,
                color: "var(--brown)",
                lineHeight: 1.15,
              }}
            >
              Chat on WhatsApp
            </h3>
            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--brown-light)",
                marginTop: 2,
              }}
            >
              Fill your details — WhatsApp opens instantly
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {fields.map((f) => (
            <div key={f.key}>
              <label
                style={{
                  fontSize: "0.68rem",
                  color: "var(--gold)",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {f.label} *
              </label>
              <input
                className="fi"
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) =>
                  setForm({ ...form, [f.key]: e.target.value })
                }
              />
            </div>
          ))}
          <div>
            <label
              style={{
                fontSize: "0.68rem",
                color: "var(--gold)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Your Message *
            </label>
            <textarea
              className="fi"
              placeholder="Tell us about your solar project or service requirement..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <button
            className="btn-wa"
            onClick={handleSend}
            disabled={!valid}
            style={{ marginTop: 4, width: "100%" }}
          >
            {WA_SVG(20)}
            Send on WhatsApp
          </button>
          <p
            style={{
              fontSize: "0.7rem",
              color: "var(--brown-light)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Opens WhatsApp with your message pre-filled
          </p>
        </div>
      </div>
    </div>
  );
}

function Navbar({ onOpen }: { onOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
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
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
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
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <a
          href="/erp"
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
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--gold)";
            el.style.color = "var(--brown)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border-mid)";
            el.style.color = "var(--brown-mid)";
          }}
        >
          {ERP_ICON} Sunce ERP
        </a>
        <button
          onClick={onOpen}
          className="btn-dark"
          style={{ padding: "10px 22px", fontSize: "0.83rem" }}
        >
          Get a Quote →
        </button>
      </div>
    </nav>
  );
}

function Hero({ onOpen }: { onOpen: () => void }) {
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

  const fadeR = (d: number): CSSProperties => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "none" : "translateX(40px) scale(0.97)",
    transition: `opacity 1s cubic-bezier(.22,1,.36,1) ${d}s, transform 1s cubic-bezier(.22,1,.36,1) ${d}s`,
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
        background: "var(--cream)",
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
          left: "-140px",
          top: "10%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          border: "1px solid rgba(44,26,14,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-90px",
          top: "18%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: "1px solid rgba(44,26,14,0.04)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "38%",
          bottom: "-60px",
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: "1px solid rgba(181,130,26,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      <div
        className="hg"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
          width: "100%",
          maxWidth: 1200,
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
            <button onClick={onOpen} className="btn-dark">
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

        <div className="hi" style={{ ...fadeR(0.3), position: "relative", zIndex: 2 }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "108%",
              height: "108%",
              borderRadius: "28px",
              border: "1.5px solid rgba(181,130,26,0.18)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -16,
              right: -16,
              width: "100%",
              height: "100%",
              borderRadius: 24,
              background: "var(--cream-dark)",
              border: "1px solid var(--border)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(44,26,14,0.18)",
              aspectRatio: "4/5",
            }}
          >
            <img
              src="/hero.jpeg"
              alt="Sunce Solar Hero"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: "sepia(0.08) saturate(0.92)",
              }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                if (el.parentElement) {
                  el.parentElement.style.background = "var(--cream-dark)";
                  el.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:1.2rem;font-weight:800;letter-spacing:.12em;opacity:0.35">SUNCE</div>`;
                }
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(44,26,14,0.45) 0%, transparent 50%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 22,
                left: 22,
                background: "rgba(240,235,224,0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(44,26,14,0.12)",
                borderRadius: 14,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "var(--brown)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LuSunMedium size={20} color="var(--cream)" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--brown)",
                    lineHeight: 1.2,
                  }}
                >
                  Certified Inverter Doctors
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--brown-light)",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  Pan India · Since 2017
                </div>
              </div>
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
    <section style={{ background: "var(--cream-mid)", padding: "110px 6vw" }}>
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

function CTA({ onOpen }: { onOpen: () => void }) {
  return (
    <section style={{ background: "var(--brown)", padding: "100px 6vw", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: "-80px", top: "-80px", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(181,130,26,0.12)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "40%", bottom: "-60px", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(181,130,26,0.08)", pointerEvents: "none" }} />
      <div className="rv" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(181,130,26,0.15)", border: "1px solid rgba(181,130,26,0.3)", color: "var(--gold-warm)", padding: "5px 14px", borderRadius: 50, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-warm)", display: "inline-block" }} /> Get In Touch
        </span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 700, color: "var(--cream)", lineHeight: 1.1, marginBottom: 18 }}>
          Ready to Harness <em style={{ fontStyle: "italic", color: "var(--gold-warm)" }}>Solar Power?</em>
        </h2>
        <p style={{ fontSize: "1rem", color: "rgba(240,235,224,0.6)", lineHeight: 1.8, marginBottom: 42 }}>
          Talk to our certified solar experts today. We&apos;ll design, deploy and maintain the perfect solution — at any scale.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onOpen} className="btn-wa" style={{ width: "auto", padding: "14px 34px", fontSize: "0.95rem" }}>
            {WA_SVG(20)} WhatsApp Us Now
          </button>
        </div>
        <div style={{ marginTop: 52, display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
          {[
            { Icon: LuMapPin, val: "Sector 63, NOIDA, UP 201309" },
            { Icon: LuPhone, val: "0120 459 8196" },
            { Icon: LuGlobe, val: "www.suncerenewable.com" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", alignItems: "center", opacity: 0.9 }}>
                <c.Icon size={16} />
              </span>
              <span style={{ fontSize: "0.83rem", color: "rgba(240,235,224,0.55)", fontWeight: 500 }}>{c.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--cream)", borderTop: "1px solid var(--border)", padding: "26px 6vw" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--brown)" }}>Sunce Renewables Pvt. Ltd.</span>
        <a href="/erp"
          style={{ fontSize: "0.82rem", color: "var(--gold)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-light)"}
          onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)"}>
          {ERP_ICON} Sunce ERP Platform ↗
        </a>
        <span style={{ fontSize: "0.78rem", color: "var(--brown-light)", opacity: 0.65 }}>© {new Date().getFullYear()} Sunce Renewables · NOIDA, India</span>
      </div>
    </footer>
  );
}

export default function HomePage() {
  useReveal();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <main>
      {open && <WAModal onClose={() => setOpen(false)} />}
      <Navbar onOpen={() => setOpen(true)} />
      <Hero onOpen={() => setOpen(true)} />
      <Ticker />
      <Services />
      <About />
      <WhyUs />
      <Projects />
      <CTA onOpen={() => setOpen(true)} />
      <Footer />
      <button className="waf" onClick={() => setOpen(true)} title="Chat on WhatsApp">
        {WA_SVG(28)}
      </button>
    </main>
  );
}
