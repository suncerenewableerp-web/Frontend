import Link from "next/link";
import JsonLd from "../JsonLd";
import { absoluteUrl, breadcrumbJsonLd } from "../../lib/seo";
import type { Crumb } from "./LandingTemplate";

type Card = { title: string; text: string; href: string; meta?: string };

type Props = {
  kicker: string;
  h1: string;
  intro: string;
  breadcrumbs: Crumb[];
  cards: Card[];
  footnote?: string;
};

export default function HubPage({ kicker, h1, intro, breadcrumbs, cards, footnote }: Props) {
  const path = breadcrumbs[breadcrumbs.length - 1].path;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: h1,
          description: intro,
          url: absoluteUrl(path),
          hasPart: cards.map((c) => ({ "@type": "WebPage", name: c.title, url: absoluteUrl(c.href) })),
        }}
      />
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <nav className="lp-crumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((c, i) => (
              <span key={c.path}>
                {i > 0 && <span aria-hidden="true"> / </span>}
                {i < breadcrumbs.length - 1 ? <Link href={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
              </span>
            ))}
          </nav>
          <div className="lp-kicker">{kicker}</div>
          <h1>{h1}</h1>
          <p className="lp-hero-intro">{intro}</p>
        </div>
      </section>
      <section className="lp-hub">
        <div className="lp-grid">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="lp-card">
              {c.meta && <span className="lp-card-meta">{c.meta}</span>}
              <h2>{c.title}</h2>
              <p>{c.text}</p>
              <span className="lp-card-more">Read more →</span>
            </Link>
          ))}
        </div>
        {footnote && <p className="lp-footnote">{footnote}</p>}
      </section>
    </>
  );
}
