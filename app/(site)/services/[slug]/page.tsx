import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingTemplate from "../../../components/seo/LandingTemplate";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "../../../lib/seo";
import { blogLinks, brandLinks, locationLinks, serviceLinks } from "../../../lib/seo-pages/links";
import { SERVICES, getService, serviceUrl } from "../../../lib/seo-pages/services";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getService(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: serviceUrl(page.slug),
    keywords: page.keywords,
    imageAlt: page.h1,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const page = getService(slug);
  if (!page) notFound();
  const path = serviceUrl(page.slug);

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
        { name: "Services", path: "/services" },
        { name: page.name, path },
      ]}
      related={[serviceLinks(page.slug, 12), locationLinks(), brandLinks(undefined, 8), blogLinks(undefined, 4)]}
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
