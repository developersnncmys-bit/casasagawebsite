"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const text =
  "Tucked away in Banashankari, CasaSaga is a hideaway built for two — where soft light, quiet luxury and thoughtful details turn a night away into a story you'll keep retelling.";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

export default function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const imgY1 = useTransform(scrollYProgress, [0, 1], [120, -160]);
  const imgY2 = useTransform(scrollYProgress, [0, 1], [-60, 140]);
  const rot = useTransform(scrollYProgress, [0, 1], [-8, 6]);
  const list = text.split(" ");

  return (
    <section ref={ref} className="manifesto">
      <motion.img src="/images/sakura.jpg" alt="" className="float-img fi-1" style={{ y: imgY1, rotate: rot }} />
      <motion.img src="/images/riviera-lounge-1.jpg" alt="" className="float-img fi-2" style={{ y: imgY2 }} />
      <p className="eyebrow">A sanctuary for lovers</p>
      <p className="manifesto-text">
        {list.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / list.length, (i + 1) / list.length]}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}
