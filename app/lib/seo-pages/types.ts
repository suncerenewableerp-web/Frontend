export type Faq = { q: string; a: string };

export type ContentSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

/** A keyword-targeted landing page (service, location or brand). */
export type LandingPage = {
  slug: string;
  /** Short label used in links, breadcrumbs and nav. */
  name: string;
  /** <title> — keep under ~60 chars; " | Sunce Renewables" is appended. */
  title: string;
  /** Meta description — keep within ~155 chars. */
  description: string;
  h1: string;
  kicker: string;
  intro: string[];
  keywords: string[];
  /** schema.org Service.serviceType */
  serviceType: string;
  areaServed?: string[];
  highlights?: string[];
  sections: ContentSection[];
  faqs: Faq[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  datePublished: string;
  readMinutes: number;
  keywords: string[];
  intro: string[];
  sections: ContentSection[];
  faqs?: Faq[];
  /** Slugs of service pages to link to at the end of the article. */
  relatedServices: string[];
  /** Extra links (e.g. a location page) shown with the related services. */
  relatedLinks?: { label: string; href: string }[];
};
