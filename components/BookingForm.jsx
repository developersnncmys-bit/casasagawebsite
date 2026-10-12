"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { contact, formatINR, getSuite, occasions, suites, waLink } from "./data";

const today = () => new Date().toISOString().slice(0, 10);
const nightsBetween = (a, b) => (a && b && b > a ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0);
const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function BookingForm() {
  const p = useSearchParams();
  const [form, setForm] = useState({
    suite: getSuite(p.get("suite")) ? p.get("suite") : suites[0].id,
    in: p.get("in") || "",
    out: p.get("out") || "",
    guests: ["1", "2", "3", "4"].includes(p.get("guests")) ? p.get("guests") : "2",
    name: "",
    phone: "",
    email: "",
    occasion: occasions[0],
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors({ ...errors, [k]: undefined });
  };
  const suite = getSuite(form.suite);
  const nights = nightsBetween(form.in, form.out);
  const total = useMemo(() => nights * suite.price, [nights, suite]);

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.in) err.in = "Choose a check-in date.";
    if (!form.out) err.out = "Choose a check-out date.";
    else if (form.in && nights < 1) err.out = "Check-out must be after check-in.";
    if (form.name.trim().length < 2) err.name = "Please enter your name.";
    if (!/^[+\d][\d\s-]{7,}$/.test(form.phone)) err.phone = "Please enter a valid phone number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Please enter a valid email.";
    setErrors(err);
    if (Object.keys(err).length) return;

    const ref = "CS" + Date.now().toString(36).toUpperCase().slice(-6);
    const text =
      `Booking request ${ref} — CasaSaga\n` +
      `Suite: ${suite.name} Suite\n` +
      `Check-in: ${fmtDate(form.in)}\nCheck-out: ${fmtDate(form.out)}\n` +
      `Nights: ${nights} · Guests: ${form.guests}\n` +
      `Estimated total: ₹${formatINR(total)} (taxes as applicable)\n\n` +
      `Name: ${form.name}\nPhone: ${form.phone}\n` +
      (form.email ? `Email: ${form.email}\n` : "") +
      `Occasion: ${form.occasion}\n` +
      (form.notes ? `Requests: ${form.notes}\n` : "");
    const link = waLink(text);
    setDone({ ref, link });
    window.open(link, "_blank", "noopener");
  };

  const err = (k) => errors[k] && <em className="field-error">{errors[k]}</em>;

  if (done) {
    return (
      <motion.div className="form-success booking-done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <span className="success-mark">♥</span>
        <p className="eyebrow">Request {done.ref}</p>
        <h3>Almost there, {form.name.split(" ")[0]}!</h3>
        <p className="muted">
          Your request for the <strong>{suite.name} Suite</strong>, {fmtDate(form.in)} → {fmtDate(form.out)} ({nights}{" "}
          {nights === 1 ? "night" : "nights"}), is ready in WhatsApp. Press send and our team will confirm availability
          and payment details with you.
        </p>
        <div className="suite-actions">
          <a href={done.link} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Open WhatsApp again</a>
          <a href={`tel:${contact.tel}`} className="link-line">Call {contact.phone}</a>
          <button type="button" className="link-line" onClick={() => setDone(null)}>Edit request</button>
        </div>
      </motion.div>
    );
  }

  return (
    <form className="booking-page" onSubmit={submit} noValidate>
      <div className="bp-main">
        <fieldset>
          <legend><span>01</span> Choose your suite</legend>
          <div className="suite-pick">
            {suites.map((s) => (
              <label key={s.id} className={`pick ${form.suite === s.id ? "on" : ""}`} style={{ "--accent": s.accent }}>
                <input type="radio" name="suite" value={s.id} checked={form.suite === s.id} onChange={set("suite")} />
                <img src={s.img} alt="" />
                <span className="pick-name">{s.name}</span>
                <span className="pick-price">₹{formatINR(s.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend><span>02</span> Your dates</legend>
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
                  <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend><span>03</span> Your details</legend>
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
            <textarea rows={4} value={form.notes} onChange={set("notes")} placeholder="Decorations, dietary needs, arrival time…" />
          </label>
        </fieldset>
      </div>

      <aside className="bp-summary">
        <div className="bp-img">
          <AnimatePresence mode="wait">
            <motion.img
              key={suite.img}
              src={suite.img}
              alt={`${suite.name} Suite`}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        </div>
        <div className="bp-body">
          <p className="suite-mood" style={{ color: suite.accent }}>{suite.mood}</p>
          <h3>{suite.name} <em>Suite</em></h3>
          <dl>
            <div className="dl-row"><dt>Check-in</dt><dd>{form.in ? fmtDate(form.in) : "—"}</dd></div>
            <div className="dl-row"><dt>Check-out</dt><dd>{form.out ? fmtDate(form.out) : "—"}</dd></div>
            <div className="dl-row"><dt>Guests</dt><dd>{form.guests}</dd></div>
            <div className="dl-row">
              <dt>₹{formatINR(suite.price)} × {nights} {nights === 1 ? "night" : "nights"}</dt>
              <dd>₹{formatINR(total)}</dd>
            </div>
          </dl>
          <div className="bp-total">
            <span>Estimated total</span>
            <strong>₹{formatINR(total)}</strong>
          </div>
          <p className="muted bp-note">Taxes as applicable. Free cancellation up to 48 hours before arrival.</p>
          <button type="submit" className="btn btn-gold btn-lg bp-btn">Request Booking</button>
        </div>
      </aside>
    </form>
  );
}
