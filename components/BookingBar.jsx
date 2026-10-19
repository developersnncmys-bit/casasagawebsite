"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContent } from "./ContentProvider";
import DateInput from "./DateInput";
import { formatINR, fullName, guestRules, maxGuestsOf, priceStay } from "./content-helpers";

const today = () => new Date().toISOString().slice(0, 10);
const nightsBetween = (a, b) => (a && b && b > a ? Math.round((new Date(b) - new Date(a)) / 86400000) : 0);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

export default function BookingBar() {
  const router = useRouter();
  const { locations = [], suites = [], pricing } = useContent();
  const [form, setForm] = useState({ location: "all", in: "", out: "", guests: "2", suite: "" });
  const [msg, setMsg] = useState("");
  const suitesAt = (place) => (place === "all" ? suites : suites.filter((s) => s.location === place));
  // Guests: up to the most any suite at the chosen location takes (e.g. 3 at Banashankari 6th Stage)
  const maxGuests = (place) => maxGuestsOf(suitesAt(place));
  // A location whose suites take different numbers of guests (1, 2 and 4 bedrooms at Banashankari
  // 5th Stage) is booked by room type rather than by guests
  const byRoom = (place) => place !== "all" && new Set(suitesAt(place).map((s) => guestRules(s).max)).size > 1;

  const set = (k) => (e) => {
    setMsg("");
    const next = { ...form, [k]: e.target.value };
    if (k === "location") {
      if (byRoom(next.location)) {
        // Start with the smallest room type; its guests come with it
        const first = [...suitesAt(next.location)].sort((a, b) => guestRules(a).max - guestRules(b).max)[0];
        next.suite = first.id;
        next.guests = String(guestRules(first).max);
      } else {
        // Fill in the most guests the location's suites take; the guest can lower it
        next.suite = "";
        next.guests = String(next.location === "all" ? Math.min(Number(next.guests), maxGuests("all")) : maxGuests(next.location));
      }
    }
    if (k === "suite") next.guests = String(guestRules(suites.find((s) => s.id === next.suite)).max);
    setForm(next);
  };

  // Price for the chosen location and guests (or room type): the lowest-priced suite that fits,
  // for the stay (or one night until dates are chosen) — changes as soon as the choice changes
  const nights = nightsBetween(form.in, form.out);
  const guests = Number(form.guests);
  const rooms = byRoom(form.location);
  const quote =
    form.location === "all"
      ? null
      : suitesAt(form.location)
          .filter((s) => (rooms ? s.id === form.suite : guestRules(s).max >= guests))
          .map((s) => ({ ...priceStay(pricing, { ...s, discountValue: 0 }, nights || 1, [], guests, form.in), suite: s }))
          .sort((a, b) => a.total - b.total)[0];

  const submit = (e) => {
    e.preventDefault();
    if (!form.in || !form.out) return setMsg("Please choose your check-in and check-out dates.");
    if (form.in < today()) return setMsg("Check-in can't be in the past.");
    if (form.out <= form.in) return setMsg("Check-out must be after check-in.");
    if (nightsBetween(form.in, form.out) > 30) return setMsg("Online bookings are up to 30 nights — call us for longer stays.");
    const place = form.location !== "all" ? `&location=${form.location}` : "";
    const suite = rooms && form.suite ? `&suite=${form.suite}` : "";
    router.push(`/booking?in=${form.in}&out=${form.out}&guests=${form.guests}${place}${suite}`);
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
        <DateInput min={today()} value={form.in} onChange={set("in")} />
      </label>
      <label>
        <span>Check-out</span>
        <DateInput min={form.in || today()} value={form.out} onChange={set("out")} />
      </label>
      {rooms ? (
        <label>
          <span>Rooms</span>
          <select value={form.suite} onChange={set("suite")}>
            {[...suitesAt(form.location)]
              .sort((a, b) => guestRules(a).max - guestRules(b).max)
              .map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {plural(guestRules(s).max, "guest")}</option>
              ))}
          </select>
        </label>
      ) : (
        <label>
          <span>Guests</span>
          <select value={form.guests} onChange={set("guests")}>
            {Array.from({ length: maxGuests(form.location) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
            ))}
          </select>
        </label>
      )}
      <button className="btn btn-gold" type="submit">Check Availability</button>
      {quote && (
        <p className="booking-price" aria-live="polite">
          {nights ? (
            <>
              <strong>₹{formatINR(quote.total)}</strong> for {plural(nights, "night")}
              {rooms ? `, ${fullName(quote.suite.name)} (${plural(guests, "guest")})` : `, ${plural(guests, "guest")}`}
              {quote.convenienceFee > 0 ? " · incl. GST & fees" : quote.taxRate > 0 ? " · incl. GST" : ""}
            </>
          ) : (
            // One night: the base fee (covers the included guests) + each extra guest + GST = the total
            <>
              ₹{formatINR(quote.roomTotal)} / night {rooms ? `· ${fullName(quote.suite.name)}` : ""} for {plural(quote.extraGuestTotal > 0 ? guests - quote.extraGuests : guests, "guest")}
              {quote.extraGuestTotal > 0 && ` + ₹${formatINR(quote.extraGuestTotal)} extra guest${quote.extraGuests > 1 ? `s (${quote.extraGuests})` : ""}`}
              {quote.taxRate > 0 && ` + ${quote.taxRate}% GST`} = <strong>₹{formatINR(quote.subtotal)}</strong> / night
              {quote.extraGuestTotal > 0 ? ` for ${plural(guests, "guest")}` : ""}
            </>
          )}
        </p>
      )}
      {msg && <p className="booking-msg" role="alert">{msg}</p>}
    </form>
  );
}
