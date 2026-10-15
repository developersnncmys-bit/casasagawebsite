import Link from "next/link";
import PageHero from "@/components/PageHero";
import ParallaxImg from "@/components/ParallaxImg";
import Reveal from "@/components/Reveal";
import { formatINR } from "@/components/content-helpers";
import { getContent } from "@/lib/content";

export const metadata = { title: "Suites" };

export default async function RoomsPage() {
  const { suites, policies } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Rooms & Suites"
        title="Our"
        accent="sanctuaries"
        sub="Four themed suites, each built around its own private water ritual — from sunken jacuzzis to an indoor plunge pool."
        img="/images/tulum-jacuzzi-1.jpg"
      />

      <section className="rooms-list">
        {suites.map((s, i) => (
          <article key={s.id} className={`room-row ${i % 2 ? "flip" : ""}`} style={{ "--accent": s.accent }}>
            <Link href={`/rooms/${s.id}`} className="room-media" data-hover>
              <ParallaxImg src={s.img} alt={`${s.name} Suite`} speed={12} />
              <span className="room-no">0{i + 1}</span>
            </Link>
            <Reveal className="room-info">
              <p className="suite-mood">{s.tag} · {s.mood}</p>
              <h2>
                {s.name} <em>Suite</em>
              </h2>
              <p className="muted">{s.blurb}</p>
              <ul className="chip-list">
                {s.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
                {s.size && <li>{s.size}</li>}
              </ul>
              <div className="room-price">
                ₹{formatINR(s.price)} <small>per night</small>
              </div>
              <div className="suite-actions">
                <Link href={`/booking?suite=${s.id}`} className="btn btn-gold">Book Now</Link>
                <Link href={`/rooms/${s.id}`} className="link-line">View Suite</Link>
                <Link href={`/contact?topic=${encodeURIComponent(s.name + " Suite")}`} className="link-line">Enquire</Link>
              </div>
            </Reveal>
          </article>
        ))}
      </section>

      <section className="policies">
        <Reveal className="section-head center">
          <p className="eyebrow">Good to know</p>
          <h2>
            House <em>policies</em>
          </h2>
        </Reveal>
        <div className="policy-grid">
          {policies.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.08} className="policy">
              <span>{p.label}</span>
              <strong>{p.value}</strong>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
