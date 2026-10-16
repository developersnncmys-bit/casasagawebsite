"use client";
import { isVideo, youtubeId } from "./content-helpers";

// A gallery tile: a photo, a silent looping video, or a YouTube thumbnail
export function MediaThumb({ src, alt = "" }) {
  if (!isVideo(src)) return <img src={src} alt={alt} loading="lazy" />;
  const yt = youtubeId(src);
  return (
    <span className="media-tile">
      {yt ? (
        <img src={`https://img.youtube.com/vi/${yt}/hqdefault.jpg`} alt={alt} loading="lazy" />
      ) : (
        <video src={src} muted loop playsInline autoPlay preload="metadata" aria-label={alt} />
      )}
      <span className="media-play" aria-hidden>▶</span>
    </span>
  );
}

// Full-size in the viewer: a photo, a video with controls, or the YouTube player
export function MediaFull({ src, alt = "", onClick }) {
  const yt = youtubeId(src);
  if (yt) {
    return (
      <iframe
        className="media-full media-yt"
        src={`https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`}
        title={alt || "Video"}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        onClick={onClick}
      />
    );
  }
  if (isVideo(src)) return <video className="media-full" src={src} controls autoPlay playsInline onClick={onClick} />;
  return <img className="media-full" src={src} alt={alt} onClick={onClick} />;
}
