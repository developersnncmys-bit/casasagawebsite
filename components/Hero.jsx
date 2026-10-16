"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import BookingBar from "./BookingBar";

const words = ["Where", "every", "moment", "becomes", "a", "memory."];

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // The text fades as the page scrolls; the banner photo itself stays still
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section id="top" ref={ref} className="hero">
      <div className="hero-bg">
        {/* Same banner photo as casasaga.in — fixed, no movement */}
        <img src="/images/hero-banner.jpg" alt="" fetchPriority="high" aria-hidden="true" />
      </div>
      <div className="hero-veil" />

      <motion.div className="hero-content" style={{ opacity: fade }}>
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
          Themed suites across Bangalore, private jacuzzis and in-house celebration decor — crafted for couples,
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
