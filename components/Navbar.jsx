"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { nav } from "./data";

export default function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 200 && !open);
    setSolid(v > 60);
  });

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.header
      className={`nav ${solid || pathname !== "/" ? "nav-solid" : ""}`}
      animate={{ y: hidden ? "-110%" : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" className="nav-logo" aria-label="CasaSaga home">
        <img src="/images/logo.png" alt="CasaSaga" />
      </Link>
      <nav className={`nav-links ${open ? "is-open" : ""}`}>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? "active" : ""}>
            {n.label}
          </Link>
        ))}
        <Link href="/booking" className="btn btn-gold nav-cta-mobile">Book Now</Link>
      </nav>
      <Link href="/booking" className="btn btn-gold nav-cta">Book Now</Link>
      <button className="nav-burger" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
        <span className={open ? "x" : ""} />
      </button>
    </motion.header>
  );
}
