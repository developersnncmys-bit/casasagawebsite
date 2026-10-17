// Instagram's glyph (rounded square, lens, flash dot), drawn in the current text colour
export default function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// "@casasaga_official" from https://www.instagram.com/casasaga_official/?…
export const instagramHandle = (url) => {
  const m = /instagram\.com\/([\w.]+)/.exec(url || "");
  return m && !["reel", "reels", "p"].includes(m[1]) ? `@${m[1]}` : "Instagram";
};
