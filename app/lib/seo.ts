import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image = "/hero.webp",
  imageAlt,
}: PageSeo): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  image: string;
  slug: string;
  features: string[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${SITE_URL}${product.image}`,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "SNet",
    },
    manufacturer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    category: "Solar Monitoring Equipment",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
    additionalProperty: product.features.map((feature) => ({
      "@type": "PropertyValue",
      name: "Feature",
      value: feature,
    })),
  };
}

export function contactPageJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Sunce Renewables",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      telephone: "+91-6361991349",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressRegion: "UP",
        addressLocality: "Noida",
      },
    },
  };
}
