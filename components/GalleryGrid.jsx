"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Lightbox from "./Lightbox";
import { MediaThumb } from "./Media";
import { useContent } from "./ContentProvider";

function Column({ items, speed, progress, onOpen }) {
  const y = useTransform(progress, [0, 1], [0, speed]);
  return (
    <motion.div className="g-col" style={{ y }}>
      <AnimatePresence mode="popLayout">
        {items.map((img) => (
          <motion.button
            layout
            key={img.src}
            className="g-item"
            onClick={() => onOpen(img)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            aria-label={`Open ${img.alt}`}
          >
            <MediaThumb src={img.src} alt={img.alt} />
            <span className="g-cap">{img.cat}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GalleryGrid() {
  const { gallery, galleryCategories } = useContent();
  const [cat, setCat] = useState("All");
  const [index, setIndex] = useState(null);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const items = useMemo(() => (cat === "All" ? gallery : gallery.filter((g) => g.cat === cat)), [cat, gallery]);
  const cols = [0, 1, 2].map((c) => items.filter((_, i) => i % 3 === c));
  const speeds = [-80, 60, -140];

  return (
    <section className="gallery" ref={ref}>
      <div className="filters" role="tablist">
        {galleryCategories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            className={`filter ${cat === c ? "on" : ""}`}
            onClick={() => setCat(c)}
          >
            {c}
            {cat === c && <motion.span layoutId="filter-pill" className="filter-pill" />}
          </button>
        ))}
      </div>
      <div className="g-grid">
        {cols.map((col, i) => (
          <Column
            key={i}
            items={col}
            speed={speeds[i]}
            progress={scrollYProgress}
            onOpen={(img) => setIndex(items.indexOf(img))}
          />
        ))}
      </div>
      <Lightbox images={items} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
    </section>
  );
}
