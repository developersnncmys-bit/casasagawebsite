import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ParallaxImg from "@/components/ParallaxImg";
import Reveal from "@/components/Reveal";
import SuiteGallery from "@/components/SuiteGallery";
import { formatINR, getSuite, policies, suites, waLink } from "@/components/data";

export function generateStaticParams() {
  return suites.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const s = getSuite(slug);
  return s ? { title: `${s.name} Suite`, description: s.blurb } : {};
}

export default async function SuitePage({ params }) {
  const { slug } = await params;
  const s = getSuite(slug);
  if (!s) notFound();
  const others = suites.filter((o) => o.id !== s.id);

  return (
    <div style={{ "--accent": s.accent }}>
      <PageHero eyebrow={`${s.tag} · ${s.mood}`} title={s.name} accent="Suite" sub={s.blurb} img={s.gallery[0]} />

      <section className="suite-detail">
        <div className="sd-main">
          <Reveal>
            <p className="eyebrow">The suite</p>
            <p className="sd-story">{s.story}</p>
          </Reveal>
          <ParallaxImg src={s.gallery[1]} alt={`${s.name} Suite`} className="sd-img" speed={14} />
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
          <p className="suite-mood">{s.tag}</p>
          <div className="room-price">
            ₹{formatINR(s.price)} <small>per night</small>
          </div>
          <dl>
            {s.size && <div className="dl-row"><dt>Size</dt><dd>{s.size}</dd></div>}
            {s.guests && <div className="dl-row"><dt>Occupancy</dt><dd>{s.guests}</dd></div>}
            {policies.slice(0, 3).map((p) => (
              <div key={p.label} className="dl-row"><dt>{p.label}</dt><dd>{p.value}</dd></div>
            ))}
          </dl>
          <Link href={`/booking?suite=${s.id}`} className="btn btn-gold sd-btn">Reserve this suite</Link>
          <a
            href={waLink(`Hi CasaSaga, I'm interested in the ${s.name} Suite. Could you share availability?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn sd-btn"
          >
            Ask on WhatsApp
          </a>
          <Link href={`/contact?topic=${encodeURIComponent(s.name + " Suite")}`} className="link-line">Send an enquiry</Link>
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
                <ParallaxImg src={o.img} alt={`${o.name} Suite`} speed={10} />
                <div className="other-info">
                  <span className="suite-mood">{o.mood}</span>
                  <h3>{o.name} <em>Suite</em></h3>
                  <span>₹{formatINR(o.price)} / night →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
