import type { Metadata } from "next";
import HomePage from "../homepage";
import JsonLd from "../components/JsonLd";
import SeoContent from "../components/SeoContent";
import { SITE_URL } from "../lib/site";

const TITLE = "Solar Inverter Repair Services in Noida & India | Sunce Renewables";
const DESCRIPTION =
  "Sunce Renewables — trusted solar inverter repair company in Noida. On-grid, off-grid & hybrid inverter repair, PCB repair, maintenance, AMC & solar O&M across Delhi NCR & India.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "solar inverter repair",
    "solar inverter repair services",
    "solar inverter repair company",
    "solar inverter repair near me",
    "solar inverter repair in noida",
    "solar inverter service",
    "solar inverter maintenance",
    "solar inverter AMC services",
    "solar inverter repair experts",
    "solar inverter repair delhi ncr",
    "solar inverter repair india",
    "solar plant maintenance services",
    "Sunce Renewables",
    "Sunce Renewable",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Sunce Renewables",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/hero.webp",
        width: 1200,
        height: 630,
        alt: "Sunce Renewables solar inverter repair team",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero.webp"],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: TITLE,
  description: DESCRIPTION,
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
      <SeoContent />
    </>
  );
}
