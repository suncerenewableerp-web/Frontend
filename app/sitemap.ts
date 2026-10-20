import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";
import { PRODUCTS, productUrl } from "./lib/products";
import { BLOG_POSTS, blogUrl } from "./lib/seo-pages/blog";
import { BRANDS, brandUrl } from "./lib/seo-pages/brands";
import { LOCATIONS, locationUrl } from "./lib/seo-pages/locations";
import { SERVICES, serviceUrl } from "./lib/seo-pages/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/management`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/career`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-conditions`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${SITE_URL}${productUrl(product.slug)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const page = (
    path: string,
    priority: number,
    changeFrequency: "weekly" | "monthly" = "monthly",
    lastModified: Date = now
  ) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority });

  const seoPages: MetadataRoute.Sitemap = [
    page("/solar-inverter-repair", 0.95, "weekly"),
    page("/services", 0.9, "weekly"),
    page("/brands", 0.8),
    page("/blog", 0.8, "weekly"),
    ...LOCATIONS.map((l) => page(locationUrl(l.slug), 0.9)),
    ...SERVICES.map((s) => page(serviceUrl(s.slug), 0.85)),
    ...BRANDS.map((b) => page(brandUrl(b.slug), 0.75)),
    ...BLOG_POSTS.map((p) => page(blogUrl(p.slug), 0.7, "monthly", new Date(p.datePublished))),
  ];

  return [...staticPages, ...seoPages, ...productPages];
}
