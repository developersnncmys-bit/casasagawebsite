"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Image that drifts inside its frame as the frame passes through the viewport
export default function ParallaxImg({ src, alt = "", className = "", speed = 15 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed}%`, `${speed}%`]);
  return (
    <div ref={ref} className={`px-frame ${className}`}>
      <motion.img src={src} alt={alt} style={{ y, scale: 1 + speed / 50 }} loading="lazy" />
    </div>
  );
}
