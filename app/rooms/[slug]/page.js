import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ParallaxImg from "@/components/ParallaxImg";
import Reveal from "@/components/Reveal";
import SuiteGallery from "@/components/SuiteGallery";
import { findLocation, findSuite, formatINR, fullName, guestRules, nameParts, isVideo, suiteTax, taxNote } from "@/components/content-helpers";
import { getContent } from "@/lib/content";

// Suites added later in the admin panel are rendered on first visit
export const dynamicParams = true;

export async function generateStaticParams() {
  const { suites } = await getContent();
  return suites.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = findSuite(await getContent(), slug);
  return s ? { title: `${fullName(s.name)}`, description: s.blurb } : {};
}

export default async function SuitePage({ params }) {
  const { slug } = await params;
  const content = await getContent();
  const { suites, policies, pricing } = content;
  const s = findSuite(content, slug);
  if (!s) notFound();
  const others = suites.filter((o) => o.id !== s.id);
  // Videos play in the gallery; the banner and large picture need photos
  const photos = s.gallery.filter((g) => !isVideo(g));

  return (
    <div style={{ "--accent": s.accent }}>
      <PageHero eyebrow={`${fullName(s.name)}${s.mood ? ` · ${s.mood}` : ""}`} title={nameParts(s.name)[0]} accent={nameParts(s.name)[1]} sub={s.blurb} img={photos[0] || s.img} />

      <section className="suite-detail">
        <div className="sd-main">
          <Reveal>
            <p className="eyebrow">The suite</p>
            <p className="sd-story">{s.story}</p>
          </Reveal>
          <ParallaxImg src={photos[1] || photos[0] || s.img} alt={`${fullName(s.name)}`} className="sd-img" speed={14} />
          <Reveal>
            <h3 className="sd-h">In the suite</h3>
            <ul className="amenity-list">
              {s.amenities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        <aside className="sd-card">
          <p className="suite-mood">{fullName(s.name)}{s.mood ? ` · ${s.mood}` : ""}</p>
          <div className="room-price">
            ₹{formatINR(s.price)} <small>per night {taxNote(pricing, s)}</small>
          </div>
          <dl>
            {(() => {
              const loc = findLocation(content, s.location);
              return loc ? (
                <div className="dl-row">
                  <dt>Location</dt>
                  <dd>
                    {loc.name}
                    {loc.mapUrl && (
                      <>
                        <br />
                        <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="link-line">Directions</a>
                      </>
                    )}
                  </dd>
                </div>
              ) : null;
            })()}
            {s.size && <div className="dl-row"><dt>Size</dt><dd>{s.size}</dd></div>}
            <div className="dl-row"><dt>Guests</dt><dd>{guestRules(s).max > guestRules(s).included ? `${guestRules(s).included} included · up to ${guestRules(s).max}` : `Up to ${guestRules(s).max}`}</dd></div>
            {guestRules(s).extraPrice > 0 && guestRules(s).max > guestRules(s).included && (
              <div className="dl-row"><dt>Extra guest</dt><dd>₹{formatINR(guestRules(s).extraPrice)} / night {taxNote(pricing, s)}</dd></div>
            )}
            {suiteTax(pricing, s) > 0 && (
              <div className="dl-row"><dt>Per night incl. GST</dt><dd>₹{formatINR(Math.round(s.price * (1 + suiteTax(pricing, s) / 100)))}</dd></div>
            )}
            {policies.slice(0, 3).map((p) => (
              <div key={p.label} className="dl-row">
                <dt>{p.label}</dt>
                <dd>
                  {p.value}
                  {/cancel/i.test(p.label) && (
                    <>
                      <br />
                      <Link href="/cancellation-policy" className="link-line">Full policy</Link>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <Link href={`/booking?suite=${s.id}`} className="btn btn-gold sd-btn">Reserve this suite</Link>
          <Link href="/house-rules" className="link-line sd-rules">House rules</Link>
        </aside>
      </section>

      <section className="sd-gallery-wrap">
        <Reveal className="section-head">
          <p className="eyebrow">Gallery</p>
          <h2>
            Inside <em>{s.name}</em>
          </h2>
        </Reveal>
        <SuiteGallery images={s.gallery} name={s.name} />
      </section>

      <section className="others">
        <Reveal className="section-head">
          <p className="eyebrow">Keep exploring</p>
          <h2>
            Other <em>suites</em>
          </h2>
        </Reveal>
        <div className="others-grid">
          {others.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.1}>
              <Link href={`/rooms/${o.id}`} className="other-card" data-hover style={{ "--accent": o.accent }}>
                <ParallaxImg src={o.img} alt={`${fullName(o.name)}`} speed={10} />
                <div className="other-info">
                  <span className="suite-mood">{fullName(o.name)}{o.mood ? ` · ${o.mood}` : ""}</span>
                  <h3>{nameParts(o.name)[0]} <em>{nameParts(o.name)[1]}</em></h3>
                  <span>₹{formatINR(o.price)} / night {taxNote(pricing, o)} →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
