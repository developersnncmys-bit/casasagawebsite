"use client";
import { useRef } from "react";
import {
  motion, useAnimationFrame, useMotionValue, useScroll, useSpring,
  useTransform, useVelocity,
} from "framer-motion";

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function Row({ base, children }) {
  const pos = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const x = useTransform(pos, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    pos.set(pos.get() + move);
  });

  return (
    <div className="marquee-row">
      <motion.div className="marquee-inner" style={{ x }}>
        {[0, 1, 2, 3].map((k) => (
          <span key={k}>{children}</span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="marquee" aria-hidden>
      <Row base={-2.5}>Candlelight ✦ Jacuzzis ✦ Rooftop Evenings ✦ Plunge Pool ✦ </Row>
      <Row base={2.5}>
        <em>Honeymoons ✦ Anniversaries ✦ Proposals ✦ Getaways ✦ </em>
      </Row>
    </section>
  );
}
