// Helpers that work on the live content (from the CasaSaga API) on both server and client

export const formatINR = (n) => (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
// GST % on an add-on: its own rate, else the add-on default
export const addonTax = (pricing, a) => a?.taxRate ?? pricing?.addonTaxRate ?? 0;
export const addonPrice = (a, pricing) =>
  a.price ? `₹${formatINR(a.price)}${pricing && addonTax(pricing, a) > 0 ? ` + ${addonTax(pricing, a)}% GST` : ""}` : "Price on request";

export const findSuite = (content, id) => content.suites.find((s) => s.id === id);

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * The bill for a stay, worked out the same way as the backend (services/booking.service.js):
 * base fee (rate × nights) + convenience fee with GST at the suite's rate, and each add-on with its own GST.
 * The backend's figure on the confirmed booking is the one that counts.
 */
export function priceStay(pricing, suite, nights, addons = []) {
  const p = pricing || {};
  const roomTotal = suite && nights > 0 ? round2(nights * suite.price) : 0;
  const addonTotal = round2(addons.reduce((t, a) => t + (a.price || 0), 0));
  const convenienceFee = !roomTotal
    ? 0
    : round2(p.convenienceFeeType === "percent" ? (roomTotal * (p.convenienceFee || 0)) / 100 : p.convenienceFee || 0);
  const taxRate = suite?.taxRate ?? p.taxRate ?? 0;
  const stayTaxAmount = round2(((roomTotal + convenienceFee) * taxRate) / 100);
  const addonTaxAmount = round2(addons.reduce((t, a) => t + ((a.price || 0) * addonTax(p, a)) / 100, 0));
  const addonTaxRates = [...new Set(addons.filter((a) => a.price).map((a) => addonTax(p, a)))];
  const taxAmount = round2(stayTaxAmount + addonTaxAmount);
  return {
    roomTotal, addonTotal, convenienceFee, taxRate, stayTaxAmount, addonTaxAmount, addonTaxRates, taxAmount,
    total: round2(roomTotal + addonTotal + convenienceFee + taxAmount),
  };
}
// GST % for a suite: its own rate, else the default
export const suiteTax = (pricing, suite) => suite?.taxRate ?? pricing?.taxRate ?? 0;
export const taxNote = (pricing, suite) => (suiteTax(pricing, suite) > 0 ? `+ ${suiteTax(pricing, suite)}% GST` : "");

export const findAddon = (content, id) => content.addons.find((a) => a.id === id);
// Media: uploaded/linked videos (.mp4 .webm .mov) and YouTube links, anywhere a photo can go
export const youtubeId = (src) => /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/.exec(src || "")?.[1] || null;
export const isVideo = (src) => /\.(mp4|webm|mov)(\?|#|$)/i.test(src || "") || !!youtubeId(src);

// The property a suite is at
export const findLocation = (content, id) => content.locations.find((l) => l.id === id) || content.locations[0];
export const mapEmbed = (loc) => `https://www.google.com/maps?q=${encodeURIComponent(loc?.mapQuery || loc?.address?.join(", ") || "")}&output=embed`;
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
    pricing: { taxRate: 0, addonTaxRate: 18, convenienceFee: 0, convenienceFeeType: "fixed", ...c.pricing },
    locations: c.locations?.length ? c.locations : [{ id: "banashankari", name: "Banashankari 6th Stage", address: c.contact?.address || [], mapUrl: c.contact?.mapUrl || "" }],
    suites: (c.suites || []).map((s) => ({
      features: [],
      amenities: [],
      ...s,
      location: s.location || c.locations?.[0]?.id || "banashankari",
      gallery: s.gallery?.length ? s.gallery : [s.img],
    })),
    addons: c.addons || [],
    gallery: c.gallery || [],
    stories: c.stories || [],
  };
}
