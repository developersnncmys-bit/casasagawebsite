"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CallToAction() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const clip = useTransform(scrollYProgress, [0, 0.8], ["inset(18% 22% 18% 22% round 400px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.4, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 1], [120, 0]);
  const textOp = useTransform(scrollYProgress, [0.45, 0.9], [0, 1]);

  return (
    <section ref={ref} className="cta">
      <div className="cta-sticky">
        <motion.div className="cta-media" style={{ clipPath: clip }}>
          <motion.img src="/images/cta.jpg" alt="A CasaSaga suite ready for the evening" style={{ scale }} />
          <div className="cta-veil" />
        </motion.div>
        <motion.div className="cta-content" style={{ y: textY, opacity: textOp }}>
          <p className="eyebrow">Reserve tonight</p>
          <h2>
            Your perfect <em>escape</em> awaits
          </h2>
          <Link href="/booking" className="btn btn-gold btn-lg">Reserve Your Suite</Link>
        </motion.div>
      </div>
    </section>
  );
}
