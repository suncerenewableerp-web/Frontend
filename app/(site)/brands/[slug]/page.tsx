import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingTemplate from "../../../components/seo/LandingTemplate";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "../../../lib/seo";
import { BRANDS, brandUrl, getBrand } from "../../../lib/seo-pages/brands";
import { blogLinks, brandLinks, locationLinks, serviceLinks } from "../../../lib/seo-pages/links";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getBrand(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: brandUrl(page.slug),
    keywords: page.keywords,
    imageAlt: page.h1,
  });
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const page = getBrand(slug);
  if (!page) notFound();
  const path = brandUrl(page.slug);

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
        { name: "Brands", path: "/brands" },
        { name: page.name, path },
      ]}
      related={[brandLinks(page.slug), serviceLinks(), locationLinks(), blogLinks(undefined, 4)]}
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
