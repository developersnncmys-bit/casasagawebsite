"use client";
import { motion } from "framer-motion";
import { useContent } from "./ContentProvider";
import InstagramIcon, { instagramHandle } from "./InstagramIcon";

// "https://www.instagram.com/reel/DN8IoH5DyfE/?…" → "DN8IoH5DyfE"
const reelCode = (url) => /instagram\.com\/(?:reel|reels|p)\/([\w-]+)/.exec(url || "")?.[1] || null;

// Instagram reels from the admin panel (Contact & policies → Instagram reels), played in place
export default function Reels() {
  const { reels = [], contact } = useContent();
  const codes = reels.map(reelCode).filter(Boolean);
  if (!codes.length) return null;

  return (
    <section id="reels" className="reels">
      <div className="section-head center">
        <p className="eyebrow">On Instagram</p>
        <h2>
          Moments at <em>CasaSaga</em>
        </h2>
        <p className="muted reels-sub">A peek inside our suites, setups and celebrations.</p>
        {contact?.instagram && (
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="ig-account">
            <InstagramIcon size={20} /> {instagramHandle(contact.instagram)}
          </a>
        )}
      </div>
      <div className="reels-grid" style={{ "--cols": Math.min(codes.length, 4) }}>
        {codes.map((code, i) => (
          <motion.div
            key={code}
            className="reel"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          >
            <iframe
              src={`https://www.instagram.com/reel/${code}/embed/`}
              title={`CasaSaga on Instagram — reel ${i + 1}`}
              loading="lazy"
              scrolling="no"
              tabIndex={-1}
              aria-hidden="true"
            />
            {/* The whole card opens the reel on Instagram */}
            <a
              className="reel-link"
              href={`https://www.instagram.com/reel/${code}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch reel ${i + 1} on Instagram`}
            >
              <span className="reel-cta">Watch on Instagram</span>
            </a>
          </motion.div>
        ))}
      </div>
      {contact?.instagram && (
        <div className="reels-more">
          <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <InstagramIcon /> Follow us on Instagram
          </a>
        </div>
      )}
    </section>
  );
}
