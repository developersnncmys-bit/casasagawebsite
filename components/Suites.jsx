"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { formatINR, suites } from "./data";

function SuiteCard({ s, i, progress }) {
  // Inner image drifts against the horizontal motion for a depth effect
  const imgX = useTransform(progress, [0, 1], ["-12%", "12%"]);
  return (
    <article className="suite" style={{ "--accent": s.accent }} data-hover>
      <div className="suite-media">
        <motion.img src={s.img} alt={`${s.name} Suite`} style={{ x: imgX }} />
        <span className="suite-index">0{i + 1}</span>
        <span className="suite-price">
          ₹{formatINR(s.price)}<small>/night</small>
        </span>
      </div>
      <div className="suite-body">
        <p className="suite-mood">{s.mood}</p>
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
    </article>
  );
}

export default function Suites() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  // How far the track must travel so the last card ends at the right edge
  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 25, mass: 0.4 });
  const x = useTransform(smooth, (v) => -v * distance);
  const bigX = useTransform(smooth, [0, 1], ["10%", "-40%"]);

  return (
    <section id="suites" ref={ref} className="suites">
      <div className="suites-sticky">
        <motion.div className="suites-ghost" style={{ x: bigX }}>Sanctuaries</motion.div>
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
        <motion.div ref={trackRef} className="suites-track" style={{ x }}>
          {suites.map((s, i) => (
            <SuiteCard key={s.id} s={s} i={i} progress={smooth} />
          ))}
        </motion.div>
        <div className="suites-progress">
          <motion.span style={{ scaleX: smooth }} />
        </div>
      </div>
    </section>
  );
}
