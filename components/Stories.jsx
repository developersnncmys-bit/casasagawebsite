"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useContent } from "./ContentProvider";

function Story({ s, i, progress }) {
  const speeds = [80, -60, 120];
  const speed = speeds[i % speeds.length];
  const y = useTransform(progress, [0, 1], [speed, -speed]);
  return (
    <motion.figure
      className="story"
      style={{ y }}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1, delay: (i % 3) * 0.15 }}
    >
      <span className="story-mark">&ldquo;</span>
      <blockquote>{s.quote}</blockquote>
      <figcaption>
        <strong>{s.names}</strong>
        <span>{s.occasion}</span>
      </figcaption>
    </motion.figure>
  );
}

export default function Stories() {
  const { stories } = useContent();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const heartRotate = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const heartY = useTransform(scrollYProgress, [0, 1], ["-20%", "40%"]);

  return (
    <section id="stories" ref={ref} className="stories">
      <motion.div className="stories-heart" style={{ rotate: heartRotate, y: heartY }}>♥</motion.div>
      <div className="section-head center">
        <p className="eyebrow">Guest stories</p>
        <h2>
          Love, <em>remembered</em>
        </h2>
      </div>
      <div className="stories-grid">
        {stories.map((s, i) => (
          <Story key={s.names + i} s={s} i={i} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
