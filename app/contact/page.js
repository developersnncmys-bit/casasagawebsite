import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { waLinkFor } from "@/components/content-helpers";
import { getContent } from "@/lib/content";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const { contact } = await getContent();
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

      <section className="contact">
        <Reveal className="contact-info">
          <div className="info-block">
            <h4>Visit</h4>
            <address>
              {contact.address.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="link-line">Get directions</a>
          </div>
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

        <Reveal className="contact-form-wrap" delay={0.1}>
          <p className="eyebrow">Send an enquiry</p>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </Reveal>
      </section>

      <section className="map-wrap">
        <iframe
          title="CasaSaga location"
          src="https://www.google.com/maps?q=Banashankari+6th+Stage,+Bangalore+560061&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
