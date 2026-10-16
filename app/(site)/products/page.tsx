import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "../../components/JsonLd";
import { PRODUCTS } from "../../lib/products";
import { pageMetadata } from "../../lib/seo";
import { SITE_URL } from "../../lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Solar Monitoring Products | SNet Devices for Solar Plants",
  description:
    "Explore SNet solar monitoring products — portable string monitoring devices, LoRa wireless modules, string monitoring boxes, RS485 convertors and IoT gateways for solar plants in India.",
  path: "/products",
  keywords: [
    "solar monitoring devices",
    "string monitoring solar",
    "solar IoT gateway",
    "LoRa solar monitoring",
    "RS485 to Ethernet convertor",
    "solar plant monitoring India",
  ],
  image: "/1.png",
  imageAlt: "SNet solar monitoring products",
});

const productsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Solar Monitoring Products",
  url: `${SITE_URL}/products`,
  description:
    "SNet solar monitoring product range including string monitoring devices, LoRa modules, monitoring boxes, protocol convertors and IoT gateways.",
  hasPart: PRODUCTS.map((p) => ({
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: `${SITE_URL}${p.image}`,
    url: `${SITE_URL}/products/${p.slug}`,
    brand: { "@type": "Brand", name: "SNet" },
    manufacturer: { "@type": "Organization", name: "Sunce Renewables" },
  })),
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
    ],
  },
};

export default function ProductsPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productsJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section
        style={{
          minHeight: "40vh",
          background: "#1a1c23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 6vw 60px",
          textAlign: "center",
        }}
      >
        <div style={{ zIndex: 2 }}>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.1,
              margin: "0 0 10px",
            }}
          >
            Solar Monitoring Products
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              maxWidth: 640,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            SNet devices for string monitoring, wireless data acquisition and
            remote solar plant visibility — designed and manufactured in India.
          </p>
          <div
            style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 500,
              marginTop: 14,
            }}
          >
            <a href="/" style={{ color: "inherit" }}>
              Home
            </a>{" "}
            / Products
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 6vw", background: "#faf9f7" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 28,
          }}
        >
          {PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              style={{
                display: "block",
                background: "#fff",
                border: "1px solid var(--border-site, #e8e2d9)",
                borderRadius: 14,
                overflow: "hidden",
                textDecoration: "none",
                color: "inherit",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
            >
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff",
                  padding: 20,
                }}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ padding: "20px 22px 26px" }}>
                <h2
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--navy, #233999)",
                    margin: "0 0 8px",
                  }}
                >
                  {p.name}
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {p.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
