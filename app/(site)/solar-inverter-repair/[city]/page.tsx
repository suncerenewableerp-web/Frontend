import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingTemplate from "../../../components/seo/LandingTemplate";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "../../../lib/seo";
import { blogLinks, brandLinks, locationLinks, serviceLinks } from "../../../lib/seo-pages/links";
import { LOCATIONS, getLocation, locationUrl } from "../../../lib/seo-pages/locations";

type Props = { params: Promise<{ city: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const page = getLocation(city);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: locationUrl(page.slug),
    keywords: page.keywords,
    imageAlt: page.h1,
  });
}

export default async function LocationPage({ params }: Props) {
  const { city } = await params;
  const page = getLocation(city);
  if (!page) notFound();
  const path = locationUrl(page.slug);

  return (
    <LandingTemplate
      kicker={page.kicker}
      h1={page.h1}
      intro={page.intro}
      highlights={page.highlights}
      sections={page.sections}
      faqs={page.faqs}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Solar Inverter Repair", path: "/solar-inverter-repair" },
        { name: page.name, path },
      ]}
      related={[serviceLinks(), locationLinks(page.slug), brandLinks(undefined, 8), blogLinks(undefined, 4)]}
      jsonLd={[
        serviceJsonLd({
          name: page.h1,
          description: page.description,
          path,
          serviceType: page.serviceType,
          areaServed: page.areaServed,
        }),
        faqJsonLd(page.faqs),
      ]}
    />
  );
}
