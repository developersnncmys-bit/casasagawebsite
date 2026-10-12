"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Lightbox from "./Lightbox";

export default function SuiteGallery({ images, name }) {
  const [index, setIndex] = useState(null);
  const items = images.map((src, i) => ({ src, alt: `${name} Suite — photo ${i + 1}` }));
  return (
    <>
      <div className="suite-gallery">
        {items.map((img, i) => (
          <motion.button
            key={img.src}
            className={`sg-item sg-${i % 5}`}
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.1 }}
            aria-label={`Open ${img.alt}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" />
          </motion.button>
        ))}
      </div>
      <Lightbox images={items} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
    </>
  );
}
