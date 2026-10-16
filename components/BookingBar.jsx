"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContent } from "./ContentProvider";

const today = () => new Date().toISOString().slice(0, 10);

export default function BookingBar() {
  const router = useRouter();
  const { locations = [] } = useContent();
  const [form, setForm] = useState({ location: "all", in: "", out: "", guests: "2" });
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => {
    setMsg("");
    setForm({ ...form, [k]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.in || !form.out) return setMsg("Please choose your check-in and check-out dates.");
    if (form.out <= form.in) return setMsg("Check-out must be after check-in.");
    const place = form.location !== "all" ? `&location=${form.location}` : "";
    router.push(`/booking?in=${form.in}&out=${form.out}&guests=${form.guests}${place}`);
  };

  return (
    <form id="book" className={`booking ${locations.length > 1 ? "booking-loc" : ""}`} onSubmit={submit} noValidate>
      {locations.length > 1 && (
        <label>
          <span>Location</span>
          <select value={form.location} onChange={set("location")}>
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>Check-in</span>
        <input type="date" min={today()} value={form.in} onChange={set("in")} />
      </label>
      <label>
        <span>Check-out</span>
        <input type="date" min={form.in || today()} value={form.out} onChange={set("out")} />
      </label>
      <label>
        <span>Guests</span>
        <select value={form.guests} onChange={set("guests")}>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
          ))}
        </select>
      </label>
      <button className="btn btn-gold" type="submit">Check Availability</button>
      {msg && <p className="booking-msg" role="alert">{msg}</p>}
    </form>
  );
}
