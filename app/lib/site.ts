export const SITE_URL = "https://suncerenewable.com";
export const SITE_NAME = "Sunce Renewables";
export const SITE_LOCALE = "en_IN";

export const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "Sunce Renewables Pvt. Ltd.",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.jpg`,
      description:
        "Sunce Renewables provides solar inverter repair, maintenance, AMC, SCADA monitoring, O&M, PCB repair, solar monitoring products and project management services across India.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressRegion: "UP",
        addressLocality: "Noida",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-6361991349",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Solar inverter repair, maintenance, AMC, SCADA monitoring, O&M services and solar monitoring products in India.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: SITE_NAME,
      image: `${SITE_URL}/hero.webp`,
      url: SITE_URL,
      telephone: "+91-6361991349",
      priceRange: "$$",
      description:
        "Trusted solar inverter repair and solar plant O&M service company based in Noida, serving customers across India.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressRegion: "UP",
        addressLocality: "Noida",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.5355,
        longitude: 77.391,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:30",
        closes: "18:30",
      },
      areaServed: { "@type": "Country", name: "India" },
    },
  ],
} as const;
