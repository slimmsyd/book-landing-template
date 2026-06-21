"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

const inputClass =
  "w-full rounded-[8px] border border-[rgba(26,23,20,0.22)] bg-paper px-[15px] py-[13px] font-body text-[16px] text-ink outline-none transition-colors focus:border-gold";
const labelClass =
  "flex flex-col gap-[7px] text-[13px] tracking-[0.02em] text-ink-soft";
const legendClass =
  "mb-[4px] p-0 font-display text-[13px] uppercase tracking-[0.22em] text-ink";

export default function CheckoutForm({
  payLabel,
  qty,
}: {
  payLabel: string;
  qty: number;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError(null);

    // Only forward an ISO-2 country code to Stripe; otherwise omit it.
    const iso2 = /^[A-Za-z]{2}$/.test(country.trim())
      ? country.trim().toUpperCase()
      : undefined;

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?status=success&qty=${qty}`,
        receipt_email: email || undefined,
        shipping: {
          name: name || "Customer",
          address: {
            line1: street,
            city,
            postal_code: zip,
            ...(iso2 ? { country: iso2 } : {}),
          },
        },
      },
    });

    // If we reach here, confirmation failed (success redirects away).
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="order-1 flex flex-col gap-[clamp(28px,4vw,40px)]"
    >
      {/* 1 - Contact */}
      <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
        <legend className={legendClass}>1 &middot; Contact</legend>
        <label className={labelClass}>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Full name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First and last name"
            className={inputClass}
          />
        </label>
      </fieldset>

      {/* 2 - Shipping */}
      <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
        <legend className={legendClass}>2 &middot; Shipping address</legend>
        <label className={labelClass}>
          Street address
          <input
            type="text"
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="123 Main Street"
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-[14px]">
          <label className={labelClass}>
            City
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            ZIP / Postal
            <input
              type="text"
              required
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="00000"
              className={inputClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          Country (2-letter code, e.g. US)
          <input
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="US"
            maxLength={2}
            className={inputClass}
          />
        </label>
      </fieldset>

      {/* 3 - Payment (Stripe Elements) */}
      <fieldset className="m-0 flex flex-col gap-[16px] border-none p-0">
        <legend className={legendClass}>3 &middot; Payment</legend>
        <div className="rounded-[8px] border border-[rgba(26,23,20,0.12)] bg-paper p-[16px]">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      </fieldset>

      {error && (
        <span className="-mt-[10px] text-[14px] text-[#b3261e]">{error}</span>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="cursor-pointer rounded-full border-none bg-dark px-[30px] py-[18px] font-display text-[16px] font-medium tracking-[0.02em] text-paper transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Processing…" : payLabel}
      </button>
      <span className="-mt-[12px] flex items-center gap-[8px] text-[13px] text-muted">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        Secure encrypted checkout powered by Stripe.
      </span>
    </form>
  );
}
