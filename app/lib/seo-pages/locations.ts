import type { LandingPage } from "./types";

type LocationInput = {
  slug: string;
  city: string;
  /** e.g. "in Noida" / "in Delhi NCR" */
  inCity: string;
  extraKeywords: string[];
  localIntro: string;
  areas: string[];
  localSection: { heading: string; paragraphs: string[] };
  faqs: { q: string; a: string }[];
  areaServed: string[];
};

const commonServices = [
  "Solar inverter repair — on-grid, off-grid and hybrid",
  "Solar inverter PCB and circuit board repair",
  "Solar inverter maintenance and AMC",
  "Solar inverter troubleshooting and error code repair",
  "Commercial and industrial solar inverter repair",
  "Rooftop solar system repair and solar plant O&M",
];

function buildLocation(l: LocationInput): LandingPage {
  return {
    slug: l.slug,
    name: `Solar Inverter Repair ${l.city}`,
    title: `Solar Inverter Repair ${l.inCity} | Service & Maintenance`,
    description: `Solar inverter repair services ${l.inCity} by Sunce Renewables — on-grid, off-grid & hybrid inverter repair, PCB repair, maintenance & AMC. Call +91-9540263987.`,
    h1: `Solar Inverter Repair Services ${l.inCity}`,
    kicker: `Solar Inverter Service · ${l.city}`,
    intro: [
      l.localIntro,
      `Our solar inverter technicians repair all major brands, handle out-of-warranty inverters and offer AMC plans for homes, housing societies, businesses and industries ${l.inCity}.`,
    ],
    keywords: [
      `solar inverter repair ${l.city.toLowerCase()}`,
      `solar inverter repair in ${l.city.toLowerCase()}`,
      `solar inverter service ${l.city.toLowerCase()}`,
      `solar inverter repair near me ${l.city.toLowerCase()}`,
      ...l.extraKeywords,
    ],
    serviceType: "Solar inverter repair",
    areaServed: l.areaServed,
    highlights: [
      "All major inverter brands",
      "PCB-level repair",
      "On-site & workshop service",
      "AMC for homes & industry",
    ],
    sections: [
      {
        heading: `Solar inverter services ${l.inCity}`,
        bullets: commonServices,
      },
      l.localSection,
      {
        heading: `Areas we cover ${l.inCity}`,
        paragraphs: [
          `We provide solar inverter repair and service across ${l.city}, including ${l.areas.join(", ")} and nearby localities.`,
        ],
      },
      {
        heading: "How to book a solar inverter repair",
        bullets: [
          "Call +91-9540263987 or WhatsApp us with the inverter brand, model and error code",
          "Get remote technical support and a first assessment",
          "On-site visit or pickup to our Noida workshop",
          "Transparent estimate before repair, then testing and re-installation",
        ],
      },
    ],
    faqs: l.faqs,
  };
}

export const LOCATIONS: LandingPage[] = [
  buildLocation({
    slug: "noida",
    city: "Noida",
    inCity: "in Noida",
    extraKeywords: [
      "best solar inverter repair in noida",
      "solar inverter repair services noida",
      "solar inverter repair company noida",
      "solar inverter technician noida",
      "solar panel inverter repair noida",
      "solar power system repair noida",
      "solar inverter maintenance noida",
      "solar inverter in noida",
      "solar inverters in noida",
      "solar inverter service centre noida",
      "solar inverter repair sector 63 noida",
      "rooftop solar repair noida",
    ],
    localIntro:
      "Sunce Renewables is headquartered at B-203, Sector 63A, Noida, with our solar inverter repair workshop in the same city. That makes us one of the closest specialist solar inverter repair companies for homes, housing societies, offices and factories in Noida.",
    areas: [
      "Sector 62, 63 and 63A",
      "Sector 18 and Sector 16",
      "Noida Phase 1, Phase 2 and Hosiery Complex",
      "Sector 135–168 along the Noida–Greater Noida Expressway",
      "Sector 50, 76, 78 and 137 housing societies",
    ],
    localSection: {
      heading: "Why Noida customers choose Sunce",
      paragraphs: [
        "Being local means our technicians can reach most Noida sites quickly and inverters can come straight to our workshop for bench testing. Many Noida industrial units in Phase 2, Sector 63 and the Hosiery Complex run three phase rooftop plants — we support them with inverter repair, AMC and complete O&M, while housing societies and homes get the same component-level repair for residential inverters.",
      ],
    },
    faqs: [
      {
        q: "Where is your solar inverter repair centre in Noida?",
        a: "Our office and repair facility is at B-203, Sector 63A, Noida, Uttar Pradesh 201307. Please call +91-9540263987 before visiting.",
      },
      {
        q: "Do you visit homes and housing societies in Noida?",
        a: "Yes. We attend residential rooftop systems, housing societies, offices and factories across Noida.",
      },
      {
        q: "Which is the best solar inverter repair company in Noida?",
        a: "Look for a company that repairs at component level, services multiple brands, explains the fault clearly and gives an estimate before starting. That is exactly how Sunce Renewables works.",
      },
    ],
    areaServed: ["Noida"],
  }),
  buildLocation({
    slug: "greater-noida",
    city: "Greater Noida",
    inCity: "in Greater Noida",
    extraKeywords: [
      "solar inverter service greater noida",
      "solar inverter maintenance greater noida",
    ],
    localIntro:
      "Greater Noida's industrial areas and institutions run some of the largest rooftop solar plants in the NCR. From our base in Noida, Sunce Renewables provides solar inverter repair, maintenance and plant O&M across Greater Noida.",
    areas: [
      "Ecotech I, II, III and Udyog Vihar industrial areas",
      "Knowledge Park and educational campuses",
      "Alpha, Beta, Gamma and Delta sectors",
      "Kasna and Surajpur industrial areas",
      "Pari Chowk and Yamuna Expressway sectors",
    ],
    localSection: {
      heading: "Industrial and institutional solar in Greater Noida",
      paragraphs: [
        "Factories in Ecotech and Kasna and universities in Knowledge Park typically run large three phase string inverters. We repair these inverters on site or in our workshop, and offer AMC and monitoring so a failed inverter is spotted the same day rather than at the end of the month.",
      ],
    },
    faqs: [
      {
        q: "Do you service industrial solar plants in Greater Noida?",
        a: "Yes. We repair commercial and industrial inverters and provide O&M for factories and institutions across Greater Noida's industrial and institutional areas.",
      },
    ],
    areaServed: ["Greater Noida"],
  }),
  buildLocation({
    slug: "greater-noida-west",
    city: "Greater Noida West",
    inCity: "in Greater Noida West",
    extraKeywords: [
      "solar inverter repair noida extension",
      "solar inverter repair gaur city",
    ],
    localIntro:
      "Greater Noida West (Noida Extension) has many high-rise housing societies with common-area rooftop solar systems, along with independent homes and commercial buildings. Sunce Renewables services solar inverters across the area from our nearby Noida base.",
    areas: [
      "Gaur City 1 and 2",
      "Techzone 4",
      "Sector 1, 2, 3, 4, 10, 12 and 16",
      "Bisrakh and Shahberi",
      "Ek Murti and Gaur Chowk",
    ],
    localSection: {
      heading: "Solar inverter care for housing societies",
      paragraphs: [
        "For residents' welfare associations and facility managers, a stopped society inverter quickly shows up in common-area electricity bills. We offer AMC plans for society rooftop plants with scheduled inspection, inverter cleaning, performance checks and fast repair when faults occur.",
      ],
    },
    faqs: [
      {
        q: "Do you offer AMC for housing society solar plants in Greater Noida West?",
        a: "Yes. We provide annual maintenance contracts for society rooftop solar plants including inverter maintenance and repair support.",
      },
    ],
    areaServed: ["Greater Noida West", "Greater Noida"],
  }),
  buildLocation({
    slug: "ghaziabad",
    city: "Ghaziabad",
    inCity: "in Ghaziabad",
    extraKeywords: ["solar inverter service ghaziabad", "solar inverter technician ghaziabad"],
    localIntro:
      "Ghaziabad borders Noida, so Sunce Renewables can support Ghaziabad homes, businesses and factories quickly with solar inverter repair, PCB repair and maintenance.",
    areas: [
      "Indirapuram, Vaishali and Vasundhara",
      "Raj Nagar Extension and Crossings Republik",
      "Sahibabad Industrial Area",
      "Meerut Road and Loni Road industrial areas",
      "Kavi Nagar and Raj Nagar",
    ],
    localSection: {
      heading: "Supporting Ghaziabad's industrial rooftops",
      paragraphs: [
        "Industrial units in Sahibabad and along Meerut Road use rooftop solar to cut daytime power costs. We repair their three phase string inverters, fix recurring tripping and grid errors, and set up maintenance schedules that keep generation steady.",
      ],
    },
    faqs: [
      {
        q: "Do you repair solar inverters in Ghaziabad?",
        a: "Yes. We serve all of Ghaziabad including Indirapuram, Vaishali, Raj Nagar Extension and the Sahibabad industrial area.",
      },
    ],
    areaServed: ["Ghaziabad"],
  }),
  buildLocation({
    slug: "delhi",
    city: "Delhi",
    inCity: "in Delhi",
    extraKeywords: ["solar inverter service delhi", "solar inverter repair new delhi"],
    localIntro:
      "Delhi's homes, schools, hospitals, government buildings and industrial units have adopted rooftop solar under net metering. Sunce Renewables provides solar inverter repair and maintenance across Delhi from our Noida facility.",
    areas: [
      "East Delhi — Mayur Vihar, Laxmi Nagar, Preet Vihar",
      "South Delhi — Okhla, Saket, Vasant Kunj",
      "West Delhi — Janakpuri, Dwarka, Punjabi Bagh",
      "North Delhi — Rohini, Pitampura, Model Town",
      "Industrial areas — Okhla, Narela, Bawana, Mayapuri, Naraina",
    ],
    localSection: {
      heading: "Net-metered rooftop systems in Delhi",
      paragraphs: [
        "Most Delhi rooftop systems are on-grid and net-metered, so any inverter fault directly increases your electricity bill. We repair on-grid inverters, resolve grid-voltage tripping common at the end of distribution feeders, and help keep net-metering savings on track.",
      ],
    },
    faqs: [
      {
        q: "Do you provide solar inverter repair across Delhi?",
        a: "Yes. We cover East, South, West and North Delhi along with the Okhla, Narela, Bawana and Mayapuri industrial areas.",
      },
    ],
    areaServed: ["Delhi"],
  }),
  buildLocation({
    slug: "delhi-ncr",
    city: "Delhi NCR",
    inCity: "in Delhi NCR",
    extraKeywords: ["solar inverter repair services delhi ncr", "solar inverter service ncr"],
    localIntro:
      "Sunce Renewables is a Noida-based solar inverter repair company serving the whole Delhi NCR — Noida, Greater Noida, Ghaziabad, Delhi, Gurugram and Faridabad — with one experienced team.",
    areas: [
      "Noida and Greater Noida",
      "Greater Noida West",
      "Ghaziabad",
      "Delhi",
      "Gurugram",
      "Faridabad",
    ],
    localSection: {
      heading: "One solar service partner across the NCR",
      paragraphs: [
        "Businesses with plants in several NCR cities can work with a single service partner for inverter repair, AMC and O&M, with consistent reporting across all their sites.",
      ],
    },
    faqs: [
      {
        q: "Which Delhi NCR cities do you cover?",
        a: "We cover Noida, Greater Noida, Greater Noida West, Ghaziabad, Delhi, Gurugram and Faridabad.",
      },
    ],
    areaServed: ["Noida", "Greater Noida", "Ghaziabad", "Delhi", "Gurugram", "Faridabad"],
  }),
  buildLocation({
    slug: "gurgaon",
    city: "Gurgaon",
    inCity: "in Gurgaon",
    extraKeywords: ["solar inverter repair gurugram", "solar inverter service gurgaon"],
    localIntro:
      "Gurugram's offices, IT parks, malls, warehouses and residential societies run large rooftop solar systems. Sunce Renewables supports them with solar inverter repair, preventive maintenance and AMC.",
    areas: [
      "Udyog Vihar and Cyber City",
      "Sohna Road and Golf Course Extension Road",
      "IMT Manesar",
      "Sectors along Dwarka Expressway",
      "Bilaspur and Pataudi Road warehousing belt",
    ],
    localSection: {
      heading: "Commercial and warehouse solar in Gurugram",
      paragraphs: [
        "Warehouses on the Bilaspur and Pataudi Road belt and factories in IMT Manesar often have large roof areas fitted with multiple string inverters. We repair these inverters and provide scheduled maintenance so that one failed unit does not go unnoticed.",
      ],
    },
    faqs: [
      {
        q: "Do you repair solar inverters in Gurgaon and Manesar?",
        a: "Yes. We serve Gurugram including Udyog Vihar, Sohna Road, Dwarka Expressway sectors and IMT Manesar.",
      },
    ],
    areaServed: ["Gurugram"],
  }),
  buildLocation({
    slug: "faridabad",
    city: "Faridabad",
    inCity: "in Faridabad",
    extraKeywords: ["solar inverter service faridabad"],
    localIntro:
      "Faridabad is one of the NCR's oldest industrial cities, and many of its factories now run rooftop solar plants. Sunce Renewables provides solar inverter repair and maintenance for Faridabad industries, businesses and homes.",
    areas: [
      "NIT Faridabad",
      "Sector 24, 25, 58 and 59 industrial areas",
      "Ballabgarh",
      "Greater Faridabad sectors",
      "Mathura Road industrial belt",
    ],
    localSection: {
      heading: "Inverter repair for Faridabad industry",
      paragraphs: [
        "Heavy industrial loads and voltage fluctuations can cause frequent inverter tripping. Our technicians diagnose whether faults come from the grid, the installation or the inverter and repair accordingly.",
      ],
    },
    faqs: [
      {
        q: "Do you provide solar inverter repair in Faridabad?",
        a: "Yes. We serve Faridabad's industrial sectors, NIT, Ballabgarh and Greater Faridabad.",
      },
    ],
    areaServed: ["Faridabad"],
  }),
  buildLocation({
    slug: "lucknow",
    city: "Lucknow",
    inCity: "in Lucknow",
    extraKeywords: ["solar inverter service lucknow"],
    localIntro:
      "Uttar Pradesh is adding rooftop and ground-mounted solar rapidly, and Lucknow is one of its largest solar markets. Sunce Renewables, headquartered in Noida, Uttar Pradesh, supports Lucknow customers with solar inverter repair and plant maintenance.",
    areas: [
      "Gomti Nagar and Gomti Nagar Extension",
      "Hazratganj and Aliganj",
      "Chinhat and Amausi industrial areas",
      "Sushant Golf City and Shaheed Path",
      "Indira Nagar and Jankipuram",
    ],
    localSection: {
      heading: "Workshop repair and on-site support for Lucknow",
      paragraphs: [
        "Inverters from Lucknow can be sent to our Noida workshop for component-level repair and testing. For commercial and industrial plants we arrange on-site visits for diagnosis, central inverter repair and maintenance.",
      ],
    },
    faqs: [
      {
        q: "How do you repair inverters in Lucknow?",
        a: "Residential and small commercial inverters can be shipped to our Noida workshop for repair. For larger plants we schedule on-site service visits.",
      },
    ],
    areaServed: ["Lucknow"],
  }),
  buildLocation({
    slug: "india",
    city: "India",
    inCity: "in India",
    extraKeywords: [
      "solar inverter repair services india",
      "solar inverter maintenance services india",
      "solar inverter repair company india",
      "solar inverter service provider india",
      "solar inverter technical services india",
      "solar inverter repair experts india",
      "solar pv inverter repair services india",
      "solar plant inverter repair india",
      "solar power equipment repair india",
    ],
    localIntro:
      "Sunce Renewables provides solar inverter repair and technical services across India. Our Noida workshop handles component-level repair of inverters shipped from any state, and our field teams support commercial, industrial and utility-scale plants on site.",
    areas: [
      "Uttar Pradesh",
      "Delhi NCR and Haryana",
      "Rajasthan",
      "Punjab",
      "Madhya Pradesh",
      "and other states for plant O&M contracts",
    ],
    localSection: {
      heading: "Pan-India solar inverter repair",
      paragraphs: [
        "Since 2017 we have serviced 500+ solar plants. For customers outside the NCR we combine remote technical support, courier pickup and return of inverters and cards, and scheduled field visits for larger plants.",
      ],
    },
    faqs: [
      {
        q: "Can I send my solar inverter for repair from another state?",
        a: "Yes. Inverters and individual PCBs can be shipped to our Noida workshop. We diagnose, share an estimate, repair, test and ship back.",
      },
    ],
    areaServed: ["India"],
  }),
];

export function getLocation(slug: string): LandingPage | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export const locationUrl = (slug: string) => `/solar-inverter-repair/${slug}`;
