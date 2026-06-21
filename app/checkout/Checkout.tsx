"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSiteContent } from "@/app/lib/site-content";
import { useCart } from "../cart/CartContext";
import { computeOrder, formatMoney, pricingFrom } from "../lib/money";
import StripeProvider from "./StripeProvider";
import CheckoutForm from "./CheckoutForm";

export default function Checkout() {
  const site = useSiteContent();
  const pricing = pricingFrom(site.product);
  const currency = site.product.currency;
  const { qty, setQty, clear } = useCart();
  const searchParams = useSearchParams();
  // Stripe redirects to /checkout?status=success&redirect_status=succeeded.
  const success =
    searchParams.get("status") === "success" ||
    searchParams.get("redirect_status") === "succeeded";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);

  // The ordered quantity is carried through Stripe's return_url, so the success
  // view can show it even after the cart has been cleared.
  const orderedQty = Math.max(1, Number(searchParams.get("qty")) || 1);

  // Reaching checkout with an empty cart starts a single-copy order.
  useEffect(() => {
    if (!success && qty < 1) setQty(1);
  }, [success, qty, setQty]);

  // Clear the cart once payment has succeeded.
  useEffect(() => {
    if (success) clear();
  }, [success, clear]);

  // Create / refresh the PaymentIntent on load and whenever quantity changes
  // (debounced). The server recomputes the amount from config every time.
  useEffect(() => {
    if (success) return;
    const q = Math.max(1, qty);
    const t = setTimeout(async () => {
      setCreating(true);
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ qty: q }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start checkout.");
        setClientSecret(data.clientSecret);
        setCreateError(null);
      } catch (err) {
        setCreateError(
          err instanceof Error ? err.message : "Could not start checkout."
        );
      } finally {
        setCreating(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [qty, success]);

  const activeQty = success ? orderedQty : Math.max(1, qty);
  const totals = computeOrder(activeQty, pricing);
  const payLabel = `Pay ${formatMoney(totals.totalCents, currency)} · Place order`;

  const inc = () => setQty(Math.min(Math.max(1, qty) + 1, site.product.maxQty));
  const dec = () => setQty(Math.max(Math.max(1, qty) - 1, 1));

  const shippingLine =
    site.product.shipFlatCents === 0
      ? "Free shipping included"
      : `Free shipping over ${formatMoney(site.product.freeShipThresholdCents, currency)}`;

  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      {/* HEADER */}
      <div className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-5 px-[clamp(20px,4vw,56px)] py-[13px]">
          <Link href="/" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.brand.logo}
              alt={site.brand.logoAlt}
              className="block h-[clamp(32px,3.6vw,46px)] w-auto"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-[8px] font-display text-[13px] font-semibold uppercase tracking-[0.04em] text-ink transition-colors hover:text-gold"
          >
            <span className="text-[15px]">&larr;</span> Back to site
          </Link>
        </div>
      </div>

      {/* TITLE STRIP */}
      <div className="mx-auto flex max-w-[1180px] flex-col gap-[10px] px-[clamp(20px,4vw,56px)] pb-[clamp(20px,3vw,28px)] pt-[clamp(32px,5vw,56px)]">
        <span className="font-display text-[12px] uppercase tracking-[0.34em] text-gold">
          Checkout
        </span>
        <h1 className="m-0 font-display text-[clamp(30px,4vw,52px)] font-normal leading-[1.0] tracking-[-0.02em]">
          Complete your order
        </h1>
      </div>

      {/* BODY GRID */}
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-[clamp(32px,5vw,72px)] px-[clamp(20px,4vw,56px)] pb-[clamp(60px,9vh,110px)] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {/* LEFT: form or confirmation */}
        {!success ? (
          <div className="order-1 flex flex-col gap-[clamp(28px,4vw,40px)]">
            {clientSecret ? (
              <StripeProvider key={clientSecret} clientSecret={clientSecret}>
                <CheckoutForm payLabel={payLabel} qty={activeQty} />
              </StripeProvider>
            ) : (
              <div className="flex min-h-[280px] flex-col items-start justify-center gap-3 text-ink-soft">
                {createError ? (
                  <span className="text-[15px] text-[#b3261e]">
                    {createError}
                  </span>
                ) : (
                  <span className="text-[15px]">
                    {creating ? "Preparing secure checkout…" : "Loading…"}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="order-1 flex flex-col items-start gap-[18px] py-[clamp(32px,5vw,52px)]">
            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-dark">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D8B27C"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="m-0 font-display text-[clamp(28px,3.4vw,42px)] font-normal leading-[1.05] tracking-[-0.02em]">
              {site.copy.checkout.successTitle}
            </h2>
            <p className="m-0 max-w-[46ch] text-[17px] font-light leading-[1.65] text-ink-soft">
              {site.copy.checkout.successBody}
            </p>
            <Link
              href="/"
              className="mt-[6px] border-b-[1.5px] border-gold pb-[3px] text-[15px] font-semibold text-ink transition-colors hover:text-gold"
            >
              Return to the site &rarr;
            </Link>
          </div>
        )}

        {/* RIGHT: order summary */}
        <aside className="order-2 flex flex-col gap-[24px] rounded-[6px] bg-panel p-[clamp(26px,3vw,36px)] md:sticky md:top-[24px]">
          <span className="font-display text-[12px] uppercase tracking-[0.28em] text-gold">
            Order summary
          </span>
          <div className="flex items-start gap-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.product.coverImage}
              alt={site.product.coverAlt}
              className="w-[88px] shrink-0 self-start object-contain"
            />
            <div className="flex flex-col gap-[6px]">
              <span className="font-display text-[19px] leading-[1.1] tracking-[-0.01em]">
                {site.product.title}
              </span>
              <span className="text-[13px] tracking-[0.04em] text-muted">
                {site.copy.checkout.summaryItemSubtitle}
              </span>
              <span className="text-[13px] text-ink-soft">
                {site.copy.checkout.summaryItemNote}
              </span>
            </div>
          </div>

          {/* qty */}
          <div className="flex items-center justify-between pt-[4px]">
            <span className="text-[15px] text-ink-soft">Quantity</span>
            {!success ? (
              <div className="flex items-center overflow-hidden rounded-full border border-ink/20">
                <button
                  type="button"
                  onClick={dec}
                  aria-label="Decrease"
                  className="h-[38px] w-[38px] cursor-pointer border-none bg-transparent text-[20px] leading-none text-ink transition-colors hover:bg-ink/[0.06]"
                >
                  &minus;
                </button>
                <span className="min-w-[32px] text-center text-[16px] font-semibold">
                  {activeQty}
                </span>
                <button
                  type="button"
                  onClick={inc}
                  aria-label="Increase"
                  className="h-[38px] w-[38px] cursor-pointer border-none bg-transparent text-[20px] leading-none text-ink transition-colors hover:bg-ink/[0.06]"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-[16px] font-semibold">{activeQty}</span>
            )}
          </div>

          <div className="h-px bg-ink/[0.12]" />

          <div className="flex flex-col gap-[11px] text-[15px] text-ink-soft">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotalCents, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {totals.shippingCents === 0
                  ? "Free"
                  : formatMoney(totals.shippingCents, currency)}
              </span>
            </div>
          </div>

          <div className="h-px bg-ink/[0.12]" />

          <div className="flex items-baseline justify-between">
            <span className="font-display text-[16px] tracking-[0.02em]">
              Total
            </span>
            <span className="font-display text-[26px] tracking-[-0.01em]">
              {formatMoney(totals.totalCents, currency)}
            </span>
          </div>

          <div className="mt-[2px] flex items-center gap-[9px] text-[12.5px] tracking-[0.02em] text-muted">
            <span className="text-gold">&#10022;</span> {shippingLine}
          </div>
        </aside>
      </div>
    </div>
  );
}
