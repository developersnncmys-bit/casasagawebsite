"use client";
import { useEffect, useState } from "react";
import { isStaleVersion, reloadOnce } from "@/components/reloadOnce";

// Shown instead of Next.js's bare "Application error" when a page fails in the browser
export default function PageError({ error, reset }) {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    console.error(error);
    // An old page asking for a removed file: load the new version straight away
    if (isStaleVersion(error) && reloadOnce()) setReloading(true);
  }, [error]);

  return (
    <section style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", padding: "8rem 1.5rem 4rem" }}>
      <div style={{ maxWidth: 520 }}>
        <p className="eyebrow" style={{ justifyContent: "center" }}>CasaSaga</p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "clamp(2rem, 6vw, 3rem)", margin: "1rem 0" }}>
          {reloading ? "Loading the latest version…" : "Something didn't load"}
        </h1>
        {!reloading && (
          <>
            <p className="muted" style={{ marginBottom: "2rem" }}>Please try again — it usually works on the second go.</p>
            <button type="button" className="btn btn-gold" onClick={() => (isStaleVersion(error) ? window.location.reload() : reset())}>
              Try again
            </button>
          </>
        )}
      </div>
    </section>
  );
}
