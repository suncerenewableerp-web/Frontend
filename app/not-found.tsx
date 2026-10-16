import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/career", label: "Career" },
];

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 6vw",
        background: "#1a1c23",
        color: "#fff",
      }}
    >
      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#c9a45c",
          marginBottom: 12,
        }}
      >
        404 — Page Not Found
      </p>
      <h1
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 800,
          margin: "0 0 12px",
        }}
      >
        This page could not be found
      </h1>
      <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 28px" }}>
        The page you are looking for may have moved or does not exist. Explore
        our solar inverter services and SNet solar monitoring products instead.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
