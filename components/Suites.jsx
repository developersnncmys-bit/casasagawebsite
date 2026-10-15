"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { formatINR } from "./content-helpers";
import { useContent } from "./ContentProvider";

function SuiteCard({ s, i }) {
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
        <motion.img src={s.img} alt={`${s.name} Suite`} style={{ y: imgY }} />
        <span className="suite-index">0{i + 1}</span>
        <span className="suite-price">
          ₹{formatINR(s.price)}<small>/night</small>
        </span>
      </Link>
      <div className="suite-body">
        <p className="suite-mood">{s.tag} · {s.mood}</p>
        <h3>
          {s.name} <em>Suite</em>
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
  const { suites } = useContent();
  return (
    <section id="suites" className="suites">
      <div className="suites-head">
        <div>
          <p className="eyebrow">Rooms & Suites</p>
          <h2>
            Our <em>sanctuaries</em>
          </h2>
        </div>
        <div className="suites-head-side">
          <p className="muted">Four suites, four moods — each with its own private water ritual.</p>
          <Link href="/rooms" className="link-line">All suites</Link>
        </div>
      </div>
      <div className="suites-list">
        {suites.map((s, i) => (
          <SuiteCard key={s.id} s={s} i={i} />
        ))}
      </div>
    </section>
  );
}
