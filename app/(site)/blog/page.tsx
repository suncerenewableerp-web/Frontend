import type { Metadata } from "next";
import HubPage from "../../components/seo/HubPage";
import { pageMetadata } from "../../lib/seo";
import { BLOG_POSTS, blogUrl } from "../../lib/seo-pages/blog";

export const metadata: Metadata = pageMetadata({
  title: "Solar Inverter Guides & Blog",
  description:
    "Practical guides on solar inverter problems, troubleshooting, maintenance, repair cost and replacement from the Sunce Renewables technical team.",
  path: "/blog",
  keywords: ["solar inverter blog", "solar inverter guide", "solar inverter problems and solutions"],
});

export default function BlogIndexPage() {
  return (
    <HubPage
      kicker="Sunce Solar Guides"
      h1="Solar Inverter Guides & Articles"
      intro="Answers to the questions solar owners ask us most — written by technicians who repair solar inverters every day."
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ]}
      cards={BLOG_POSTS.map((p) => ({
        title: p.h1,
        text: p.description,
        href: blogUrl(p.slug),
        meta: `${p.readMinutes} min read`,
      }))}
    />
  );
}
