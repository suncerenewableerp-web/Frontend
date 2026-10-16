import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import { breadcrumbJsonLd, contactPageJsonLd, pageMetadata } from "../../lib/seo";
import ContactContent from "./ContactContent";

export const metadata: Metadata = pageMetadata({
  title: "Contact Solar Inverter Repair Services | Get in Touch",
  description:
    "Contact Sunce Renewables for solar inverter repair, AMC, breakdown support and solar plant O&M across India. Based in Noida — call or WhatsApp us today.",
  path: "/contact",
  keywords: [
    "solar inverter repair contact",
    "solar service Noida",
    "solar inverter breakdown support India",
    "contact solar company",
  ],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactPageJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <ContactContent />
    </>
  );
}
