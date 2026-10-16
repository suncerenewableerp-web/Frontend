import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import TermsConditionsContent from "./TermsConditionsContent";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing the use of the Sunce Renewables website and our solar inverter service, AMC and O&M offerings.",
  path: "/terms-conditions",
});

export default function TermsConditionsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms & Conditions", path: "/terms-conditions" },
        ])}
      />
      <TermsConditionsContent />
    </>
  );
}
