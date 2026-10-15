"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    lenisRef.current = lenis;
    window.__lenis = lenis; // lets components (e.g. the booking steps) scroll smoothly
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    // Smooth-scroll in-page anchors ("#x" or "/current-path#x")
    const onClick = (e) => {
      const a = e.target.closest("a[href*='#']");
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -40 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // New page: jump to top, or to the hash if one was given
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.resize();
    const target = location.hash && document.querySelector(location.hash);
    if (target) setTimeout(() => lenis.scrollTo(target, { offset: -40 }), 100);
    else lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return children;
}
