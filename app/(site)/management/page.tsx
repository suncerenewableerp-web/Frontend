import type { Metadata } from "next";
import JsonLd from "../../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import ManagementContent from "./ManagementContent";

export const metadata: Metadata = pageMetadata({
  title: "Management — Solar Industry Leadership Team",
  description:
    "Meet the founding team of Sunce Renewables — solar industry leaders with decades of experience in design, engineering, project execution and O&M of MW-scale solar plants.",
  path: "/management",
  keywords: [
    "solar company founders",
    "solar project execution experts India",
    "solar O&M leadership",
  ],
  image: "/ajeet.webp",
  imageAlt: "Sunce Renewables leadership team",
});

export default function ManagementPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Management", path: "/management" },
        ])}
      />
      <ManagementContent />
    </>
  );
}
