import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import CareerContent from "./CareerContent";

export const metadata: Metadata = pageMetadata({
  title: "Careers — Solar Inverter Technician & SCADA Jobs",
  description:
    "Join Sunce Renewables. Explore career openings for solar inverter technicians, SCADA engineers and solar O&M professionals in Noida and pan-India field roles.",
  path: "/career",
  keywords: [
    "solar jobs Noida",
    "solar inverter technician job",
    "SCADA engineer job solar",
    "solar O&M careers India",
  ],
});

export default function CareerPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Careers at Sunce Renewables",
          url: "https://suncerenewable.com/career",
          description:
            "Career openings for solar inverter technicians, SCADA engineers and solar O&M professionals.",
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Career", path: "/career" },
        ])}
      />
      <CareerContent />
    </>
  );
}
