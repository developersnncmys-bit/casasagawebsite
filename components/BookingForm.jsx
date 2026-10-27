"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { addonPrice, formatINR, fullName, guestRules, nameParts, maxGuestsOf, priceStay, suiteOffer, taxNote } from "./content-helpers";
import { useContent } from "./ContentProvider";
import { getSource, sendToBackend, useTakenSuites } from "./backend";
import PinIcon from "./PinIcon";
import { payWithRazorpay } from "./razorpay";
import DateInput from "./DateInput";
import { checkEmail, checkName, checkPhone, checkText, collect } from "./validate";

// Longest stay the website books (longer ones by phone)
const MAX_NIGHTS = 30;

// What each box accepts as you type: the mobile number keeps digits only (a pasted +91 / 0 is
// dropped, at most 10 digits); the name keeps letters, spaces and . ' -
const CLEAN = {
  phone: (v) => v.replace(/\D/g, "").replace(/^(91|0)(?=\d{10})/, "").slice(0, 10),
  name: (v) => v.replace(/[^\p{L}\p{M} .'-]/gu, "").replace(/\s{2,}/g, " ").slice(0, 80),
  email: (v) => v.replace(/\s/g, "").slice(0, 160),
};
const FIELD_CHECK = {
  name: (v) => checkName(v, "name"),
  phone: (v) => checkPhone(v),
  email: (v) => checkEmail(v, { required: true }) && "Please enter a valid email — we'll send your booking confirmation there.",
  notes: (v) => checkText(v, { max: 500, label: "special requests" }),
};

// Dates as YYYY-MM-DD in the visitor's own time (India), not UTC
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const dayAfter = (iso) => new Date(new Date(iso + "T00:00:00Z").getTime() + 86400000).toISOString().slice(0, 10);
const nightsBetween = (a, b) => (a && b && b > a ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0);
const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
// "14:00" → "2:00 PM"
const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const STEPS = ["Dates & guests", "Choose your suite", "Enhance your stay", "Your details"];

export default function BookingForm() {
  const { addons, contact, getAddon, getSuite, locations, occasions, onlinePayment, policies, pricing, suites } = useContent();
  const policy = (label) => policies.find((p) => p.label.toLowerCase() === label)?.value;
  // Check-in / check-out times set for the suite in the admin panel, else the general policy
  const timeIn = (s) => (s?.checkInTime ? `From ${fmtTime(s.checkInTime)}` : policy("check-in") || "");
  const timeOut = (s) => (s?.checkOutTime ? `By ${fmtTime(s.checkOutTime)}` : policy("check-out") || "");
  const p = useSearchParams();
  const startAddon = getAddon(p.get("addon"));
  const [form, setForm] = useState({
    suite: getSuite(p.get("suite")) ? p.get("suite") : "",
    in: p.get("in") || "",
    out: p.get("out") || "",
    guests: /^([1-9]|10)$/.test(p.get("guests") || "") ? p.get("guests") : "2",
    addons: startAddon ? [startAddon.id] : [],
    name: "",
    phone: "",
    email: "",
    occasion: startAddon ? startAddon.occasion : occasions[0],
    notes: "",
  });
  // Coming from the home-page date bar, the dates are already chosen — open on the suite step
  const datesGiven = nightsBetween(form.in, form.out) > 0;
  const [step, setStep] = useState(datesGiven ? 1 : 0);
  const [reached, setReached] = useState(datesGiven ? 1 : 0);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Online payment: the booking waiting to be paid, and how paying is going
  const [awaiting, setAwaiting] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [clash, setClash] = useState("");
  const [availKey, setAvailKey] = useState(0);
  const stepRefs = useRef([]);
  const first = useRef(true);

  const set = (k) => (e) => {
    const value = CLEAN[k] ? CLEAN[k](e.target.value) : e.target.value;
    // A check-in on or after the check-out clears the check-out, to be picked again
    setForm({ ...form, [k]: value, ...(k === "in" && form.out && form.out <= value ? { out: "" } : {}) });
    // A field already showing an error is re-checked as it's corrected
    setErrors({ ...errors, [k]: errors[k] && FIELD_CHECK[k] ? FIELD_CHECK[k](value) || undefined : undefined });
  };
  // Leaving a field shows its problem straight away
  const check = (k) => () => FIELD_CHECK[k] && setErrors((er) => ({ ...er, [k]: FIELD_CHECK[k](form[k]) || undefined }));
  const nights = nightsBetween(form.in, form.out);
  // Suites already booked for these dates aren't offered
  const { loading: checking, taken, free: roomsLeft } = useTakenSuites(nights > 0 ? form.in : "", nights > 0 ? form.out : "", availKey);
  // Which property's suites to show: from ?location=, else the suite the guest came from
  const [place, setPlace] = useState(() => {
    const wanted = p.get("location");
    if (locations.some((l) => l.id === wanted)) return wanted;
    return getSuite(p.get("suite"))?.location || "all";
  });
  const placeSuites = place === "all" ? suites : suites.filter((s) => s.location === place);
  const freeSuites = placeSuites.filter((s) => !taken.has(s.id));
  // Every suite keeps its usual place; booked ones show greyed out as sold out
  const listedSuites = placeSuites;
  const locationName = (id) => locations.find((l) => l.id === id)?.name;
  // A suite that takes fewer guests than chosen can't be picked (e.g. 3 at most at Banashankari 6th Stage)
  const tooMany = (s) => Number(form.guests) > guestRules(s).max;
  const maxGuests = maxGuestsOf(placeSuites.length ? placeSuites : suites);
  const suite = taken.has(form.suite) || tooMany(getSuite(form.suite)) ? undefined : getSuite(form.suite);
  // Add-ons are offered only at their locations (decorations: Banashankari 6th Stage); one picked
  // earlier (e.g. from the home page) drops out of the bill while the chosen suite is elsewhere
  const offeredAt = (a, s) => !a.locations?.length || (!!s && a.locations.includes(s.location));
  const offeredAddons = addons.filter((a) => offeredAt(a, suite));
  const addonPlaces = [...new Set(addons.flatMap((a) => a.locations || []))].map(locationName).filter(Boolean).join(" and ");
  const chosenAddons = form.addons.map(getAddon).filter((a) => a && (!suite || offeredAt(a, suite)));
  const unpricedAddons = chosenAddons.some((a) => !a.price);
  // Decor and occasion requests are taken only where add-ons are offered (Banashankari 6th Stage):
  // elsewhere the "Enhance your stay" step and the occasion / special requests boxes are left out
  const hasExtras = (s) => !s || addons.some((a) => offeredAt(a, s));
  const extras = hasExtras(suite);
  const shownSteps = STEPS.map((title, i) => ({ title, i })).filter((s) => s.i !== 2 || extras);
  // Base fee + add-ons + convenience fee + GST, calculated automatically
  const bill = priceStay(pricing, suite, nights, chosenAddons, form.guests, form.in);
  const total = bill.total;

  useEffect(() => {
    if (form.suite && (taken.has(form.suite) || tooMany(getSuite(form.suite)))) setForm((f) => ({ ...f, suite: "" }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taken, form.suite, form.guests]);

  // The confirmation (or payment step) replaces the form — show it from the top of the page
  useEffect(() => {
    if (done || awaiting) window.scrollTo({ top: 0, behavior: "instant" });
  }, [done, awaiting]);

  // Choosing a location brings the guests down to the most its suites take
  useEffect(() => {
    if (Number(form.guests) > maxGuests) setForm((f) => ({ ...f, guests: String(maxGuests) }));
  }, [maxGuests, form.guests]);

  // Bring the newly opened step into view
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Wait until the previous step has closed, so the position is measured on the final
    // layout — measuring earlier (with the long suite list still open) overshot to the footer
    const t = setTimeout(() => {
      const el = stepRefs.current[step];
      if (!el) return;
      if (window.__lenis) {
        window.__lenis.resize(); // the page just got shorter
        window.__lenis.scrollTo(el, { offset: -110 });
      } else el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(t);
  }, [step]);

  const goTo = (i) => {
    setStep(i);
    setReached((r) => Math.max(r, i));
  };

  const validate = (i) => {
    let err = {};
    if (i === 0) {
      if (!form.in) err.in = "Choose a check-in date.";
      else if (form.in < today()) err.in = "Check-in can't be in the past.";
      if (!form.out) err.out = "Choose a check-out date.";
      else if (form.in && nights < 1) err.out = "Check-out must be after check-in.";
      else if (nights > MAX_NIGHTS) err.out = `Online bookings are up to ${MAX_NIGHTS} nights — call us for longer stays.`;
    }
    if (i === 3) {
      err = collect({
        name: FIELD_CHECK.name(form.name),
        phone: FIELD_CHECK.phone(form.phone),
        // Required: the booking confirmation is emailed
        email: FIELD_CHECK.email(form.email),
        notes: FIELD_CHECK.notes(form.notes),
      });
    }
    setErrors(err);
    return !Object.keys(err).length;
  };

  const next = (i) => validate(i) && goTo(i + 1);

  const chooseSuite = (id) => {
    setClash("");
    setForm({ ...form, suite: id });
    goTo(hasExtras(getSuite(id)) ? 2 : 3);
  };

  const toggleAddon = (a) => {
    const on = form.addons.includes(a.id);
    const list = on ? form.addons.filter((x) => x !== a.id) : [...form.addons, a.id];
    // Picking a decoration also fills in the occasion, unless the guest already chose one
    const occasion = !on && form.occasion === occasions[0] ? a.occasion : form.occasion;
    setForm({ ...form, addons: list, occasion });
  };

  const summaries = [
    nights ? `${fmtShort(form.in)} → ${fmtShort(form.out)} · ${plural(nights, "night")} · ${plural(+form.guests, "guest")}` : "",
    suite ? `${fullName(suite.name)} · ₹${formatINR(suite.price)}/night` : "",
    chosenAddons.length ? chosenAddons.map((a) => a.title).join(", ") : "No add-ons",
    "",
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    // Enter key on an earlier step just moves forward
    if (step === 0) return next(0);
    if (step === 2) return goTo(3);
    if (step !== 3) return;
    if (nights < 1) return setStep(0);
    if (!suite) return setStep(1);
    if (!validate(3)) return;

    setSending(true);
    setSubmitError("");
    // The booking is confirmed straight away and appears in the admin panel
    const res = await sendToBackend("bookings", {
      suite: suite.id,
      checkIn: form.in,
      checkOut: form.out,
      guests: Number(form.guests),
      addons: chosenAddons.map((a) => a.id),
      name: form.name,
      phone: form.phone,
      email: form.email,
      occasion: extras ? form.occasion : "",
      notes: extras ? form.notes : "",
      // Instagram, Facebook, Google… — shown as the booking's source in the admin panel
      source: getSource(),
    });
    setSending(false);
    if (res.status === 409) {
      // Someone else took the last room while the guest was filling in the form
      setClash(`Sorry — the ${fullName(suite.name)} was just booked for these dates. Please choose another suite.`);
      setForm((f) => ({ ...f, suite: "" }));
      setAvailKey((k) => k + 1);
      return goTo(1);
    }
    if (!res.ok) {
      return setSubmitError(
        res.status === 0
          ? `We couldn't reach our booking system. Please try again, or call us on ${contact.phone}.`
          : res.message || `Something went wrong. Please try again, or call us on ${contact.phone}.`,
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Online payment: the room is held while the guest pays in Razorpay Checkout
    if (res.data.payment) {
      setAwaiting(res.data);
      return pay(res.data);
    }
    setDone(res.data);
  };

  const pay = async (booking) => {
    setPaying(true);
    setPayError("");
    const result = await payWithRazorpay(booking.payment, {
      description: `${fullName(booking.suiteName)} · ${plural(booking.nights, "night")} · ${booking.ref}`,
      onFailedAttempt: (why) => setPayError(why ? `Payment didn't go through: ${why}` : "Payment didn't go through."),
    });
    if (!result.paid) {
      setPaying(false);
      if (result.reason === "unavailable") setPayError("We couldn't open the payment window. Check your internet connection and try again.");
      return;
    }
    // Razorpay took the money — the API checks the reply is genuine and confirms the stay
    const res = await sendToBackend(`bookings/${booking.ref}/pay`, result.response, { timeout: 20000 });
    setPaying(false);
    if (!res.ok) {
      return setPayError(
        res.message ||
          `Your payment went through but we couldn't confirm it yet. Please don't pay again — call us on ${contact.phone} with booking ${booking.ref}.`,
      );
    }
    setAwaiting(null);
    setDone(res.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const err = (k) => errors[k] && <em className="field-error">{errors[k]}</em>;

  if (awaiting && !done) {
    const holdUntil = awaiting.payment?.holdUntil ? new Date(awaiting.payment.holdUntil) : null;
    // What Checkout charges — the total (₹1 for a test booking)
    const toPay = awaiting.payment?.amount ? awaiting.payment.amount / 100 : awaiting.total;
    return (
      <motion.div className="form-success booking-done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">Booking {awaiting.ref}</p>
        <h3>One last step — payment</h3>
        <p className="muted">
          Your {fullName(awaiting.suiteName)} is held for you
          {holdUntil ? ` until ${holdUntil.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}. Pay now to confirm
          your stay.
        </p>
        <dl className="done-summary">
          <div><dt>Check-in</dt><dd>{fmtDate(awaiting.checkIn)}{timeIn(getSuite(form.suite)) ? ` · ${timeIn(getSuite(form.suite))}` : ""}</dd></div>
          <div><dt>Check-out</dt><dd>{fmtDate(awaiting.checkOut)}{timeOut(getSuite(form.suite)) ? ` · ${timeOut(getSuite(form.suite))}` : ""}</dd></div>
          <div><dt>Guests</dt><dd>{awaiting.guests} · {plural(awaiting.nights, "night")}</dd></div>
          {toPay !== awaiting.total && <div><dt>Total</dt><dd>₹{formatINR(awaiting.total)}</dd></div>}
          <div className="done-total"><dt>{toPay !== awaiting.total ? "To pay now (test)" : "To pay"}</dt><dd>₹{formatINR(toPay)}</dd></div>
        </dl>
        {payError && <p className="avail-note warn" role="alert">{payError}</p>}
        <div className="suite-actions">
          <button type="button" className="btn btn-gold" onClick={() => pay(awaiting)} disabled={paying}>
            {paying ? "Waiting for payment…" : `Pay ₹${formatINR(toPay)}`}
          </button>
          <a href={`tel:${contact.tel}`} className="link-line">Need help? {contact.phone}</a>
        </div>
        <p className="muted small-note">Secure payment by Razorpay — UPI, cards, net banking and wallets.</p>
      </motion.div>
    );
  }

  if (done) {
    return (
      <motion.div className="form-success booking-done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <motion.span
          className="done-check"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </motion.span>
        <p className="done-status">✓ Booking confirmed{done.paymentStatus === "paid" ? " · Paid" : ""}</p>
        <h3>You&apos;re booked, {form.name.split(" ")[0]}!</h3>
        <p className="muted">
          {done.paymentStatus === "paid" ? "We've received your payment and your stay is confirmed." : "Your stay is confirmed."} We can&apos;t
          wait to welcome you.
        </p>
        <div className="done-ref">
          <span>Booking reference</span>
          <strong>{done.ref}</strong>
          <small>Please keep it handy for check-in</small>
        </div>
        {form.email && <p className="muted done-mailed">✉ We&apos;ve emailed your confirmation to <strong>{form.email}</strong></p>}
        <dl className="done-summary">
          <div><dt>{/Flat$/i.test(fullName(done.suiteName || suite?.name)) ? "Stay" : "Suite"}</dt><dd>{fullName(done.suiteName || suite?.name)}</dd></div>
          {suite && locationName(suite.location) && <div><dt>Location</dt><dd>{locationName(suite.location)}</dd></div>}
          <div><dt>Check-in</dt><dd>{fmtDate(done.checkIn)}{timeIn(getSuite(form.suite)) ? ` · ${timeIn(getSuite(form.suite))}` : ""}</dd></div>
          <div><dt>Check-out</dt><dd>{fmtDate(done.checkOut)}{timeOut(getSuite(form.suite)) ? ` · ${timeOut(getSuite(form.suite))}` : ""}</dd></div>
          <div><dt>Guests</dt><dd>{done.guests} · {plural(done.nights, "night")}</dd></div>
          {done.addonItems?.length > 0 && (
            <div><dt>Add-ons</dt><dd>{done.addonItems.map((a) => a.title).join(", ")}</dd></div>
          )}
          <div><dt>Base fee</dt><dd>₹{formatINR(done.roomTotal)}</dd></div>
          {done.extraGuestTotal > 0 && <div><dt>Extra guest{done.extraGuests > 1 ? `s (${done.extraGuests})` : ""}</dt><dd>₹{formatINR(done.extraGuestTotal)}</dd></div>}
          {done.discount > 0 && <div className="dl-discount"><dt>Discount{done.discountNote ? ` · ${done.discountNote}` : ""}</dt><dd>− ₹{formatINR(done.discount)}</dd></div>}
          {done.addonTotal > 0 && <div><dt>Add-ons</dt><dd>₹{formatINR(done.addonTotal)}</dd></div>}
          {done.taxAmount - (done.addonTaxAmount || 0) > 0 && (
            <div><dt>GST on stay ({done.taxRate}%)</dt><dd>₹{formatINR(done.taxAmount - (done.addonTaxAmount || 0))}</dd></div>
          )}
          {done.addonTaxAmount > 0 && <div><dt>GST on add-ons</dt><dd>₹{formatINR(done.addonTaxAmount)}</dd></div>}
          {done.convenienceFee > 0 && (
            <div><dt>{pricing.convenienceFeeType === "percent" ? `Convenience fee (${pricing.convenienceFee}%)` : "Convenience fee"}</dt><dd>₹{formatINR(done.convenienceFee)}</dd></div>
          )}
          <div className="done-total"><dt>Total</dt><dd>₹{formatINR(done.total)}</dd></div>
          {done.paymentStatus === "paid" && <div><dt>Paid online</dt><dd>₹{formatINR(done.amountPaid)} ✓</dd></div>}
        </dl>
        <p className="muted small-note">
          {done.addonItems?.some((a) => a.price == null) && "Our team will call you to agree the decoration price. "}
          Questions? Call us on {contact.phone}.
        </p>
        <div className="suite-actions">
          <a href={`tel:${contact.tel}`} className="btn btn-gold">Call {contact.phone}</a>
          <a href="/" className="link-line">Back to home</a>
        </div>
      </motion.div>
    );
  }

  const content = [
    // 1 — dates & guests
    <>
      <div className="form-row three">
        <label className={`field ${errors.in ? "has-error" : ""}`}>
          <span>Check-in *</span>
          <DateInput min={today()} value={form.in} onChange={set("in")} />
          {err("in")}
        </label>
        <label className={`field ${errors.out ? "has-error" : ""}`}>
          <span>Check-out *</span>
          <DateInput min={dayAfter(form.in || today())} value={form.out} onChange={set("out")} />
          {err("out")}
        </label>
        <label className="field">
          <span>Guests</span>
          <select value={form.guests} onChange={set("guests")}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{plural(n, "Guest")}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="step-actions">
        <button type="button" className="btn btn-gold" onClick={() => next(0)}>Check availability</button>
      </div>
    </>,

    // 2 — suites, one below the other
    <div className="room-pick">
      {locations.length > 1 && (
        <div className="loc-tabs loc-tabs-inline" role="tablist" aria-label="Location">
          <button type="button" role="tab" aria-selected={place === "all"} className={place === "all" ? "on" : ""} onClick={() => setPlace("all")}>
            All locations
          </button>
          {locations.map((l) => (
            <button type="button" role="tab" key={l.id} aria-selected={place === l.id} className={place === l.id ? "on" : ""} onClick={() => setPlace(l.id)}>
              {l.name} <span>{suites.filter((s) => s.location === l.id).length}</span>
            </button>
          ))}
        </div>
      )}
      {!checking && placeSuites.length === 0 && <p className="avail-note">Suites at this location are coming soon.</p>}
      {clash && <p className="avail-note warn">{clash}</p>}
      {checking && <p className="avail-note">Checking availability for your dates…</p>}
      {!checking && nights > 0 && placeSuites.length > 0 && freeSuites.length === 0 && (
        <div className="avail-note warn">
          Every suite is booked for these dates.{" "}
          <button type="button" className="link-line" onClick={() => goTo(0)}>Try other dates</button>
        </div>
      )}
      {!checking && nights > 0 && taken.size > 0 && freeSuites.length > 0 && (
        <p className="avail-note">
          {freeSuites.length} of {placeSuites.length} suites are free for your dates — {placeSuites.length - freeSuites.length} sold out.
        </p>
      )}
      {(checking ? [] : listedSuites).map((s) => {
        const soldOut = nights > 0 && taken.has(s.id);
        const full = tooMany(s); // takes fewer guests than chosen
        const rules = guestRules(s);
        const stay = priceStay(pricing, s, nights, [], form.guests, form.in);
        const offer = suiteOffer(s, form.in);
        const on = !soldOut && form.suite === s.id;
        return (
          <article
            key={s.id}
            className={`rp ${on ? "on" : ""} ${soldOut ? "sold-out" : ""}`}
            style={{ "--accent": s.accent }}
            aria-disabled={soldOut || undefined}
          >
            <div className="rp-img">
              <img src={s.img} alt={`${fullName(s.name)}`} />
              {on && <span className="rp-badge">Selected</span>}
              {soldOut && <span className="rp-sold">Sold out</span>}
            </div>
            <div className="rp-body">
              <p className="suite-mood">{fullName(s.name)}{s.mood ? ` · ${s.mood}` : ""}</p>
              <h4>{nameParts(s.name)[0]} <em>{nameParts(s.name)[1]}</em></h4>
              <p className="loc-pill"><PinIcon /> {locationName(s.location)}</p>
              <p className="muted rp-blurb">{s.blurb}</p>
              <ul className="chip-list">
                {s.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a href={`/rooms/${s.id}`} target="_blank" rel="noopener" className="link-line rp-link">Photos & details</a>
            </div>
            <div className="rp-rate">
              {/* Nightly price for the guests chosen: the base fee covers the included guests, each extra guest adds their charge */}
              {(() => {
                const extra = full ? 0 : Math.max(Number(form.guests) - rules.included, 0);
                return (
                  <>
                    {offer && (
                      <>
                        <span className="offer-badge">{offer.label ? `${offer.label} · ` : ""}{offer.text}</span>
                        <s className="rp-was">₹{formatINR(s.price + extra * rules.extraPrice)}</s>
                      </>
                    )}
                    <strong>₹{formatINR((offer ? offer.nightly : s.price) + extra * rules.extraPrice)}</strong>
                    <small>per night{full ? "" : ` for ${plural(Number(form.guests), "guest")}`} {taxNote(pricing, s)}</small>
                    <small className="rp-guests">
                      {extra > 0 && rules.extraPrice > 0
                        ? `₹${formatINR(s.price)} for ${plural(rules.included, "guest")} + ₹${formatINR(extra * rules.extraPrice)} extra guest${extra > 1 ? `s (${extra})` : ""} · max ${rules.max}`
                        : `Up to ${plural(rules.included, "guest")}${rules.max > rules.included && rules.extraPrice > 0 ? ` · extra guest ₹${formatINR(rules.extraPrice)}/night` : ""} · max ${rules.max}`}
                    </small>
                  </>
                );
              })()}
              {!soldOut && nights > 0 && roomsLeft[s.id] > 0 && (
                <small className={`rp-left ${roomsLeft[s.id] <= 3 ? "low" : ""}`}>
                  {roomsLeft[s.id] <= 3
                    ? `Only ${roomsLeft[s.id]} room${roomsLeft[s.id] > 1 ? "s" : ""} left`
                    : `${roomsLeft[s.id]} rooms available`}
                </small>
              )}
              {soldOut ? (
                <small className="rp-total rp-sold-note">Fully booked for your dates — try other dates</small>
              ) : full ? (
                <small className="rp-total rp-sold-note">Takes up to {plural(rules.max, "guest")} — choose fewer guests</small>
              ) : (
                nights > 0 && (
                  <small className="rp-total">
                    ₹{formatINR(stay.total)} for {plural(nights, "night")}
                    {stay.extraGuests > 0 && `, ${plural(Number(form.guests), "guest")}`}
                    {stay.convenienceFee > 0 ? " incl. GST & fees" : stay.taxRate > 0 ? " incl. GST" : ""}
                  </small>
                )
              )}
              <button
                type="button"
                className={`btn ${on ? "btn-gold" : "btn-ghost"}`}
                onClick={() => !soldOut && !full && chooseSuite(s.id)}
                disabled={soldOut || full}
              >
                {soldOut ? "Sold out" : full ? `Max ${rules.max} guests` : on ? "Continue" : "Select"}
              </button>
            </div>
          </article>
        );
      })}
    </div>,

    // 3 — add-ons
    <>
      <p className="muted step-intro">
        {offeredAddons.length
          ? "Celebrating something? Our team decorates your suite in-house before you arrive. Optional — pick any you like."
          : `Decoration add-ons aren't offered for ${suite ? `the ${fullName(suite.name)}` : "this stay"}${addonPlaces ? ` — they're available at ${addonPlaces}` : ""}. Continue to your details.`}
      </p>
      <div className="addon-pick">
        {offeredAddons.map((a) => {
          const on = form.addons.includes(a.id);
          return (
            <button type="button" key={a.id} className={`ap ${on ? "on" : ""}`} onClick={() => toggleAddon(a)} aria-pressed={on}>
              <img src={a.img} alt="" />
              <span className="ap-body">
                <span className="ap-title">{a.title}</span>
                <span className="ap-text">{a.text}</span>
                <span className="ap-foot">
                  <span className="ap-price">{addonPrice(a, pricing)}</span>
                  <span className="ap-toggle">{on ? "✓ Added" : "+ Add"}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="step-actions">
        <button type="button" className="btn btn-gold" onClick={() => goTo(3)}>
          {form.addons.length ? "Continue" : "Skip & continue"}
        </button>
      </div>
    </>,

    // 4 — guest details
    <>
      <div className="form-row">
        <label className={`field ${errors.name ? "has-error" : ""}`}>
          <span>Full name *</span>
          <input value={form.name} onChange={set("name")} onBlur={check("name")} autoComplete="name" maxLength={80} />
          {err("name")}
        </label>
        <label className={`field ${errors.phone ? "has-error" : ""}`}>
          <span>Phone *</span>
          <input type="tel" inputMode="numeric" value={form.phone} onChange={set("phone")} onBlur={check("phone")} autoComplete="tel-national" placeholder="10-digit mobile number" />
          {err("phone")}
        </label>
      </div>
      <div className="form-row">
        <label className={`field ${errors.email ? "has-error" : ""}`}>
          <span>Email * <small className="field-note">— your confirmation is sent here</small></span>
          <input type="email" value={form.email} onChange={set("email")} onBlur={check("email")} autoComplete="email" maxLength={160} required />
          {err("email")}
        </label>
        {extras && (
          <label className="field">
            <span>Occasion</span>
            <select value={form.occasion} onChange={set("occasion")}>
              {occasions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      {extras && (
        <label className={`field ${errors.notes ? "has-error" : ""}`}>
          <span>Special requests</span>
          <textarea rows={4} value={form.notes} onChange={set("notes")} placeholder="Decoration theme or colours, cake message, arrival time…" maxLength={500} />
          {err("notes")}
        </label>
      )}
      {submitError && <p className="avail-note warn" role="alert">{submitError}</p>}
      <p className="muted form-note policy-agree">
        By confirming, you agree to our{" "}
        <Link href="/house-rules" target="_blank" className="link-line">house rules</Link> and{" "}
        <Link href="/cancellation-policy" target="_blank" className="link-line">cancellation &amp; refund policy</Link>.
      </p>
      <div className="step-actions">
        <button type="submit" className="btn btn-gold btn-lg" disabled={sending}>{sending ? "Confirming…" : onlinePayment ? "Confirm & Pay" : "Confirm Booking"}</button>
      </div>
    </>,
  ];

  return (
    <form className="booking-page" onSubmit={submit} noValidate>
      <div className="bp-main">
        <ol className="stepper" aria-label="Booking steps">
          {shownSteps.map(({ title: t, i }, n) => (
            <li key={t} className={i === step ? "now" : i < step || i <= reached ? "done" : ""}>
              <span>{n + 1}</span> {t}
            </li>
          ))}
        </ol>

        {shownSteps.map(({ title, i }, n) => {
          const open = i === step;
          const canOpen = !open && i <= reached && (i < 2 || suite);
          return (
            <section key={title} ref={(el) => (stepRefs.current[i] = el)} className={`bstep ${open ? "open" : ""} ${i > reached ? "locked" : ""}`}>
              <header className="bstep-head">
                <span className="bstep-no">{i < step || (i <= reached && !open) ? "✓" : n + 1}</span>
                <div>
                  <h3>{title}</h3>
                  {!open && i <= reached && summaries[i] && <p className="bstep-sum">{summaries[i]}</p>}
                </div>
                {canOpen && (
                  <button type="button" className="link-line bstep-edit" onClick={() => setStep(i)}>Edit</button>
                )}
              </header>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    className="bstep-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    // Closing is instant so the page height settles before we scroll to the next step
                    exit={{ height: 0, opacity: 0, transition: { duration: 0 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="bstep-inner">{content[i]}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>

      <aside className="bp-summary">
        <div className="bp-img">
          <AnimatePresence mode="wait">
            <motion.img
              key={suite ? suite.img : "none"}
              src={suite ? suite.img : "/images/hero.jpg"}
              alt={suite ? `${fullName(suite.name)}` : ""}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        </div>
        <div className="bp-body">
          <p className="eyebrow">Your stay</p>
          {suite ? (
            <>
              <p className="suite-mood" style={{ color: suite.accent }}>{fullName(suite.name)}{suite.mood ? ` · ${suite.mood}` : ""}</p>
              <h3>{nameParts(suite.name)[0]} <em>{nameParts(suite.name)[1]}</em></h3>
              <p className="loc-pill"><PinIcon /> {locationName(suite.location)}</p>
            </>
          ) : (
            <h3>Choose a <em>suite</em></h3>
          )}
          <dl>
            <div className="dl-row">
              <dt>Check-in</dt>
              <dd>{form.in ? fmtDate(form.in) : "—"}{timeIn(suite) && <small className="dl-time">{timeIn(suite)}</small>}</dd>
            </div>
            <div className="dl-row">
              <dt>Check-out</dt>
              <dd>{form.out ? fmtDate(form.out) : "—"}{timeOut(suite) && <small className="dl-time">{timeOut(suite)}</small>}</dd>
            </div>
            <div className="dl-row"><dt>Guests</dt><dd>{form.guests}</dd></div>
            {suite && nights > 0 && (
              <div className="dl-row">
                <dt>Base fee · ₹{formatINR(suite.price)} × {plural(nights, "night")}</dt>
                <dd>₹{formatINR(bill.roomTotal)}</dd>
              </div>
            )}
            {bill.extraGuestTotal > 0 && (
              <div className="dl-row">
                <dt>Extra guest · ₹{formatINR(bill.extraGuestRate)} × {bill.extraGuests > 1 ? `${bill.extraGuests} × ` : ""}{plural(nights, "night")}</dt>
                <dd>₹{formatINR(bill.extraGuestTotal)}</dd>
              </div>
            )}
            {bill.discount > 0 && (
              <div className="dl-row dl-discount">
                <dt>Discount · {bill.discountNote}</dt>
                <dd>− ₹{formatINR(bill.discount)}</dd>
              </div>
            )}
            {chosenAddons.map((a) => (
              <div key={a.id} className="dl-row">
                <dt>{a.title}</dt>
                <dd>{a.price ? `₹${formatINR(a.price)}` : "On request"}</dd>
              </div>
            ))}
            {bill.taxRate > 0 && bill.roomTotal > 0 && (
              <div className="dl-row">
                <dt>GST on stay ({bill.taxRate}%)</dt>
                <dd>₹{formatINR(bill.stayTaxAmount)}</dd>
              </div>
            )}
            {bill.addonTaxAmount > 0 && (
              <div className="dl-row">
                <dt>GST on add-ons ({bill.addonTaxRates.join("/")}%)</dt>
                <dd>₹{formatINR(bill.addonTaxAmount)}</dd>
              </div>
            )}
            {bill.convenienceFee > 0 && (
              <div className="dl-row">
                <dt>{bill.feeLabel}</dt>
                <dd>₹{formatINR(bill.convenienceFee)}</dd>
              </div>
            )}
          </dl>
          <div className="bp-total">
            <span>Total</span>
            <strong>₹{formatINR(total)}</strong>
          </div>
          <p className="muted bp-note">
            {unpricedAddons && "Decoration prices are agreed with our team after booking, plus GST. "}
            {bill.taxAmount > 0 ? "Includes GST and fees. " : "Taxes as applicable. "}
            {policy("cancellation") ? `Cancellation: ${policy("cancellation")}. ` : ""}
            <Link href="/cancellation-policy" target="_blank" className="link-line">Cancellation &amp; refund policy</Link>
          </p>
        </div>
      </aside>
    </form>
  );
}
