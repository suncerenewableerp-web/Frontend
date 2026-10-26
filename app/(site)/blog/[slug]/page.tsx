import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingTemplate from "../../../components/seo/LandingTemplate";
import { articleJsonLd, faqJsonLd, pageMetadata } from "../../../lib/seo";
import { BLOG_POSTS, blogUrl, getPost } from "../../../lib/seo-pages/blog";
import { blogLinks, locationLinks } from "../../../lib/seo-pages/links";
import { getService, serviceUrl } from "../../../lib/seo-pages/services";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const meta = pageMetadata({
    title: post.title,
    description: post.description,
    path: blogUrl(post.slug),
    keywords: post.keywords,
    imageAlt: post.h1,
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.datePublished },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const path = blogUrl(post.slug);

  const related = post.relatedServices
    .map(getService)
    .filter((s) => s !== undefined)
    .map((s) => ({ label: s.name, href: serviceUrl(s.slug) }));

  return (
    <LandingTemplate
      kicker="Sunce Solar Guides"
      h1={post.h1}
      meta={`${dateFormat.format(new Date(post.datePublished))} · ${post.readMinutes} min read · By Sunce Renewables technical team`}
      intro={post.intro}
      sections={post.sections}
      faqs={post.faqs}
      breadcrumbs={[
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.h1, path },
      ]}
      related={[
        {
          title: "Related Services",
          links: [
            { label: "Solar Inverter Repair", href: "/solar-inverter-repair" },
            ...related,
            ...(post.relatedLinks ?? []),
          ],
        },
        blogLinks(post.slug),
        locationLinks(),
      ]}
      jsonLd={[
        articleJsonLd({
          title: post.title,
          description: post.description,
          path,
          datePublished: post.datePublished,
        }),
        ...(post.faqs?.length ? [faqJsonLd(post.faqs)] : []),
      ]}
    />
  );
}
