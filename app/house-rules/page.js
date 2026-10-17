import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { getContent } from "@/lib/content";

export const metadata = {
  title: "House Rules",
  description: "The house rules for a comfortable and pleasant stay at CasaSaga.",
};

export default async function HouseRulesPage() {
  const { houseRules, contact } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Good to know"
        title="House"
        accent="rules"
        sub="To ensure a comfortable and pleasant stay for everyone, please follow our house rules."
        img="/images/about-hero.jpg"
      />

      <section className="refund">
        <ol className="refund-list">
          {houseRules.map((r, i) => (
            <Reveal as="li" key={r.title} delay={i * 0.06} className="refund-item">
              <span className="refund-no">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{r.title}</h2>
                <p className="muted">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal className="refund-help">
          <p className="muted">
            Thank you for your cooperation! We hope you have a wonderful and memorable stay with us.
            {contact?.phone ? <> Questions? Call us on <a href={`tel:${contact.tel}`} className="gold">{contact.phone}</a>.</> : null}
          </p>
          <Link href="/booking" className="btn btn-gold">
            Book your stay
          </Link>
        </Reveal>
        <p className="muted rules-also">
          See also our <Link href="/cancellation-policy" className="link-line">Cancellation &amp; refund policy</Link>
        </p>
      </section>
    </>
  );
}
