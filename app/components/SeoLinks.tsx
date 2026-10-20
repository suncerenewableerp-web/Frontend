import Link from "next/link";
import { BLOG_POSTS, blogUrl } from "../lib/seo-pages/blog";
import { BRANDS, brandUrl } from "../lib/seo-pages/brands";
import { LOCATIONS, locationUrl } from "../lib/seo-pages/locations";
import { SERVICES, serviceUrl } from "../lib/seo-pages/services";

// Site-wide internal links so every page passes authority to the keyword pages.
export default function SeoLinks() {
  const groups = [
    {
      title: "Solar Inverter Services",
      links: [
        { label: "Solar Inverter Repair", href: "/solar-inverter-repair" },
        ...SERVICES.slice(0, 7).map((s) => ({ label: s.name, href: serviceUrl(s.slug) })),
      ],
    },
    {
      title: "Areas We Serve",
      links: LOCATIONS.map((l) => ({ label: l.name, href: locationUrl(l.slug) })),
    },
    {
      title: "Brands We Repair",
      links: BRANDS.slice(0, 9).map((b) => ({ label: b.name, href: brandUrl(b.slug) })),
    },
    {
      title: "Solar Inverter Guides",
      links: BLOG_POSTS.slice(0, 7).map((p) => ({ label: p.h1, href: blogUrl(p.slug) })),
    },
  ];

  return (
    <nav className="sl-section" aria-label="Solar inverter services directory">
      <div className="sl-wrap">
        {groups.map((g) => (
          <div key={g.title}>
            <h2>{g.title}</h2>
            <ul>
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
