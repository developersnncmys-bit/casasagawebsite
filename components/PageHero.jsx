"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function PageHero({ eyebrow, title, accent, sub, img, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="page-hero">
      <motion.div className="page-hero-bg" style={{ y, scale }}>
        <img src={img} alt="" />
      </motion.div>
      <div className="page-hero-veil" />
      <motion.div className="page-hero-content" style={{ y: textY, opacity: fade }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {eyebrow}
        </motion.p>
        <h1 className="page-title">
          <span className="word-mask">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              {title} {accent && <em>{accent}</em>}
            </motion.span>
          </span>
        </h1>
        {sub && (
          <motion.p
            className="page-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {sub}
          </motion.p>
        )}
        {children}
      </motion.div>
    </section>
  );
}
