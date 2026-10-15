"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { addonPrice } from "./content-helpers";
import { useContent } from "./ContentProvider";

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
          <span className="exp-tag">Add-on · {addonPrice(e)}</span>
          <Link href={`/booking?addon=${e.id}`} className="link-line">Add to my stay</Link>
        </div>
        <div className="exp-media">
          <motion.img src={e.img} alt={e.title} style={{ scale: imgScale }} />
        </div>
      </motion.article>
    </div>
  );
}

export default function Experience() {
  const { addons } = useContent();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section id="experience" className="experience">
      <div className="section-head">
        <p className="eyebrow">Add-ons</p>
        <h2>
          Make it an <em>occasion</em>
        </h2>
        <p className="muted exp-intro">
          Celebrating something? Our team decorates your suite in-house before you arrive — just add it when you book.
        </p>
      </div>
      <div ref={ref}>
        {addons.map((e, i) => (
          <Card key={e.id} e={e} i={i} total={addons.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
