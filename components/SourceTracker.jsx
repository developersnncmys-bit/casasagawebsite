"use client";
import { useEffect } from "react";
import { rememberSource } from "./backend";

// Notes where the guest arrived from, so their booking shows it in the admin panel
export default function SourceTracker() {
  useEffect(() => {
    rememberSource();
  }, []);
  return null;
}
