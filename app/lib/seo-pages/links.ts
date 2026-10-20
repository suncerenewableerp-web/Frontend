import type { LinkGroup } from "../../components/seo/LandingTemplate";
import { BLOG_POSTS, blogUrl } from "./blog";
import { BRANDS, brandUrl } from "./brands";
import { LOCATIONS, locationUrl } from "./locations";
import { SERVICES, serviceUrl } from "./services";

const without = <T extends { slug: string }>(items: T[], slug?: string) =>
  items.filter((i) => i.slug !== slug);

export function serviceLinks(exclude?: string, limit = 8): LinkGroup {
  return {
    title: "Our Services",
    links: [
      { label: "Solar Inverter Repair", href: "/solar-inverter-repair" },
      ...without(SERVICES, exclude)
        .slice(0, limit)
        .map((s) => ({ label: s.name, href: serviceUrl(s.slug) })),
    ],
  };
}

export function locationLinks(exclude?: string): LinkGroup {
  return {
    title: "Areas We Serve",
    links: without(LOCATIONS, exclude).map((l) => ({
      label: l.name,
      href: locationUrl(l.slug),
    })),
  };
}

export function brandLinks(exclude?: string, limit = 13): LinkGroup {
  return {
    title: "Brands We Repair",
    links: without(BRANDS, exclude)
      .slice(0, limit)
      .map((b) => ({ label: b.name, href: brandUrl(b.slug) })),
  };
}

export function blogLinks(exclude?: string, limit = 6): LinkGroup {
  return {
    title: "Helpful Guides",
    links: without(BLOG_POSTS, exclude)
      .slice(0, limit)
      .map((p) => ({ label: p.h1, href: blogUrl(p.slug) })),
  };
}
