import Link from "next/link";
import PageHero from "@/components/PageHero";
import ParallaxImg from "@/components/ParallaxImg";
import Reveal from "@/components/Reveal";
import { findLocation, formatINR, taxNote } from "@/components/content-helpers";
import { getContent } from "@/lib/content";
import PinIcon from "@/components/PinIcon";

export const metadata = { title: "Suites" };

export default async function RoomsPage({ searchParams }) {
  const content = await getContent();
  const { policies, pricing, locations } = content;
  // ?location=jp-nagar shows that property's suites only
  const wanted = (await searchParams)?.location;
  const place = locations.find((l) => l.id === wanted);
  const suites = place ? content.suites.filter((s) => s.location === place.id) : content.suites;
  return (
    <>
      <PageHero
        eyebrow="Rooms & Suites"
        title="Our"
        accent="sanctuaries"
        sub={
          place
            ? `Our suites at ${place.name} — each built around its own private water ritual.`
            : `Themed suites across ${locations.length} locations in Bangalore, each built around its own private water ritual.`
        }
        img="/images/tulum-jacuzzi-1.jpg"
      />

      <nav className="loc-tabs" aria-label="Choose a location">
        <Link href="/rooms" className={!place ? "on" : ""}>All suites <span>{content.suites.length}</span></Link>
        {locations.map((l) => (
          <Link key={l.id} href={`/rooms?location=${l.id}`} className={place?.id === l.id ? "on" : ""}>
            {l.name} <span>{content.suites.filter((s) => s.location === l.id).length}</span>
          </Link>
        ))}
      </nav>
      {place && (
        <p className="loc-address">
          {place.address.join(", ")}
          {place.mapUrl && (
            <>
              {" · "}
              <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="link-line">Get directions</a>
            </>
          )}
        </p>
      )}

      <section className="rooms-list">
        {suites.length === 0 && <p className="muted loc-empty">New suites at this location are coming soon.</p>}
        {suites.map((s, i) => (
          <article key={s.id} className={`room-row ${i % 2 ? "flip" : ""}`} style={{ "--accent": s.accent }}>
            <Link href={`/rooms/${s.id}`} className="room-media" data-hover>
              <ParallaxImg src={s.img} alt={`${s.name} Suite`} speed={12} />
              <span className="room-no">0{i + 1}</span>
            </Link>
            <Reveal className="room-info">
              <p className="suite-mood">{s.tag} · {s.mood}</p>
              <p className="loc-pill"><PinIcon /> {findLocation(content, s.location)?.name}</p>
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
                ₹{formatINR(s.price)} <small>per night {taxNote(pricing, s)}</small>
              </div>
              <div className="suite-actions">
                <Link href={`/booking?suite=${s.id}`} className="btn btn-gold">Book Now</Link>
                <Link href={`/rooms/${s.id}`} className="link-line">View Suite</Link>
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
