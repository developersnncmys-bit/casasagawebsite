"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "./ContentProvider";
import { sendToBackend } from "./backend";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => !v || /^[+\d][\d\s-]{7,}$/.test(v);

export default function ContactForm() {
  const { occasions, waLink } = useContent();
  const params = useSearchParams();
  const topic = params.get("topic");
  const initialOccasion = occasions.includes(params.get("occasion")) ? params.get("occasion") : occasions[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    occasion: initialOccasion,
    message: topic ? `I'd like to know more about: ${topic}.` : "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setErrors({ ...errors, [k]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = "Please enter your name.";
    if (!emailOk(form.email)) err.email = "Please enter a valid email.";
    if (!phoneOk(form.phone)) err.phone = "Please enter a valid phone number.";
    if (form.message.trim().length < 5) err.message = "Tell us a little about your plans.";
    setErrors(err);
    if (Object.keys(err).length) return;

    const text =
      `New enquiry — CasaSaga\n` +
      `Name: ${form.name}\nEmail: ${form.email}\n` +
      (form.phone ? `Phone: ${form.phone}\n` : "") +
      `Occasion: ${form.occasion}\n\n${form.message}`;
    // Saved to the admin panel's Enquiries; WhatsApp opens either way
    sendToBackend("enquiries", form);
    const link = waLink(text);
    setSent(link);
    window.open(link, "_blank", "noopener");
  };

  const field = (k, label, props = {}) => (
    <label className={`field ${errors[k] ? "has-error" : ""}`}>
      <span>{label}</span>
      {props.textarea ? (
        <textarea rows={5} value={form[k]} onChange={set(k)} />
      ) : (
        <input value={form[k]} onChange={set(k)} {...props} />
      )}
      {errors[k] && <em className="field-error">{errors[k]}</em>}
    </label>
  );

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div key="ok" className="form-success" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="success-mark">♥</span>
          <h3>Thank you, {form.name.split(" ")[0]}!</h3>
          <p className="muted">
            Your enquiry has been prepared in WhatsApp — just press send. We typically respond within 2 hours.
          </p>
          <div className="suite-actions">
            <a href={sent} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Open WhatsApp again</a>
            <button className="link-line" onClick={() => setSent(null)}>Send another enquiry</button>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" className="contact-form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -20 }}>
          <div className="form-row">
            {field("name", "Full name *", { autoComplete: "name" })}
            {field("email", "Email *", { type: "email", autoComplete: "email" })}
          </div>
          <div className="form-row">
            {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
            <label className="field">
              <span>Occasion</span>
              <select value={form.occasion} onChange={set("occasion")}>
                {occasions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
          {field("message", "Message *", { textarea: true })}
          <button type="submit" className="btn btn-gold btn-lg">Send Enquiry</button>
          <p className="muted form-note">We typically respond within 2 hours.</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
