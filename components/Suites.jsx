"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { findLocation, formatINR, fullName, nameParts, taxNote } from "./content-helpers";
import { useContent } from "./ContentProvider";
import PinIcon from "./PinIcon";

function SuiteCard({ s, i, pricing, location }) {
  const ref = useRef(null);
  // Image drifts slightly against the scroll for a depth effect
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.article
      ref={ref}
      className={`suite ${i % 2 ? "flip" : ""}`}
      style={{ "--accent": s.accent }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      data-hover
    >
      <Link href={`/rooms/${s.id}`} className="suite-media">
        <motion.img src={s.img} alt={`${fullName(s.name)}`} style={{ y: imgY }} />
        <span className="suite-index">0{i + 1}</span>
        <span className="suite-price">
          ₹{formatINR(s.price)}<small>/night {taxNote(pricing, s)}</small>
        </span>
      </Link>
      <div className="suite-body">
        <p className="suite-mood">{fullName(s.name)}{s.mood ? ` · ${s.mood}` : ""}</p>
        {location && <p className="loc-pill"><PinIcon /> {location.name}</p>}
        <h3>
          {nameParts(s.name)[0]} <em>{nameParts(s.name)[1]}</em>
        </h3>
        <p className="suite-blurb">{s.blurb}</p>
        <ul>
          {s.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="suite-actions">
          <Link href={`/booking?suite=${s.id}`} className="btn btn-gold">Book Now</Link>
          <Link href={`/rooms/${s.id}`} className="link-line">View Suite</Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function Suites() {
  const content = useContent();
  const { suites, pricing, locations } = content;
  // The suites at the first location (Banashankari 6th Stage), in the order set in the admin
  // panel; the other locations' suites are on the Suites page
  const home = locations[0]?.id;
  const atHome = suites.filter((s) => s.location === home);
  const shown = atHome.length ? atHome : suites.slice(0, 3);
  return (
    <section id="suites" className="suites">
      <div className="suites-head">
        <div>
          <p className="eyebrow">Rooms & Suites</p>
          <h2>
            Our <em>sanctuaries</em>
          </h2>
        </div>
      </div>
      <div className="suites-list">
        {shown.map((s, i) => (
          <SuiteCard key={s.id} s={s} i={i} pricing={pricing} location={findLocation(content, s.location)} />
        ))}
      </div>
      {suites.length > shown.length && (
        <div className="suites-more">
          <Link href="/rooms" className="btn btn-ghost">Explore all {suites.length} suites</Link>
        </div>
      )}
    </section>
  );
}
