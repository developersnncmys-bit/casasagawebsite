"use client";
import { useEffect } from "react";
import { isStaleVersion, reloadOnce } from "@/components/reloadOnce";

// Last resort when even the site's frame (menu, footer) fails — it replaces the whole page
export default function GlobalError({ error }) {
  useEffect(() => {
    console.error(error);
    if (isStaleVersion(error)) reloadOnce();
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#120a0d", color: "#f5ebe2", fontFamily: "Georgia, serif", textAlign: "center", padding: "0 16px" }}>
        <div>
          <p style={{ color: "#d8b56a", letterSpacing: "0.3em", fontSize: 13 }}>CASASAGA</p>
          <h1 style={{ fontWeight: 400, fontSize: 30, margin: "16px 0" }}>Something didn&apos;t load</h1>
          <p style={{ color: "#b8a49b", fontFamily: "system-ui, sans-serif", marginBottom: 28 }}>Please try again — it usually works on the second go.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: "#d8b56a", color: "#120a0d", border: 0, borderRadius: 999, padding: "14px 32px", fontSize: 14, letterSpacing: "0.1em", cursor: "pointer" }}
          >
            TRY AGAIN
          </button>
        </div>
      </body>
    </html>
  );
}
