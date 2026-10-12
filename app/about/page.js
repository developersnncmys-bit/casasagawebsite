import Link from "next/link";
import PageHero from "@/components/PageHero";
import AboutStory from "@/components/AboutStory";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import { values } from "@/components/data";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="A house built"
        accent="for two"
        sub="A boutique retreat in Bangalore for romantic stays, anniversaries and weekend escapes."
        img="/images/about-hero.jpg"
      />

      <AboutStory />

      <section className="philosophy">
        <Reveal>
          <p className="eyebrow">Our philosophy</p>
          <p className="philo-quote">
            Luxury should be <em>felt</em>, not counted — in the scent of jasmine when you arrive,
            and a bath already drawn after a long journey.
          </p>
          <p className="muted philo-sub">
            We design every suite so you&apos;ll want to stay a little longer, and come back a little sooner.
          </p>
        </Reveal>
      </section>

      <section className="values">
        <Reveal className="section-head">
          <p className="eyebrow">What guides us</p>
          <h2>
            Four <em>promises</em>
          </h2>
        </Reveal>
        <div className="values-grid">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1} className="value">
              <span className="value-no">0{i + 1}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee />

      <Reveal className="inline-cta">
        <p className="eyebrow">Your chapter</p>
        <h2>
          Ready to begin <em>your story?</em>
        </h2>
        <div className="inline-cta-actions">
          <Link href="/booking" className="btn btn-gold btn-lg">Book a suite</Link>
          <Link href="/rooms" className="link-line">Explore suites</Link>
        </div>
      </Reveal>
    </>
  );
}
