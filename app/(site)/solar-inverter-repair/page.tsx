import type { Metadata } from "next";
import LandingTemplate from "../../components/seo/LandingTemplate";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "../../lib/seo";
import { blogLinks, brandLinks, locationLinks, serviceLinks } from "../../lib/seo-pages/links";
import { PILLAR } from "../../lib/seo-pages/services";

const path = "/solar-inverter-repair";

export const metadata: Metadata = pageMetadata({
  title: PILLAR.title,
  description: PILLAR.description,
  path,
  keywords: PILLAR.keywords,
  imageAlt: "Solar inverter repair technicians at Sunce Renewables",
});

export default function SolarInverterRepairPage() {
  return (
    <LandingTemplate
      kicker={PILLAR.kicker}
      h1={PILLAR.h1}
      intro={PILLAR.intro}
      highlights={PILLAR.highlights}
      sections={PILLAR.sections}
      faqs={PILLAR.faqs}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Solar Inverter Repair", path },
      ]}
      related={[locationLinks(), serviceLinks(), brandLinks(), blogLinks()]}
      jsonLd={[
        serviceJsonLd({
          name: PILLAR.h1,
          description: PILLAR.description,
          path,
          serviceType: PILLAR.serviceType,
          areaServed: PILLAR.areaServed,
        }),
        faqJsonLd(PILLAR.faqs),
      ]}
    />
  );
}
