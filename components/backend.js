"use client";
import { useEffect, useState } from "react";

// Talks to the CasaSaga API so bookings and enquiries appear in the admin panel
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://casasagabackend.vercel.app").replace(/\/$/, "");

/**
 * POSTs a form to the API. Never throws: resolves to { ok, status, message, data }.
 * status 0 means the API couldn't be reached.
 */
export async function sendToBackend(path, body, { timeout = 10000 } = {}) {
  try {
    const res = await fetch(`${API_URL}/api/public/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
      signal: AbortSignal.timeout(timeout),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, message: json.message, data: json.data };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * Which suites are already fully booked for [checkIn, checkOut).
 * If the API can't be reached every suite is offered — the team confirms on WhatsApp anyway.
 */
export function useTakenSuites(checkIn, checkOut, refreshKey = 0) {
  const [state, setState] = useState({ loading: false, taken: new Set() });
  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return setState({ loading: false, taken: new Set() });
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    fetch(`${API_URL}/api/public/availability?checkIn=${checkIn}&checkOut=${checkOut}`, { signal: AbortSignal.timeout(10000) })
      .then((r) => r.json())
      .then((j) => live && setState({ loading: false, taken: new Set((j.data || []).filter((s) => !s.available).map((s) => s.id)) }))
      .catch(() => live && setState({ loading: false, taken: new Set() }));
    return () => {
      live = false;
    };
  }, [checkIn, checkOut, refreshKey]);
  return state;
}
