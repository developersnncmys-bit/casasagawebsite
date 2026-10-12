"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutStory() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 200]);
  const rot = useTransform(scrollYProgress, [0, 1], [4, -4]);

  return (
    <section ref={ref} className="about-story">
      <div className="as-text">
        <p className="eyebrow">How it began</p>
        <h2>
          Born from a love of <em>hideaways</em>
        </h2>
        <p>
          Before CasaSaga existed, its founders spent years seeking out small, intimate retreats —
          cenote-side cabins near Tulum, quiet villas among Bali&apos;s rice terraces. The places they
          remembered were never the biggest. They were the ones that felt made for two.
        </p>
        <p>
          CasaSaga is their answer for Bangalore: a handful of themed suites where every corner is
          designed to bring couples closer.
        </p>
      </div>
      <div className="as-media">
        <motion.img src="/images/tulum-lounge-1.jpg" alt="Tulum Suite lounge" className="as-img a" style={{ y: y1, rotate: rot }} />
        <motion.img src="/images/tulum-jacuzzi-1.jpg" alt="Tulum Suite jacuzzi" className="as-img b" style={{ y: y2 }} />
      </div>
    </section>
  );
}
