export const SITE_URL = "https://suncerenewable.com";
export const SITE_NAME = "Sunce Renewables";
export const SITE_LOCALE = "en_IN";

// Keep name / address / phone identical everywhere (footer, contact page,
// schema) — consistent NAP data is a local-SEO ranking signal.
export const PHONE = "+91-9540263987";
export const PHONE_ALT = "+91-9354299513";
export const PHONE_HREF = "tel:+919540263987";
export const WHATSAPP_HREF = "https://wa.me/916361991349";
export const EMAIL = "info@suncerenewable.com";

export const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "B-203, Sector 63A",
  addressLocality: "Noida",
  addressRegion: "Uttar Pradesh",
  postalCode: "201307",
  addressCountry: "IN",
} as const;

export const AREAS_SERVED = [
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Ghaziabad",
  "Delhi",
  "Gurugram",
  "Faridabad",
  "Lucknow",
  "India",
];

export const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ["Sunce Renewables Pvt. Ltd.", "Sunce Renewable", "Sunce"],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.jpg`,
      foundingDate: "2017",
      email: EMAIL,
      description:
        "Sunce Renewables is a Noida based solar inverter repair company offering solar inverter repair, PCB repair, maintenance, AMC, SCADA monitoring and solar plant O&M services across Delhi NCR and India.",
      address: ADDRESS,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: PHONE,
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
        {
          "@type": "ContactPoint",
          telephone: "+91-6361991349",
          contactType: "technical support",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      ],
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Solar inverter repair, maintenance, AMC, SCADA monitoring, O&M services and solar monitoring products in Noida, Delhi NCR and India.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": ["LocalBusiness", "ElectronicsRepairShop"],
      "@id": `${SITE_URL}/#localbusiness`,
      name: SITE_NAME,
      image: `${SITE_URL}/hero.webp`,
      logo: `${SITE_URL}/logo.jpg`,
      url: SITE_URL,
      telephone: PHONE,
      email: EMAIL,
      priceRange: "₹₹",
      description:
        "Solar inverter repair and service centre in Noida — on-grid, off-grid, hybrid, string and central inverter repair, PCB repair, AMC and solar plant maintenance for Delhi NCR and pan India.",
      address: ADDRESS,
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.6206,
        longitude: 77.3855,
      },
      hasMap: "https://www.google.com/maps/search/?api=1&query=Sunce+Renewables+Sector+63A+Noida",
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
      areaServed: AREAS_SERVED.map((name) =>
        name === "India"
          ? { "@type": "Country", name }
          : { "@type": "City", name }
      ),
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
    },
  ],
} as const;
