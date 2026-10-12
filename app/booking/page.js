import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Book Your Stay" };

export default function BookingPage() {
  return (
    <section className="booking-wrap">
      <Reveal className="section-head booking-head">
        <p className="eyebrow">Reservations</p>
        <h1 className="page-title">
          Book your <em>escape</em>
        </h1>
        <p className="muted">
          Choose a suite and your dates — we&apos;ll confirm availability with you personally on WhatsApp.
        </p>
      </Reveal>
      <Suspense fallback={null}>
        <BookingForm />
      </Suspense>
    </section>
  );
}
