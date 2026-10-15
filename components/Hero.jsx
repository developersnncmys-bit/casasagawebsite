"use client";
import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import BookingBar from "./BookingBar";

const words = ["Where", "every", "moment", "becomes", "a", "memory."];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Scroll parallax: each layer moves at a different speed
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.35]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], ["0%", "-120%"]);

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const bgX = useTransform(smx, (v) => v * -25);
  const bgYm = useTransform(smy, (v) => v * -25);
  const fgX = useTransform(smx, (v) => v * 30);
  const fgY = useTransform(smy, (v) => v * 30);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="top" ref={ref} className="hero" onMouseMove={onMove}>
      <motion.div className="hero-bg" style={{ y: bgY, scale: bgScale }}>
        <motion.div className="hero-bg-inner" style={{ x: bgX, y: bgYm }}>
          {/* Same banner photo as casasaga.in */}
          <img src="/images/hero-banner.jpg" alt="" fetchPriority="high" aria-hidden="true" />
        </motion.div>
      </motion.div>
      <div className="hero-veil" />

      <motion.div className="orb orb-a" style={{ y: orbY, x: fgX }} />
      <motion.div className="orb orb-b" style={{ y: orbY, x: fgY }} />

      <motion.div className="hero-content" style={{ y: titleY, opacity: fade }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.8 }}
        >
          Bangalore&apos;s most intimate retreat
        </motion.p>
        <h1 className="hero-title">
          {words.map((w, i) => (
            <span className="word-mask" key={i}>
              <motion.span
                className={w === "memory." ? "italic gold" : ""}
                initial={{ y: "115%", rotate: 6 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ delay: 2.15 + i * 0.08, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1 }}
        >
          Four themed suites, private jacuzzis and in-house celebration decor — crafted for couples,
          honeymooners and every anniversary worth celebrating.
        </motion.p>
      </motion.div>

      <motion.div
        className="hero-booking"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <BookingBar />
      </motion.div>

      <motion.div className="scroll-hint" style={{ opacity: fade }}>
        <span>Scroll</span>
        <i />
      </motion.div>
    </section>
  );
}
