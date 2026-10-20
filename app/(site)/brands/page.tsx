import type { Metadata } from "next";
import HubPage from "../../components/seo/HubPage";
import { pageMetadata } from "../../lib/seo";
import { BRANDS, brandUrl } from "../../lib/seo-pages/brands";

export const metadata: Metadata = pageMetadata({
  title: "Solar Inverter Brands We Repair",
  description:
    "Independent repair for Growatt, Solis, Sungrow, Huawei, GoodWe, SMA, Fronius, ABB, Delta, Schneider, SolarEdge, Havells and Luminous solar inverters.",
  path: "/brands",
  keywords: BRANDS.map((b) => b.keywords[0]),
});

export default function BrandsPage() {
  return (
    <HubPage
      kicker="Multi-Brand Repair"
      h1="Solar Inverter Brands We Repair"
      intro="Our technicians repair on-grid, off-grid and hybrid solar inverters from all major brands — including out-of-warranty and discontinued models."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Brands", path: "/brands" },
      ]}
      cards={BRANDS.map((b) => ({ title: b.name, text: b.description, href: brandUrl(b.slug) }))}
      footnote="Sunce Renewables is an independent service provider and is not affiliated with or an authorised service centre of the brands listed. All trademarks belong to their respective owners."
    />
  );
}
