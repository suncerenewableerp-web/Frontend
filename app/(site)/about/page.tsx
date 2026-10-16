import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import AboutContent from "./AboutContent";

export const metadata: Metadata = pageMetadata({
  title: "About Solar Inverter Service Company in Noida",
  description:
    "Learn about Sunce Renewables — a trusted solar inverter repair, maintenance and O&M company based in Noida, serving EPCs, industries and solar plants across India.",
  path: "/about",
  keywords: [
    "solar company Noida",
    "solar inverter service company India",
    "about Sunce Renewables",
    "solar O&M company",
  ],
  image: "/about-meeting.png",
  imageAlt: "Sunce Renewables team meeting",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <AboutContent />
    </>
  );
}
