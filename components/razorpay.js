"use client";

// Razorpay Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
let loading;
function loadCheckout() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true);
  loading ||= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => {
      loading = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return loading;
}

/**
 * Opens Checkout for a booking's order. Resolves to
 *   { paid: true, response }   — Razorpay's success reply, to be verified by the API
 *   { paid: false, reason }     — closed by the guest ("dismissed"), failed, or Checkout didn't load
 */
export async function payWithRazorpay(payment, { description, onFailedAttempt } = {}) {
  if (!(await loadCheckout())) return { paid: false, reason: "unavailable" };
  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: payment.keyId,
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency || "INR",
      name: "CasaSaga",
      description,
      image: `${window.location.origin}/images/logo.png`,
      prefill: payment.prefill,
      theme: { color: "#3d1420" },
      handler: (response) => resolve({ paid: true, response }),
      modal: { ondismiss: () => resolve({ paid: false, reason: "dismissed" }), confirm_close: true },
    });
    // A declined card etc. — Checkout stays open so the guest can try another way
    rzp.on("payment.failed", (r) => onFailedAttempt?.(r.error?.description));
    rzp.open();
  });
}
