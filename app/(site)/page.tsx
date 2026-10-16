import type { Metadata } from "next";
import HomePage from "../homepage";
import JsonLd from "../components/JsonLd";
import { SITE_URL } from "../lib/site";

export const metadata: Metadata = {
  title: "Solar Inverter Repair & Solar Services in India",
  description:
    "Expert solar inverter repair, maintenance, AMC, SCADA monitoring, O&M and solar monitoring products from Noida to pan India. Call Sunce Renewables for reliable solar plant support.",
  keywords: [
    "solar inverter repair",
    "solar inverter services India",
    "solar inverter maintenance",
    "solar inverter AMC",
    "solar plant O&M",
    "SCADA monitoring solar",
    "solar monitoring devices India",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Sunce Renewables",
    title: "Sunce Renewables | Solar Inverter Repair & Solar Services in India",
    description:
      "Expert solar inverter repair, maintenance, AMC, SCADA monitoring, O&M and solar monitoring products from Noida to pan India.",
    images: [
      {
        url: "/hero.webp",
        width: 1200,
        height: 630,
        alt: "Sunce Renewables solar inverter service team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunce Renewables | Solar Inverter Repair & Solar Services in India",
    description:
      "Solar inverter repair, AMC, O&M, SCADA monitoring and solar monitoring products across India.",
    images: ["/hero.webp"],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "Sunce Renewables | Solar Inverter Repair & Solar Services in India",
  description:
    "Expert solar inverter repair, maintenance, AMC, SCADA monitoring, O&M and solar monitoring products from Noida to pan India.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: { "@id": `${SITE_URL}/#primaryimage` },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
    ],
  },
};

export default function SiteHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "SNet Solar Monitoring Products",
          description:
            "SNet string monitoring devices, IoT gateways, LoRa modules and RS485 convertors for solar plant monitoring.",
          brand: { "@type": "Brand", name: "SNet" },
          manufacturer: { "@type": "Organization", name: "Sunce Renewables" },
          image: [`${SITE_URL}/1.png`, `${SITE_URL}/2.png`, `${SITE_URL}/3.png`],
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/products`,
          },
        }}
      />
      <HomePage />
    </>
  );
}
