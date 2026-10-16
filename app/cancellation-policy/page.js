import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { getContent } from "@/lib/content";

export const metadata = {
  title: "Cancellation & Refund Policy",
  description: "How cancellations, no-shows, refunds and booking changes work at CasaSaga.",
};

export default async function CancellationPolicyPage() {
  const { refundPolicy, contact } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Good to know"
        title="Cancellation"
        accent="& refunds"
        sub="Plans change — here is exactly how cancellations, refunds and booking changes work."
        img="/images/gallery-hero.jpg"
      />

      <section className="refund">
        <ol className="refund-list">
          {refundPolicy.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.06} className="refund-item">
              <span className="refund-no">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{p.title}</h2>
                <p className="muted">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal className="refund-help">
          <p className="muted">
            To cancel or change a booking, call us{contact?.phone ? <> on <a href={`tel:${contact.tel}`} className="gold">{contact.phone}</a></> : null} with your booking reference.
          </p>
          <Link href="/booking" className="btn btn-gold">
            Book your stay
          </Link>
        </Reveal>
      </section>
    </>
  );
}
