"use client";
import { useEffect, useState } from "react";

// Talks to the CasaSaga API so bookings appear in the admin panel
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
 * Which suites are fully booked for [checkIn, checkOut), and how many rooms each has left.
 * If the API can't be reached every suite is offered — the team confirms on WhatsApp anyway.
 */
export function useTakenSuites(checkIn, checkOut, refreshKey = 0) {
  const [state, setState] = useState({ loading: false, taken: new Set(), free: {} });
  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return setState({ loading: false, taken: new Set(), free: {} });
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    fetch(`${API_URL}/api/public/availability?checkIn=${checkIn}&checkOut=${checkOut}`, { signal: AbortSignal.timeout(10000) })
      .then((r) => r.json())
      .then((j) => {
        if (!live) return;
        const rows = j.data || [];
        setState({
          loading: false,
          taken: new Set(rows.filter((s) => !s.available).map((s) => s.id)),
          free: Object.fromEntries(rows.map((s) => [s.id, s.free])),
        });
      })
      .catch(() => live && setState({ loading: false, taken: new Set(), free: {} }));
    return () => {
      live = false;
    };
  }, [checkIn, checkOut, refreshKey]);
  return state;
}

/* ---------- Where the guest came from (Instagram, Facebook, Google…) ---------- */

const SOURCE_KEY = "cs_source";
const SOURCE_RULES = [
  [/^ig$|instagram/, "instagram"],
  [/^fb$|facebook|fban|fbav/, "facebook"],
  [/google/, "google"],
  [/whatsapp|^wa$|wa\.me/, "whatsapp"],
];
const match = (text) => SOURCE_RULES.find(([re]) => re.test(text))?.[1];

/**
 * Works out the source once, on the guest's first page of the visit:
 * ?utm_source=instagram (or ?source= / ?ref=) on the link, then the in-app browser
 * (Instagram and Facebook add their name to it), then the site they came from.
 * Nothing found means they typed the address or used a bookmark → "website".
 */
export function rememberSource() {
  try {
    if (sessionStorage.getItem(SOURCE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const tag = (params.get("utm_source") || params.get("source") || params.get("ref") || "").toLowerCase();
    const ua = navigator.userAgent.toLowerCase();
    let ref = "";
    try {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) ref = host.toLowerCase();
    } catch {}
    const source = (tag && (match(tag) || "referral")) || match(ua) || (ref && (match(ref) || "referral")) || "website";
    sessionStorage.setItem(SOURCE_KEY, source);
  } catch {}
}

export function getSource() {
  try {
    return sessionStorage.getItem(SOURCE_KEY) || "website";
  } catch {
    return "website";
  }
}
