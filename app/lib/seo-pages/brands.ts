import type { LandingPage } from "./types";

type BrandInput = {
  key: string;
  brand: string;
  series: string;
  about: string;
  faults: string[];
};

// Only brands present in the ERP inverter catalog (app/erp/data/inverter_catalog.json),
// i.e. brands Sunce actually services.
function buildBrand(b: BrandInput): LandingPage {
  const lower = b.brand.toLowerCase();
  return {
    slug: `${b.key}-solar-inverter-repair`,
    name: `${b.brand} Inverter Repair`,
    title: `${b.brand} Solar Inverter Repair & Service`,
    description: `${b.brand} solar inverter repair in Noida, Delhi NCR & India — error codes, PCB repair, no generation and out-of-warranty ${b.brand} inverters. Call Sunce Renewables.`,
    h1: `${b.brand} Solar Inverter Repair`,
    kicker: `${b.brand} Inverter Service · Independent Repair Specialists`,
    intro: [
      b.about,
      `Sunce Renewables repairs ${b.brand} solar inverters at component level in our Noida workshop and on site — including units that are out of warranty or have discontinued spares.`,
    ],
    keywords: [
      `${lower} solar inverter repair`,
      `${lower} inverter repair`,
      `${lower} inverter service centre`,
      `${lower} inverter error`,
      `${lower} inverter repair noida`,
    ],
    serviceType: `${b.brand} solar inverter repair`,
    areaServed: ["Noida", "Delhi", "India"],
    highlights: [b.series, "Out-of-warranty repair", "PCB-level repair", "On-site & workshop"],
    sections: [
      {
        heading: `${b.brand} inverter models we repair`,
        paragraphs: [
          `We service ${b.series}, in single phase and three phase, across residential, commercial and industrial installations.`,
        ],
      },
      {
        heading: `Common ${b.brand} inverter faults`,
        bullets: b.faults,
      },
      {
        heading: `Our ${b.brand} inverter repair process`,
        bullets: [
          "Share the model, serial number and error code or a photo of the display",
          "Remote check of settings, monitoring data and fault history",
          "On-site diagnosis or pickup to our Noida workshop",
          "Estimate before repair, component-level repair and load testing",
          "Re-installation, commissioning and monitoring check",
        ],
      },
      {
        heading: "Independent service provider",
        paragraphs: [
          `Sunce Renewables is an independent solar inverter repair company and is not an authorised service centre of, or affiliated with, ${b.brand}. ${b.brand} is a trademark of its respective owner. For inverters still under manufacturer warranty, we recommend contacting the manufacturer first — we can help you document the fault.`,
        ],
      },
    ],
    faqs: [
      {
        q: `Do you repair out-of-warranty ${b.brand} solar inverters?`,
        a: `Yes. Out-of-warranty ${b.brand} inverters are repaired at component level, which is usually much cheaper than replacing the inverter.`,
      },
      {
        q: `My ${b.brand} inverter shows an error code — can you help?`,
        a: `Send us the error code and a photo of the display on WhatsApp. Many ${b.brand} errors are caused by site conditions and can be resolved without opening the inverter; others need workshop repair.`,
      },
    ],
  };
}

export const BRANDS: LandingPage[] = [
  buildBrand({
    key: "growatt",
    brand: "Growatt",
    series: "Growatt MIN, MIC, MID and MAX string inverters and SPH hybrid inverters",
    about:
      "Growatt is one of the most widely installed on-grid inverter brands on Indian rooftops, from small residential MIN/MIC models to MAX commercial inverters.",
    faults: [
      "PV isolation low / insulation errors",
      "No AC connection and grid voltage faults",
      "Inverter not starting or no display",
      "Fan failures and over-temperature derating",
      "Wi-Fi / ShineLink monitoring offline",
      "Power board and relay failures",
    ],
  }),
  buildBrand({
    key: "solis",
    brand: "Solis",
    series: "Solis single phase and three phase string inverters and RHI hybrid inverters",
    about:
      "Solis (Ginlong) inverters are common in Indian residential and commercial rooftop plants for their wide MPPT range and compact design.",
    faults: [
      "Grid over-voltage and no-grid alarms",
      "PV insulation (ISO) protection alarms",
      "DC bus and boost circuit faults",
      "Inverter switching off in the afternoon due to heat",
      "Communication / data logger issues",
      "Control and power board failures",
    ],
  }),
  buildBrand({
    key: "sungrow",
    brand: "Sungrow",
    series: "Sungrow RS and CX series string inverters, SH hybrid inverters and central inverters",
    about:
      "Sungrow inverters power many commercial, industrial and utility-scale solar plants in India, from rooftop string inverters to MW-scale central units.",
    faults: [
      "Grid and frequency faults",
      "PV insulation impedance faults",
      "Over-temperature and fan faults",
      "IGBT and power module failures",
      "Communication board and monitoring faults",
      "AC and DC relay failures",
    ],
  }),
  buildBrand({
    key: "huawei",
    brand: "Huawei",
    series: "Huawei SUN2000 string inverters and SmartLogger-based plant systems",
    about:
      "Huawei SUN2000 string inverters are used in many Indian commercial and utility solar plants, typically monitored through FusionSolar.",
    faults: [
      "Low insulation resistance alarms",
      "Grid over-voltage and abnormal grid alarms",
      "String reverse connection and abnormal string alarms",
      "Fan and over-temperature alarms",
      "SmartLogger and communication issues",
      "Internal board failures",
    ],
  }),
  buildBrand({
    key: "goodwe",
    brand: "GoodWe",
    series: "GoodWe DNS, XS, SDT and MT string inverters and ET / EH hybrid inverters",
    about:
      "GoodWe inverters are widely used in Indian homes and businesses, with residential XS/DNS models and three phase SDT/MT commercial inverters.",
    faults: [
      "Isolation fault and PV over-voltage",
      "Utility loss and grid voltage faults",
      "Relay check failure",
      "DCI / GFCI faults",
      "SEMS portal / Wi-Fi offline",
      "No display and power board failures",
    ],
  }),
  buildBrand({
    key: "sma",
    brand: "SMA",
    series: "SMA Sunny Boy, Sunny Tripower and Sunny Central inverters",
    about:
      "SMA is a German inverter brand found in many older and premium solar installations in India, including Sunny Boy and Sunny Tripower string inverters.",
    faults: [
      "Grid fault and insulation fault events",
      "Display and communication problems",
      "Fan and over-temperature derating",
      "Power stage and relay failures in ageing units",
      "Out-of-warranty inverters with discontinued spares",
    ],
  }),
  buildBrand({
    key: "fronius",
    brand: "Fronius",
    series: "Fronius Primo, Symo, Galvo and Eco inverters",
    about:
      "Fronius inverters from Austria are known for their modular design and are used in many Indian rooftop and commercial installations.",
    faults: [
      "State codes related to grid and AC voltage",
      "Isolation / DC insulation state codes",
      "Power stage set and board failures",
      "Fan failures and over-temperature",
      "Datamanager / Solar.web communication problems",
    ],
  }),
  buildBrand({
    key: "abb",
    brand: "ABB",
    series: "ABB UNO, TRIO and PVS string inverters and ABB central inverters",
    about:
      "ABB solar inverters (the business later moved to FIMER) are installed across many Indian plants commissioned in the last decade, and many are now out of warranty.",
    faults: [
      "Ground fault and riso low errors",
      "Grid and frequency errors",
      "Fan and temperature alarms",
      "Board-level failures in older units",
      "Spare-part availability for discontinued models",
    ],
  }),
  buildBrand({
    key: "delta",
    brand: "Delta",
    series: "Delta RPI and M-series single phase and three phase string inverters",
    about:
      "Delta inverters are common in Indian commercial and industrial rooftop solar plants, especially the M-series three phase string inverters.",
    faults: [
      "Grid and AC voltage faults",
      "Insulation and DC injection faults",
      "Fan failures and derating",
      "Communication and RS485 issues",
      "Power and control board failures",
    ],
  }),
  buildBrand({
    key: "schneider",
    brand: "Schneider Electric",
    series: "Schneider Electric Conext string and central inverters",
    about:
      "Schneider Electric Conext inverters were installed in many Indian commercial and utility plants, and owners increasingly need independent repair support for them.",
    faults: [
      "Grid and isolation faults",
      "Power module and IGBT failures",
      "Control board and communication faults",
      "Cooling system failures",
      "Spare availability for discontinued models",
    ],
  }),
  buildBrand({
    key: "solaredge",
    brand: "SolarEdge",
    series: "SolarEdge single phase and three phase inverters and power optimizer systems",
    about:
      "SolarEdge systems combine an inverter with panel-level power optimizers, so faults can sit in the inverter, an optimizer or the string wiring.",
    faults: [
      "Low string voltage or optimizers not reporting",
      "Isolation and ground faults",
      "Inverter not producing (standby / night mode issues)",
      "Communication and monitoring portal faults",
      "Inverter board failures",
    ],
  }),
  buildBrand({
    key: "havells",
    brand: "Havells",
    series: "Havells on-grid and off-grid solar inverters",
    about:
      "Havells solar inverters are popular in Indian homes and small businesses, sold through a wide dealer network.",
    faults: [
      "Inverter not starting or no display",
      "Grid voltage and frequency faults",
      "Battery charging problems on off-grid models",
      "Fan and overheating issues",
      "Board and relay failures",
    ],
  }),
  buildBrand({
    key: "luminous",
    brand: "Luminous",
    series: "Luminous solar PCUs, solar home UPS and on-grid solar inverters",
    about:
      "Luminous is one of India's best-known home power brands, and its solar PCUs and solar home UPS units are common in off-grid and backup systems.",
    faults: [
      "Solar battery not charging",
      "Low backup and battery low cut-off issues",
      "Overload and short-circuit trips",
      "No output or buzzing sound",
      "Charge controller and MOSFET failures",
      "Display not working",
    ],
  }),
];

export function getBrand(slug: string): LandingPage | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export const brandUrl = (slug: string) => `/brands/${slug}`;
