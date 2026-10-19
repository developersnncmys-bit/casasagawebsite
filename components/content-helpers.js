// Helpers that work on the live content (from the CasaSaga API) on both server and client
import { houseRules as defaultHouseRules, refundPolicy as defaultRefundPolicy } from "./data";

export const formatINR = (n) => (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
// GST % on an add-on: its own rate, else the add-on default
export const addonTax = (pricing, a) => a?.taxRate ?? pricing?.addonTaxRate ?? 0;
export const addonPrice = (a, pricing) =>
  a.price ? `₹${formatINR(a.price)}${pricing && addonTax(pricing, a) > 0 ? ` + ${addonTax(pricing, a)}% GST` : ""}` : "Price on request";

export const findSuite = (content, id) => content.suites.find((s) => s.id === id);

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * The bill for a stay, worked out the same way as the backend (services/booking.service.js):
 * base fee (rate × nights) with GST at the suite's rate, each add-on with its own GST,
 * then the convenience fee (online bookings) on that total — not taxed.
 * The backend's figure on the confirmed booking is the one that counts.
 */
// Guests: the suite's price covers `included`; each guest beyond pays `extraPrice` a night, up to `max`
export const guestRules = (suite) => ({
  included: suite?.includedGuests || 2,
  max: suite?.maxGuests || 4,
  extraPrice: suite?.extraGuestPrice || 0,
});
// The most guests any of these suites takes (for a guests dropdown)
export const maxGuestsOf = (suites) => Math.max(1, ...suites.map((s) => guestRules(s).max));

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * A suite's offer while it runs: % off or ₹ off per night on the base fee. `checkIn` (or today)
 * must be on or before discountUntil. Returns null when there's no offer.
 */
export function suiteOffer(suite, checkIn) {
  const value = Number(suite?.discountValue) || 0;
  if (!value || (suite.discountUntil && (checkIn || todayISO()) > suite.discountUntil)) return null;
  const flat = suite.discountType === "flat";
  const text = flat ? `₹${formatINR(value)} off per night` : `${value}% off`;
  return {
    flat,
    value,
    label: suite.discountLabel || "",
    text,
    note: suite.discountLabel ? `${suite.discountLabel} · ${text}` : text,
    until: suite.discountUntil || "",
    // The nightly price after the offer
    nightly: Math.max(0, round2(flat ? suite.price - value : suite.price * (1 - Math.min(value, 100) / 100))),
  };
}

// Same sums as the API (casasaga-adminpanel/backend/src/services/booking.service.js)
export function priceStay(pricing, suite, nights, addons = [], guests = 2, checkIn) {
  const p = pricing || {};
  const roomTotal = suite && nights > 0 ? round2(nights * suite.price) : 0;
  const rules = guestRules(suite);
  const extraGuests = suite ? Math.max(Number(guests) - rules.included, 0) : 0;
  const extraGuestTotal = nights > 0 ? round2(nights * extraGuests * rules.extraPrice) : 0;
  const addonTotal = round2(addons.reduce((t, a) => t + (a.price || 0), 0));
  const taxRate = suite?.taxRate ?? p.taxRate ?? 0;
  // The suite's offer comes off the base fee, before GST
  const offer = suite && nights > 0 ? suiteOffer(suite, checkIn) : null;
  const discount = offer ? round2(Math.min(roomTotal, offer.flat ? offer.value * nights : (roomTotal * Math.min(offer.value, 100)) / 100)) : 0;
  const stayTaxAmount = round2((Math.max(roomTotal + extraGuestTotal - discount, 0) * taxRate) / 100);
  const addonTaxAmount = round2(addons.reduce((t, a) => t + ((a.price || 0) * addonTax(p, a)) / 100, 0));
  const addonTaxRates = [...new Set(addons.filter((a) => a.price).map((a) => addonTax(p, a)))];
  const taxAmount = round2(stayTaxAmount + addonTaxAmount);
  const subtotal = round2(Math.max(roomTotal + extraGuestTotal - discount, 0) + addonTotal + taxAmount);
  const convenienceFee = !roomTotal
    ? 0
    : round2(p.convenienceFeeType === "percent" ? (subtotal * (p.convenienceFee || 0)) / 100 : p.convenienceFee || 0);
  const feeLabel = p.convenienceFeeType === "percent" ? `Convenience fee (${p.convenienceFee}%)` : "Convenience fee";
  return {
    roomTotal, discount, discountNote: discount > 0 ? offer.note : "", extraGuests, extraGuestRate: rules.extraPrice, extraGuestTotal, addonTotal, taxRate, stayTaxAmount, addonTaxAmount, addonTaxRates, taxAmount, subtotal, convenienceFee, feeLabel,
    total: round2(subtotal + convenienceFee),
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
    reels: c.reels || [],
    occasions: c.occasions?.length ? c.occasions : ["Romantic Getaway", "Other"],
    values: c.values || [],
    refundPolicy: c.refundPolicy?.length ? c.refundPolicy : defaultRefundPolicy,
    houseRules: c.houseRules?.length ? c.houseRules : defaultHouseRules,
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

// A suite's name for display: "Tulum" → "Tulum Suite", but a name that already says what it is
// ("1 Bedroom Flat") is shown as it is. nameParts splits off the last word for the gold italic.
const ROOM_TYPE = /\s(Suite|Flat|Room|Villa|Apartment|Cottage|Studio|Penthouse)$/i;
export const nameParts = (name = "") => {
  const m = ROOM_TYPE.exec(name);
  return m ? [name.slice(0, m.index), m[1]] : [name, "Suite"];
};
export const fullName = (name) => nameParts(name).join(" ");
