"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import { useSiteContent } from "@/app/lib/site-content";

// loadStripe is memoized at module scope so the script loads once.
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

export default function StripeProvider({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  const site = useSiteContent();
  const appearance = site.brand.stripeAppearance;
  const options = useMemo(
    () => ({
      clientSecret,
      appearance,
    }),
    [clientSecret, appearance]
  );

  return (
    <Elements stripe={getStripe()} options={options}>
      {children}
    </Elements>
  );
}
