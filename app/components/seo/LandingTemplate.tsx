import Link from "next/link";
import JsonLd from "../JsonLd";
import { breadcrumbJsonLd } from "../../lib/seo";
import { PHONE, PHONE_HREF, WHATSAPP_HREF } from "../../lib/site";
import type { ContentSection, Faq } from "../../lib/seo-pages/types";

export type Crumb = { name: string; path: string };
export type LinkGroup = { title: string; links: { label: string; href: string }[] };

type Props = {
  kicker: string;
  h1: string;
  intro: string[];
  highlights?: string[];
  sections: ContentSection[];
  faqs?: Faq[];
  breadcrumbs: Crumb[];
  related?: LinkGroup[];
  jsonLd?: object[];
  /** Extra line under the H1, e.g. blog meta. */
  meta?: string;
  showCta?: boolean;
};

export default function LandingTemplate({
  kicker,
  h1,
  intro,
  highlights,
  sections,
  faqs,
  breadcrumbs,
  related,
  jsonLd = [],
  meta,
  showCta = true,
}: Props) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      {jsonLd.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      <section className="lp-hero">
        <div className="lp-hero-inner">
          <nav className="lp-crumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((c, i) => (
              <span key={c.path}>
                {i > 0 && <span aria-hidden="true"> / </span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={c.path}>{c.name}</Link>
                ) : (
                  <span aria-current="page">{c.name}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="lp-kicker">{kicker}</div>
          <h1>{h1}</h1>
          {meta && <div className="lp-meta">{meta}</div>}
          {showCta && (
            <div className="lp-actions">
              <a href={PHONE_HREF} className="lp-btn lp-btn-primary">
                Call {PHONE}
              </a>
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-ghost">
                WhatsApp Us
              </a>
            </div>
          )}
        </div>
      </section>

      <div className="lp-body">
        <article className="lp-main">
          {intro.map((p, i) => (
            <p key={i} className={i === 0 ? "lp-lead" : undefined}>
              {p}
            </p>
          ))}

          {highlights && highlights.length > 0 && (
            <ul className="lp-chips">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}

          {sections.map((s) => (
            <section key={s.heading} className="lp-section">
              <h2>{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.bullets && (
                <ul className="lp-list">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {faqs && faqs.length > 0 && (
            <section className="lp-section">
              <h2>Frequently asked questions</h2>
              <div className="lp-faqs">
                {faqs.map((f) => (
                  <details key={f.q} className="lp-faq">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {showCta && (
            <div className="lp-cta">
              <div>
                <h2>Need a solar inverter repaired?</h2>
                <p>
                  Share your inverter brand, model and error code — our technicians will
                  guide you and share an estimate before any repair starts.
                </p>
              </div>
              <div className="lp-actions">
                <a href={PHONE_HREF} className="lp-btn lp-btn-primary">
                  Call {PHONE}
                </a>
                <Link href="/contact" className="lp-btn lp-btn-outline">
                  Contact Us
                </Link>
              </div>
            </div>
          )}
        </article>

        {related && related.length > 0 && (
          <aside className="lp-aside">
            {related.map((group) => (
              <div key={group.title} className="lp-aside-card">
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        )}
      </div>
    </>
  );
}
