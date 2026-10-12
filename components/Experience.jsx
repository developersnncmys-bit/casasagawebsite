"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { experiences } from "./data";

function Card({ e, i, total, progress }) {
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.05]);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.5, 1]);

  return (
    <div ref={ref} className="exp-holder">
      <motion.article className="exp-card" style={{ scale, top: `calc(100px + ${i * 28}px)` }}>
        <div className="exp-text">
          <span className="exp-no">{e.no}</span>
          <h3>{e.title}</h3>
          <p>{e.text}</p>
          <Link href={`/contact?occasion=${encodeURIComponent(e.occasion)}&topic=${encodeURIComponent(e.title)}`} className="link-line">Plan this experience</Link>
        </div>
        <div className="exp-media">
          <motion.img src={e.img} alt={e.title} style={{ scale: imgScale }} />
        </div>
      </motion.article>
    </div>
  );
}

export default function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section id="experience" className="experience">
      <div className="section-head">
        <p className="eyebrow">Amenities</p>
        <h2>
          The CasaSaga <em>experience</em>
        </h2>
      </div>
      <div ref={ref}>
        {experiences.map((e, i) => (
          <Card key={e.no} e={e} i={i} total={experiences.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
