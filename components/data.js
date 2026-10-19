// Built-in copy of the website content.
// The live content is managed in the admin panel and served by the CasaSaga API
// (see lib/content.js) — this copy is only used when the API cannot be reached,
// and to seed the database (casasaga-adminpanel/backend: npm run seed).

export const nav = [
  { label: "Suites", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const contact = {
  address: ["Casasaga 1613, 2nd Block", "Banashankari 6th Stage", "Bangalore 560061, Karnataka"],
  phone: "+91 74065 65065",
  tel: "+917406565065",
  whatsapp: "917406565065",
  instagram: "https://www.instagram.com/casasaga_official/",
  mapUrl: "https://maps.google.com/?cid=4137288655807854482",
};

// The two properties; each suite's `location` is one of these ids
export const locations = [
  {
    id: "banashankari",
    name: "Banashankari 6th Stage",
    address: ["Casasaga 1613, 2nd Block", "Banashankari 6th Stage", "Bangalore 560061, Karnataka"],
    mapUrl: "https://maps.google.com/?cid=4137288655807854482",
    mapQuery: "12.88972,77.512352",
  },
  {
    id: "jp-nagar",
    name: "JP Nagar 7th Phase",
    address: ["JP Nagar 7th Phase", "Bangalore, Karnataka"],
    mapUrl: "https://maps.app.goo.gl/3334obPGcP4PHHQw5",
    mapQuery: "12.8940229,77.5784378",
  },
  {
    id: "banashankari-5th-stage",
    name: "Banashankari 5th Stage",
    address: ["Banashankari 5th Stage", "Bangalore, Karnataka"],
    mapUrl: "https://www.google.com/maps?q=12.900843620300293,77.53178405761719&z=17&hl=en",
    mapQuery: "12.900843620300293,77.53178405761719",
  },
];

// Instagram reels shown on the home page
export const reels = [
  "https://www.instagram.com/reel/DN8IoH5DyfE/",
  "https://www.instagram.com/reel/DQT8cGEkt7e/",
  "https://www.instagram.com/reel/DN7PRaiiYL-/",
  "https://www.instagram.com/reel/DbMmBdPM5uR/",
];

export const policies = [
  { label: "Check-in", value: "From 2:00 PM" },
  { label: "Check-out", value: "Until 11:00 AM" },
  { label: "Cancellation", value: "Free up to 7 days before check-in" },
  { label: "Pets", value: "Not permitted" },
  { label: "Smoking", value: "Not allowed indoors — ₹2,000 fine" },
];

// Cancellation & Refund Policy page (managed in the admin panel: Contact & policies)
export const refundPolicy = [
  {
    title: "Free Cancellation",
    text: "Cancellations made at least 7 days before check-in are eligible for a full refund of the amount paid.",
  },
  {
    title: "Late Cancellation",
    text: "Cancellations made less than 7 days before check-in may incur a cancellation fee equal to the total booking amount.",
  },
  {
    title: "No-Show Policy",
    text: "If a guest fails to arrive on the scheduled check-in date without prior cancellation, the booking amount is non-refundable.",
  },
  {
    title: "Refund Processing",
    text: "Eligible refunds will be processed within 7–10 business days, depending on the payment method and bank processing times.",
  },
  {
    title: "Booking Modifications",
    text: "Changes to booking dates or room types are subject to availability and may result in additional charges.",
  },
];


// House Rules page (managed in the admin panel: Contact & policies)
export const houseRules = [
  {
    title: "No Smoking Indoors",
    text: "Smoking is strictly prohibited inside the room. Please use the balcony for smoking. A ₹2,000 fine will apply for smoking inside the room.",
  },
  {
    title: "No Extra Guests or Visitors",
    text: "Only guests included in the confirmed booking are permitted. Outside visitors and unregistered guests are not allowed.",
  },
  {
    title: "No Loud Music",
    text: "Please keep the noise to a minimum and respect the peace and privacy of others.",
  },
  {
    title: "No Decorations on Walls",
    text: "Sticking, taping, or hanging decorations on walls is strictly prohibited. Please do not damage the walls or interiors.",
  },
  {
    title: "Damage Policy",
    text: "Guests will be held responsible for any damage to the property's furniture, fixtures, furnishings, or other items. Applicable repair or replacement charges will be levied.",
  },
  {
    title: "Respect the Property",
    text: "Please treat the property with care and leave it in good condition.",
  },
];

export const occasions = [
  "Romantic Getaway",
  "Anniversary",
  "Honeymoon",
  "Birthday Celebration",
  "Just Because",
  "Other",
];

const g = (slug, names) => names.map((n) => `/images/${slug}-${n}.jpg`);

export const suites = [
  {
    id: "tulum",
    name: "Tulum",
    mood: "Boho Chic",
    tag: "Signature Suite",
    price: 12499,
    img: "/images/tulum.jpg",
    accent: "#c98b5e",
    size: "65 sq. m.",
    guests: "2 guests",
    blurb:
      "Rattan, linen and warm earth tones wrapped around a sunken private jacuzzi — a slow, sun-drenched escape without leaving the city.",
    story:
      "Inspired by the jungle hideaways of the Mexican coast, Tulum is all texture and warmth. Sculptural lighting throws soft shadows across woven surfaces, a plush lounge invites long conversations, and the sunken jacuzzi sits at the heart of it all — waiting for the two of you.",
    features: ["Sunken private jacuzzi", "Smart TV", "Walk-in wardrobe"],
    amenities: [
      "Private sunken jacuzzi",
      "Netflix-ready smart TV",
      "Walk-in wardrobe",
      "Sculptural ambient lighting",
      "Plush lounge area",
      "Rainfall shower",
      "Complimentary welcome amenity",
      "Late checkout on request",
    ],
    gallery: g("tulum", ["jacuzzi-1", "lounge-1", "bedroom-1", "jacuzzi-2", "lounge-2", "bedroom-2"]),
  },
  {
    id: "riviera",
    name: "Riviera",
    mood: "Mediterranean Serenity",
    tag: "New Suite",
    price: 12499,
    img: "/images/riviera.jpg",
    accent: "#6f9fb8",
    blurb:
      "Whitewashed walls and coastal calm, centred on a sunken jacuzzi for two. Breezy, bright and quietly indulgent.",
    story:
      "Riviera borrows the easy light of a seaside villa. Organic, sculpted ceilings curve overhead, whitewashed walls keep everything airy, and gold pebble accents glint around a private sunken jacuzzi. A relaxed lounge completes the feeling of a long summer afternoon.",
    features: ["Sunken private jacuzzi", "Whitewashed interiors", "Sculpted ceilings"],
    amenities: [
      "Private sunken jacuzzi with gold pebble accents",
      "Whitewashed walls",
      "Organic sculpted ceilings",
      "Lounge area",
    ],
    gallery: g("riviera", ["jacuzzi-1", "lounge-1", "bedroom-1", "jacuzzi-2", "lounge-2", "bedroom-2"]),
  },
  {
    id: "sakura",
    name: "Sakura",
    mood: "Blush & Bloom",
    tag: "New Suite",
    price: 12499,
    img: "/images/sakura.jpg",
    accent: "#e2a3b4",
    blurb:
      "Soft blush hues, gold pearl wall art and a circular sunken jacuzzi — a suite that feels like cherry blossom season.",
    story:
      "Sakura is tender and playful. Glowing niches are carved into an organic ceiling, gold pearls scatter across blush walls, and a circular sunken jacuzzi anchors the room. A blush wardrobe with a wavy mirror and a striped lounge add a little whimsy.",
    features: ["Circular sunken jacuzzi", "Gold pearl wall art", "Blush-pink theme"],
    amenities: [
      "Circular sunken jacuzzi",
      "Gold pearl wall art",
      "Glowing organic ceiling niches",
      "Blush wardrobe with wavy mirror",
      "Striped lounge",
    ],
    gallery: g("sakura", ["jacuzzi-1", "lounge-1", "bedroom-1", "wardrobe-1", "jacuzzi-2", "lounge-2", "bedroom-2", "wardrobe-2"]),
  },
  {
    id: "santorini",
    name: "Santorini",
    mood: "Aegean Grandeur",
    tag: "Premium Suite",
    price: 14999,
    img: "/images/santorini.jpg",
    accent: "#d8b56a",
    blurb:
      "Our most dramatic space: a private indoor plunge pool beneath open skylights. Starlight above, still water below.",
    story:
      "Santorini is our grandest suite. Glowing oval skylights pour light onto a private indoor plunge pool, a white lion sculpture keeps watch, and gold accents frame the wardrobe alcove. Striped platform beds make it easy to linger long after the swim.",
    features: ["Private indoor plunge pool", "Oval skylights", "Premium suite"],
    amenities: [
      "Private indoor plunge pool",
      "Glowing oval skylights",
      "White lion sculpture",
      "Gold-accented wardrobe alcove",
      "Striped platform beds",
    ],
    gallery: g("santorini", ["pool-1", "lounge-1", "bedroom-1", "wardrobe-1", "pool-2", "lounge-2", "bedroom-2"]),
  },
];


// In-house decoration add-ons. `price: null` shows "Price on request".
export const addons = [
  {
    id: "birthday",
    no: "01",
    title: "Birthday Decor",
    occasion: "Birthday Celebration",
    text: "Balloons, banners and a little sparkle waiting in your suite — the surprise starts the moment the door opens.",
    img: "/images/cta.jpg",
    price: null,
  },
  {
    id: "anniversary",
    no: "02",
    title: "Anniversary Decor",
    occasion: "Anniversary",
    text: "Rose petals, soft lights and a setup styled around the two of you — another year together, celebrated properly.",
    img: "/images/tulum-jacuzzi-1.jpg",
    price: null,
  },
  {
    id: "honeymoon",
    no: "03",
    title: "Honeymoon Decor",
    occasion: "Honeymoon",
    text: "A romantic room makeover for newlyweds, from the bed to the jacuzzi, ready before you check in.",
    img: "/images/sakura-jacuzzi-1.jpg",
    price: null,
  },
  {
    id: "proposal",
    no: "04",
    title: "Proposal & Surprises",
    occasion: "Romantic Getaway",
    text: "Planning to pop the question or surprise someone special? Share the idea and we'll decorate the suite to match.",
    img: "/images/santorini-pool-2.jpg",
    price: null,
  },
];


// Guest reviews shown on the home page.
export const stories = [
  {
    names: "Priya & Arjun",
    occasion: "Anniversary",
    quote: "Every little detail felt curated for us. It was the anniversary we'll keep talking about.",
  },
  {
    names: "Meera & Karthik",
    occasion: "Honeymoon",
    quote: "The suite was breathtaking and the service made us feel like the only guests in the house.",
  },
  {
    names: "Divya & Rahul",
    occasion: "Romantic Getaway",
    quote: "Thoughtful touches everywhere, and a team whose warmth made the weekend unforgettable.",
  },
];

export const values = [
  { title: "Romance first", text: "Every decision is measured against one question: does it make the stay more romantic?" },
  { title: "Obsessive detail", text: "From the thread count of the linen to the temperature of the welcome drink, nothing is left to chance." },
  { title: "Absolute privacy", text: "Discretion is a promise. Your evening belongs to the two of you." },
  { title: "Bespoke moments", text: "Every stay is shaped around you — your occasion, your pace, your preferences." },
];

export const galleryCategories = ["All", "Suites", "Spaces", "Romantic Setups"];

export const gallery = [
  { src: "/images/santorini-pool-1.jpg", cat: "Suites", alt: "Santorini Suite plunge pool" },
  { src: "/images/tulum-jacuzzi-1.jpg", cat: "Romantic Setups", alt: "Tulum Suite jacuzzi" },
  { src: "/images/gallery-hero.jpg", cat: "Spaces", alt: "CasaSaga interior" },
  { src: "/images/sakura-jacuzzi-1.jpg", cat: "Suites", alt: "Sakura Suite circular jacuzzi" },
  { src: "/images/riviera-lounge-1.jpg", cat: "Suites", alt: "Riviera Suite lounge" },
  { src: "/images/tulum-lounge-1.jpg", cat: "Suites", alt: "Tulum Suite lounge" },
  { src: "/images/sakura-wardrobe-1.jpg", cat: "Spaces", alt: "Sakura Suite wardrobe" },
  { src: "/images/riviera-jacuzzi-1.jpg", cat: "Romantic Setups", alt: "Riviera Suite jacuzzi" },
  { src: "/images/santorini-bedroom-1.jpg", cat: "Suites", alt: "Santorini Suite bedroom" },
  { src: "/images/about-hero.jpg", cat: "Spaces", alt: "CasaSaga hideaway" },
  { src: "/images/sakura-lounge-1.jpg", cat: "Suites", alt: "Sakura Suite lounge" },
  { src: "/images/santorini-pool-2.jpg", cat: "Romantic Setups", alt: "Santorini plunge pool at night" },
  { src: "/images/tulum-bedroom-1.jpg", cat: "Suites", alt: "Tulum Suite bedroom" },
  { src: "/images/riviera-bedroom-1.jpg", cat: "Suites", alt: "Riviera Suite bedroom" },
];

