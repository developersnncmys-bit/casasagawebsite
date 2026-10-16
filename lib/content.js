import { cache } from "react";
import * as fallback from "@/components/data";
import { normalize } from "@/components/content-helpers";

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://casasagabackend.vercel.app").replace(/\/$/, "");

// How often (seconds) pages re-check the API. The admin panel also triggers an
// instant refresh through /api/revalidate whenever content changes.
export const REVALIDATE = 60;

/**
 * Everything the site shows — suites, add-ons, gallery, stories, contact, policies —
 * managed in the admin panel. If the API can't be reached, the built-in copy in
 * components/data.js is used so the site keeps working.
 */
export const getContent = cache(async () => {
  try {
    const res = await fetch(`${API_URL}/api/public/content`, { next: { revalidate: REVALIDATE, tags: ["content"] } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();
    return normalize(data);
  } catch (err) {
    console.warn(`[content] CasaSaga API unavailable at ${API_URL} (${err.message}) — using built-in content`);
    const { contact, locations, reels, policies, occasions, values, galleryCategories, suites, addons, gallery, stories } = fallback;
    return normalize({ contact, locations, reels, policies, occasions, values, galleryCategories, suites, addons, gallery, stories });
  }
});
