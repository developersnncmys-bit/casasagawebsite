// Helpers that work on the live content (from the CasaSaga API) on both server and client

export const formatINR = (n) => (Number(n) || 0).toLocaleString("en-IN");
export const addonPrice = (a) => (a.price ? `₹${formatINR(a.price)}` : "Price on request");

export const findSuite = (content, id) => content.suites.find((s) => s.id === id);
export const findAddon = (content, id) => content.addons.find((a) => a.id === id);
export const waLinkFor = (contact) => (text) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(text)}`;

// Fill gaps a freshly added item may have, so pages never read undefined lists
export function normalize(c) {
  return {
    ...c,
    contact: { address: [], ...c.contact },
    policies: c.policies || [],
    occasions: c.occasions?.length ? c.occasions : ["Romantic Getaway", "Other"],
    values: c.values || [],
    galleryCategories: c.galleryCategories?.length ? c.galleryCategories : ["All"],
    suites: (c.suites || []).map((s) => ({
      features: [],
      amenities: [],
      ...s,
      gallery: s.gallery?.length ? s.gallery : [s.img],
    })),
    addons: c.addons || [],
    gallery: c.gallery || [],
    stories: c.stories || [],
  };
}
