"use client";
import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MediaFull } from "./Media";

export default function Lightbox({ images, index, onClose, onChange }) {
  const open = index !== null && index !== undefined;
  const go = useCallback(
    (d) => onChange((index + d + images.length) % images.length),
    [index, images.length, onChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={images[index].src}
              className="lb-media"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MediaFull src={images[index].src} alt={images[index].alt || ""} />
            </motion.div>
          </AnimatePresence>
          <button className="lb-btn lb-close" onClick={onClose} aria-label="Close">✕</button>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">←</button>
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">→</button>
          <p className="lb-count">
            {index + 1} / {images.length}
            {images[index].alt && <span> · {images[index].alt}</span>}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
