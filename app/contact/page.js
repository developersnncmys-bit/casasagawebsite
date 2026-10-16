import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { mapEmbed, waLinkFor } from "@/components/content-helpers";
import { getContent } from "@/lib/content";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const { contact, locations } = await getContent();
  const waLink = waLinkFor(contact);
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's plan"
        accent="something special"
        sub="Tell us about your occasion and we'll help shape the perfect stay."
        img="/images/tulum-bedroom-1.jpg"
      />

      <section className="locations">
        <Reveal className="section-head center">
          <p className="eyebrow">Our locations</p>
          <h2>
            {locations.length} homes in <em>Bangalore</em>
          </h2>
        </Reveal>
        <div className="loc-grid" style={{ "--cols": Math.min(locations.length, 3) }}>
          {locations.map((loc, i) => (
            <Reveal key={loc.id} delay={i * 0.1} className="loc-card">
              <iframe
                title={`CasaSaga ${loc.name} map`}
                src={mapEmbed(loc)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="loc-card-body">
                <h3>{loc.name}</h3>
                <address>
                  {loc.address.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </address>
                <div className="loc-card-actions">
                  {loc.mapUrl && (
                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                      Get directions
                    </a>
                  )}
                  <a href={`/rooms?location=${loc.id}`} className="link-line">View suites</a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="contact">
        <Reveal className="contact-info">
          <div className="info-block">
            <h4>Call</h4>
            <a href={`tel:${contact.tel}`} className="info-big">{contact.phone}</a>
          </div>
          <div className="info-block">
            <h4>WhatsApp</h4>
            <a
              href={waLink("Hi CasaSaga, I'd like to plan a stay.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Chat with us
            </a>
          </div>
          <div className="info-block">
            <h4>Arrivals</h4>
            <p className="muted">Check-in from 2:00 PM to 10:00 PM</p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
