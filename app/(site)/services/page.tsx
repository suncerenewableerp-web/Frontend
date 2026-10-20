import type { Metadata } from "next";
import HubPage from "../../components/seo/HubPage";
import { pageMetadata } from "../../lib/seo";
import { LOCATIONS, locationUrl } from "../../lib/seo-pages/locations";
import { PILLAR, SERVICES, serviceUrl } from "../../lib/seo-pages/services";

export const metadata: Metadata = pageMetadata({
  title: "Solar Inverter & Solar Plant Services",
  description:
    "All Sunce Renewables services — solar inverter repair, PCB repair, maintenance & AMC, troubleshooting, testing, solar panel repair, O&M and SCADA monitoring.",
  path: "/services",
  keywords: [
    "solar inverter services",
    "solar inverter repair and maintenance",
    "solar energy system service provider",
    "solar equipment repair company",
  ],
});

export default function ServicesPage() {
  return (
    <HubPage
      kicker="What We Do"
      h1="Solar Inverter Repair & Solar Plant Services"
      intro="From component-level solar inverter repair to complete solar plant operation and maintenance, Sunce Renewables is a single expert partner for homes, businesses and solar power plants."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
      ]}
      cards={[
        { title: PILLAR.name, text: PILLAR.description, href: "/solar-inverter-repair", meta: "Core Service" },
        ...SERVICES.map((s) => ({ title: s.name, text: s.description, href: serviceUrl(s.slug) })),
        ...LOCATIONS.slice(0, 3).map((l) => ({
          title: l.name,
          text: l.description,
          href: locationUrl(l.slug),
          meta: "Location",
        })),
      ]}
    />
  );
}
