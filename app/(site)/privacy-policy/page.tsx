import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for Sunce Renewables — how we collect, use and protect your personal data when you use our website and solar services.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ])}
      />
      <PrivacyPolicyContent />
    </>
  );
}
