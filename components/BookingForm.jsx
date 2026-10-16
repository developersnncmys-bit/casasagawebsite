"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { addonPrice, formatINR, priceStay, taxNote } from "./content-helpers";
import { useContent } from "./ContentProvider";
import { getSource, sendToBackend, useTakenSuites } from "./backend";
import PinIcon from "./PinIcon";

const today = () => new Date().toISOString().slice(0, 10);
const nightsBetween = (a, b) => (a && b && b > a ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0);
const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const STEPS = ["Dates & guests", "Choose your suite", "Enhance your stay", "Your details"];

export default function BookingForm() {
  const { addons, contact, getAddon, getSuite, locations, occasions, policies, pricing, suites } = useContent();
  const policy = (label) => policies.find((p) => p.label.toLowerCase() === label)?.value;
  const p = useSearchParams();
  const startAddon = getAddon(p.get("addon"));
  const [form, setForm] = useState({
    suite: getSuite(p.get("suite")) ? p.get("suite") : "",
    in: p.get("in") || "",
    out: p.get("out") || "",
    guests: ["1", "2", "3", "4"].includes(p.get("guests")) ? p.get("guests") : "2",
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
  const [clash, setClash] = useState("");
  const [availKey, setAvailKey] = useState(0);
  const stepRefs = useRef([]);
  const first = useRef(true);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors({ ...errors, [k]: undefined });
  };
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
  const suite = taken.has(form.suite) ? undefined : getSuite(form.suite);
  const chosenAddons = form.addons.map(getAddon).filter(Boolean);
  const unpricedAddons = chosenAddons.some((a) => !a.price);
  // Base fee + add-ons + convenience fee + GST, calculated automatically
  const bill = priceStay(pricing, suite, nights, chosenAddons);
  const total = bill.total;

  useEffect(() => {
    if (form.suite && taken.has(form.suite)) setForm((f) => ({ ...f, suite: "" }));
  }, [taken, form.suite]);

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
    const err = {};
    if (i === 0) {
      if (!form.in) err.in = "Choose a check-in date.";
      if (!form.out) err.out = "Choose a check-out date.";
      else if (form.in && nights < 1) err.out = "Check-out must be after check-in.";
    }
    if (i === 3) {
      if (form.name.trim().length < 2) err.name = "Please enter your name.";
      if (!/^[+\d][\d\s-]{7,}$/.test(form.phone)) err.phone = "Please enter a valid phone number.";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Please enter a valid email.";
    }
    setErrors(err);
    return !Object.keys(err).length;
  };

  const next = (i) => validate(i) && goTo(i + 1);

  const chooseSuite = (id) => {
    setClash("");
    setForm({ ...form, suite: id });
    goTo(2);
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
    suite ? `${suite.name} Suite · ₹${formatINR(suite.price)}/night` : "",
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
      occasion: form.occasion,
      notes: form.notes,
      // Instagram, Facebook, Google… — shown as the booking's source in the admin panel
      source: getSource(),
    });
    setSending(false);
    if (res.status === 409) {
      // Someone else took the last room while the guest was filling in the form
      setClash(`Sorry — the ${suite.name} Suite was just booked for these dates. Please choose another suite.`);
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
    setDone(res.data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const err = (k) => errors[k] && <em className="field-error">{errors[k]}</em>;

  if (done) {
    return (
      <motion.div className="form-success booking-done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <span className="success-mark">♥</span>
        <p className="eyebrow">Booking {done.ref}</p>
        <h3>You&apos;re booked, {form.name.split(" ")[0]}!</h3>
        <p className="muted">Your stay is confirmed. Please keep your booking reference handy for check-in.</p>
        <dl className="done-summary">
          <div><dt>Suite</dt><dd>{done.suiteName || suite?.name} Suite</dd></div>
          <div><dt>Check-in</dt><dd>{fmtDate(done.checkIn)}{policy("check-in") ? ` · ${policy("check-in")}` : ""}</dd></div>
          <div><dt>Check-out</dt><dd>{fmtDate(done.checkOut)}{policy("check-out") ? ` · ${policy("check-out")}` : ""}</dd></div>
          <div><dt>Guests</dt><dd>{done.guests} · {plural(done.nights, "night")}</dd></div>
          {done.addonItems?.length > 0 && (
            <div><dt>Add-ons</dt><dd>{done.addonItems.map((a) => a.title).join(", ")}</dd></div>
          )}
          <div><dt>Base fee</dt><dd>₹{formatINR(done.roomTotal)}</dd></div>
          {done.addonTotal > 0 && <div><dt>Add-ons</dt><dd>₹{formatINR(done.addonTotal)}</dd></div>}
          {done.taxAmount - (done.addonTaxAmount || 0) > 0 && (
            <div><dt>GST on stay ({done.taxRate}%)</dt><dd>₹{formatINR(done.taxAmount - (done.addonTaxAmount || 0))}</dd></div>
          )}
          {done.addonTaxAmount > 0 && <div><dt>GST on add-ons</dt><dd>₹{formatINR(done.addonTaxAmount)}</dd></div>}
          {done.convenienceFee > 0 && (
            <div><dt>{pricing.convenienceFeeType === "percent" ? `Convenience fee (${pricing.convenienceFee}%)` : "Convenience fee"}</dt><dd>₹{formatINR(done.convenienceFee)}</dd></div>
          )}
          <div className="done-total"><dt>Total</dt><dd>₹{formatINR(done.total)}</dd></div>
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
          <input type="date" min={today()} value={form.in} onChange={set("in")} />
          {err("in")}
        </label>
        <label className={`field ${errors.out ? "has-error" : ""}`}>
          <span>Check-out *</span>
          <input type="date" min={form.in || today()} value={form.out} onChange={set("out")} />
          {err("out")}
        </label>
        <label className="field">
          <span>Guests</span>
          <select value={form.guests} onChange={set("guests")}>
            {[1, 2, 3, 4].map((n) => (
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
        const on = !soldOut && form.suite === s.id;
        return (
          <article
            key={s.id}
            className={`rp ${on ? "on" : ""} ${soldOut ? "sold-out" : ""}`}
            style={{ "--accent": s.accent }}
            aria-disabled={soldOut || undefined}
          >
            <div className="rp-img">
              <img src={s.img} alt={`${s.name} Suite`} />
              {on && <span className="rp-badge">Selected</span>}
              {soldOut && <span className="rp-sold">Sold out</span>}
            </div>
            <div className="rp-body">
              <p className="suite-mood">{s.tag} · {s.mood}</p>
              <h4>{s.name} <em>Suite</em></h4>
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
              <strong>₹{formatINR(s.price)}</strong>
              <small>per night {taxNote(pricing, s)}</small>
              {!soldOut && nights > 0 && roomsLeft[s.id] > 0 && (
                <small className={`rp-left ${roomsLeft[s.id] <= 3 ? "low" : ""}`}>
                  {roomsLeft[s.id] <= 3
                    ? `Only ${roomsLeft[s.id]} room${roomsLeft[s.id] > 1 ? "s" : ""} left`
                    : `${roomsLeft[s.id]} rooms available`}
                </small>
              )}
              {soldOut ? (
                <small className="rp-total rp-sold-note">Fully booked for your dates — try other dates</small>
              ) : (
                nights > 0 && (
                  <small className="rp-total">
                    ₹{formatINR(priceStay(pricing, s, nights).total)} for {plural(nights, "night")}
                    {priceStay(pricing, s, nights).convenienceFee > 0 ? " incl. GST & fees" : priceStay(pricing, s, nights).taxRate > 0 ? " incl. GST" : ""}
                  </small>
                )
              )}
              <button
                type="button"
                className={`btn ${on ? "btn-gold" : "btn-ghost"}`}
                onClick={() => !soldOut && chooseSuite(s.id)}
                disabled={soldOut}
              >
                {soldOut ? "Sold out" : on ? "Continue" : "Select"}
              </button>
            </div>
          </article>
        );
      })}
    </div>,

    // 3 — add-ons
    <>
      <p className="muted step-intro">
        Celebrating something? Our team decorates your suite in-house before you arrive. Optional — pick any you like.
      </p>
      <div className="addon-pick">
        {addons.map((a) => {
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
          <input value={form.name} onChange={set("name")} autoComplete="name" />
          {err("name")}
        </label>
        <label className={`field ${errors.phone ? "has-error" : ""}`}>
          <span>Phone *</span>
          <input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
          {err("phone")}
        </label>
      </div>
      <div className="form-row">
        <label className={`field ${errors.email ? "has-error" : ""}`}>
          <span>Email</span>
          <input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
          {err("email")}
        </label>
        <label className="field">
          <span>Occasion</span>
          <select value={form.occasion} onChange={set("occasion")}>
            {occasions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Special requests</span>
        <textarea rows={4} value={form.notes} onChange={set("notes")} placeholder="Decoration theme or colours, cake message, arrival time…" />
      </label>
      {submitError && <p className="avail-note warn" role="alert">{submitError}</p>}
      <p className="muted form-note policy-agree">
        By confirming, you agree to our{" "}
        <Link href="/cancellation-policy" target="_blank" className="link-line">cancellation &amp; refund policy</Link>.
      </p>
      <div className="step-actions">
        <button type="submit" className="btn btn-gold btn-lg" disabled={sending}>{sending ? "Confirming…" : "Confirm Booking"}</button>
      </div>
    </>,
  ];

  return (
    <form className="booking-page" onSubmit={submit} noValidate>
      <div className="bp-main">
        <ol className="stepper" aria-label="Booking steps">
          {STEPS.map((t, i) => (
            <li key={t} className={i === step ? "now" : i < step || i <= reached ? "done" : ""}>
              <span>{i + 1}</span> {t}
            </li>
          ))}
        </ol>

        {STEPS.map((title, i) => {
          const open = i === step;
          const canOpen = !open && i <= reached && (i < 2 || suite);
          return (
            <section key={title} ref={(el) => (stepRefs.current[i] = el)} className={`bstep ${open ? "open" : ""} ${i > reached ? "locked" : ""}`}>
              <header className="bstep-head">
                <span className="bstep-no">{i < step || (i <= reached && !open) ? "✓" : i + 1}</span>
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
              alt={suite ? `${suite.name} Suite` : ""}
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
              <p className="suite-mood" style={{ color: suite.accent }}>{suite.mood}</p>
              <h3>{suite.name} <em>Suite</em></h3>
              <p className="loc-pill"><PinIcon /> {locationName(suite.location)}</p>
            </>
          ) : (
            <h3>Choose a <em>suite</em></h3>
          )}
          <dl>
            <div className="dl-row"><dt>Check-in</dt><dd>{form.in ? fmtDate(form.in) : "—"}</dd></div>
            <div className="dl-row"><dt>Check-out</dt><dd>{form.out ? fmtDate(form.out) : "—"}</dd></div>
            <div className="dl-row"><dt>Guests</dt><dd>{form.guests}</dd></div>
            {suite && nights > 0 && (
              <div className="dl-row">
                <dt>Base fee · ₹{formatINR(suite.price)} × {plural(nights, "night")}</dt>
                <dd>₹{formatINR(bill.roomTotal)}</dd>
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
